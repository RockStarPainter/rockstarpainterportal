import React, { forwardRef, useEffect, useState } from 'react'

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
  FormControlLabel,
  Divider
} from '@mui/material'
import axios from 'axios'
import toast, { LoaderIcon } from 'react-hot-toast'
import { InvoiceTypes, InvoiceTypesValues } from 'src/enums/FormTypes'
import Router, { useRouter } from 'next/router'
import emailjs from '@emailjs/browser'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import FallbackSpinner from 'src/@core/components/spinner'
import Create from 'src/pages/create'
import { Status, statusValues } from 'src/enums'
import Link from 'next/link'

// import html2pdf from 'html2pdf.js'

emailjs.init({
  publicKey: '1rRx93iEXQmVegiJX'
})
const CreateInvoice = () => {
  const numRows = 18 // Number of rows in your table
  const numCols = 6 // Number of columns in each row
  const eNumRows = 17 // Number of rows in your table
  const eNumCols = 2 // Number of columns in each row
  const router = useRouter()
  const { invoiceId, view } = router.query

  // Generate default values dynamically
  const generateDefaultValues = (rows: any, cols: any) => {
    const defaultValues: any = {}
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
    defaultValues.interiorData = {
      paint_textarea: '',
      stain_textarea: ''
    }
    defaultValues.exteriorData = {
      paint_textarea: '',
      stain_textarea: ''
    }
    defaultValues.form_type = ''
    defaultValues.invoice_type = ''
    defaultValues.phone_number = ''
    defaultValues.email = ''
    defaultValues.address = ''
    defaultValues.city = ''
    defaultValues.state = ''

    defaultValues.zip_code = ''
    defaultValues.total_cost = ''
    defaultValues.balance_due = ''
    defaultValues.down_payment = ''
    defaultValues.issue_date = new Date()
    defaultValues.pay_link = ''

    return defaultValues
  }

  const defaultValues = generateDefaultValues(numRows, numCols)

  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues
  })

  const [isLoading, setIsLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)
  const [data, setData] = useState<any>([])
  const [exteriorData, setExteriorData] = useState<any>([])
  const [invoiceType, setInvoiceType] = useState<any>(InvoiceTypes.BOTH)
  const [selectedOption, setSelectedOption] = useState('')
  const [allData, setAllData] = useState<any>()
  const [pdfLoading, setPdfLoading] = useState(false)
  const [status, setStatus] = useState(Status.UNPAID)
  const [emailLoading, setemailLoading] = useState(false)

  const handleCheckboxChange = (event: any) => {
    setSelectedOption(event.target.name)
  }

  const headers = ['WALL', 'BASE', 'CEILING', 'CLOSET', 'DOOR', 'DASHBOARD']
  const eheaders = ['YES', 'NO']
  useEffect(() => {
    if (invoiceId) {
      axios.post(`/api/get`, { invoiceId }).then(response => {
        const defaultValues: any = {}
        defaultValues.interiorRows = []
        defaultValues.exteriorRows = []
        const tableData = response.data.payload.data

        tableData.interiorRows.forEach((row: any, rowIndex: any) => {
          row.columns.forEach((column: any, colIndex: any) => {
            defaultValues.interiorRows[`row-${rowIndex}-col-${colIndex + 1}`] = column.value
          })
        })
        tableData.exteriorRows.forEach((row: any, rowIndex: any) => {
          row.columns.forEach((column: any, colIndex: any) => {
            defaultValues.exteriorRows[`row-${rowIndex}-col-${colIndex + 1}`] = column.value
          })
        })

        // defaultValues.interiorRows = tableData.interiorRows
        // defaultValues.exteriorRows = tableData.exteriorRows
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
        defaultValues.total_cost = tableData.total_cost
        defaultValues.balance_due = tableData.balance_due
        defaultValues.pay_link = tableData.pay_link
        defaultValues.down_payment = tableData.down_payment
        defaultValues.issue_date = tableData.issue_date ? new Date(tableData.issue_date) : null
        setAllData(tableData)
        reset(defaultValues)
        setSelectedOption(tableData.form_type)
        setData(tableData.interiorRows)
        setExteriorData(tableData.exteriorRows)
        setIsLoading(false)
        setStatus(tableData.status)
      })
    } else {
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
  }, [invoiceId])

  const getBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = function () {
        const reader = new FileReader()
        reader.onloadend = function () {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(xhr.response)
      }
      xhr.onerror = reject
      xhr.open('GET', url)
      xhr.responseType = 'blob'
      xhr.send()
    })
  }

  const generatePdf = async (str?: string) => {
    if (typeof window === 'undefined') return
    if (str !== 'email') {
      setPdfLoading(true)
    } else {
      setemailLoading(true)
    }
    const html2pdf = (await import('html2pdf.js')).default
    const input = document.getElementById('pdf-content') as HTMLElement
    const containerDiv = document.createElement('div')

    containerDiv.style.backgroundImage =
      'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxglj3iwmlB9Y9oZBH3qicAgZcnj6dtdHN2Q&s")' // Set background image URL
    containerDiv.style.backgroundSize = '840px 1400px' // Adjust background size as needed
    containerDiv.style.backgroundPosition = 'center' // Adjust background position as needed
    containerDiv.style.backgroundRepeat = 'repeat'

    containerDiv.appendChild(input)

    const htmlContent = containerDiv.outerHTML

    if (!input) {
      console.error('No element found with id "pdf-content"')

      return
    }

    const options = {
      margin: 0,
      filename: 'download.pdf',
      image: { type: 'jpeg', quality: 0.5 },
      html2canvas: {
        scale: 2, // Use a higher scale for better clarity
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: '1200',
        windowHeight: '1000'
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }

    // Generate the PDF and get the blob
    const pdfBlob = await html2pdf().from(htmlContent).set(options).outputPdf('blob')

    // Create a Data URI for downloading the PDF locally
    const pdfDataUri = await html2pdf().from(htmlContent).set(options).outputPdf('datauristring')
    const imageUrl = '/images/new-logo.png' // Path to your image in the public folder
    const base64Image = await getBase64Image(imageUrl)

    // Save the PDF locally
    if (str !== 'email') {
      const link = document.createElement('a')
      link.href = pdfDataUri
      link.download = 'download.pdf'
      link.click()
    }
    setPdfLoading(false)
    if (str === 'email') {
      const reader = new FileReader()
      reader.readAsDataURL(pdfBlob)
      reader.onloadend = () => {
        const base64data = reader.result as string

        // EmailJS configuration
        const serviceID = 'service_pypvnz1'
        const templateID = 'template_1hlt1qp'
        const userID = '1rRx93iEXQmVegiJX'
        if (!allData.email) {
          toast.error('No email address provided')
          setemailLoading(false)

          return
        }
        const templateParams = {
          content: base64data,
          customer_name: allData.customer_name,
          to_email: allData.email
        }

        emailjs
          .send(serviceID, templateID, templateParams, userID)
          .then(response => {
            console.log('Email sent successfully:', response.status, response.text)
            toast.success('Email sent')
          })
          .catch(error => {
            console.error('Error sending email:', error)
          })
          .finally(() => {
            setemailLoading(false)
          })
      }
    }
  }

  const onSubmit = async (formData: any) => {
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
        form_type: selectedOption ? selectedOption : undefined,
        invoice_type: invoiceType,
        zip_code: formData.zip_code,
        customer_name: formData.customer_name,
        phone_number: formData.phone_number,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        issue_date: formData.issue_date,
        interiorData: formData.interiorData,
        exteriorData: formData.exteriorData,
        total_cost: parseInt(formData.total_cost),
        balance_due: parseInt(formData.balance_due),
        down_payment: parseInt(formData.down_payment),
        status: status,
        pay_link: formData.pay_link
      }

      if (invoiceId) {
        await axios.post(`/api/update`, { payload, invoiceId })
      } else {
        const res = await axios.post('/api/create-invoice', payload)

        reset(defaultValues)
        setSelectedOption('')
        console.log(res.data)
        const { _id } = res.data.payload.invoice
        router.push(`create?invoiceId=${_id}&view=true`)
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
    { name: 'zip_code', label: 'ZipCode' },
    { name: 'issue_date', label: 'Issue Date' }
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

  const showExteriorWindow = () => {
    if (view) {
      if (
        getValues(`exteriorData.window.row-${0}-col-${1 + 1}`) ||
        getValues(`exteriorData.window.row-${0}-col-${2 + 1}`) ||
        getValues(`exteriorData.window.row-${0}-col-${3 + 1}`) ||
        getValues(`exteriorData.window.row-${0}-col-${4 + 1}`)
      ) {
        return true
      } else return false
    } else return true
  }

  const showExteriorExtras = () => {
    if (view) {
      if (
        getValues(`exteriorData.extras.paint`) ||
        getValues(`exteriorData.extras.power_wash`) ||
        getValues(`exteriorData.extras.patch_cracks`) ||
        getValues(`exteriorData.extras.primer`) ||
        getValues(`exteriorData.extras.apply_primer`) ||
        getValues(`exteriorData.extras.paper`) ||
        getValues(`exteriorData.extras.caulking`) ||
        getValues(`exteriorData.extras.plastic`) ||
        getValues(`exteriorData.extras.stain`) ||
        getValues(`exteriorData.extras.tape`) ||
        getValues(`exteriorData.extras.heavy_prep`)
      ) {
        return true
      } else return false
    } else return true
  }

  const showExtras = () => {
    if (view) {
      if (
        getValues(`interiorData.extras.paint`) ||
        getValues(`interiorData.extras.patch_cracks`) ||
        getValues(`interiorData.extras.primer`) ||
        getValues(`interiorData.extras.apply_primer`) ||
        getValues(`interiorData.extras.paper`) ||
        getValues(`interiorData.extras.caulking`) ||
        getValues(`interiorData.extras.plastic`) ||
        getValues(`interiorData.extras.stain`) ||
        getValues(`interiorData.extras.tape`)
      ) {
        return true
      } else return false
    } else return true
  }
  const showSingleExtra = (name: any) => {
    if (view) {
      if (getValues(name)) {
        return true
      } else return false
    }

    return true
  }

  const showInteriorWindow = () => {
    if (view) {
      if (
        getValues(`interiorData.window.row-${0}-col-${1 + 1}`) ||
        getValues(`interiorData.window.row-${0}-col-${2 + 1}`) ||
        getValues(`interiorData.window.row-${1}-col-${1 + 1}`) ||
        getValues(`interiorData.window.row-${1}-col-${2 + 1}`)
      ) {
        return true
      } else return false
    }

    return true
  }
  interface CustomInputProps {
    value: any
    label: string
    error: boolean
    onChange: (event: any) => void
  }
  const CustomInput = forwardRef(({ ...props }: CustomInputProps, ref) => {
    return <TextField inputRef={ref} {...props} sx={{ width: '100%' }} />
  })

  if (isLoading)
    return (
      <div>
        <FallbackSpinner />
      </div>
    )

  return (
    <Box>
      {view && (
        <Box justifyContent={'end'} display={'flex'}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => generatePdf('pdf')}
            disabled={pdfLoading}
            startIcon={pdfLoading ? <CircularProgress size={15} /> : null}
          >
            Download PDF
          </Button>
          <Box sx={{ width: '20px' }}></Box>
          <Button
            variant='contained'
            color='primary'
            onClick={() => generatePdf('email')}
            disabled={emailLoading}
            startIcon={emailLoading ? <CircularProgress size={15} /> : null}
          >
            Send Email
          </Button>
        </Box>
      )}

      <Divider sx={{ mt: 6 }} />

      <div id='pdf-content' style={{ padding: 20 }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Box width={'350px'}>
            <img src='/images/rockstar-logo.png' style={{ width: '100%' }} />
          </Box>
          <Box width={'350px'}>
            <img src='/images/rockstarDetails.png' style={{ width: '100%' }} />
          </Box>
        </Box>
        <Box width={'100%'} display={'flex'} flexDirection={'row'} justifyContent={'space-evenly'}>
          <FormGroup row={true}>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* <Button onClick={() => reset()}>Reset</Button> */}
          <Typography variant='h4' sx={{ mb: 5, textAlign: 'left', mt: 10 }}>
            Customer Details
          </Typography>
          <Grid container>
            {customerDetailsArray.map((c: any) => {
              return (
                // <Grid item xs={12} sm={6} md={4} lg={3}>
                <Grid marginTop={5} item width='100%'>
                  {!view &&
                    (c.name === 'issue_date' ? (
                      <Controller
                        name='issue_date'
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <DatePickerWrapper>
                            <DatePicker
                              selected={value}
                              showYearDropdown
                              showMonthDropdown
                              onChange={e => onChange(e)}
                              placeholderText='MM/DD/YYYY'
                              customInput={
                                <CustomInput
                                  value={value}
                                  onChange={onChange}
                                  label={'Issue Date'}
                                  error={false}
                                  aria-describedby='validation-basic-dob'
                                />
                              }
                            />
                          </DatePickerWrapper>
                        )}
                      />
                    ) : (
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
                    ))}
                  {view && (
                    <Box display={'flex'} flexDirection={'row'} alignItems={'center'} justifyContent={'space-around'}>
                      <Typography variant='h6' sx={{ textAlign: 'left', width: '35%' }}>
                        {c.label}
                      </Typography>
                      <Typography variant='body1' sx={{ textAlign: 'left', width: '65%' }}>
                        {allData &&
                          (c.name === 'issue_date' ? new Date(allData[c.name]).toLocaleDateString() : allData[c.name])}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              )
            })}
          </Grid>
          {!view && (
            <FormControl fullWidth sx={{ mt: 5 }}>
              <InputLabel id='demo-simple-select-label'>Select Status</InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={status}
                label='Select Status'
                onChange={(e: any) => setStatus(e.target.value)}
              >
                {statusValues.map(d => {
                  return <MenuItem value={d}>{d}</MenuItem>
                })}
              </Select>
            </FormControl>
          )}
          {!view && (
            <FormControl fullWidth sx={{ mt: 5 }}>
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
          )}
          {(invoiceType === InvoiceTypes.INTERIOR || invoiceType === InvoiceTypes.BOTH) && (
            <>
              <Typography variant='h4' sx={{ mb: 5, textAlign: 'left', mt: 10 }}>
                INTERIOR
              </Typography>
              <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 0,
                    width: 750,
                    height: '100%',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          colSpan={1}
                          rowSpan={2}
                          sx={{ border: '1px solid black', textAlign: 'center' }}
                        ></TableCell>
                        {/* <TableCell colSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                          INCLUDE
                        </TableCell> */}
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
                      {data.map((row: any, rowIndex: any) => {
                        let rowFilled = false
                        row.columns.forEach((c: any, i: any) => {
                          if (getValues(`interiorRows.row-${rowIndex}-col-${i + 1}`)) {
                            rowFilled = true
                          }
                        })
                        if (!view) rowFilled = true

                        return rowFilled ? (
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
                        ) : (
                          <></>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box
                  sx={{
                    width: '100%',
                    marginTop: '20px'
                  }}
                >
                  <Box
                    display={'flex'}
                    flexDirection={window.innerWidth > 1024 ? 'row' : 'column'}
                    alignItems={'center'}
                    justifyContent={'space-evenly'}
                  >
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='interiorData.paint_textarea'
                          control={control}
                          render={({ field }) => <TextField rows={4} multiline label='Paint' fullWidth {...field} />}
                        />
                      </FormControl>
                    )}
                    {view && allData?.interiorData?.paint_textarea && (
                      <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                        <Typography textAlign={'left'} variant='h6'>
                          Paint:
                        </Typography>
                        <Typography marginLeft={20} textAlign={'left'} variant='body1'>
                          {allData?.interiorData?.paint_textarea}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ width: window.innerWidth > 1024 ? 20 : 0, mt: window.innerWidth > 1024 ? 0 : 5 }}></Box>
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='interiorData.stain_textarea'
                          control={control}
                          render={({ field }) => <TextField rows={4} multiline label='Stain' fullWidth {...field} />}
                        />
                      </FormControl>
                    )}
                    {view && allData?.interiorData?.stain_textarea && (
                      <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                        <Typography textAlign={'left'} variant='h6'>
                          Stain:
                        </Typography>
                        <Typography marginLeft={20} variant='body1'>
                          {allData?.interiorData?.stain_textarea}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {showInteriorWindow() && (
                    <TableContainer
                      component={Paper}
                      sx={{ borderRadius: 0, width: '750px', mt: 10, backgroundColor: 'transparent' }}
                    >
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
                  )}
                  {showExtras() && (
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
                  )}
                </Box>
              </Box>
            </>
          )}
          {/* exterior below */}
          {(invoiceType === InvoiceTypes.EXTERIOR || invoiceType === InvoiceTypes.BOTH) && (
            <>
              <Typography variant='h4' sx={{ mb: 5, textAlign: 'left', mt: 10 }}>
                EXTERIOR
              </Typography>
              <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: 0, width: '750px', height: '100%', backgroundColor: 'transparent' }}
                >
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
                      {exteriorData.map((row: any, rowIndex: any) => {
                        let rowFilled = false
                        row.columns.forEach((c: any, i: any) => {
                          if (getValues(`exteriorRows.row-${rowIndex}-col-${i + 1}`)) {
                            rowFilled = true
                          }
                        })
                        if (!view) rowFilled = true

                        return rowFilled ? (
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
                        ) : (
                          <></>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box
                  sx={{
                    width: '100%',
                    marginTop: '20px'
                  }}
                >
                  <Box
                    display={'flex'}
                    flexDirection={window.innerWidth > 1024 ? 'row' : 'column'}
                    alignItems={'center'}
                    justifyContent={'space-evenly'}
                  >
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='exteriorData.paint_textarea'
                          control={control}
                          render={({ field }) => <TextField rows={4} multiline label='Paint' fullWidth {...field} />}
                        />
                      </FormControl>
                    )}
                    {view && allData?.exteriorData?.paint_textarea && (
                      <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                        <Typography textAlign={'left'} variant='h6'>
                          Paint:
                        </Typography>
                        <Typography marginLeft={20} textAlign={'left'} variant='body1'>
                          {allData?.exteriorData?.paint_textarea}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ width: window.innerWidth > 1024 ? 20 : 0, mt: window.innerWidth > 1024 ? 0 : 5 }}></Box>
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='exteriorData.stain_textarea'
                          control={control}
                          render={({ field }) => <TextField rows={4} multiline label='Stain' fullWidth {...field} />}
                        />
                      </FormControl>
                    )}
                    {view && allData?.exteriorData?.stain_textarea && (
                      <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                        <Typography textAlign={'left'} variant='h6'>
                          Stain:
                        </Typography>
                        <Typography marginLeft={20} variant='body1'>
                          {allData?.exteriorData?.stain_textarea}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {showExteriorWindow() && (
                    <TableContainer
                      component={Paper}
                      sx={{ borderRadius: 0, width: '750px', mt: 10, backgroundColor: 'transparent' }}
                    >
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
                  )}
                  {showExteriorExtras() && (
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
                  )}
                </Box>
              </Box>
            </>
          )}

          {/* <Box mt={10} display={'flex'} flexDirection={'column'} sx={{ border: '1px solid black' }}>
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
        </Box> */}
          <Typography variant='h4' sx={{ textAlign: 'left', mt: 10 }}>
            PAYMENT DETAILS
          </Typography>
          <Grid container spacing={5} mt={5} mb={10}>
            <Grid item xs={12} sm={3}>
              {!view ? (
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
              ) : (
                <Box>
                  <Typography variant='h6' sx={{ textAlign: 'center' }}>
                    {'Total Cost'}
                  </Typography>
                  <Typography variant='body1' sx={{ textAlign: 'center' }}>
                    {allData && allData['total_cost']}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              {!view ? (
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
              ) : (
                <Box>
                  <Typography variant='h6' sx={{ textAlign: 'center' }}>
                    {'50% Down payment'}
                  </Typography>
                  <Typography variant='body1' sx={{ textAlign: 'center' }}>
                    {allData && allData['down_payment']}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              {!view ? (
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
              ) : (
                <Box>
                  <Typography variant='h6' sx={{ textAlign: 'center' }}>
                    {'Balance Due'}
                  </Typography>
                  <Typography variant='body1' sx={{ textAlign: 'center' }}>
                    {allData && allData['balance_due']}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              {!view ? (
                <FormControl fullWidth>
                  <Controller
                    name={'pay_link'}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value}
                        label={'Payment Link'}
                        onChange={onChange}
                        aria-describedby='validation-basic-last-name'
                      />
                    )}
                  />
                </FormControl>
              ) : (
                <Box>
                  <Typography variant='h6' sx={{ textAlign: 'center' }}>
                    {'Pay Link'}
                  </Typography>
                  <Typography variant='body1' sx={{ textAlign: 'center' }}>
                    {allData && allData['pay_link'] ? (
                      <Link href={allData['pay_link']} target='_blank'>
                        {allData['pay_link'].length > 30
                          ? `${allData['pay_link'].substring(0, 30)}...`
                          : allData['pay_link']}
                      </Link>
                    ) : null}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          {!view && (
            <Button type='submit' variant='contained' fullWidth disabled={apiLoading}>
              {apiLoading ? <CircularProgress /> : invoiceId ? 'Update Invoice' : 'Generate Invoice'}
            </Button>
          )}
        </form>
      </div>
    </Box>
  )
}

export default CreateInvoice
