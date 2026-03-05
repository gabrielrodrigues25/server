import express from "express";
import jwt from "jsonwebtoken";
import { getListItems } from "../services/sharepointService.js";

const router = express.Router();

/* router.post("/login", async (req, res) => {
  try {

    const { usuario, senha } = req.body;

    const Login = await getListItems("Auth");

    const user = Login.find(
      item => item.User === usuario && item.Senha === senha
    );

    if (!user) {
      return res.status(401).json({
        message: "Usuário ou senha inválidos"
      });
    }

    const token = jwt.sign(
      { usuario },
      process.env.JWT_SECRET || "chave_secreta",
      { expiresIn: "8h" }
    );

    res.json({ token });

  } catch (err) {

    res.status(500).json({
      error: err.response?.status,
      message: err.response?.data || err.message
    });

  }
}); */
router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    const Login = await getListItems("Auth");

    const user = Login.find(item => {
      const itemUser = item.User ? String(item.User).trim().toLowerCase() : "";
      const itemSenha = item.Senha ? String(item.Senha).trim() : "";

      return itemUser === usuario.trim().toLowerCase() &&
             itemSenha === senha
    });

    if (!user) {
      return res.status(401).json({ message: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      { usuario },
      process.env.JWT_SECRET || "chave_secreta",
      { expiresIn: "2h" }
    );

    res.json({
      token,
      nome: user.Promotor,      // nome do usuário
      matricula: user.User   // matrícula
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;