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
  console.log(req.body);
  try {
    const { usuario, senha } = req.body;

    const Login = await getListItems("dClientes");

    const user = Login.find(item => {
      const matricula = item.field_9 ? String(item.field_9).trim() : "";
      const itemUser = matricula.toLowerCase();

      const senhaEsperada = "5" + matricula;

      return itemUser === usuario.trim().toLowerCase() &&
             senha === senhaEsperada;
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
      matricula: user.field_9  // matrícula
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//login site

router.post("/log", (req, res) => {

  const { usuario, senha } = req.body;

  if (usuario === "admin" && senha === "123") {

    req.session.logado = true;

    return res.redirect("/downloads");

  }

  res.send("Usuário ou senha inválidos");

});

export default router;