import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'
import UserModel from 'src/Backend/schemas/user'
import { isAuthenticated } from 'src/isAuthenticated'

// import { isAuthenticated } from 'src/Backend/utils/isAuthenticated'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      // Ensure the user is authenticated
      if (!isAuthenticated(req)) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      // Fetch the user from the request (set by isAuthenticated)
      const user = await UserModel.findById(req.user.id)
      if (!user) return res.status(404).json({ message: 'User not found' })

      let appointments
      if (user.role === 'admin') {
        // Admin: Fetch all appointments
        appointments = await AppointmentModel.find({})
      } else {
        // Employee: Fetch only appointments associated with this employee
        appointments = await AppointmentModel.find({ userId: user._id })
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
