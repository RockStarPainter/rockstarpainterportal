// import connectDb from 'src/Backend/databaseConnection'
// import jwt, { Secret } from 'jsonwebtoken'
// import UserModel from 'src/Backend/schemas/user'

// const tokenSecret = process.env.JWT_SECRET as Secret
// const handler = async (req: any, res: any) => {
//   if (req.method === 'POST') {
//     try {
//       const { token } = req.body

//       UserModel.schema

//       const decoded: any = jwt.verify(token, tokenSecret)

//       const user = await UserModel.findOne({ user_name: decoded.user.user_name }, '-password')
//       if (!user) return res.status(500).send('user not found')

//       return res.send({
//         message: 'token verify successful',
//         payload: { user, token }
//       })
//     } catch (error) {
//       res.status(500).send('something went wrong')
//     }
//   } else {
//     res.status(500).send('this is a post request')
//   }
// }

// export default connectDb(handler)
