import multer from 'multer'
import upload from 'src/Backend/middlewares/uploadFiles'

// Disable Next.js default body parsing for the API route
export const config = {
  api: {
    bodyParser: false // Multer will handle the file parsing
  }
}

// API route handler
export default function handler(req: any, res: any) {
  upload(req, res, (err: any) => {
    if (err) {
      const statusCode = err instanceof multer.MulterError ? 400 : 500
      console.error('File upload error:', err)

      return res.status(statusCode).json({
        error: 'File upload error',
        details: err.message
      })
    }

    // If the upload is successful, return the Cloudinary URL
    if (req.file && req.file.path) {
      return res.status(200).json({
        message: 'File uploaded successfully',
        url: req.file.path // Cloudinary returns the uploaded file's URL in `path`
      })
    }

    // Handle case where no file was provided
    return res.status(400).json({
      error: 'No file uploaded'
    })
  })
}
