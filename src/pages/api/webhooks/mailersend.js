import AppointmentModel from 'src/Backend/schemas/appointment'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const eventData = req.body

    try {
      // Log incoming event for debugging
      console.log('Webhook received:', eventData)

      // Check if it's an email opened event
      if (eventData.type === 'activity.opened') {
        const messageId = eventData.data.email.message.id // Corrected: Extract message ID from the event data
        console.log(`Email with message ID ${messageId} was opened by ${eventData.data.email.recipient.email}`)

        // Update the appointment in the database where email_id matches
        const updatedAppointment = await AppointmentModel.findOneAndUpdate(
          { email_id: messageId }, // Match the message ID stored in DB (email_id)
          { emailOpened: true },
          { new: true } // Return the updated document
        )

        if (updatedAppointment) {
          console.log('Appointment updated successfully:', updatedAppointment)
        } else {
          console.log('Appointment not found for message ID:', messageId)
        }
      }

      // Check if it's an email clicked event
      if (eventData.type === 'activity.clicked') {
        const messageId = eventData.data.email.message.id // Corrected: Extract message ID from the event data
        console.log(`Link in email with message ID ${messageId} was clicked by ${eventData.data.email.recipient.email}`)

        // Update the appointment in the database where email_id matches
        const updatedAppointment = await AppointmentModel.findOneAndUpdate(
          { email_id: messageId }, // Match the message ID stored in DB (email_id)
          { emailClicked: true },
          { new: true } // Return the updated document
        )

        if (updatedAppointment) {
          console.log('Appointment updated successfully:', updatedAppointment)
        } else {
          console.log('Appointment not found for message ID:', messageId)
        }
      }

      res.status(200).json({ message: 'Webhook received and processed!' })
    } catch (error) {
      console.error('Error handling webhook:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
