import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Crear un nuevo podcast
router.post("/", async (req, res) => {
  try {
    const { title, author, topic, image_url } = req.body;

    const podcast = await prisma.podcast.create({
      data: {
        title,
        author,
        topic,
        image_url,
      },
    });

    res.json(podcast);
  } catch (error) {
    console.error("Error al crear podcast:", error);
    res.status(500).json({ error: "Error al crear el podcast" });
  }
});

// 🔹 Obtener todos los podcasts
router.get("/", async (req, res) => {
  const podcasts = await prisma.podcast.findMany();
  res.json(podcasts);
});

export default router;
