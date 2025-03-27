import axios from 'axios'

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Uploads images directly to Cloudinary from the client-side
 * @param files Array of File objects to upload
 * @returns Array of uploaded image URLs
 */
export async function uploadImagesToCloudinary(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return []

  try {
    const uploadPromises = files.map(async file => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || 'rockstar_painter_portal')
      formData.append('folder', 'uploaded_images')

      // Generate a unique public_id similar to the server-side implementation
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const randomString = Math.random().toString(36).substring(2, 11)
      formData.append('public_id', `${timestamp}-${randomString}-image`)

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      )

      return response.data.secure_url
    })

    const uploadedUrls = await Promise.all(uploadPromises)

    return uploadedUrls
  } catch (error) {
    console.error('Error uploading images to Cloudinary:', error)
    throw error
  }
}
