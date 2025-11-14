import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Configurar ruta absoluta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// ✅ Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Configuración de multer (subida temporal local antes de enviar a Cloudinary)
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

// 🧩 Crear un nuevo podcast con imagen
export const createPodcast = async (req, res) => {
  try {
    const { title, author, topic, created_by } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        error: "El título y el autor son campos obligatorios.",
      });
    }

    let image_url = null;

    // 📤 Si el usuario subió una imagen, la enviamos a Cloudinary
    if (req.file) {
      const filePath = req.file.path;

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "podhub_podcasts",
      });

      image_url = uploadResult.secure_url;

      // 🧹 Borramos el archivo temporal después de subirlo
      fs.unlinkSync(filePath);
    }

    // 🗃 Guardamos en la base de datos
    const newPodcast = await prisma.podcasts.create({
      data: {
        title,
        author,
        topic,
        created_by: created_by ? Number(created_by) : null,
        image_url,
      },
    });

    res.status(201).json(newPodcast);
  } catch (error) {
    console.error("❌ Error al crear el podcast:", error);
    res.status(500).json({ error: "Error al crear el podcast" });
  }
};

// 🧩 Obtener todos los podcasts
export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await prisma.podcasts.findMany({
      include: { users: true },
      orderBy: { id: "desc" },
    });
    res.status(200).json(podcasts);
  } catch (error) {
    console.error("❌ Error al obtener los podcasts:", error);
    res.status(500).json({ error: "Error al obtener los podcasts" });
  }
};

// 🧩 Obtener un podcast por ID
export const getPodcastById = async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await prisma.podcasts.findUnique({
      where: { id: Number(id) },
    });

    if (!podcast) {
      return res.status(404).json({ error: "Podcast no encontrado" });
    }

    res.status(200).json(podcast);
  } catch (error) {
    console.error("❌ Error al obtener el podcast:", error);
    res.status(500).json({ error: "Error al obtener el podcast" });
  }
};

// 🧩 Eliminar un podcast
export const deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.podcasts.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Podcast eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar el podcast:", error);
    res.status(500).json({ error: "Error al eliminar el podcast" });
  }
};
