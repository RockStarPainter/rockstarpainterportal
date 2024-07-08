import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

// import { scheduleEmail } from '../../../Backend/mailerSend'
// import dayjs from 'dayjs'

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { appointmentId } = req.body
      const appointment = await AppointmentModel.findById(appointmentId)

      if (!appointment) {
        return res.status(404).send('Appointment not found')
      }

      // const appointmentDateTime = dayjs(
      //   `${appointment.appointment_date.toISOString().substring(0, 10)}T${appointment.appointment_time}`
      // )
      // console.log(appointmentDateTime)
      // // Check if the combined date and time is valid

      // const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
      // const twelveHoursBefore = new Date(appointmentDate.getTime() - 12 * 60 * 60 * 1000)
      // const twoHoursBefore = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000)
      // console.log('12 hour before', twoHoursBefore)
      // await scheduleEmail(
      //   appointment.client_email,
      //   'Appointment Reminder (12 hours)',
      //   `Reminder: Your appointment is in 12 hours. Scheduled for ${appointment.appointment_date} at ${appointment.appointment_time}.`,
      //   twelveHoursBefore.toISOString()
      // )

      // await scheduleEmail(
      //   appointment.client_email,
      //   'Appointment Reminder (2 hours)',
      //   `Reminder: Your appointment is in 2 hours. Scheduled for ${appointment.appointment_date} at ${appointment.appointment_time}.`,
      //   twoHoursBefore.toISOString()
      // )

      return res.send({
        message: 'Reminders scheduled successfully'
      })
    } catch (error) {
      console.error('Error scheduling reminders:', error)
      res.status(500).send('Something went wrong')
    }
  } else {
    res.status(405).send('Method Not Allowed')
  }
}

export default connectDb(handler)
