import express from "express";
import cors from "cors";
import sharepointRoutes from "./routes/tabelas.js";
import users from "./routes/users.js";
import helmet from "helmet";
import { verificarToken } from "./middlewares/autenticacao.js";

const crypto = await import("crypto");
function generateRandomKey() {
  return crypto.randomBytes(32).toString("hex"); // Gera uma chave e a converte para hexadecimal
}

const app = express(); 

app.use(cors()); // Habilita CORS para todas as rotas

app.use(express.json()); // Para interpretar JSON no corpo das requisições

app.use(helmet()); // Segurança básica

app.use("/auth", users); // rota pública (login)

app.use(verificarToken); // proteger todas as rotas abaixo

app.use("/api", sharepointRoutes); // rotas do SharePoint com /api

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando na porta:${PORT}`);
  console.log(`Chave de criptografia gerada: ${generateRandomKey()}`);
});