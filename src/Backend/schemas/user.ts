import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    user_name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee' // Default role if not specified
    }
  },
  { timestamps: true }
)

const UserModel = mongoose.models.User || mongoose.model('User', userSchema)

export default UserModel
