import uploadImages from 'src/Backend/middlewares/imageUpload';
import multer from 'multer'

export const config = {
  api: {
    bodyParser: false, // Let Multer handle file parsing
    responseLimit: false,
    bodyLimit: "50mb"  // Increase from default 4mb
  },
};

export default function handler(req: any, res: any) {
  uploadImages(req, res, async (err: any) => {
    if (err) {
      const statusCode = err instanceof multer.MulterError ? 400 : 500;
      console.error('Image upload error:', err);

      return res.status(statusCode).json({
        error: 'Image upload error',
        details: err.message,
      });
    }

    // Ensure images exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Extract Cloudinary URLs from uploaded images
    const uploadedUrls = req.files.map((file: any) => file.path);

    return res.status(200).json({
      message: 'Images uploaded successfully',
      urls: uploadedUrls,
    });
  });
}
