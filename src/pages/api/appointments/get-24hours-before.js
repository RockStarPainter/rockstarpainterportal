import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'
import moment from 'moment/moment'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const currentDate = moment()
      const startDate = currentDate.clone().subtract(24, 'hours').toDate()

      const appointments = await AppointmentModel.find({
        appointment_date: {
          $gte: startDate,
          $lte: currentDate.toDate()
        }
      })

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
