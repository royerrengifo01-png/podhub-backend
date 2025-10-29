import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar el almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "podhub_profiles", // Carpeta donde se guardan las fotos
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Middleware de subida
export const uploadProfile = multer({ storage });

// Función auxiliar para subir manualmente (por si quieres usarla luego)
export const uploadToCloudinary = async (filePath) => {
  return await cloudinary.v2.uploader.upload(filePath, {
    folder: "podhub_profiles",
  });
};
