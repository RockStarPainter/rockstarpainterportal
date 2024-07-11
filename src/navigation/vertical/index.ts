// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Invoicing CRM',
      path: '/',
      icon: 'mdi:home-outline'
    },
    {
      title: 'Appointments CRM',
      path: '/scheduling-dashboard',
      icon: 'mdi:home-outline'
    }
  ]
}

export default navigation
