import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

const handler = async (req, res) => {
  if (req.method === 'DELETE') {
    try {
      const { appointmentId } = req.body

      const deleteAppointment = await AppointmentModel.findByIdAndDelete(appointmentId)

      if (!deleteAppointment) {
        return res.status(404).send('Appointment not found')
      }

      return res.status(200).send({
        message: 'Appointment deleted successfully',
        payload: { appointment: deleteAppointment }
      })
    } catch (error) {
      console.error('Error saving appointment:', error)

      return res.status(500).send('Something went wrong')
    }
  } else {
    res.setHeader('Allow', ['DELETE'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
