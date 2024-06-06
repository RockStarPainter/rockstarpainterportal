import React, { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  CircularProgress,
  Grid,
  FormControl,
  TextField,
  Typography,
  Box
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FormTypes, InvoiceTypes } from 'src/enums/FormTypes'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import EditIcon from '@mui/icons-material/Edit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'

const Home = ({ tableId }: any) => {
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
        accessorKey: 'status' //simple recommended way to define a column
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

  //pass table options to useMaterialReactTable
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

  //note: you can also pass table options as props directly to <MaterialReactTable /> instead of using useMaterialReactTable
  //but the useMaterialReactTable hook will be the most recommended way to define table options
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
