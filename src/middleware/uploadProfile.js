import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// ✅ Configuración de Cloudinary (asegúrate de tener las variables en Railway)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Configuración del almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profiles', // Carpeta donde se guardarán las fotos de perfil
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// ✅ Configuramos multer con el almacenamiento de Cloudinary
const uploadProfile = multer({ storage });

// ✅ Función auxiliar opcional si quieres subir manualmente archivos
async function uploadToCloudinary(filePath) {
  return await cloudinary.uploader.upload(filePath);
}

export { uploadProfile, uploadToCloudinary };
