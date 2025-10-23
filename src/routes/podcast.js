import express from "express";
import {
  getPodcasts,
  createPodcast,
  getPodcastById,
  deletePodcast,
  upload
} from "../controllers/podcastController.js";

const router = express.Router();

// 📦 Obtener todos los podcasts
router.get("/", getPodcasts);

// ➕ Crear un nuevo podcast con imagen
router.post("/", upload.single("image"), createPodcast);

// 🔍 Obtener un podcast por ID
router.get("/:id", getPodcastById);

// ❌ Eliminar un podcast
router.delete("/:id", deletePodcast);

export default router;
