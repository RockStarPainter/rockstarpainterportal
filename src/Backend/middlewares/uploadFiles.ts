import dayjs from 'dayjs'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from 'src/Backend/config/cloudinary'

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf'

    return {
      folder: isPDF ? 'invoice_pdfs' : 'invoice_images', // Different folders for PDFs & images
      public_id: `${dayjs().format('YYYY-MM-DD-HH-mm-ss')}-invoice`, // Unique filename
      resource_type: 'auto', // Automatically detects the file type
      format: isPDF ? 'pdf' : undefined // Enforce correct format for PDFs
    }
  }
})

// Configure Multer for handling multipart form data
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Increase file size limit to 10MB
}).single('file') // Only handle single file uploads

export default upload
