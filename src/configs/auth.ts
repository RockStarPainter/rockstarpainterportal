export default {
  meEndpoint: '/api/auth/verify-token',
  loginEndpoint: '/api/auth/login',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: '/api/accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
