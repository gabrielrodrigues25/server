import express from "express";
import cors from "cors";
import sharepointRoutes from "./routes/tabelas.js";
import users from "./routes/users.js";
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
    saveUninitialized: true
}));

app.use(express.static("public"));

// página inicial (login)
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/home/index.html"));
});

// página downloads
app.get("/downloads", verificarSessao, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/pages/downloads/downloads.html"));
});

app.use("/auth", users);

// API protegida por token
app.use("/api", verificarToken, sharepointRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando na porta: ${PORT}`);
  console.log(`Chave de criptografia gerada: ${generateRandomKey()}`);
});