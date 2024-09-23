import connectDb from 'src/Backend/databaseConnection'
import UserModel from 'src/Backend/schemas/user' // Assuming you already have a user schema

const handler = async (req: any, res: any) => {
  if (req.method === 'GET') {
    try {
      // Fetch all users from the database
      const users = await UserModel.find({}).sort({ createdAt: -1 })

      return res.send({
        message: 'Users fetched successfully',
        payload: { users }
      })
    } catch (error) {
      console.error(error)
      res.status(500).send('Something went wrong')
    }
  } else {
    res.status(500).send('This is a GET request')
  }
}

export default connectDb(handler)
