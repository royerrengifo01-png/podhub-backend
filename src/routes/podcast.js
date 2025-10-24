import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import express from "express";
import upload from "../middleware/upload.js";
import { uploadPodcast } from "../controllers/podcastController.js";

const router = express.Router();
const prisma = new PrismaClient();
router.post("/upload", upload.single("file"), uploadPodcast);


// 📂 Configurar multer (guarda temporalmente el archivo)
const upload = multer({ dest: "uploads/" });

// 🧩 POST /api/podcasts → subir un nuevo podcast con imagen
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, author, topic } = req.body;
    let imageUrl = null;

    // Si se subió una imagen, subirla a Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "podcasts",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // eliminar archivo temporal
    }

    // Guardar en la base de datos
    const podcast = await prisma.podcast.create({
      data: {
        title,
        author,
        topic,
        image_url: imageUrl || null,
      },
    });

    res.json(podcast);
  } catch (error) {
    console.error("Error al subir el podcast:", error);
    res.status(500).json({ error: "Error al subir el podcast" });
  }
});

export default router;
