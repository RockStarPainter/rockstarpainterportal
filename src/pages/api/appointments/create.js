import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const newAppointment = new AppointmentModel({ ...req.body })

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
