import mongoose from 'mongoose'

const connectDb = (handler: any) => async (req: any, res: any) => {
  if (mongoose.connections[0].readyState) {
    return handler(req, res)
  }

  await mongoose.connect('mongodb+srv://hunfa:hunfa@cluster0.z2kbwem.mongodb.net/invoice-crm')

  return handler(req, res)
}

export default connectDb
