import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const appointments = await AppointmentModel.find({})

      return res.status(200).send({
        message: 'Appointments fetched successfully',
        payload: { appointments }
      })
    } catch (error) {
      console.error('Error fetching appointments:', error)

      return res.status(500).send('Something went wrong')
    }
  } else {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
