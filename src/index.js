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

const app = express();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/podcasts", podcastRoutes)

// Configuración robusta de CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://podhub-frontend.onrender.com",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// Rutas principales
app.use("/api/profile", profileRoutes);
app.use("/api/podcasts", podcastRoutes);



const JWT_SECRET = "super_secret_key";

//
// Registro de usuario (extendido con datos del perfil)
//
app.post("/api/register", async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      adress,
      phone,
      city,
      state,
      profile_photo,
    } = req.body;

    // Validar si el usuario ya existe
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con todos los campos
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        adress,
        phone,
        city,
        state,
        profile_photo,
      },
    });

    res.json({ message: "Usuario registrado correctamente", user });
  } catch (error) {
    console.error("Error en /api/register:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

//
//  Login
//
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    console.error("Error en /api/login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

//
// Obtener perfil del usuario autenticado
//
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

//
//  Actualizar o completar perfil con foto
//
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
        const filePath = req.file.path;
        profile_photo = await uploadToCloudinary(filePath);
      }

const updatedUser = await prisma.users.update({
  where: { email },
  data: {
    name: name || user.name,
    adress: adress || user.adress,
    phone: phone || user.phone,
    city: city || user.city,
    state: state || user.state,
    profile_photo: profile_photo ? profile_photo : user.profile_photo,
  },
});


      res.json({
        message: "Perfil actualizado correctamente",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error al actualizar el perfil:", error.message);
console.error("Detalles:", error);
console.log("Datos recibidos:", req.body);
console.log("Archivo recibido:", req.file);

      res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  }
);


// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en el puerto ${PORT}`)
);
