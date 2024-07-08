import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

const handler = async (req, res) => {
  const { appointmentId } = req.query

  if (req.method === 'GET') {
    try {
      const appointment = await AppointmentModel.findById(appointmentId)

      if (!appointment) {
        return res.status(404).send('Appointment not found')
      }

      return res.send({
        message: 'Appointment fetched successfully',
        payload: { appointment }
      })
    } catch (error) {
      console.error('Error fetching appointment:', error)
      res.status(500).send('Something went wrong')
    }
  } else {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
