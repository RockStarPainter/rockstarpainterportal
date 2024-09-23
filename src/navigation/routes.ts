export const InvoicingCrmRouteObj = {
  title: 'Invoicing CRM',
  path: '/',
  icon: 'mdi:invoice-text-arrow-left-outline'
}

export const AppointmentsCrmRouteObj = {
  title: 'Appointments CRM',
  path: '/scheduling-dashboard',
  icon: 'mdi:calendar-clock-outline'
}

export const UsersRouteObj = {
  title: 'Users',
  icon: 'mdi:account-multiple-outline',
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
