import * as yup from 'yup'

export const appointmentSchema = yup.object().shape({
  client_name: yup.string().required('Client name is required'),
  client_email: yup.string().required('Client email is required').email('Invalid email format'),
  client_phone: yup.string().optional(),
  appointment_date: yup.date().required('Appointment date is required'),
  appointment_time: yup.string().required('Appointment time is required'),
  details: yup.string().optional(),
  status: yup.string().required('Status is required')
})
