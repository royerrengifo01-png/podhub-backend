import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import podcastRoutes from "./routes/podcast.js"; // 👈 importa la ruta

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 👇 aquí conectamos las rutas de podcasts
app.use("/api/podcasts", podcastRoutes);

const JWT_SECRET = "super_secret_key"; // puedes cambiarla

// 🧩 Registro de usuario
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: { email, password: hashedPassword, name },
    });

    res.json({ message: "Usuario registrado correctamente", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 🔑 Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 👤 Obtener perfil del usuario autenticado
app.get("/api/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No autorizado" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.users.findUnique({ where: { id: decoded.userId } });
    res.json(user);
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Servidor corriendo en el puerto ${PORT}`));
