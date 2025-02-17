import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Box, Typography, CircularProgress, Modal, Button } from '@mui/material'

const InvoiceImagesPage = () => {
  const router = useRouter()
  const { invoiceId } = router.query
  const [images, setImages] = useState<string[]>([])
  const [imageComments, setImagesComments] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (!invoiceId) return

    const fetchImages = async () => {
      try {
        const response = await axios.post(`/api/get`, { invoiceId })
        console.log('API Response:', response.data) // Debugging

        // ✅ Store only unique image URLs
        setImages(prev => [...new Set([...prev, ...(response.data?.payload?.data?.images || [])])])
        setImagesComments(response.data?.payload?.data?.imageComments)
      } catch (error) {
        console.error('Error fetching images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [invoiceId])

  // 🔽 Function to Download All Images 🔽
  const downloadAllImages = async () => {
    if (images.length === 0) {
      console.warn('No images to download.')

      return
    }

    const batchSize = 10 // Download 10 images at a time
    let batchStart = 0

    while (batchStart < images.length) {
      const batch = images.slice(batchStart, batchStart + batchSize) // Get next 10 images

      console.log(`Downloading batch: ${batchStart + 1} to ${batchStart + batch.length}`)

      await Promise.all(
        batch.map(async (url, index) => {
          try {
            const response = await fetch(url)
            const blob = await response.blob()
            const objectURL = URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = objectURL
            link.download = `invoice_image_${batchStart + index + 1}.jpg` // Unique name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // ✅ Important: Revoke Object URL Immediately After Download
            setTimeout(() => {
              URL.revokeObjectURL(objectURL)
              console.log(`Cleared memory for image ${batchStart + index + 1}`)
            }, 1000) // Delay to allow download before clearing memory
          } catch (error) {
            console.error(`Error downloading image ${batchStart + index + 1}:`, error)
          }
        })
      )

      batchStart += batchSize // Move to the next batch
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds before next batch
    }

    console.log('All images downloaded in batches.')
  }

  return (
    <Box sx={{ textAlign: 'center', padding: '20px' }}>
      <Typography variant='h4' fontWeight='bold'>
        Invoice Images
      </Typography>

      {/* 🔹 Download Button at the Top */}
      <Button
        variant='contained'
        sx={{ marginTop: '20px', backgroundColor: '#007bff', color: 'white' }}
        onClick={downloadAllImages}
        disabled={images.length === 0}
      >
        Download All Images
      </Button>

      {loading ? (
        <CircularProgress sx={{ marginTop: '20px' }} />
      ) : images.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, marginTop: '20px' }}>
          {images.map((url, index) => (
            <Box
              key={index}
              sx={{
                width: 200,
                height: 200,
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.05)', transition: '0.3s' }
              }}
              onClick={() => setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`Invoice Image ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant='h6' sx={{ marginTop: '20px', color: 'gray' }}>
          No images found for this invoice.
        </Typography>
      )}

      <Typography
        variant='body1'
        sx={{
          p: 2,
          borderRadius: '8px',
          border: '1px solid #B0B0B0',
          minHeight: '120px',
          backgroundColor: '#F7F7F9',
          marginTop:'5rem'
        }}
      >
        {imageComments || 'No image comments'}
      </Typography>

      {/* Popup Modal for Image */}
      <Modal open={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt='Selected Invoice'
              style={{ width: '100%', height: 'auto', maxHeight: '80vh' }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  )
}

export default InvoiceImagesPage
