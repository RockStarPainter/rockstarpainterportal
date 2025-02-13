import dayjs from 'dayjs';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'src/Backend/config/cloudinary';

// Configure Cloudinary storage for images
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => {
    return {
      folder: 'uploaded_images', // Store images in a dedicated folder
      public_id: `${dayjs().format('YYYY-MM-DD-HH-mm-ss')}-${Math.random()
        .toString(36)
        .substr(2, 9)}-image`, // Ensure unique filename
      resource_type: 'image', // Only allow images
    };
  }
});

// Multer middleware for handling multiple image uploads
const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).array('images', 30); // Allow multiple image uploads (up to 10)

export default uploadImages;
