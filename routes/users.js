import express from "express";
import jwt from "jsonwebtoken";
import { getListItems } from "../services/sharepointService.js";
import fetch from "node-fetch";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

//  Redirecionar para login Microsoft
router.get("/microsoft", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.REDIRECT_URI, 
    response_mode: "query",
    scope: "User.Read",
    state: "12345"
  });

  res.redirect(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`);
});

// callback do login Microsoft 
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Erro: código não recebido.");

  try {
    // Troca code por token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: querystring.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
        scope: "User.Read"
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) return res.send("Erro ao obter token!");

    // Consulta Graph para pegar e-mail
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    const userData = await userResponse.json();
    const email = userData.mail || userData.userPrincipalName;

    // Validar domínio corporativo
    if (!email.endsWith(`@${process.env.DOMINIO_CORPORATIVO}`)) {
      return res.send(`E-mail ${email} não pertence ao domínio corporativo!`);
    }

    // Gerar token JWT interno para liberar login normal
    const tokenInterno = jwt.sign({ email, microsoft: true }, process.env.JWT_SECRET || "chave_secreta", { expiresIn: "8h" });

    // Redireciona para frontend com token interno
    res.redirect(`/login?token=${tokenInterno}`);

  } catch (err) {
    console.error(err);
    res.send("Erro no login com Microsoft!");
  }
});

//Login normal (matrícula + senha)
router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    const Login = await getListItems("dClientes");

    const user = Login.find(item => {
      const matricula = item.field_9 ? String(item.field_9).trim() : "";
      const senhaEsperada = "5" + matricula;
      return matricula === usuario.trim() && senha === senhaEsperada;
    });

    if (!user) return res.status(401).json({ message: "Usuário ou senha inválidos" });

    const token = jwt.sign({ usuario }, process.env.JWT_SECRET || "chave_secreta", { expiresIn: "2h" });

    res.json({
      token,
      nome: user.Promotor,
      matricula: user.field_9
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Login site com sessão
router.post("/log", async (req, res) => {
  try {
    const usuario = String(req.body.usuario || "").trim();
    const senha = String(req.body.senha || "").trim();
    const Login = await getListItems("dClientes");

    const user = Login.find(item => {
      const matricula = item.field_9 ? String(item.field_9).trim() : "";
      return matricula === usuario && senha === "5" + matricula;
    });

    if (!user) return res.send("Usuário ou senha inválidos");

    req.session.logado = true;
    req.session.usuario = usuario;
    req.session.nome = user.Promotor;

    res.redirect("/downloads");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;