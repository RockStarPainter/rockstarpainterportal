// src/backend/auth.guard.ts
import { isAuthenticated } from 'src/@core/utils/isAuthenticated'

export const guardWrapper = (handler: any) => async (req: any, res: any) => {
  try {
    if (isAuthenticated(req) === false) {
      return res.status(401).send('Unauthorized')
    }

    return await handler(req, res)
  } catch (error) {
    return res.status(500).send('Internal Server Error')
  }
}
