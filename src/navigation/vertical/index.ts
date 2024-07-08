// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Invoice Crm',
      path: '/',
      icon: 'mdi:home-outline'
    },
    {
      title: 'Scheduling Crm',
      path: '/scheduling-dashboard',
      icon: 'mdi:home-outline'
    }
  ]
}

export default navigation
