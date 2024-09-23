// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { AppointmentsCrmRouteObj, InvoicingCrmRouteObj } from './routes'

const employeeNavigation = (): VerticalNavItemsType => {
  return [InvoicingCrmRouteObj, AppointmentsCrmRouteObj]
}

export default employeeNavigation
