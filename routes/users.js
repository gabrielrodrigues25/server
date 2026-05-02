import express from "express";
import jwt from "jsonwebtoken";
import { getListItems, buscarContagemAnterior } from "../services/sharepointService.js";
import { poolDisp, poolConnectDisp, poolLogin, poolConnectLogin } from "../auth/banco.js";
import sql from "mssql";
import fetch from "node-fetch";
import querystring from "querystring";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const router = express.Router();

// BUSCAR CONTAGEM ANTERIOR
router.get("/Pedidos/Anterior", async (req, res) => {

  const { loja, data } = req.query;

  try {
    const dados = await buscarContagemAnterior(loja, data, ACCESS_TOKEN);
    res.json({ Relatorio: dados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar contagem anterior" });
  }

});

//versão do app
router.get("/versao", async (req, res) => {

  try {

    const itens = await getListItems("AppVersion");

    if (!itens || itens.length === 0) {
      return res.json({ versao: null });
    }

    const ultimaVersao = itens
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

    res.json({
      versao: ultimaVersao.versao,
      data: ultimaVersao.data,
      usuario: ultimaVersao.usuario,
      id: ultimaVersao.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }

});

//  Redirecionar para login Microsoft

router.get("/microsoft", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");

  req.session.state = state;

  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.REDIRECT_URI,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state
  });

  res.redirect(
    `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`
  );
});

// callback do login Microsoft 
router.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) return res.send("Código não recebido");

  if (state !== req.session.state) {
    return res.send("State inválido");
  }

  try {
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: querystring.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
        scope: "openid profile email User.Read"
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return res.send("Erro ao obter token");
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userData = await userResponse.json();
    const nome = userData.displayName;

    const email =
      userData.mail ||
      userData.userPrincipalName ||
      userData.preferred_username;

    if (!email) {
  return res.send("Não foi possível obter email da Microsoft");
}
    req.session.logado = true;
    req.session.tipoLogin = "microsoft";
    req.session.nome = userData.displayName;
    req.session.user = userData;

  return res.redirect("/home");

  } catch (err) {
    console.error(err);
    return res.send("Erro no login Microsoft");
  }
});

//Login normal (matrícula + senha)
router.post("/loginShare", async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    const Login = await getListItems("dClientes");

    const user = Login.find(item => {
      const matricula = item.field_9 ? String(item.field_9).trim() : "";
      const senhaEsperada = "5" + matricula;
      return matricula === usuario.trim() && senha === senhaEsperada;
    });

    if (!user) return res.status(401).json({ message: "Usuário ou senha inválidos" });

    const token = jwt.sign({ usuario }, process.env.JWT_SECRET || "chave_secreta", { expiresIn: "8h" });

    res.json({
      token,
      nome: user.Promotor,
      matricula: user.field_9
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//login pelo banco
router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    const request = poolDisp.request();

    request.input("Login", sql.NVarChar, usuario.trim());

    const result = await request.query(`
      SELECT *
      FROM dClientes
      WHERE Login = @Login
    `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: "Usuário ou senha inválidos" });
    }

    const matricula = String(user.Login).trim();
    const senhaEsperada = "5" + matricula;

    if (senha !== senhaEsperada) {
      return res.status(401).json({ message: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      { usuario: matricula },
      process.env.JWT_SECRET || "chave_secreta",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      nome: user.Promotor,
      matricula: user.Login,
      id: user.id
    });

  } catch (err) {
    console.error("Erro /login:", err);
    res.status(500).json({ message: err.message });
  }
});

//Login site com sessão
router.post("/log", async (req, res) => {
  try {
    const usuario = String(req.body.usuario || "").trim();
    const senha = String(req.body.senha || "").trim();

    /* if (!usuario || !senha) {
      return res.json({ erro: "Preencha usuário e senha" });
    }
 */
    const pool = await poolLogin;

    const result = await pool.request()
      .input("usuario", usuario)
      .query(`
        SELECT TOP 1 *
        FROM dim_Cadastro_Funcionario
        WHERE CODIGO_CHAPA = @usuario
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.json({ erro: "Usuário não encontrado" });
    }

    const matricula = String(user.CODIGO_CHAPA).trim();

    // regra da senha: "5" + matrícula
    if (senha !== "5" + matricula) {
      return res.json({ erro: "Usuário ou senha inválidos" });
    }

    // sessão
    req.session.logado = true;
    req.session.tipoLogin = "local";
    req.session.nome = user.NOME_COLABORADOR;
    req.session.user = {
      codigo: user.CODIGO_CHAPA
    };

    return res.json({
      sucesso: true,
      nome: user.NOME_COLABORADOR,
      matricula
    });

  } catch (err) {
    console.error(err);
    return res.json({ erro: "Erro no servidor" });
  }
});

router.get("/buscar-matricula", async (req, res) => {
  try {
    const cpf = String(req.query.cpf || "").replace(/\D/g, "");

    const pool = await poolConnectLogin;

    const result = await pool.request()
      .input("cpf", cpf)
      .query(`
        SELECT TOP 1 
          CODIGO_CHAPA,
          NOME_COLABORADOR,
          CPF
        FROM dim_Cadastro_Funcionario
        WHERE REPLACE(REPLACE(REPLACE(CPF, '.', ''), '-', ''), ' ', '') = @cpf
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.json({ erro: true });
    }

    res.json({
      nome: user.NOME_COLABORADOR,
      matricula: user.CODIGO_CHAPA
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: true });
  }
});

export default router;