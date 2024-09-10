import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'
import { MailerSend, SMSParams } from 'mailersend'
import dayjs from 'dayjs'

const mailerSend = new MailerSend({
  apiKey: 'mlsn.9c77df47fbe9081e10c6ed4186e62c9405412f383294e0db5452e870c41379cf'
})

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { appointmentId } = req.body
      const saved = await AppointmentModel.findById(appointmentId)

      if (!saved) {
        return res.status(404).send('Appointment not found')
      }

      const smsParams = new SMSParams()
        .setFrom('+18448975791') // Replace with your MailerSend virtual number
        .setTo([saved.client_phone]) // Ensure client_phone is a field in your appointment schema
        .setText(
          `Hello ${saved.client_name},\n
This is a reminder for your upcoming appointment with Rockstar Painting. We look forward to bringing color and life to your space!\n
📅 Date: ${dayjs(saved.appointment_date).format('D-MMMM-YYYY')}\n
⏰ Time: ${saved.appointment_time}\n
🌐 www.rockstarpainting.com\n
📞 Contact: 720 771 5791\n
Thank you for choosing Rockstar Painting. See you soon!\n\n
Please do not reply to this message.`
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
