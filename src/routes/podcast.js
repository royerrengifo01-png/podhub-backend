import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 🎧 Obtener todos los podcasts
router.get("/", async (req, res) => {
  try {
    const podcasts = await prisma.podcasts.findMany({
      include: {
        episodes: true,
        likes: true,
        favorites: true
      }
    });
    res.json(podcasts);
  } catch (error) {
    console.error("Error al obtener los podcasts:", error);
    res.status(500).json({ error: "Error al obtener los podcasts" });
  }
});

// 🎙️ Crear un nuevo podcast
router.post("/", async (req, res) => {
  try {
    const { title, author, topic } = req.body;
    const nuevoPodcast = await prisma.podcasts.create({
      data: { title, author, topic },
    });
    res.json(nuevoPodcast);
  } catch (error) {
    console.error("Error al crear el podcast:", error);
    res.status(500).json({ error: "Error al crear el podcast" });
  }
});

export default router;
