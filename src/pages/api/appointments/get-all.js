import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'
import UserModel from 'src/Backend/schemas/user' // Import UserModel to ensure it's registered

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { role, userId } = req.query

      let appointments

      // Make sure UserModel is used to prevent build errors
      await UserModel.findOne({}) // Dummy query to ensure the UserModel is registered

      if (role === 'Admin') {
        // Admins get all appointments
        appointments = await AppointmentModel.find({}).populate({ path: 'employee', select: 'user_name' }) // Populate employee's user_name from UserModel
      } else if (role === 'Employee') {
        // Employees get only their appointments
        appointments = await AppointmentModel.find({ employee: userId }).populate({
          path: 'employee',
          select: 'user_name'
        }) // Populate employee's user_name from UserModel
      } else {
        return res.status(403).json({ message: 'Forbidden' })
      }

      return res.status(200).json({
        message: 'Appointments fetched successfully',
        payload: { appointments }
      })
    } catch (error) {
      console.error('Error fetching appointments:', error.message, error.stack)

      return res.status(500).json({ message: 'Something went wrong', error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
