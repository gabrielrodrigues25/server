import express from "express";
import jwt from "jsonwebtoken";
import { getListItems } from "../services/sharepointService.js";
import fetch from "node-fetch";
import querystring from "querystring";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const router = express.Router();

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

    const email =
      userData.mail ||
      userData.userPrincipalName ||
      userData.preferred_username;

    if (!email) {
  return res.send("Não foi possível obter email da Microsoft");
}
    req.session.logado = true;
    req.session.user = {
      email,
      microsoft: true
    };

  return res.redirect("/home");

  } catch (err) {
    console.error(err);
    return res.send("Erro no login Microsoft");
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

    res.redirect("/home");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;