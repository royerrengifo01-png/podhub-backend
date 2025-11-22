export default function isAdmin(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: "Error en validación de permisos" });
  }
}
