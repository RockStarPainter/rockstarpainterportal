// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import adminNavigation from '../adminRoutes'
import employeeNavigation from '../employeeRoutes'
import { UserRole } from 'src/shared/enums/UserRole.enum'

const navigation = (): VerticalNavItemsType => {
  let userData: any = ''
  let role = ''

  if (typeof window !== 'undefined') {
    userData = localStorage.getItem('userData')

    if (userData) {
      role = JSON.parse(userData).role
    }
  }

  switch (role) {
    case UserRole.ADMIN:
      return adminNavigation()

    case UserRole.EMPLOYEE:
      return employeeNavigation()

    default:
      return []
  }
}

export default navigation
