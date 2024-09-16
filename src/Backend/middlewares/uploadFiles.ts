import dayjs from 'dayjs'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from 'src/Backend/config/cloudinary'

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  // eslint-disable-next-line
  params: async (req, file) => ({
    folder: 'invoice_files', // You can change the folder where the files are uploaded
    public_id: `${dayjs().format('YYYY-MM-DD-HH-mm-ss')}-invoice`, // Generate a unique file name
    resource_type: 'auto', // Automatically detects the file type
    format: 'pdf' // Enforce correct file format
  })
})

// Configure Multer for handling multipart form data
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
}).single('file') // Only handle single file uploads

export default upload
