// /pages/api/user/delete.js
import connectDb from 'src/Backend/databaseConnection'
import UserModel from 'src/Backend/schemas/user'

const handler = async (req: any, res: any) => {
  if (req.method === 'DELETE') {
    try {
      const { user_id } = req.body // or use req.query.user_id for query parameters

      // Validate input
      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' })
      }

      // Check if the user exists
      const user = await UserModel.findById(user_id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Delete the user
      await UserModel.findByIdAndDelete(user_id)

      // Return success response
      return res.status(200).json({
        message: 'User deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting user:', error)

      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}

export default connectDb(handler)
