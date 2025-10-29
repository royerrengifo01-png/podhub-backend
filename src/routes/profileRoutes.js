import express from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/update", upload.single("foto"), async (req, res) => {
  try {
    const { nombre, email, direccion, telefono, ciudad, estado } = req.body;
    let fotoUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload_stream(
        { folder: "podhub_profiles" },
        (error, result) => {
          if (error) throw error;
          fotoUrl = result.secure_url;
        }
      );
    }

    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        name: nombre,
        adress: direccion,
        phone: telefono,
        city: ciudad,
        state: estado,
        profile_photo: fotoUrl, // 👈 guardamos solo la URL
      },
    });

    res.json({ mensaje: "Perfil actualizado correctamente", updatedUser });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

export default router;
