import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { appointmentId } = req.body
      const data = await AppointmentModel.findById(appointmentId)

      if (!data) {
        return res.status(404).send('Appointment not found')
      }

      return res.send({
        message: 'Appointment fetched successfully',
        payload: { data }
      })
    } catch (error) {
      console.error(error)
      res.status(500).send('Something went wrong')
    }
  } else {
    res.status(405).send('Method Not Allowed')
  }
}

export default connectDb(handler)
