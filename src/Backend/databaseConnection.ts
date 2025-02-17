import mongoose from 'mongoose'

const connectDb = (handler: any) => async (req: any, res: any) => {
  if (mongoose.connections[0].readyState) {
    return handler(req, res)
  }

  //connect db
  await mongoose.connect('mongodb+srv://crmrankbpo:8PQnqzqTnGeXnSAX@crmrankorbit.gq2hhuc.mongodb.net/rockstarinvoices')

  return handler(req, res)
}

export default connectDb
