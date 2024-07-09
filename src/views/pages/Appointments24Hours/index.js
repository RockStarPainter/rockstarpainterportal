import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MaterialReactTable } from 'material-react-table'
import { AppointmentType } from 'src/Backend/constants'
import formatTime from 'src/utilis/formatTime'
import Tooltip from '@mui/material/Tooltip'

const Appointments24Hours = () => {
  const [data24Hours, setData24Hours] = useState([])

  const fetchData24Hours = async () => {
    try {
      const res = await axios.get('/api/appointments/get-24hours-before')

      // console.log(res.data.payload.appointments)
      setData24Hours(res.data.payload.appointments)
    } catch (error) {
      console.log(error)
      toast.error('Error fetching 24-hour appointments')
    }
  }

  useEffect(() => {
    fetchData24Hours()
  }, [])

  const columns24Hours = useMemo(
    () => [
      {
        header: 'Client Name',
        accessorKey: 'client_name'
      },
      {
        header: 'Client Email',
        accessorKey: 'client_email'
      },
      {
        header: 'Appointment Date',
        accessorKey: 'appointment_date',
        Cell: ({ cell }) => {
          const value = cell.getValue()
          const formattedDate = value ? new Date(value).toLocaleDateString('en-GB') : ''

          return (
            <Tooltip title={'DD-MM-YYYY'}>
              <span>{formattedDate}</span>
            </Tooltip>
          )
        }
      },
      {
        header: 'Appointment Time',
        accessorKey: 'appointment_time',
        Cell: ({ cell }) => {
          const value = cell.getValue()

          return formatTime(value)
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: ({ cell }) => {
          const value = cell.getValue()

          return AppointmentType[value.toUpperCase()] || value
        }
      }
    ],
    []
  )

  return (
    <Box mt={5}>
      <Typography mt={15} variant='h4' textAlign={'center'}>
        Reminder 1 Day Before Appointment
      </Typography>
      <MaterialReactTable
        columns={columns24Hours}
        data={data24Hours}
        enableColumnActions={false}
        enableSorting={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
      />
    </Box>
  )
}

export default Appointments24Hours
