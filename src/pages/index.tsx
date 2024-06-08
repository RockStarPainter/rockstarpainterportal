import React, { useEffect, useMemo, useState } from 'react'
import { Button, CircularProgress, FormControl, Box, Select, MenuItem } from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import EditIcon from '@mui/icons-material/Edit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import { statusValues } from 'src/enums'

const Home = () => {
  const [data, setData] = useState<any>([])
  const router = useRouter()
  const fetchData = async () => {
    try {
      const res = await axios.get('/api/get-all')
      console.log(res.data.payload.data)
      setData(res.data.payload.data)
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
    } catch (error) {}
  }

  const columns = useMemo(
    () => [
      {
        header: 'Invoice #',
        accessorKey: 'custom_id' //simple recommended way to define a column
      },
      {
        header: 'Issue Date',
        accessorKey: 'issue_date', //simple recommended way to define a column
        Cell: ({ cell }: any) => {
          const value = cell.getValue()

          return value ? new Date(value).toLocaleDateString() : ''
        }
      },
      {
        header: 'Customer Name',
        accessorKey: 'customer_name' //simple recommended way to define a column
      },

      {
        header: 'Total Payment',
        accessorKey: 'total_cost' //simple recommended way to define a column
      },
      {
        header: 'Status',
        accessorKey: 'status', //simple recommended way to define a column,

        Cell: ({ cell }: any) => {
          const { _id } = cell.row.original
          const defaultValue = cell.getValue() ? cell.getValue() : ''
          const [value, setValue] = useState(defaultValue)

          return (
            <>
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
                  {statusValues.map((e: any) => {
                    return (
                      <MenuItem key={e} value={e}>
                        {e}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </>
          )
        }
      },

      {
        header: 'Actions',
        accessorKey: 'actions',
        Cell: ({ cell }: any) => {
          const { _id } = cell.row.original
          const [deleting, setDeleting] = useState(false)

          return (
            <>
              <Box display={'flex'}>
                <div
                  onClick={() => {
                    router.push(`create?invoiceId=${_id}&view=true`)
                  }}
                >
                  <RemoveRedEyeIcon />
                </div>
                <div style={{ width: '15px' }}></div>
                <div
                  onClick={() => {
                    router.push(`create?invoiceId=${_id}`)
                  }}
                >
                  <EditIcon />
                </div>
                <div style={{ width: '15px' }}></div>
                <div
                  onClick={async () => {
                    try {
                      setDeleting(true)
                      await axios.post('/api/delete', { invoiceId: _id })
                      setData((prev: any) => {
                        return prev.filter((p: any) => {
                          return p._id !== _id
                        })
                      })
                    } catch (error) {
                      console.log(error)
                      toast.error('Network Error')
                    } finally {
                      setDeleting(false)
                    }
                  }}
                >
                  {deleting ? <CircularProgress size={25} /> : <DeleteIcon />}
                </div>
              </Box>
            </>
          )
        }
      }
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnActions: false,

    // enableColumnFilters: false,
    // enablePagination: false,

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
    </>
  )
}

export default Home
