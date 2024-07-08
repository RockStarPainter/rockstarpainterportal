import React, { forwardRef, useState, useEffect } from 'react'
import {
  Dialog,
  IconButton,
  DialogActions,
  DialogContent,
  Slide,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  FormControl,
  TextField,
  Grid,
  FormHelperText,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import { FormProvider, useForm, Controller, useFormContext } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Spinner from 'src/@core/components/spinner'
import { appointmentSchema } from 'src/yupSchemas/appointmentSchema'
import { AppointmentType } from 'src/Backend/constants'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

const formatDate = date => {
  const d = new Date(date)
  let month = '' + (d.getMonth() + 1)
  let day = '' + d.getDate()
  const year = d.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [year, month, day].join('-')
}

const AppointmentForm = ({ defaultValues, onSubmit }) => {
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext()

  useEffect(() => {
    if (defaultValues) {
      for (const [key, value] of Object.entries(defaultValues)) {
        setValue(key, key === 'appointment_date' ? formatDate(value) : value, { shouldValidate: true })
      }
    }
  }, [defaultValues, setValue])

  return (
    <form noValidate autoComplete='off' onSubmit={onSubmit}>
      <Card>
        <CardHeader
          title={
            <Typography variant='h5' color={'primary'}>
              Update Appointment
            </Typography>
          }
        />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.client_name}>
                <Controller
                  name='client_name'
                  control={control}
                  render={({ field }) => (
                    <>
                      <TextField label='Client Name' {...field} error={Boolean(errors.client_name)} fullWidth />
                      {errors.client_name && <FormHelperText>{errors.client_name.message}</FormHelperText>}
                    </>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.client_email}>
                <Controller
                  name='client_email'
                  control={control}
                  render={({ field }) => (
                    <>
                      <TextField label='Client Email' {...field} error={Boolean(errors.client_email)} fullWidth />
                      {errors.client_email && <FormHelperText>{errors.client_email.message}</FormHelperText>}
                    </>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.client_phone}>
                <Controller
                  name='client_phone'
                  control={control}
                  render={({ field }) => (
                    <>
                      <TextField label='Client Phone' {...field} error={Boolean(errors.client_phone)} fullWidth />
                      {errors.client_phone && <FormHelperText>{errors.client_phone.message}</FormHelperText>}
                    </>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.appointment_date}>
                <Controller
                  name='appointment_date'
                  control={control}
                  render={({ field }) => (
                    <>
                      <TextField
                        type='date'
                        label='Appointment Date'
                        {...field}
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(errors.appointment_date)}
                        fullWidth
                      />
                      {errors.appointment_date && <FormHelperText>{errors.appointment_date.message}</FormHelperText>}
                    </>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.appointment_time}>
                <Controller
                  name='appointment_time'
                  control={control}
                  render={({ field }) => (
                    <>
                      <TextField
                        type='time'
                        label='Appointment Time'
                        {...field}
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(errors.appointment_time)}
                        fullWidth
                      />
                      {errors.appointment_time && <FormHelperText>{errors.appointment_time.message}</FormHelperText>}
                    </>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.details}>
                <Controller
                  name='details'
                  control={control}
                  render={({ field }) => (
                    <>
                      <TextField label='Details' {...field} error={Boolean(errors.details)} fullWidth />
                      {errors.details && <FormHelperText>{errors.details.message}</FormHelperText>}
                    </>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id='status-label'>Status</InputLabel>
                <Controller
                  name='status'
                  control={control}
                  defaultValue={AppointmentType.UP_COMING}
                  render={({ field }) => (
                    <Select {...field} labelId='status-label' label='Status' fullWidth>
                      <MenuItem value={AppointmentType.UP_COMING}>Upcoming</MenuItem>
                      <MenuItem value={AppointmentType.COMPLETED}>Completed</MenuItem>
                      <MenuItem value={AppointmentType.CANCELLED}>Cancelled</MenuItem>
                    </Select>
                  )}
                />
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
          <Button fullWidth size='large' type='submit' variant='contained' sx={{ mt: 3, mb: 7 }}>
            Update Appointment
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

const UpdateAppointmentDialog = ({ appointmentId, open, onClose, onUpdateComplete }) => {
  const [apiLoading, setApiLoading] = useState(false)
  const [defaultValues, setDefaultValues] = useState(null)

  const methods = useForm({
    defaultValues: {
      client_name: '',
      client_email: '',
      client_phone: '',
      appointment_date: '',
      appointment_time: '',
      details: '',
      status: AppointmentType.UP_COMING
    },
    resolver: yupResolver(appointmentSchema),
    mode: 'onChange'
  })

  useEffect(() => {
    if (appointmentId) {
      const fetchAppointment = async () => {
        try {
          setApiLoading(true)

          const res = await axios.get(`/api/appointments/${appointmentId}`, {
            headers: { authorization: localStorage.getItem('token') }
          })
          const appointment = res.data.payload.appointment
          appointment.appointment_date = formatDate(appointment.appointment_date) // Format the date here
          setDefaultValues(appointment)
          methods.reset(appointment)
          setApiLoading(false)
        } catch (error) {
          toast.error(error?.response?.data)
          setApiLoading(false)
        }
      }
      fetchAppointment()
    }
  }, [appointmentId, methods])

  const onSubmit = methods.handleSubmit(async data => {
    try {
      await axios.put(
        `/api/appointments/update`,
        { appointmentId, ...data },
        {
          headers: { authorization: localStorage.getItem('token') }
        }
      )
      toast.success('Appointment updated successfully')
      onClose()
      onUpdateComplete() // Trigger the callback to fetch the appointments
    } catch (error) {
      toast.error(error?.response?.data || 'Something went wrong')
    }
  })

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
          <Spinner />
        ) : (
          <FormProvider {...methods}>
            <AppointmentForm defaultValues={defaultValues} onSubmit={onSubmit} />
          </FormProvider>
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

export default UpdateAppointmentDialog
