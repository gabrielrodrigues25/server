import express from "express";
import cors from "cors";
import sharepointRoutes from "./routes/tabelas.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", sharepointRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando na porta:${PORT}`);
});