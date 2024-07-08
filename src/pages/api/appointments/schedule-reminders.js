import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

const mailerSend = new MailerSend({
  apiKey: 'mlsn.9794f3c98a5782999dd8016e02407362789f797b5dea6675a25f9e6f5a1e5899'
})

// import dayjs from 'dayjs'

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { appointmentId } = req.body
      const appointment = await AppointmentModel.findById(appointmentId)

      if (!appointment) {
        return res.status(404).send('Appointment not found')
      }
      const sentFrom = new Sender('info@rockstarpainting.us', 'RockStar Paints')

      const recipients = [new Recipient('hunfa.jalil786@gmail.com', 'Shabi')]

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject('This is a scheduled Subject')
        .setHtml('<strong>This is a scheduled HTML content</strong>')
        .setText('This is a scheduled text content')
        .setSendAt(Math.floor(new Date(Date.now() + 5 * 60 * 1000).getTime() / 1000)) //send in 30mins NB:param has to be a Unix timestamp e.g 2443651141

      const h = await mailerSend.email.send(emailParams)
      console.log('hunfa')
      console.log(h)

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
