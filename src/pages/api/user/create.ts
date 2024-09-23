// /pages/api/user/create.js
import connectDb from 'src/Backend/databaseConnection'
import UserModel from 'src/Backend/schemas/user'

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      const { user_name, password, role } = req.body

      // Validate input
      if (!user_name || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' })
      }

      // Check if the user already exists
      const existingUser = await UserModel.findOne({ user_name })
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' })
      }

      // Create new user
      const newUser = await UserModel.create({
        user_name,
        password, // You may want to hash the password here
        role
      })

      // Return success response
      res.status(201).json({
        message: 'User created successfully',
        user: newUser
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
export default connectDb(handler)
