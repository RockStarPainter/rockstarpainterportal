import { Typography } from '@mui/material'
import React from 'react'
import UserTable from 'src/@core/layouts/components/tables/userTable'

function Index() {
  return (
    <>
      <Typography variant='h4' sx={{ mb: 5 }}>
        Users Table
      </Typography>

      <UserTable />
    </>
  )
}

export default Index
