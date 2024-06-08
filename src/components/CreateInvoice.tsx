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
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// import html2pdf from 'html2pdf.js'

emailjs.init({
  publicKey: '1rRx93iEXQmVegiJX'
})
const CreateInvoice = () => {
  const numRows = 18 // Number of rows in your table
  const numCols = 8 // Number of columns in each row
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
  const [selectedSherwin, setSelectedSherwin] = useState<any>([])
  const [selectedBenjamin, setSelectedBenjamin] = useState<any>([])

  const handleCheckboxChange = (event: any) => {
    setSelectedOption(event.target.name)
  }

  const headers = ['YES', 'NO', 'WALL', 'BASE', 'CEILING', 'CLOSET', 'DOOR', 'DASHBOARD']
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
        setSelectedBenjamin(tableData.benjamin_paints)
        setSelectedSherwin(tableData.sherwin_paints)
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
    const section1 = document.getElementById('section1') // First section
    const section2 = document.getElementById('section2') // Second section
    const section3 = document.getElementById('section3') // Second section
    const section4 = document.getElementById('section4') // Second section
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = 210 // A4 width in mm
    const pdfHeight = 297 // A4 height in mm
    const screenWidth = 1500 // Desired screen width in pixels
    const screenHeight = (pdfHeight / pdfWidth) * screenWidth // Scale height proportionally to screen width

    // Function to add a section to the PDF
    const addSectionToPdf = async (section: any, pdf: any) => {
      const canvas = await html2canvas(section, {
        scale: 3, // Adjust as needed
        useCORS: true,
        width: screenWidth,
        height: screenHeight,
        windowWidth: screenWidth
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.5) // Adjust quality as needed

      const imgProps = pdf.getImageProperties(imgData)
      const imgWidth = pdfWidth
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
    }

    // Add first section to the first page
    await addSectionToPdf(section1, pdf)

    // Add a new page for the second section
    pdf.addPage()

    // Add second section to the new page
    await addSectionToPdf(section2, pdf)

    pdf.addPage()

    if (showBenjaminPaints() || showSherwinPaints()) {
      // Add second section to the new page
      await addSectionToPdf(section3, pdf)

      pdf.addPage()
    }

    // Add second section to the new page
    await addSectionToPdf(section4, pdf)

    // Save the PDF locally
    pdf.save('download.pdf')
    const imageUrl = '/images/new-logo.png' // Path to your image in the public folder
    const base64Image = await getBase64Image(imageUrl)

    // Save the PDF locally
    // if (str !== 'email') {
    //   const link = document.createElement('a')
    //   link.href = pdfDataUri
    //   link.download = 'download.pdf'
    //   link.click()
    // }
    setPdfLoading(false)
    // if (str === 'email') {
    //   const reader = new FileReader()
    //   reader.readAsDataURL(pdfBlob)
    //   reader.onloadend = () => {
    //     const base64data = reader.result as string

    //     // EmailJS configuration
    //     const serviceID = 'service_pypvnz1'
    //     const templateID = 'template_1hlt1qp'
    //     const userID = '1rRx93iEXQmVegiJX'
    //     if (!allData.email) {
    //       toast.error('No email address provided')
    //       setemailLoading(false)

    //       return
    //     }
    //     const templateParams = {
    //       content: base64data,
    //       customer_name: allData.customer_name,
    //       to_email: allData.email
    //     }

    //     emailjs
    //       .send(serviceID, templateID, templateParams, userID)
    //       .then(response => {
    //         console.log('Email sent successfully:', response.status, response.text)
    //         toast.success('Email sent')
    //       })
    //       .catch(error => {
    //         console.error('Error sending email:', error)
    //       })
    //       .finally(() => {
    //         setemailLoading(false)
    //       })
    //   }
    // }
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
        pay_link: formData.pay_link,
        sherwin_paints: selectedSherwin,
        benjamin_paints: selectedBenjamin
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

  const sherwinPaints = [
    {
      name: 'Cashmere ®',
      sub_name: 'Interior Acrylic Latex',
      img: '/images/s-1.png',
      d_name: 's-1.png'
    },
    {
      name: 'Duration®',
      sub_name: 'Exterior Acrylic Latex',
      img: '/images/s-2.png',
      d_name: 's-2.png'
    },
    {
      name: 'Duration Home®',
      sub_name: 'Interior Acrylic Latex',
      img: '/images/s-3.png',
      d_name: 's-3.png'
    },
    {
      name: 'Emerald®',
      sub_name: 'Urethane Trim Enamel',
      img: '/images/s-4.png',
      d_name: 's-4.png'
    },
    {
      name: 'Emerald®',
      sub_name: 'Exterior Acrylic Latex',
      img: '/images/s-5.png',
      d_name: 's-5.png'
    },
    {
      name: 'Latitude™ with Climate Flex Technology™',
      sub_name: 'Exterior Acrylic Latex',
      img: '/images/s-6.png',
      d_name: 's-6.png'
    },
    {
      name: 'SuperDeck ®',
      sub_name: 'Deck Finishing System',
      img: '/images/s-7.png',
      d_name: 's-7.png'
    },
    {
      name: 'ProClassic®',
      sub_name: 'Interior Acrylic, Acrylic-Alkyd and Alkyd Enamels',
      img: '/images/s-8.png',
      d_name: 's-8.png'
    },
    {
      name: 'SuperPaint®',
      sub_name: 'Interior Acrylic Latex',
      img: '/images/s-9.png',
      d_name: 's-9.png'
    },
    {
      name: 'WoodScapes®',
      sub_name: 'Rain Refresh',
      img: '/images/s-10.png',
      d_name: 's-10.png'
    },
    {
      name: 'Emerald®',
      sub_name: 'Interior Acrylic Latex',
      img: '/images/s-11.png',
      d_name: 's-11.png'
    },
    {
      name: 'Emerald®',
      sub_name: 'Exterior Acrylic Latex Paint',
      img: '/images/s-12.png',
      d_name: 's-12.png'
    },
    {
      name: 'Duration®',
      sub_name: 'Exterior Acrylic Latex',
      img: '/images/s-13.png',
      d_name: 's-13.png'
    },
    {
      name: 'Latitude®',
      sub_name: 'Exterior Acrylic Latex',
      img: '/images/s-14.png',
      d_name: 's-14.png'
    },
    {
      name: 'SuperPaint®',
      sub_name: 'Exterior Acrylic Latex',
      img: '/images/s-15.png',
      d_name: 's-15.png'
    }
  ]

  const benjaminPaints = [
    {
      paint_code: '0790',
      img: '/images/b-1.png',
      d_name: 'b-1.png',
      name: 'PRIMER IMPRIMADOR'
    },
    {
      paint_code: '0791',
      img: '/images/b-2.png',
      d_name: 'b-2.png',
      name: 'MATTE MATE'
    },
    {
      paint_code: '0792',
      img: '/images/b-3.png',
      d_name: 'b-3.png',
      name: 'SATIN SATINADO'
    },
    {
      paint_code: '0793',
      img: '/images/b-4.png',
      d_name: 'b-4.png',
      name: 'SEMI-GLOSS SEMI-BRILLANTE'
    },
    {
      paint_code: 'N794',
      img: '/images/b-5.png',
      d_name: 'b-5.png',
      name: 'HIGH-GLOSS ALTO BRILLO'
    }
  ]

  const handlePaintSelect = (name: string, checked: any) => {
    if (checked) {
      if (selectedSherwin.includes(name)) {
        return
      } else {
        setSelectedSherwin([...selectedSherwin, name])
      }
    } else {
      const index = selectedSherwin.indexOf(name)
      const temp = [...selectedSherwin]
      temp.splice(index, 1)
      setSelectedSherwin(temp)
    }
  }

  const handlePaintSelectBenjamin = (name: string, checked: any) => {
    if (checked) {
      if (selectedBenjamin.includes(name)) {
        return
      } else {
        setSelectedBenjamin([...selectedBenjamin, name])
      }
    } else {
      const index = selectedBenjamin.indexOf(name)
      const temp = [...selectedBenjamin]
      temp.splice(index, 1)
      setSelectedBenjamin(temp)
    }
  }

  const showBenjaminPaints = () => {
    if (view) {
      if (selectedBenjamin.length > 0) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  const showSherwinPaints = () => {
    if (view) {
      if (selectedSherwin.length > 0) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div id='section1'>
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
                      <Checkbox
                        checked={selectedOption === 'ESTIMATE'}
                        onChange={handleCheckboxChange}
                        name='ESTIMATE'
                      />
                    }
                    label='ESTIMATE'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedOption === 'CONTRACT'}
                        onChange={handleCheckboxChange}
                        name='CONTRACT'
                      />
                    }
                    label='CONTRACT'
                  />
                </FormGroup>
              </Box>
            </Box>

            {/* <Button onClick={() => reset()}>Reset</Button> */}
            <Typography
              variant='h4'
              sx={{
                mb: 5,
                textAlign: 'center',
                mt: 10,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                color: 'white',
                fontWeight: 'bold',
                backgroundImage: 'linear-gradient(to right, #161615, #cbbeb5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              CUSTOMER DETAILS
            </Typography>
            <Grid container spacing={5}>
              {customerDetailsArray.map((c: any) => {
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3}>
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
                      <Box>
                        <Typography variant='h5' sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                          {c.label}
                        </Typography>
                        <Typography variant='h6' sx={{ textAlign: 'center' }}>
                          {allData &&
                            (c.name === 'issue_date'
                              ? new Date(allData[c.name]).toLocaleDateString()
                              : allData[c.name])}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                )
              })}
            </Grid>
            {!view && (
              <FormControl fullWidth sx={{ mt: 10 }}>
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
            )}
            {(invoiceType === InvoiceTypes.INTERIOR || invoiceType === InvoiceTypes.BOTH) && (
              <>
                <Typography
                  variant='h4'
                  sx={{
                    mb: 5,
                    textAlign: 'center',
                    mt: 10,
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    fontWeight: 'bold',
                    backgroundImage: 'linear-gradient(to right, #161615, #cbbeb5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  INTERIOR
                </Typography>
                <Box marginLeft={'2%'} display={'flex'} justifyContent={'space-between'}>
                  <TableContainer component={Paper} sx={{ borderRadius: 0, width: '820px', height: '100%' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            colSpan={1}
                            rowSpan={2}
                            sx={{ border: '1px solid black', textAlign: 'center' }}
                          ></TableCell>
                          <TableCell colSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                            <b style={{ fontSize: '1.2rem' }}> INCLUDE </b>
                          </TableCell>
                          <TableCell colSpan={6} sx={{ border: '1px solid black', textAlign: 'center' }}>
                            <b style={{ fontSize: '1.2rem' }}> PAINT CODE</b>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          {headers.map((header, colIndex) => (
                            <TableCell key={colIndex} sx={{ border: '1px solid black' }}>
                              <p style={{ margin: 0, padding: 0, fontSize: '0.8rem' }}>{header}</p>
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
                  <Box sx={{ width: '35%' }}>
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
                      <Box minHeight={150}>
                        <Typography variant='h5' fontWeight={'bold'}>
                          Paint :{' '}
                        </Typography>
                        <Typography variant='h6'>{allData?.interiorData?.paint_textarea}</Typography>
                      </Box>
                    )}
                    <Box sx={{ mt: 10 }}></Box>
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
                      <Box minHeight={150}>
                        <Typography variant='h5' fontWeight={'bold'}>
                          Stain :{' '}
                        </Typography>
                        <Typography variant='h6'>{allData?.interiorData?.stain_textarea}</Typography>
                      </Box>
                    )}
                    {showInteriorWindow() && (
                      <TableContainer component={Paper} sx={{ borderRadius: 0, width: '300px', mt: 10 }}>
                        <Table>
                          <TableHead>
                            <TableCell
                              colSpan={1}
                              rowSpan={2}
                              sx={{ border: '1px solid black', textAlign: 'center' }}
                            ></TableCell>
                            <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}> YES </p>
                            </TableCell>
                            <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>NO</p>
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
                                <Typography width={'50%'} variant='h6'>
                                  {e.label}
                                </Typography>
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
          </div>
          {/* exterior below */}
          <div id='section2'>
            {(invoiceType === InvoiceTypes.EXTERIOR || invoiceType === InvoiceTypes.BOTH) && (
              <>
                <Typography
                  variant='h4'
                  sx={{
                    mb: 5,
                    textAlign: 'center',
                    mt: 10,
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    fontWeight: 'bold',
                    backgroundImage: 'linear-gradient(to right, #161615, #cbbeb5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  EXTERIOR
                </Typography>

                <Box marginLeft={'2%'} display={'flex'} justifyContent={'space-between'}>
                  <TableContainer component={Paper} sx={{ borderRadius: 0, width: '820px', height: '100%' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            colSpan={1}
                            rowSpan={2}
                            sx={{ border: '1px solid black', textAlign: 'center' }}
                            style={{ fontSize: '23px', fontWeight: 'bold' }}
                          >
                            Exterior Design
                          </TableCell>
                          <TableCell colSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                            <b style={{ fontSize: '1.2rem' }}> INCLUDE </b>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          {eheaders.map((header, colIndex) => (
                            <TableCell key={colIndex} sx={{ border: '1px solid black' }}>
                              <p style={{ margin: 0, fontSize: '1rem' }}> {header}</p>
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
                  <Box sx={{ width: '35%' }}>
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
                      <Box minHeight={150}>
                        <Typography variant='h5' fontWeight={'bold'}>
                          Paint :{' '}
                        </Typography>
                        <Typography variant='h6'>{allData?.exteriorData?.paint_textarea}</Typography>
                      </Box>
                    )}
                    <Box sx={{ mt: 10 }}></Box>
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
                      <Box minHeight={150}>
                        <Typography variant='h5' fontWeight={'bold'}>
                          Stain :{' '}
                        </Typography>
                        <Typography variant='h6'>{allData?.exteriorData?.stain_textarea}</Typography>
                      </Box>
                    )}
                    {showExteriorWindow() && (
                      <TableContainer component={Paper} sx={{ borderRadius: 0, width: '420px', mt: 10 }}>
                        <Table>
                          <TableHead>
                            <TableCell
                              colSpan={1}
                              rowSpan={2}
                              sx={{ border: '1px solid black', textAlign: 'center' }}
                            ></TableCell>
                            <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: '0.8rem' }}> SIDING</p>
                            </TableCell>
                            <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: '0.8rem' }}> FACIAL </p>
                            </TableCell>
                            <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: '0.8rem' }}> TRIM </p>
                            </TableCell>
                            <TableCell colSpan={1} rowSpan={2} sx={{ border: '1px solid black', textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: '0.8rem' }}> SOFFITS </p>
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
                                <Typography width={'50%'} variant='h6'>
                                  {e.label}
                                </Typography>
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
          </div>
          <div id='section3'>
            {showSherwinPaints() && (
              <>
                <Typography variant='h4' textAlign={'center'} sx={{ mt: 10 }}>
                  Brand Sherwin Williams Paints
                </Typography>
                <Grid container mt={10}>
                  {sherwinPaints.map(p => {
                    if (view) {
                      if (!selectedSherwin.includes(p.d_name)) return
                    }
                    return (
                      <Grid item xs={12} sm={4} key={p.d_name} mb={10}>
                        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
                          <Typography variant='h5'>{p.name}</Typography>
                          <Typography variant='h6'>{p.sub_name}</Typography>
                          <Box width={140}>
                            <img style={{ width: '100%', marginTop: '8px' }} src={p.img} />
                          </Box>
                          {!view && (
                            <Checkbox
                              checked={selectedSherwin.includes(p.d_name)}
                              onClick={(e: any) => handlePaintSelect(p.d_name, e.target.checked)}
                            />
                          )}
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </>
            )}
            {showBenjaminPaints() && (
              <>
                {' '}
                <Typography variant='h4' textAlign={'center'} sx={{ mt: 8 }}>
                  Benjamin Moore Advance Paints
                </Typography>
                <Grid container mt={10}>
                  {benjaminPaints.map(p => {
                    if (view) {
                      if (!selectedBenjamin.includes(p.d_name)) return
                    }
                    return (
                      <Grid item xs={12} sm={4} key={p.d_name} mb={10}>
                        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
                          <Typography variant='h5'>{p.name}</Typography>
                          <Typography variant='h6'>{p.paint_code}</Typography>
                          <Box width={140}>
                            <img style={{ width: '100%', marginTop: '8px' }} src={p.img} />
                          </Box>
                          {!view && (
                            <Checkbox
                              checked={selectedBenjamin.includes(p.d_name)}
                              onClick={(e: any) => handlePaintSelectBenjamin(p.d_name, e.target.checked)}
                            />
                          )}
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </>
            )}
          </div>
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
          <div id='section4'>
            <Typography
              variant='h4'
              sx={{
                mb: 5,
                textAlign: 'center',
                mt: 10,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                color: 'white',
                fontWeight: 'bold',
                backgroundImage: 'linear-gradient(to right, #161615, #cbbeb5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
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
                    <Typography variant='h5' fontWeight={'bold'} sx={{ textAlign: 'center' }}>
                      {'Total Cost'}
                    </Typography>
                    <Typography variant='h6' sx={{ textAlign: 'center' }}>
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
                    <Typography variant='h5' fontWeight={'bold'} sx={{ textAlign: 'center' }}>
                      {'50% Down payment'}
                    </Typography>
                    <Typography variant='h6' sx={{ textAlign: 'center' }}>
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
                    <Typography variant='h5' fontWeight={'bold'} sx={{ textAlign: 'center' }}>
                      {'Balance Due'}
                    </Typography>
                    <Typography variant='h6' sx={{ textAlign: 'center' }}>
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
                    <Typography variant='h5' fontWeight={'bold'} sx={{ textAlign: 'center' }}>
                      {'Pay Link'}
                    </Typography>
                    <Typography variant='h6' sx={{ textAlign: 'center' }}>
                      {allData && allData['pay_link'] ? (
                        <Link href={allData['pay_link']} target='_blank'>
                          {allData['pay_link'].length > 30 ? `${allData['pay_link']}` : allData['pay_link']}
                        </Link>
                      ) : null}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </div>
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
