import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {

  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso Negado - Token não fornecido" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "chave_secreta", (err, decoded) => {

    if (err) {
      return res.status(403).json({ message: "Acesso Negado - Token inválido" });
    }

    req.user = decoded;
    next();

  });

}