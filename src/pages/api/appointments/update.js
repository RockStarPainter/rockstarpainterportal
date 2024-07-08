import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

const handler = async (req, res) => {
  if (req.method === 'PUT') {
    try {
      const { appointmentId, ...updateData } = req.body
      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(appointmentId, updateData, { new: true })

      if (!updatedAppointment) {
        return res.status(404).send('Appointment not found')
      }

      return res.status(200).send({
        message: 'Appointment updated successfully',
        payload: { appointment: updatedAppointment }
      })
    } catch (error) {
      console.error('Error updating appointment:', error)

      return res.status(500).send('Something went wrong')
    }
  } else {
    res.setHeader('Allow', ['PUT'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
