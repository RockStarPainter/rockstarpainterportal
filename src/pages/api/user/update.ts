// /pages/api/user/update.ts

import connectDb from 'src/Backend/databaseConnection'
import UserModel from 'src/Backend/schemas/user'

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      const { user_name, password, role, user_id } = req.body

      // Find the user by ID and update the fields
      const updatedUser = await UserModel.findByIdAndUpdate(
        user_id,
        { user_name, password, role },
        { new: true, runValidators: true }
      )

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' })
      }

      return res.status(200).json({
        message: 'User updated successfully',
        payload: { user: updatedUser }
      })
    } catch (error) {
      console.error('Error updating user:', error)

      return res.status(500).json({ message: 'Something went wrong' })
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}

export default connectDb(handler)
