import React from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  CircularProgress,
  Box
} from '@mui/material'

const AppointmentDetailsDialog = ({ open, onClose, appointment, loading }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Appointment Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          appointment && (
            <Box>
              <Typography variant='body1'>
                <strong>Client Name:</strong> {appointment.client_name}
              </Typography>
              <Typography variant='body1'>
                <strong>Client Email:</strong> {appointment.client_email}
              </Typography>
              <Typography variant='body1'>
                <strong>Client Phone:</strong> {appointment.client_phone}
              </Typography>
              <Typography variant='body1'>
                <strong>Appointment Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}
              </Typography>
              <Typography variant='body1'>
                <strong>Appointment Time:</strong> {appointment.appointment_time}
              </Typography>
              <Typography variant='body1'>
                <strong>Details:</strong> {appointment.details}
              </Typography>
              <Typography variant='body1'>
                <strong>Status:</strong> {appointment.status}
              </Typography>
            </Box>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AppointmentDetailsDialog
