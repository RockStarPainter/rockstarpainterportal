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
    },
    {
      title: 'Users', // Users section
      icon: 'mdi:shield-outline',
      children: [
        {
          title: 'Create New User',
          path: '/users/create-user'
        },
        {
          title: 'View Users',
          path: '/users/view-users'
        }
      ]
    }
  ]
}

export default navigation
