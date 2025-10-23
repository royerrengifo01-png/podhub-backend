import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// 📂 Configurar destino y nombre del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// 🧩 Crear un nuevo podcast con imagen
export const createPodcast = async (req, res) => {
  try {
    const { title, author, topic, created_by } = req.body;
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    if (!title || !author) {
      return res.status(400).json({
        error: "El título y el autor son campos obligatorios.",
      });
    }

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
    console.error("Error al crear el podcast:", error);
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
    console.error("Error al obtener los podcasts:", error);
    res.status(500).json({ error: "Error al obtener los podcasts" });
  }
};

// (deja las demás funciones igual)

// Eliminar un podcast
export const deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.podcasts.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Podcast eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el podcast:", error);
    res.status(500).json({ error: "Error al eliminar el podcast" });
  }
};
