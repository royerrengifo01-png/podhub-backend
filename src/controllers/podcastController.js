import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js"; // 🧩 Importamos Cloudinary

// ✅ Configurar rutas absolutas correctamente para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Crear la carpeta "uploads" si no existe
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const prisma = new PrismaClient();

// ✅ Configuración de multer para guardar archivos temporalmente
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// 🧩 Crear un nuevo podcast con subida a Cloudinary
export const createPodcast = async (req, res) => {
  try {
    const { title, author, topic, created_by } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        error: "El título y el autor son campos obligatorios.",
      });
    }

    let image_url = null;

    // 🪄 Subir imagen a Cloudinary si existe
    if (req.file) {
      const filePath = req.file.path;

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "podhub_podcasts", // 📁 Carpeta en tu Cloudinary
        resource_type: "image",
      });

      image_url = result.secure_url;

      // 🧹 Eliminar archivo local tras subirlo
      fs.unlinkSync(filePath);
    }

    // 🧩 Crear registro en la base de datos
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
