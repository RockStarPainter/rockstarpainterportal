import React, { useEffect, useState } from 'react'
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
  Box,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FormTypes, InvoiceTypes, InvoiceTypesValues } from 'src/enums/FormTypes'
import { useRouter } from 'next/router'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
const CreateInvoice = ({ tableId }: any) => {
  const numRows = 18 // Number of rows in your table
  const numCols = 8 // Number of columns in each row
  const eNumRows = 17 // Number of rows in your table
  const eNumCols = 2 // Number of columns in each row
  const router = useRouter()
  const { invoiceId } = router.query

  // Generate default values dynamically
  const generateDefaultValues = (rows: any, cols: any) => {
    let defaultValues: any = {}
    defaultValues.interiorRows = []
    defaultValues.exteriorRows = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        defaultValues.interiorRows[`row-${row}-col-${col + 1}`] = false
      }
    }
    for (let row = 0; row < eNumRows; row++) {
      for (let col = 0; col < eNumCols; col++) {
        defaultValues.exteriorRows[`row-${row}-col-${col + 1}`] = false
      }
    }
    defaultValues.customer_name = ''

    return defaultValues
  }

  const defaultValues = generateDefaultValues(numRows, numCols)

  const { control, handleSubmit, setValue, reset } = useForm({
    defaultValues
  })

  const [isLoading, setIsLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)
  const [data, setData] = useState<any>([])
  const [exteriorData, setExteriorData] = useState<any>([])
  const [invoiceType, setInvoiceType] = useState<any>(InvoiceTypes.BOTH)
  const [selectedOption, setSelectedOption] = useState('')

  const handleCheckboxChange = (event: any) => {
    setSelectedOption(event.target.name)
  }

  const headers = ['YES', 'NO', 'WALL', 'BASE', 'CEILING', 'CLOSET', 'DOOR', 'DASHBOARD']
  const eheaders = ['YES', 'NO']
  useEffect(() => {
    if (invoiceId) {
      axios.post(`/api/get`, { invoiceId }).then(response => {
        let defaultValues: any = {}
        defaultValues.interiorRows = []
        defaultValues.exteriorRows = []
        const tableData = response.data.payload.data

        // tableData.interiorRows.forEach((row: any) => {
        //   row.columns.forEach((column: any, colIndex: any) => {
        //     defaultValues.interiorRows[`row-${row}-col-${colIndex + 1}`] = column.value
        //   })
        // })
        // tableData.exteriorRows.forEach((row: any) => {
        //   row.columns.forEach((column: any, colIndex: any) => {
        //     // setValue(`interiorRows.row-${rowIndex}-col-${colIndex + 1}`, column.value)
        //     defaultValues.exteriorRows[`row-${row}-col-${colIndex + 1}`] = column.value
        //   })
        // })
        defaultValues.interiorRows = tableData.interiorRows
        defaultValues.exteriorRows = tableData.exteriorRows
        defaultValues.interiorData = tableData.interiorData
        defaultValues.exteriorData = tableData.exteriorData
        defaultValues.customer_name = tableData.customer_name
        defaultValues.form_type = tableData.form_type
        defaultValues.invoice_type = tableData.invoice_type
        defaultValues.phone_number = tableData.phone_number
        defaultValues.email = tableData.email
        defaultValues.address = tableData.address
        defaultValues.city = tableData.city
        defaultValues.state = tableData.state

        defaultValues.zip_code = tableData.zip_code

        reset(defaultValues)
        setData(tableData.interiorRows)
        setExteriorData(tableData.exteriorRows)
        setIsLoading(false)
      })
    } else {
      // Default data structure when creating a new table entry
      reset(defaultValues)
      setIsLoading(false)
      setExteriorData([
        { name: 'BODY SIDING', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'TRIM', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'FACIAL', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'SOFFITS', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'SHUTTERS', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'GUTTERS', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'FRONT DOOR', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'GARAGE DOOR', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'FENCE', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'DECK', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'PORCH', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'PERGOLA', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'FOUNDATION', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'SHED', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'STUCCO', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'BRICKS', columns: Array(eNumCols).fill({ value: false }) },
        { name: 'REPLACE GARAGE WEATHER STRIP', columns: Array(eNumCols).fill({ value: false }) }
      ])
      setData([
        { name: 'OFFICE/STUDY', columns: Array(numCols).fill({ value: false }) },
        { name: 'LIVING ROOM', columns: Array(numCols).fill({ value: false }) },
        { name: 'ENTRY', columns: Array(numCols).fill({ value: false }) },
        { name: 'HALLWAY', columns: Array(numCols).fill({ value: false }) },
        { name: 'KITCHEN', columns: Array(numCols).fill({ value: false }) },
        { name: 'MASTER BED', columns: Array(numCols).fill({ value: false }) },
        { name: 'MASTER BATH', columns: Array(numCols).fill({ value: false }) },
        { name: 'BEDROOM A', columns: Array(numCols).fill({ value: false }) },
        { name: 'BEDROOM B', columns: Array(numCols).fill({ value: false }) },
        { name: 'BATHROOM B', columns: Array(numCols).fill({ value: false }) },
        { name: 'BEDROOM C', columns: Array(numCols).fill({ value: false }) },
        { name: 'LAUNDRY ROOM', columns: Array(numCols).fill({ value: false }) },
        { name: 'BASEMENT', columns: Array(numCols).fill({ value: false }) },
        { name: 'REPAIR', columns: Array(numCols).fill({ value: false }) },
        { name: 'DRY WALL', columns: Array(numCols).fill({ value: false }) },
        { name: 'BUILT-IN BOOK SHELVES', columns: Array(numCols).fill({ value: false }) },
        { name: 'CABINETS', columns: Array(numCols).fill({ value: false }) },
        { name: 'POWDER BATHROOM', columns: Array(numCols).fill({ value: false }) }
      ])
    }
  }, [invoiceId, setValue])

  const generatePdf = async () => {
    const input = document.getElementById('pdf-content')
    if (!input) {
      console.error('No element found with id "pdf-content"')
      return
    }

    const canvas = await html2canvas(input)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate height of the input to determine if it spans multiple pages
    const imgProps = pdf.getImageProperties(imgData)
    const imgWidth = pdfWidth
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width

    let heightLeft = imgHeight
    let position = 0

    // Add the first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    // Add more pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    pdf.save('download.pdf')
  }
  const onSubmit = async (formData: any) => {
    console.log(formData)
    try {
      setApiLoading(true)
      const rows = data.map((row: any, rowIndex: any) => ({
        name: row.name,
        columns: row.columns.map((_: any, colIndex: any) => ({
          value: formData.interiorRows[`row-${rowIndex}-col-${colIndex + 1}`]
        }))
      }))
      const exteriorRows = exteriorData.map((row: any, rowIndex: any) => ({
        name: row.name,
        columns: row.columns.map((_: any, colIndex: any) => ({
          value: formData.exteriorRows[`row-${rowIndex}-col-${colIndex + 1}`]
        }))
      }))

      const payload = {
        interiorRows: rows,
        exteriorRows: exteriorRows,
        form_type: FormTypes.INVOICE,
        invoice_type: invoiceType,
        zip_code: formData.zip_code,
        customer_name: formData.customer_name,
        phone_number: formData.phone_number,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        interiorData: formData.interiorData,
        exteriorData: formData.exteriorData
      }

      if (invoiceId) {
        axios.put(`/table/${tableId}`, payload).then(response => {
          console.log('Updated:', response.data)
        })
      } else {
        const res = await axios.post('/api/create-invoice', payload)
        reset(defaultValues)
      }
    } catch (error) {
      console.log(error)
      toast.error('Network Error')
    } finally {
      setApiLoading(false)
    }
  }

  const customerDetailsArray = [
    { name: 'customer_name', label: 'Customer Name' },
    { name: 'phone_number', label: 'Phone Number' },
    { name: 'address', label: 'Address' },
    { name: 'email', label: 'Email' },
    { name: 'city', label: 'City' },
    { name: 'state', label: 'State' },
    { name: 'zip_code', label: 'ZipCode' }
  ]

  const extrasArray = [
    {
      label: 'Paint',
      name: 'interiorData.extras.paint'
    },
    {
      label: 'Patch Cracks',
      name: 'interiorData.extras.patch_cracks'
    },
    {
      label: 'Primer',
      name: 'interiorData.extras.primer'
    },
    {
      label: 'Apply Primer',
      name: 'interiorData.extras.apply_primer'
    },
    {
      label: 'Paper',
      name: 'interiorData.extras.paper'
    },
    {
      label: 'Caulking',
      name: 'interiorData.extras.caulking'
    },
    {
      label: 'Plastic',
      name: 'interiorData.extras.plastic'
    },
    {
      label: 'Stain',
      name: 'interiorData.extras.stain'
    },
    {
      label: 'Tape',
      name: 'interiorData.extras.tape'
    }
  ]

  const exteriorExtrasArray = [
    {
      label: 'Paint',
      name: 'exteriorData.extras.paint'
    },
    {
      label: 'Power Wash',
      name: 'exteriorData.extras.power_wash'
    },
    {
      label: 'Patch Cracks',
      name: 'exteriorData.extras.patch_cracks'
    },
    {
      label: 'Primer',
      name: 'exteriorData.extras.primer'
    },
    {
      label: 'Apply Primer',
      name: 'exteriorData.extras.apply_primer'
    },
    {
      label: 'Paper',
      name: 'exteriorData.extras.paper'
    },
    {
      label: 'Caulking',
      name: 'exteriorData.extras.caulking'
    },
    {
      label: 'Plastic',
      name: 'exteriorData.extras.plastic'
    },
    {
      label: 'Stain',
      name: 'exteriorData.extras.stain'
    },
    {
      label: 'Tape',
      name: 'exteriorData.extras.tape'
    },
    {
      label: 'Heavy Prep',
      name: 'exteriorData.extras.heavy_prep'
    }
  ]

  if (isLoading) return <div>Loading...</div>

  return (
    <div id='pdf-content' style={{ padding: 20 }}>
      <Box display={'flex'} justifyContent={'space-between'}>
        <Box width={'350px'}>
          <img src='/images/rockstar-logo.png' style={{ width: '100%' }} />
        </Box>
        <Box width={'350px'}>
          <img src='/images/rockstarDetails.png' style={{ width: '100%' }} />
        </Box>
        <Box width={'350px'} display={'flex'} justifyContent={'end'}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox checked={selectedOption === 'INVOICE'} onChange={handleCheckboxChange} name='INVOICE' />
              }
              label='INVOICE'
            />
            <FormControlLabel
              control={
                <Checkbox checked={selectedOption === 'ESTIMATE'} onChange={handleCheckboxChange} name='ESTIMATE' />
              }
              label='ESTIMATE'
            />
            <FormControlLabel
              control={
                <Checkbox checked={selectedOption === 'CONTRACT'} onChange={handleCheckboxChange} name='CONTRACT' />
              }
              label='CONTRACT'
            />
          </FormGroup>
        </Box>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <Button onClick={() => reset()}>Reset</Button> */}
        <Typography variant='h4' sx={{ mb: 5, textAlign: 'center', mt: 10 }}>
          Customer Details
        </Typography>
        <Grid container spacing={5}>
          {customerDetailsArray.map((c: any) => {
            return (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <FormControl fullWidth>
                  <Controller
                    name={c.name}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value}
                        label={c.label}
                        onChange={onChange}
                        aria-describedby='validation-basic-last-name'
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            )
          })}
        </Grid>
        <FormControl fullWidth sx={{ mt: 10 }}>
          <InputLabel id='demo-simple-select-label'>Select Service</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={invoiceType}
            label='Select Service'
            onChange={e => setInvoiceType(e.target.value)}
          >
            {InvoiceTypesValues.map(d => {
              return <MenuItem value={d}>{d}</MenuItem>
            })}
          </Select>
        </FormControl>
        {(invoiceType === InvoiceTypes.INTERIOR || invoiceType === InvoiceTypes.BOTH) && (
          <>
            <Typography variant='h4' sx={{ mb: 5, textAlign: 'center', mt: 10 }}>
              INTERIOR
            </Typography>
            <Box display={'flex'} justifyContent={'space-evenly'}>
              <TableContainer component={Paper} sx={{ borderRadius: 0, width: '820px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={1}
                        rowSpan={2}
                        sx={{ border: '1px solid black', textAlign: 'center' }}
                      ></TableCell>
                      <TableCell colSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        INCLUDE
                      </TableCell>
                      <TableCell colSpan={6} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        PAINT CODE
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {headers.map((header, colIndex) => (
                        <TableCell key={colIndex} sx={{ border: '1px solid black' }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any, rowIndex: any) => (
                      <TableRow key={rowIndex}>
                        <TableCell sx={{ border: '1px solid black' }}>{row.name}</TableCell>
                        {row.columns.map((column: any, colIndex: any) => (
                          <TableCell key={colIndex} sx={{ border: '1px solid black' }}>
                            <Controller
                              name={`interiorRows.row-${rowIndex}-col-${colIndex + 1}`}
                              control={control}
                              defaultValue={column.value}
                              render={({ field }) => <Checkbox {...field} checked={field.value} />}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ width: '30%' }}>
                <FormControl fullWidth>
                  <Controller
                    name='interiorData.paint_textarea'
                    control={control}
                    render={({ field }) => <TextField rows={4} multiline label='Paint' fullWidth {...field} />}
                  />
                </FormControl>
                <Box sx={{ mt: 10 }}></Box>
                <FormControl fullWidth>
                  <Controller
                    name='interiorData.stain_textarea'
                    control={control}
                    render={({ field }) => <TextField rows={4} multiline label='Stain' fullWidth {...field} />}
                  />
                </FormControl>
                <TableContainer component={Paper} sx={{ borderRadius: 0, width: '300px', mt: 10 }}>
                  <Table>
                    <TableHead>
                      <TableCell
                        colSpan={1}
                        rowSpan={2}
                        sx={{ border: '1px solid black', textAlign: 'center' }}
                      ></TableCell>
                      <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        YES
                      </TableCell>
                      <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        NO
                      </TableCell>
                    </TableHead>
                    <TableBody>
                      <TableRow key={'0'}>
                        <TableCell key={'0'} sx={{ border: '1px solid black' }}>
                          WINDOW TRIM
                        </TableCell>
                        <TableCell key={'1'} sx={{ border: '1px solid black' }}>
                          <Controller
                            name={`interiorData.window.row-${0}-col-${1 + 1}`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </TableCell>
                        <TableCell key={'2'} sx={{ border: '1px solid black' }}>
                          <Controller
                            name={`interiorData.window.row-${0}-col-${2 + 1}`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow key={'1'}>
                        <TableCell sx={{ border: '1px solid black' }}>WINDOW SEAL</TableCell>
                        <TableCell key={'1'} sx={{ border: '1px solid black' }}>
                          <Controller
                            name={`interiorData.window.row-${1}-col-${1 + 1}`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </TableCell>
                        <TableCell key={'2'} sx={{ border: '1px solid black' }}>
                          <Controller
                            name={`interiorData.window.row-${1}-col-${2 + 1}`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Grid container sx={{ mt: 10 }}>
                  {extrasArray.map((e: any) => {
                    return (
                      <Grid item xs={12} sm={6} key={e.name}>
                        <Box display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}>
                          <Typography width={'50%'}>{e.label}</Typography>
                          <Controller
                            name={e.name}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            </Box>
          </>
        )}
        {/* exterior below */}
        {(invoiceType === InvoiceTypes.EXTERIOR || invoiceType === InvoiceTypes.BOTH) && (
          <>
            <Typography variant='h4' sx={{ mb: 5, textAlign: 'center', mt: 10 }}>
              EXTERIOR
            </Typography>
            <Box display={'flex'} justifyContent={'space-evenly'}>
              <TableContainer component={Paper} sx={{ borderRadius: 0, width: '820px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={1}
                        rowSpan={2}
                        sx={{ border: '1px solid black', textAlign: 'center' }}
                      ></TableCell>
                      <TableCell colSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        INCLUDE
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {eheaders.map((header, colIndex) => (
                        <TableCell key={colIndex} sx={{ border: '1px solid black' }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exteriorData.map((row: any, rowIndex: any) => (
                      <TableRow key={rowIndex}>
                        <TableCell sx={{ border: '1px solid black' }}>{row.name}</TableCell>
                        {row.columns.map((column: any, colIndex: any) => (
                          <TableCell key={colIndex} sx={{ border: '1px solid black' }}>
                            <Controller
                              name={`exteriorRows.row-${rowIndex}-col-${colIndex + 1}`}
                              control={control}
                              defaultValue={column.value}
                              render={({ field }) => <Checkbox {...field} checked={field.value} />}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ width: '30%' }}>
                <FormControl fullWidth>
                  <Controller
                    name='exteriorData.paint_textarea'
                    control={control}
                    render={({ field }) => <TextField rows={4} multiline label='Paint' fullWidth {...field} />}
                  />
                </FormControl>
                <Box sx={{ mt: 10 }}></Box>
                <FormControl fullWidth>
                  <Controller
                    name='exteriorData.stain_textarea'
                    control={control}
                    render={({ field }) => <TextField rows={4} multiline label='Stain' fullWidth {...field} />}
                  />
                </FormControl>
                <TableContainer component={Paper} sx={{ borderRadius: 0, width: '420px', mt: 10 }}>
                  <Table>
                    <TableHead>
                      <TableCell
                        colSpan={1}
                        rowSpan={2}
                        sx={{ border: '1px solid black', textAlign: 'center' }}
                      ></TableCell>
                      <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        SIDING
                      </TableCell>
                      <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        FACIAL
                      </TableCell>
                      <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        TRIM
                      </TableCell>
                      <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                        SOFFITS
                      </TableCell>
                    </TableHead>
                    <TableBody>
                      <TableRow key={'0'}>
                        <TableCell key={'0'} sx={{ border: '1px solid black' }}>
                          REPAIRS
                        </TableCell>
                        <TableCell key={'1'} sx={{ border: '1px solid black' }}>
                          <Controller
                            name={`exteriorData.window.row-${0}-col-${1 + 1}`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </TableCell>
                        <TableCell key={'2'} sx={{ border: '1px solid black' }}>
                          <Controller
                            name={`exteriorData.window.row-${0}-col-${2 + 1}`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </TableCell>
                        <TableCell key={'3'} sx={{ border: '1px solid black' }}>
                          <Controller
                            name={`exteriorData.window.row-${0}-col-${3 + 1}`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </TableCell>
                        <TableCell key={'4'} sx={{ border: '1px solid black' }}>
                          <Controller
                            name={`exteriorData.window.row-${0}-col-${4 + 1}`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Grid container sx={{ mt: 10 }}>
                  {exteriorExtrasArray.map((e: any) => {
                    return (
                      <Grid item xs={12} sm={6} key={e.name}>
                        <Box display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}>
                          <Typography width={'50%'}>{e.label}</Typography>
                          <Controller
                            name={e.name}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Checkbox {...field} checked={field.value} />}
                          />
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            </Box>
          </>
        )}

        <Box mt={10} display={'flex'} flexDirection={'column'} sx={{ border: '1px solid black', width: '700px' }}>
          <Typography textAlign={'center'} mt={2} mb={2}>
            APPROVED AND ACCEPTED
          </Typography>

          <Box sx={{ border: '1px solid black' }} display={'flex'}>
            <Box
              display={'flex'}
              width={'50%'}
              justifyContent={'space-between'}
              padding={1}
              borderRight={'1px solid black'}
            >
              <Typography variant='h6'>Customer</Typography>
              <Typography variant='h6'>Date</Typography>
            </Box>
            <Box display={'flex'} padding={1} width={'50%'} justifyContent={'space-between'}>
              <Typography variant='h6'>Contractor</Typography>
              <Typography variant='h6'>Date</Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={5} mt={10} mb={10}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <Controller
                name={'total_cost'}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label={'Total Cost'}
                    onChange={onChange}
                    aria-describedby='validation-basic-last-name'
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <Controller
                name={'down_payment'}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label={'50% Down payment'}
                    onChange={onChange}
                    aria-describedby='validation-basic-last-name'
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <Controller
                name={'balance_due'}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label={'Balance Due'}
                    onChange={onChange}
                    aria-describedby='validation-basic-last-name'
                  />
                )}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Button type='submit' variant='contained' fullWidth disabled={apiLoading}>
          {apiLoading ? <CircularProgress /> : 'Submit'}
        </Button>
      </form>

      <Button variant='contained' color='primary' onClick={generatePdf}>
        Generate PDF
      </Button>
    </div>
  )
}

export default CreateInvoice
