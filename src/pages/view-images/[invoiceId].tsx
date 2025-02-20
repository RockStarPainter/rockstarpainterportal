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
    <Box
      sx={{
        padding: '32px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 6
        }}
      >
        <Typography
          variant='h4'
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            mb: 3,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              borderRadius: '2px'
            }
          }}
        >
          Invoice Images
        </Typography>

        <Button
          variant='contained'
          onClick={downloadAllImages}
          disabled={images.length === 0 || loading}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: '8px',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'translateY(-2px)',
              transition: 'all 0.2s'
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0'
            },
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Processing</span>
              <CircularProgress size={20} sx={{ color: 'white' }} />
            </Box>
          ) : (
            'Download All Images'
          )}
        </Button>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          borderRadius: '16px',
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          p: 4
        }}
      >
        {/* Images Section */}
        <Box sx={{ position: 'relative', width: '100%', mb: 6 }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 8
              }}
            >
              <CircularProgress size={50} thickness={4} />
              <Typography variant='body1' color='text.secondary'>
                Loading Images...
              </Typography>
            </Box>
          ) : images.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 3,
                width: '100%'
              }}
            >
              {images.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }
                  }}
                  onClick={() => setSelectedImage(url)}
                >
                  <img
                    src={url}
                    alt={`Invoice Image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                py: 8,
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #e0e0e0'
              }}
            >
              <Typography variant='h6' sx={{ color: 'text.secondary' }}>
                No images found for this invoice.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Comments Section */}
        <Box sx={{ width: '100%' }}>
          <Typography
            variant='h6'
            sx={{
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:before': {
                content: '""',
                width: '4px',
                height: '24px',
                backgroundColor: 'primary.main',
                borderRadius: '2px'
              }
            }}
          >
            Comments
          </Typography>

          <Box
            sx={{
              p: 3,
              borderRadius: '12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e0e0e0',
              minHeight: '120px'
            }}
          >
            <Typography
              variant='body1'
              sx={{
                color: imageComments ? 'text.primary' : 'text.secondary',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap'
              }}
            >
              {imageComments || 'No comments available for this invoice.'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Modal */}
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        sx={{
          backdropFilter: 'blur(5px)'
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxHeight: '90vh',
            bgcolor: 'white',
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            p: 2,
            outline: 'none',
            overflow: 'hidden'
          }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt='Selected Invoice'
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  )
}

export default InvoiceImagesPage
