import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'
import { MailerSend, SmsParams } from 'mailersend'

const mailerSend = new MailerSend({
  api_key: process.env.MAILERSEND_API_KEY // Ensure you have this in your .env.local
})

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { appointmentId } = req.body
      const saved = await AppointmentModel.findById(appointmentId)

      if (!saved) {
        return res.status(404).send('Appointment not found')
      }

      const smsParams = new SmsParams()
        .setFrom('+18332552485') // Replace with your MailerSend virtual number
        .setRecipients([saved.client_phone]) // Ensure client_phone is a field in your appointment schema
        .setText(
          `Hello ${saved.client_name}, your appointment is confirmed for ${saved.appointment_date} at ${saved.appointment_time}.`
        )

      await mailerSend.sms.send(smsParams)
      console.log('SMS sent successfully')

      return res.send({
        message: 'SMS sent successfully'
      })
    } catch (error) {
      console.error('Error sending SMS:', error)
      res.status(500).send('Something went wrong')
    }
  } else {
    res.status(405).send('Method Not Allowed')
  }
}

export default connectDb(handler)
