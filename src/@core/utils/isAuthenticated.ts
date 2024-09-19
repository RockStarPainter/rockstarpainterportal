// src/backend/utils/isAuthenticated.ts
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'

interface DecodedToken extends JwtPayload {
  user: string
}

const tokenSecret = process.env.JWT_SECRET as Secret

export const isAuthenticated = (req: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return false

    const decoded = jwt.verify(token, tokenSecret) as DecodedToken
    req.user = decoded.user

    return true
  } catch (error) {
    return false
  }
}
