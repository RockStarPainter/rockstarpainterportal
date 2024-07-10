import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'
import { AppointmentType } from 'src/Backend/constants'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const currentDate = new Date()
      const endDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) // 24 hours later

      const appointments = await AppointmentModel.find({
        appointment_date: {
          $gte: currentDate,
          $lte: endDate
        },
        status: AppointmentType.UP_COMING
      })

      return res.status(200).json({
        message: 'Appointments fetched successfully',
        payload: { appointments }
      })
    } catch (error) {
      console.error('Error fetching appointments:', error)

      return res.status(500).json({ message: 'Something went wrong' })
    }
  } else {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
