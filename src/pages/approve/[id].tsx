import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material'
import { toast } from 'react-hot-toast' // For toast notifications

const ApprovePage = () => {
  const router = useRouter()
  const [approvalStatus, setApprovalStatus] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { id, token } = router.query

  // Wait for router to be ready and query parameters to be present
  useEffect(() => {
    if (router.isReady) {
      if (id && token) {
        setLoading(false)
      } else {
        setError('Invalid link or missing parameters')
        setLoading(false)
      }
    }
  }, [router.isReady, id, token])

  const handleApproval = async () => {
    try {
      const response = await fetch('/api/approveInvoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, token, status: approvalStatus, remarks })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Feedback Submitted Successfully')

        // Reset form after successful submission
        setApprovalStatus('')
        setRemarks('')
      } else {
        toast.error('Failed to submit feedback')
      }
    } catch (err) {
      console.error('Error approving invoice:', err)
      toast.error('Failed to submit feedback')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Typography variant='h5' sx={{ mb: 4 }}>
        Action Required for Invoice {id}
      </Typography>

      {/* Dropdown for selecting approval status */}
      <Select
        value={approvalStatus}
        onChange={e => setApprovalStatus(e.target.value)}
        fullWidth
        displayEmpty
        sx={{ mb: 3 }}
      >
        <MenuItem value='' disabled>
          Select Approval Status
        </MenuItem>
        <MenuItem value='Pending'>Pending</MenuItem>
        <MenuItem value='Approved'>Approved</MenuItem>
        <MenuItem value='Rejected'>Rejected</MenuItem>
        <MenuItem value='Modification Requested'>Modification Requested</MenuItem>
      </Select>

      {/* Remarks text area */}
      <TextField
        label='Remarks'
        value={remarks}
        onChange={e => setRemarks(e.target.value)}
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 3 }}
      />

      {/* Submit button */}
      <Button variant='contained' color='primary' onClick={handleApproval} fullWidth>
        Submit Feedback
      </Button>
    </Box>
  )
}

// Disable authentication guard for this page
ApprovePage.authGuard = false

export default ApprovePage
