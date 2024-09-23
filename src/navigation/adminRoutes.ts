// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { AppointmentsCrmRouteObj, InvoicingCrmRouteObj, UsersRouteObj } from './routes'

const adminNavigation = (): VerticalNavItemsType => {
  return [InvoicingCrmRouteObj, AppointmentsCrmRouteObj, UsersRouteObj]
}

export default adminNavigation
