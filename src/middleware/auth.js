import jwt from "jsonwebtoken";

const JWT_SECRET = "super_secret_key"; // usa el mismo que en index.js

export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
