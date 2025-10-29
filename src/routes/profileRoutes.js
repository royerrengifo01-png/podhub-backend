import express from "express";
import { uploadProfile, uploadToCloudinary } from "../middleware/uploadProfile.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.put("/update", uploadProfile.single("profile_photo"), async (req, res) => {
  try {
    const { email, name, adress, phone, city, state } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    let profile_photo = user.profile_photo;

    // 📸 Si el usuario envía una nueva imagen
    if (req.file) {
      const filePath = req.file.path;
      profile_photo = await uploadToCloudinary(filePath);
    }

    const updatedUser = await prisma.users.update({
      where: { email },
      data: { name, adress, phone, city, state, profile_photo },
    });

    res.json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

export default router;
