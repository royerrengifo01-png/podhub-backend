import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../middleware/uploadProfile.js";

const prisma = new PrismaClient();

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, adress, phone, city, state } = req.body;

    let profilePhotoUrl = null;

    // Si el usuario sube una nueva foto
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path);
      profilePhotoUrl = uploadResult.secure_url;
    }

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        adress,
        phone,
        city,
        state,
        ...(profilePhotoUrl && { profile_photo: profilePhotoUrl }),
      },
    });

    res.status(200).json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};
