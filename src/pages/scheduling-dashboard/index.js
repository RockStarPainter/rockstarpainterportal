import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  CircularProgress,
  FormControl,
  Box,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import EditIcon from '@mui/icons-material/Edit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import { AppointmentType } from 'src/Backend/constants'
import ViewAppointmentDetailsDialog from 'src/views/pages/ViewAppointmentDetailsDialog'
import UpdateAppointmentDialog from 'src/views/pages/UpdateAppointmentDialog'
import formatTime from 'src/utilis/formatTime'
import Appointments24Hours from 'src/views/pages/Appointments24Hours'
import SendIcon from '@mui/icons-material/Send'
import Tooltip from '@mui/material/Tooltip'
import SmsIcon from '@mui/icons-material/Sms' // Import the Sms icon
import Icon from 'src/@core/components/icon'

const Home = () => {
  const [data, setData] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true) // Add loading state

  const fetchData = async () => {
    const storedData = localStorage.getItem('userData')
    const userData = storedData ? JSON.parse(storedData) : null

    if (!userData) {
      toast.error('User data missing, please log in again')

      return
    }

    const { role, _id } = userData

    try {
      setIsLoading(true) // Set loading to true before fetching
      const res = await axios.get('/api/appointments/get-all', {
        headers: {
          authorization: localStorage.getItem('token')
        },
        params: {
          role,
          userId: _id
        }
      })
      const fetchedData = res.data.payload.appointments

      // Sort the data
      const sortedData = fetchedData.sort((a, b) => {
        // Check if emailOpened or emailClicked is true for 'a' and 'b'
        const aPriority = a.emailOpened || a.emailClicked
        const bPriority = b.emailOpened || b.emailClicked

        // Prioritize appointments with emailOpened or emailClicked
        if (aPriority && !bPriority) {
          return -1 // 'a' should be before 'b'
        }
        if (!aPriority && bPriority) {
          return 1 // 'b' should be before 'a'
        }

        // If both have the same priority, sort by creation date (older ones on top)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

      setData(sortedData)
    } catch (error) {
      console.log(error)
      toast.error('Error fetching data')
    } finally {
      setIsLoading(false) // Set loading to false after fetching
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteClick = appointmentId => {
    setSelectedAppointment(appointmentId)
    setOpenDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await axios.delete('/api/appointments/delete', { data: { appointmentId: selectedAppointment } })
      setData(prev => prev.filter(p => p._id !== selectedAppointment))
      toast.success('Appointment deleted successfully')
    } catch (error) {
      console.log(error)
      toast.error('Network Error')
    } finally {
      setDeleting(false)
      setOpenDialog(false)
      setSelectedAppointment(null)
    }
  }

  const handleCancelDelete = () => {
    setOpenDialog(false)
    setSelectedAppointment(null)
  }

  const handleViewDetails = appointmentId => {
    setSelectedAppointment(appointmentId)
    setViewDialog(true)
  }

  const handleCloseViewDialog = () => {
    setViewDialog(false)
    setSelectedAppointment(null)
  }

  const handleEditClick = appointmentId => {
    setSelectedAppointment(appointmentId)
    setEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialog(false)
    setSelectedAppointment(null)
  }

  const updateStatus = async (appointmentId, status) => {
    try {
      await axios.put(
        '/api/appointments/update-type',
        { appointmentId, status },
        {
          headers: { authorization: localStorage.getItem('token') }
        }
      )
      toast.success('Appointment status updated successfully')
      fetchData() // Refresh the data
    } catch (error) {
      console.error(error)
      toast.error('Error updating appointment status')
    }
  }

  // a comment

  const handleSendEmail = async appointment => {
    try {
      console.log('Sending initial email for appointment:', appointment._id)

      // Send initial email
      await axios.post('/api/appointments/send-email', { appointmentId: appointment._id })
      console.log('Initial email sent successfully for appointment:', appointment._id)

      // Schedule reminder emails
      await axios.post('/api/appointments/schedule-reminders', { appointmentId: appointment._id })

      toast.success('Email sent and reminders scheduled successfully')
    } catch (error) {
      console.error('Error sending email or scheduling reminders:', error)
      toast.error('Error sending email')
    }
  }

  const handleSendSMS = async appointment => {
    try {
      await axios.post('/api/appointments/send-sms', { appointmentId: appointment._id })
      toast.success('SMS sent successfully')
    } catch (error) {
      console.error('Error sending SMS:', error)
      toast.error('Error sending SMS')
    }
  }

  const columns = useMemo(
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
        header: 'Created By', // New column to show the employee who created the appointment
        accessorKey: 'employee',
        Cell: ({ cell }) => {
          const employee = cell.getValue()

          return employee?.user_name || 'Admin' // Display the user_name of the employee or 'Admin' if null
        }
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
        header: 'Email Opened',
        accessorKey: 'emailOpened',
        Cell: ({ cell }) => {
          const isEmailOpened = cell.getValue()

          return (
            <Tooltip title={isEmailOpened ? 'Email is opened' : 'Email not opened'}>
              <span style={{ color: isEmailOpened ? 'green' : 'black', display: 'flex', alignItems: 'center' }}>
                {isEmailOpened ? (
                  <>
                    <Icon icon='mdi:email-check' fontSize={30} style={{ marginRight: '5px' }} />
                  </>
                ) : (
                  <>
                    <Icon icon='mdi:email-off' fontSize={30} style={{ marginRight: '5px' }} />
                  </>
                )}
              </span>
            </Tooltip>
          )
        }
      },
      {
        header: 'Email Clicked',
        accessorKey: 'emailClicked',
        Cell: ({ cell }) => {
          const isEmailClicked = cell.getValue()

          return (
            <Tooltip title={isEmailClicked ? 'Link inside email is clicked' : 'Link not clicked'}>
              <span style={{ color: isEmailClicked ? 'green' : 'black', display: 'flex', alignItems: 'center' }}>
                {isEmailClicked ? (
                  <>
                    <Icon icon='mdi:email-check' fontSize={30} style={{ marginRight: '5px' }} />
                  </>
                ) : (
                  <>
                    <Icon icon='mdi:email-off' fontSize={30} style={{ marginRight: '5px' }} />
                  </>
                )}
              </span>
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
          const { _id } = cell.row.original
          const defaultValue = cell.getValue() ? cell.getValue() : ''
          const [value, setValue] = useState(defaultValue)

          return (
            <FormControl>
              <Select
                size='small'
                sx={{ fontSize: '14px' }}
                onChange={e => {
                  setValue(e.target.value)
                  updateStatus(_id, e.target.value)
                }}
                value={value}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value={AppointmentType.UP_COMING}>Upcoming</MenuItem>
                <MenuItem value={AppointmentType.COMPLETED}>Completed</MenuItem>
                <MenuItem value={AppointmentType.CANCELLED}>Cancelled</MenuItem>
              </Select>
            </FormControl>
          )
        }
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        Cell: ({ cell }) => {
          const appointment = cell.row.original

          return (
            <Box display={'flex'}>
              <div onClick={() => handleViewDetails(appointment._id)} style={{ cursor: 'pointer' }}>
                <RemoveRedEyeIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div onClick={() => handleEditClick(appointment._id)} style={{ cursor: 'pointer' }}>
                <EditIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div onClick={() => handleDeleteClick(appointment._id)} style={{ cursor: 'pointer' }}>
                {deleting && selectedAppointment === appointment._id ? <CircularProgress size={25} /> : <DeleteIcon />}
              </div>
              <div style={{ width: '15px' }}></div>
              <div onClick={() => handleSendEmail(appointment)} style={{ cursor: 'pointer' }}>
                <SendIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div onClick={() => handleSendSMS(appointment)} style={{ cursor: 'pointer' }}>
                <SmsIcon />
              </div>
            </Box>
          )
        }
      }
    ],
    [deleting, selectedAppointment, router]
  )

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnActions: false,
    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    state: {
      isLoading // Add loading state to the table
    }
  })

  return (
    <>
      <Box textAlign={'right'} mb={5}>
        <Link href={'/appointments'} legacyBehavior>
          <Button variant='contained'>Create +</Button>
        </Link>
      </Box>
      <MaterialReactTable table={table} />
      <Appointments24Hours />
      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color='primary' autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <ViewAppointmentDetailsDialog
        _id={selectedAppointment}
        open={viewDialog}
        onClose={handleCloseViewDialog}
        onUpdateComplete={fetchData}
      />
      <UpdateAppointmentDialog
        appointmentId={selectedAppointment}
        open={editDialog}
        onClose={handleCloseEditDialog}
        onUpdateComplete={fetchData}
      />
    </>
  )
}

export default Home
