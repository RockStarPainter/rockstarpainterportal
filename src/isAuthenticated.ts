import jwt, { JwtPayload, Secret } from 'jsonwebtoken'

// Define an interface for the decoded JWT payload
interface DecodedToken extends JwtPayload {
  user: string // Assuming `user` is a string, you can adjust this according to your actual payload structure
}

const tokenSecret = process.env.JWT_SECRET as Secret

export const isAuthenticated = (req: any) => {
  try {
    // const token = req.headers.authorization
    const token = req.headers.authorization

    console.log('tokenSecret: ' + tokenSecret)
    console.log('token: ' + token)

    // Verify and type cast the decoded payload
    const decoded = jwt.verify(token, tokenSecret, { ignoreExpiration: false }) as DecodedToken
    req.user = decoded.user

    return true
  } catch (error) {
    console.log(error)

    return false
  }
}
