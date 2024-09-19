import jwt from 'jsonwebtoken'
import UserModel from 'src/Backend/schemas/user' // Import user schema

const authMiddleware = async ({ req, res, next }: any) => {
  try {
    // Extract token from headers
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find the user associated with the decoded token
    const user = await UserModel.findById(decoded.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Attach user info to request object
    req.user = { id: user._id, role: user.role }

    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export default authMiddleware
