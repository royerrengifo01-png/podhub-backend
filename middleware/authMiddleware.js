import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

export default function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // IMPORTANTE → ahora pasa userId y role a req.user
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
