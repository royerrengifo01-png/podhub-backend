  import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
  import fs from "fs";

const prisma = new PrismaClient();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Crear un podcast
export const createPodcast = async (req, res) => {
  try {
    const { title, author, topic, created_by } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "El título y el autor son obligatorios" });
    }

    let image_url = null;
    let audio_url = null;

    // Imagen -> Cloudinary
    if (req.files?.image) {
      const imgPath = req.files.image[0].path;

      const uploadedImage = await cloudinary.uploader.upload(imgPath, {
        folder: "podhub_podcasts",
      });

      image_url = uploadedImage.secure_url;

      fs.unlinkSync(imgPath);
    }

    // Audio -> Cloudinary (resource_type obligatorio)
    if (req.files?.audio) {
      const audioPath = req.files.audio[0].path;

      const uploadedAudio = await cloudinary.uploader.upload(audioPath, {
        folder: "podhub_audios",
        resource_type: "video",
      });

      audio_url = uploadedAudio.secure_url;

      fs.unlinkSync(audioPath);
    }

    // Guardar en Prisma
    const newPodcast = await prisma.podcasts.create({
      data: {
        title,
        author,
        topic,
        created_by: created_by ? Number(created_by) : null,
        image_url,
        audio_url,
      },
    });

    res.status(201).json(newPodcast);

  } catch (error) {
    console.error("❌ Error al crear el podcast:", error);
    res.status(500).json({ error: "Error al crear el podcast" });
  }
};

// Obtener todos
export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await prisma.podcasts.findMany({
      include: { users: true },
      orderBy: { id: "desc" },
    });
    res.status(200).json(podcasts);
  } catch (error) {
    console.error("❌ Error al obtener podcasts:", error);
    res.status(500).json({ error: "Error al obtener podcasts" });
  }
};

// Obtener por ID
export const getPodcastById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const podcast = await prisma.podcasts.findUnique({
      where: { id },
    });

    if (!podcast) return res.status(404).json({ error: "Podcast no encontrado" });

    res.json(podcast);

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al buscar podcast" });
  }
};

// Eliminar
export const deletePodcast = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.podcasts.delete({ where: { id } });

    res.json({ message: "Podcast eliminado" });

  } catch (error) {
    console.error("❌ Error al eliminar:", error);
    res.status(500).json({ error: "Error al eliminar el podcast" });
  }
};
