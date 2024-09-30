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
  DialogTitle,
  Tooltip
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import EditIcon from '@mui/icons-material/Edit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import { statusValues } from 'src/enums'
import Icon from 'src/@core/components/icon'

const Home = () => {
  const [data, setData] = useState<any>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    const storedData = localStorage.getItem('userData')
    const userData = storedData ? JSON.parse(storedData) : null

    if (!userData) {
      toast.error('User data missing, please log in again')

      return
    }

    const { role, _id } = userData

    try {
      const res = await axios.get('/api/get-all', {
        headers: {
          authorization: localStorage.getItem('token')
        },
        params: {
          role,
          userId: _id
        }
      })
      const fetchedData = res.data.payload.invoices

      const sortedData = fetchedData.sort((a: any, b: any) => {
        if (a.approval_status === 'Approved' && b.approval_status !== 'Approved') {
          return -1
        }
        if (a.approval_status !== 'Approved' && b.approval_status === 'Approved') {
          return 1
        }

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })

      setData(sortedData)
    } catch (error) {
      console.log(error)
      toast.error('Error fetching data')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateStatus = async (_id: any, value: any) => {
    try {
      await axios.post('/api/update-status', { invoiceId: _id, value })
      toast.success('Status Updated Successfully')
      fetchData()
    } catch (error) {
      toast.error('Error To Update Status')
    }
  }

  const handleDeleteClick = (invoiceId: any) => {
    setSelectedInvoice(invoiceId)
    setOpenDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await axios.post('/api/delete', { invoiceId: selectedInvoice })
      setData((prev: any) => {
        return prev.filter((p: any) => p._id !== selectedInvoice)
      })
      toast.success('Invoice deleted successfully')
    } catch (error) {
      console.log(error)
      toast.error('Network Error')
    } finally {
      setDeleting(false)
      setOpenDialog(false)
      setSelectedInvoice(null)
    }
  }

  const handleCancelDelete = () => {
    setOpenDialog(false)
    setSelectedInvoice(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'green'
      case 'Rejected':
        return 'red'
      case 'Modification Requested':
        return 'blue'
      default:
        return 'gray'
    }
  }

  // Now use the populated employee field directly to get the user_name
  const getEmployeeName = (invoice: any) => {
    return invoice.employee?.user_name || 'Admin'
  }

  const columns = useMemo(
    () => [
      {
        header: 'Invoice #',
        accessorKey: 'custom_id'
      },
      {
        header: 'Issue Date',
        accessorKey: 'issue_date',
        Cell: ({ cell }: any) => {
          const value = cell.getValue()

          return value ? new Date(value).toLocaleDateString() : ''
        }
      },
      {
        header: 'Customer Name',
        accessorKey: 'customer_name'
      },
      {
        header: 'Total Payment',
        accessorKey: 'total_cost'
      },
      {
        header: 'Created By',
        accessorKey: 'createdBy',
        Cell: ({ row }: any) => {
          const invoice = row.original

          return getEmployeeName(invoice)
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: ({ cell }: any) => {
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
                {statusValues.map((e: any) => (
                  <MenuItem key={e} value={e}>
                    {e}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        }
      },
      {
        header: 'Email Status',
        accessorKey: 'email_opened',
        Cell: ({ cell }: any) => {
          const emailOpened = cell.getValue()

          return (
            <Box display='flex' alignItems='center'>
              {emailOpened ? (
                <Icon icon='mdi:email-check' fontSize={30} style={{ marginRight: '5px', color: '#4caf50' }} />
              ) : (
                <Icon icon='mdi:email-off' fontSize={30} style={{ marginRight: '5px' }} />
              )}
            </Box>
          )
        }
      },
      {
        header: 'Client Status',
        accessorKey: 'approval_status',
        Cell: ({ cell }: any) => {
          const status = cell.getValue()
          const remarks = cell.row.original.customer_remarks

          return (
            <Tooltip
              title={remarks ? remarks : 'No remarks'}
              placement='top'
              arrow
              sx={{
                '& .MuiTooltip-arrow': {
                  color: 'black'
                },
                '& .MuiTooltip-tooltip': {
                  backgroundColor: 'black',
                  color: 'white',
                  fontSize: '14px',
                  borderRadius: '5px'
                }
              }}
            >
              <Box display='flex' alignItems='center' sx={{ cursor: 'pointer' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(status),
                    marginRight: 1
                  }}
                />
                {status}
              </Box>
            </Tooltip>
          )
        }
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        Cell: ({ cell }: any) => {
          const { _id } = cell.row.original

          return (
            <Box display={'flex'}>
              <div
                onClick={() => {
                  router.push(`create?invoiceId=${_id}&view=true`)
                }}
                style={{ cursor: 'pointer' }}
              >
                <RemoveRedEyeIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div
                onClick={() => {
                  router.push(`create?invoiceId=${_id}`)
                }}
                style={{ cursor: 'pointer' }}
              >
                <EditIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div onClick={() => handleDeleteClick(_id)} style={{ cursor: 'pointer' }}>
                {deleting && selectedInvoice === _id ? <CircularProgress size={25} /> : <DeleteIcon />}
              </div>
            </Box>
          )
        }
      }
    ],
    [deleting, selectedInvoice, router]
  )

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnActions: false,
    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false
  })

  return (
    <>
      <Box textAlign={'right'} mb={5}>
        <Link href={'/create'} legacyBehavior>
          <Button variant='contained'>Create +</Button>
        </Link>
      </Box>
      <MaterialReactTable table={table} />
      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this invoice? This action cannot be undone.
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
    </>
  )
}

export default Home
