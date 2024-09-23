import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

const formatPhoneNumber = phone => {
  if (!phone) return null

  // Remove all non-digit characters
  let formattedPhone = phone.replace(/\D/g, '')

  // Add +1 if it's not already there
  if (!formattedPhone.startsWith('1')) {
    formattedPhone = '1' + formattedPhone
  }

  // Return phone with +1 added
  return `+${formattedPhone}`
}

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { userId, ...appointmentData } = req.body // Extract userId from the request body

      // Format the phone number
      if (appointmentData.client_phone) {
        appointmentData.client_phone = formatPhoneNumber(appointmentData.client_phone)
      }

      // Create the appointment and set the employee field to the userId
      const newAppointment = new AppointmentModel({
        ...appointmentData,
        employee: userId // Associate the appointment with the logged-in user (employee)
      })

      const saved = await newAppointment.save()

      if (!saved) {
        return res.status(404).send('Not able to save appointment')
      }

      return res.status(201).send({
        message: 'Appointment created successfully',
        payload: { appointment: saved }
      })
    } catch (error) {
      console.error('Error saving appointment:', error)

      return res.status(500).send('Something went wrong')
    }
  } else {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
