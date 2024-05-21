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
        header: 'Customer Name',
        accessorKey: 'customer_name' //simple recommended way to define a column
      },
      {
        header: 'Phone Number',
        accessorKey: 'phone_number' //simple recommended way to define a column
      },
      {
        header: 'City',
        accessorKey: 'city' //simple recommended way to define a column
      },
      {
        header: 'Actions',
        Cell: ({ cell }: any) => {
          const { _id } = cell.row.original
          return (
            <>
              <div
                onClick={() => {
                  router.push(`create?invoiceId=${_id}`)
                }}
              >
                <EditIcon />
              </div>
              {/* <Link href={'/delete/[id]'} as={`/delete/${row.id}`}>
                <a>Delete</a>
              </Link> */}
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
    enableRowSelection: true, //enable some features
    enableColumnOrdering: false, //enable a feature for all columns
    enableGlobalFilter: false //turn off a feature
  })

  //note: you can also pass table options as props directly to <MaterialReactTable /> instead of using useMaterialReactTable
  //but the useMaterialReactTable hook will be the most recommended way to define table options
  return (
    <>
      <Link href={'/create'} legacyBehavior>
        <Button variant='contained'>Create +</Button>
      </Link>
      <MaterialReactTable table={table} />
    </>
  )
}

export default Home
