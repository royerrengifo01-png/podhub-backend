import express from "express";
import {
  getPodcasts,
  createPodcast,
  getPodcastById,
  deletePodcast
} from "../controllers/podcastController.js";

const router = express.Router();

// 📦 Obtener todos los podcasts
router.get("/", getPodcasts);

// ➕ Crear un nuevo podcast
router.post("/", createPodcast);

// 🔍 Obtener un podcast por ID
router.get("/:id", getPodcastById);

// ❌ Eliminar un podcast
router.delete("/:id", deletePodcast);

export default router;
