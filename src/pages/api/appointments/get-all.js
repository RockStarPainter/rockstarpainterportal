import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { role, userId } = req.query

      let appointments

      if (role === 'Admin') {
        // Admins get all appointments
        appointments = await AppointmentModel.find({}).populate({ path: 'employee', select: 'user_name' }) // Populate user_name from employee reference
      } else if (role === 'Employee') {
        // Employees get only their appointments
        appointments = await AppointmentModel.find({ employee: userId }).populate({
          path: 'employee',
          select: 'user_name'
        }) // Populate user_name from employee reference
      } else {
        return res.status(403).json({ message: 'Forbidden' })
      }

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
