import connectDb from 'src/Backend/databaseConnection'
import UserModel from 'src/Backend/schemas/user'

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      const { user_name, password } = req.body

      const userData = await UserModel.findOne({ user_name })
      if (!userData) return res.status(401).send('Invalid username or password')

      if (password !== userData.password) return res.status(401).send('Invalid username or password')

      return res.send({
        message: 'login successful',
        payload: { userData }
      })
    } catch (error) {
      console.log(error)
      res.status(500).send('Something went wrong')
    }
  } else {
    res.status(405).send('Method not allowed')
  }
}

export default connectDb(handler)
