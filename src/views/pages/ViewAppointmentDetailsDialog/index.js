import React, { forwardRef, useState, useEffect } from 'react'
import {
  Dialog,
  IconButton,
  DialogActions,
  DialogContent,
  Slide,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

const BoldText = ({ children }) => (
  <Typography variant='subtitle1' sx={{ fontWeight: 'bold', display: 'inline' }}>
    {children}
  </Typography>
)

const ViewAppointmentDetailsDialog = ({ _id, open, onClose }) => {
  const [apiLoading, setApiLoading] = useState(false)
  const [data, setData] = useState({})

  const fetchAppointmentDetails = async () => {
    setApiLoading(true)
    axios
      .post(
        '/api/appointments/get-single',
        { appointmentId: _id },
        {
          headers: { authorization: localStorage.getItem('token') }
        }
      )
      .then(res => {
        setData(res.data.payload.data)
      })
      .catch(error => {
        console.log(error)
        toast.error(error?.response?.data)
      })
      .finally(() => {
        setApiLoading(false)
      })
  }

  useEffect(() => {
    if (_id) {
      fetchAppointmentDetails()
    }
  }, [_id])

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition} onBackdropClick={onClose}>
      <DialogContent
        sx={{
          backgroundColor: '#282A42',
          position: 'relative',
          pb: theme => `${theme.spacing(8)} !important`,
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <IconButton size='small' onClick={onClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
          <Icon icon='mdi:close' />
        </IconButton>
        {apiLoading ? (
          <CircularProgress />
        ) : (
          <Card>
            <CardHeader
              title={
                <Typography variant='h5' color={'primary'}>
                  Appointment Details
                </Typography>
              }
            />
            <Divider sx={{ m: '0 !important' }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <BoldText>Client Name:</BoldText> {data.client_name}
                </Grid>
                <Grid item xs={6}>
                  <BoldText>Client Email:</BoldText> {data.client_email}
                </Grid>
                <Grid item xs={6}>
                  <BoldText>Client Phone:</BoldText> {data.client_phone}
                </Grid>
                <Grid item xs={6}>
                  <BoldText>Appointment Date:</BoldText>{' '}
                  {data.appointment_date && new Date(data.appointment_date).toLocaleDateString()}
                </Grid>
                <Grid item xs={6}>
                  <BoldText>Appointment Time:</BoldText> {data.appointment_time}
                </Grid>
                <Grid item xs={6}>
                  <BoldText>Details:</BoldText> {data.details}
                </Grid>
                <Grid item xs={6}>
                  <BoldText>Status:</BoldText> {data.status}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: '#282A42',
          justifyContent: 'center',
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      ></DialogActions>
    </Dialog>
  )
}

export default ViewAppointmentDetailsDialog
