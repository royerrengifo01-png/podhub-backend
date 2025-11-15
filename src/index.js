import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import podcastRoutes from "./routes/podcast.js";
import path from "path";
import { fileURLToPath } from "url";
import profileRoutes from "./routes/profileRoutes.js";
import { uploadProfile, uploadToCloudinary } from "./middleware/uploadProfile.js";
import likes from "./routes/likes.js";
import authRoutes from "./routes/auth.js";

const app = express();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- CORS GLOBAL — DEBE IR ANTES DE TODAS LAS RUTAS ----------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://podhub-frontend.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
  })
);

// Necesario para JSON
app.use(express.json());

// Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------- RUTAS ----------------
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/podcasts", podcastRoutes);
app.use("/api/likes", likes);

// ---------------- GET PROFILE ----------------
const JWT_SECRET = "super_secret_key";

app.get("/api/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No autorizado" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });
    res.json(user);
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

// ---------------- UPDATE PROFILE ----------------
app.put(
  "/api/profile/update",
  uploadProfile.single("profile_photo"),
  async (req, res) => {
    try {
      const { email, name, adress, phone, city, state } = req.body;

      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

      let profile_photo = user.profile_photo;

      if (req.file) {
        profile_photo = await uploadToCloudinary(req.file.path);
      }

      const updatedUser = await prisma.users.update({
        where: { email },
        data: {
          name: name || user.name,
          adress: adress || user.adress,
          phone: phone || user.phone,
          city: city || user.city,
          state: state || user.state,
          profile_photo,
        },
      });

      res.json({
        message: "Perfil actualizado correctamente",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  }
);

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en el puerto ${PORT}`)
);
