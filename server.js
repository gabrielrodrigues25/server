import express from "express";
import cors from "cors";
import sharepointRoutes from "./routes/tabelas.js";
import users from "./routes/users.js";
import crud from "./routes/crud.js";
import saptab from "./routes/saptab.js";
import sqlTab from "./routes/sqlTab.js";
import helmet from "helmet";
import { verificarToken } from "./middlewares/autenticacao.js";
import path from "path";
import session from "express-session";
import { verificarSessao } from "./middlewares/autenticacao.js";

const crypto = await import("crypto");

function generateRandomKey() {
  return crypto.randomBytes(32).toString("hex");
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// servir arquivos estáticos (HTML, CSS, APK etc)
app.use(session({
  secret: "segredo_api",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static("public"));

// página inicial (login)
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/index.html"));
});

// página home
app.get("/home", verificarSessao, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/1.home/home.html"));
});

// página downloads
app.get("/downloads", verificarSessao, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/2.downloads/downloads.html"));
});

// página lojas
app.get("/lojas", verificarSessao, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/3.lojas/lojas.html"));
});

// página lojas
app.get("/produtos", verificarSessao, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/4.produtos/produtos.html"));
});

// página mapeamento
app.get("/mapeamento", verificarSessao, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/5.mapeamento/mapeamento.html"));
});

// página mapeamento
app.get("/contagens", verificarSessao, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/6.contagens/contagens.html"));
});

// página pedidos programados
app.get("/programados", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/7.programados/programados.html"));
});

app.use("/auth", users, sqlTab);

// API protegida por sessão
app.use("/tab", /* verificarSessao, */ crud, saptab)

// API protegida por token
app.use("/api", verificarToken, sharepointRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando na porta: ${PORT}`);
  console.log(`Chave de criptografia gerada: ${generateRandomKey()}`);
});