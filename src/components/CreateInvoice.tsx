import React, { forwardRef, useEffect, useState } from 'react'

import { useForm, Controller, FormProvider } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  CircularProgress,
  FormControl,
  Typography,
  Box,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material'
import axios from 'axios'
import { InvoiceTypes, InvoiceTypesValues } from 'src/enums/FormTypes'
import { useRouter } from 'next/router'
import emailjs from '@emailjs/browser'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import FallbackSpinner from 'src/@core/components/spinner'
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Grid } from '@mui/material'

// import Create from 'src/pages/create'
import { Status, statusValues } from 'src/enums'
import Link from 'next/link'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { green } from '@mui/material/colors'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// import html2pdf from 'html2pdf.js'

//Custom Libraries
import PaintGridComponent from './PaintGrid'
import { styled } from '@mui/system'
import CustomerSection from './CustomerSection'
import { toast } from 'react-hot-toast'
import NewForm from './NewForm'
import WarrantyContent from './WarrantyContent'

interface FormItemProps {
  name: string
  label: string
  control: any
  allData: any
  view: boolean
  payLink?: string
  disabled?: boolean
}

const FormItem: React.FC<FormItemProps> = ({ name, label, control, allData, view, payLink, disabled = false }) => {
  return (
    <Grid item xs={12} sm={4}>
      {!view && !disabled ? (
        <FormControl fullWidth>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={label}
                onChange={e => {
                  // Ensure the value is non-negative if the field is 'total_cost' or 'handyMan_total_cost'
                  const value = parseFloat(e.target.value)
                  if ((name === 'total_cost' || name === 'handyMan_total_cost') && value < 0) {
                    field.onChange(0) // Reset to 0 if negative value is input
                  } else {
                    field.onChange(e.target.value) // Otherwise, pass the value through normally
                  }
                }}
                aria-describedby='validation-basic-last-name'
                disabled={disabled}
              />
            )}
          />
        </FormControl>
      ) : (
        <Box>
          <Typography variant='h5' fontWeight='bold' sx={{ textAlign: 'center' }}>
            {label}
          </Typography>
          <Typography variant='h6' sx={{ textAlign: 'center' }}>
            {(name === 'grand_total' ||
              name === 'total_down_payment' ||
              name === 'handyMan_total_cost' ||
              name === 'total_cost' ||
              name === 'handyMan_down_payment' ||
              name === 'down_payment' ||
              name === 'handyMan_balance_due' ||
              name === 'balance_due') &&
              '$'}
            {name === 'pay_link'
              ? payLink
              : disabled && (name === 'grand_total' || name === 'total_down_payment')
              ? name === 'grand_total'
                ? (allData?.['handyMan_total_cost'] || 0) + (allData?.['total_cost'] || 0)
                : (allData?.['handyMan_down_payment'] || 0) + (allData?.['down_payment'] || 0)
              : allData?.[name]}
          </Typography>
        </Box>
      )}
    </Grid>
  )
}

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
  const [warrantyType, setWarrantyType] = useState<'None' | 'Interior' | 'Exterior' | 'Both'>('None')
  const [interiorWarranty, setInteriorWarranty] = useState('')
  const [exteriorWarranty, setExteriorWarranty] = useState('')
  const [warrantyDate, setWarrantyDate] = useState('')

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
    defaultValues.notes = ''
    defaultValues.balance_due = ''
    defaultValues.down_payment = ''
    defaultValues.issue_date = new Date()
    defaultValues.pay_link = ''
    defaultValues.other_paints = ''
    defaultValues.newForm = {
      dryWall: { sheets: 0, corners: '', tapping: '', sheetRock: '', repairs: '' },
      textureRepair: {
        orangePeel: '',
        knockDown: '',
        level: '',
        slapBrush: '',
        pullTrowel: '',
        customTexture: '',
        popCornRemoval: ''
      },
      vinylFlooring: {
        removal: '',
        debrisRemoval: '',
        stairs: '',
        prepping: '',
        baseboardInstallation: '',
        repairs: ''
      },
      tile: {
        removal: '',
        reguardWaterProofingApplication: '',
        debrisRemoval: '',
        prepping: '',
        groutInstallation: '',
        ditraInstallation: '',
        showerPan: ''
      },
      carpetInstallation: {
        squareYard: '',
        removal: '',
        debrisRemoval: '',
        stairWay: '',
        carpetStretching: '',
        repairs: ''
      },
      carpentry: {
        framing: '',
        doorInstallation: '',
        debrisRemoval: '',
        baseboardInstallation: '',
        doorCasingInstallation: '',
        quarterRoundMolding: '',
        crownMolding: '',
        windowSill: ''
      },
      plumbing: {
        GarbageDesposalRemovalInstallation: '',
        faucetRemovalInstallation: '',
        toiletRemovalInstallation: '',
        replaceValves: '',
        sinkRemovalInstallation: '',
        showerDoorInstallation: '',
        debrisRemoval: '',
        kitRepair: ''
      },
      fixtures: {
        mirrorInstallation: '',
        vanityInstallation: '',
        lightReplacement: '',
        towelBar: '',
        hardware: '',
        blindInstallation: ''
      },
      cleaning: {
        deepCleaning: '',
        basicCleaning: '',
        insideWindows: 0,
        stove: '',
        microwave: '',
        baseBoard: '',
        refrigerator: '',
        cabinets: '',
        walls: '',
        pantry: '',
        stoveHood: '',
        bathrooms: 0,
        mopping: '',
        bedrooms: 0,
        carpetVacuum: '',
        powerWash: '',
        basement: '',
        garage: '',
        patio: ''
      }
    }

    return defaultValues
  }

  const defaultValues = generateDefaultValues(numRows, numCols)

  const methods = useForm({
    defaultValues
  })
  const { control, handleSubmit, reset, getValues } = methods

  const [isLoading, setIsLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)
  const [data, setData] = useState<any>([])
  const [exteriorData, setExteriorData] = useState<any>([])
  const [invoiceType, setInvoiceType] = useState<any>(InvoiceTypes.ALL)
  const [selectedOption, setSelectedOption] = useState('')
  const [allData, setAllData] = useState<any>()
  const [pdfLoading, setPdfLoading] = useState(false)
  const [status, setStatus] = useState(Status.UNPAID)
  const [emailLoading, setemailLoading] = useState(false)
  const [selectedSherwin, setSelectedSherwin] = useState<any>([])
  const [selectedBenjamin, setSelectedBenjamin] = useState<any>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [workStartedDate, setWorkStartedDate] = useState(null)
  const [workStartedTime, setWorkStartedTime] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  // const [statusLoading, setStatusLoading] = useState(false)

  const handleDialogOpen = () => {
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleDialogSubmit = () => {
    setIsDialogOpen(false)
    sendStatusEmail()
  }

  const [newForm, setNewForm] = useState({
    dryWall: false,
    textureRepair: false,
    vinylFlooring: false,
    tile: false,
    carpetInstallation: false,
    carpentry: false,
    plumbing: false,
    fixtures: false,
    cleaning: false
  })

  // const handleCheckboxChange = (event: any) => {
  //   setSelectedOption(event.target.name)
  // }

  const headers = ['WALL', 'BASE', 'CEILING', 'CLOSET', 'DOOR', 'BASEBOARD']

  const checkValues = (obj: any) => {
    if (obj == null) return false

    return !Object.values(obj).every(value => value === null || value === 0 || value === '' || value === 'No')
  }

  const showNewFormOrNot = (newFormData: any) => {
    const obj = { ...newForm }
    obj.dryWall = checkValues(newFormData?.dryWall)
    obj.textureRepair = checkValues(newFormData?.textureRepair)
    obj.vinylFlooring = checkValues(newFormData?.vinylFlooring)
    obj.tile = checkValues(newFormData?.tile)

    obj.carpetInstallation = checkValues(newFormData?.carpetInstallation)
    obj.carpentry = checkValues(newFormData?.carpentry)
    obj.plumbing = checkValues(newFormData?.plumbing)
    obj.fixtures = checkValues(newFormData?.fixtures)
    obj.cleaning = checkValues(newFormData?.cleaning)

    setNewForm(obj)
  }

  // const headers = ['YES', 'NO', 'WALL', 'BASE', 'CEILING', 'CLOSET', 'DOOR', 'DASHBOARD']
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
        defaultValues.notes = tableData.notes
        defaultValues.total_cost = tableData.total_cost
        defaultValues.balance_due = tableData.balance_due
        defaultValues.down_payment = tableData.down_payment
        defaultValues.handyMan_total_cost = tableData.handyMan_total_cost
        defaultValues.handyMan_balance_due = tableData.handyMan_balance_due
        defaultValues.handyMan_down_payment = tableData.handyMan_down_payment
        defaultValues.grand_total =
          parseInt(response.data.payload.data.total_cost || 0, 10) +
          parseInt(response.data.payload.data.handyMan_total_cost || 0, 10)
        defaultValues.total_down_payment =
          parseInt(response.data.payload.data.down_payment || 0, 10) +
          parseInt(response.data.payload.data.handyMan_down_payment || 0, 10)
        defaultValues.pay_link = tableData.pay_link
        defaultValues.other_paints = tableData.other_paints
        defaultValues.issue_date = tableData.issue_date ? new Date(tableData.issue_date) : null
        defaultValues.newForm = tableData.moreDetails
        console.log('Default Values:', defaultValues) // Add this line for debugging

        setAllData(tableData)
        reset(defaultValues)
        setSelectedOption(tableData.form_type)
        setInvoiceType(tableData.invoice_type) // Set the invoice type state
        setData(tableData.interiorRows)
        setExteriorData(tableData.exteriorRows)
        setIsLoading(false)
        setStatus(tableData.status)
        setSelectedBenjamin(tableData.benjamin_paints)
        setSelectedSherwin(tableData.sherwin_paints)
        showNewFormOrNot(tableData.moreDetails)
        setWarrantyType(tableData.warranty_type)
        setInteriorWarranty(
          tableData.warranty_type === 'Interior'
            ? tableData.interior_warranty
            : tableData.warranty_type === 'Both'
            ? tableData.interior_warranty
            : ''
        )
        setExteriorWarranty(
          tableData.warranty_type === 'Exterior'
            ? tableData.exterior_warranty
            : tableData.warranty_type === 'Both'
            ? tableData.exterior_warranty
            : ''
        )
        setWarrantyDate(new Date(tableData?.warranty_date).toLocaleDateString())
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

  const generatePdf = async (str?: string) => {
    try {
      if (typeof window === 'undefined') return
      if (str !== 'email') {
        setPdfLoading(true)
      } else {
        setemailLoading(true)
      }

      const section1 = document.getElementById('section1') // First section
      const section2 = document.getElementById('section2') // Second section
      const section3 = document.getElementById('section3') // Third section
      const section4 = document.getElementById('section4') // Fourth section
      const section6 = document.getElementById('section6') // Sixth section
      const section5 = document.getElementById('section5') // Fourth section
      const CustomerWithSingle = document.getElementById('CustomerWithSingle') // This is so if only exterior is selected then we could print customer details on top
      const CustomerWithExterior = document.getElementById('CustomerWithExterior')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm
      const screenWidth = 1500 // Desired screen width in pixels
      const screenHeight = (pdfHeight / pdfWidth) * screenWidth // Scale height proportionally to screen width

      const addSectionToPdf = async (section: any, pdf: any, html?: any, doHtml = false) => {
        const canvas = await html2canvas(
          section,
          doHtml
            ? {
                scale: 2, // Adjust as needed
                useCORS: true,
                width: screenWidth,
                windowWidth: screenWidth
              }
            : {
                scale: 2, // Adjust as needed
                useCORS: true,
                width: screenWidth,
                height: screenHeight,
                windowWidth: screenWidth
              }
        )

        const imgData = canvas.toDataURL('image/jpeg', 0.5) // Adjust quality as needed

        const imgProps = pdf.getImageProperties(imgData)
        const imgWidth = pdfWidth
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width

        await pdf.insertPage(1).addImage(imgData, 'JPEG', 6, 5, imgWidth, imgHeight, undefined, 'FAST')
        if (doHtml) {
          await pdf.html(html.outerHTML, {
            // callback: function (pdf) {},
            x: 6,
            y: imgHeight + 5,
            width: imgWidth,
            windowWidth: screenWidth
          })
          await pdf.link(165, imgHeight + 16, 45, 10, { url: allData['pay_link'] })
        }
      }

      if (warrantyType !== 'None') {
        await addSectionToPdf(section5, pdf)
      }
      await addSectionToPdf(section3, pdf, section4, true)
      if (
        invoiceType === InvoiceTypes.INTERIOR ||
        invoiceType === InvoiceTypes.HANDYMAN ||
        invoiceType === InvoiceTypes.EXTERIOR
      ) {
        await addSectionToPdf(CustomerWithSingle, pdf)
        pdf.deletePage(warrantyType !== 'None' ? 4 : 3)
      } else if (invoiceType === InvoiceTypes.ALL) {
        await addSectionToPdf(section6, pdf)
        await addSectionToPdf(section2, pdf)
        await addSectionToPdf(section1, pdf)
        pdf.deletePage(warrantyType !== 'None' ? 6 : 5)
      } else {
        if (invoiceType === InvoiceTypes.INTERIOR_WITH_EXTERIOR) {
          await addSectionToPdf(section2, pdf)
          await addSectionToPdf(section1, pdf)
        } else if (invoiceType === InvoiceTypes.INTERIOR_WITH_HANDYMAN) {
          await addSectionToPdf(section6, pdf)
          await addSectionToPdf(section1, pdf)
        } else if (invoiceType === InvoiceTypes.EXTERIOR_WITH_HANDYMAN) {
          await addSectionToPdf(section6, pdf)
          await addSectionToPdf(CustomerWithExterior, pdf)
        }
        pdf.deletePage(warrantyType !== 'None' ? 5 : 4)
      }

      if (str !== 'email') {
        pdf.save('download.pdf')
      }

      setPdfLoading(false)

      const pdfBlob = pdf.output('blob')

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
            .then(() => {
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
    } catch (error) {
      console.log(error)
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
        notes: formData.notes,
        balance_due: parseInt(formData.balance_due),
        down_payment: parseInt(formData.down_payment),
        total_cost: parseInt(formData.total_cost),
        handyMan_balance_due: parseInt(formData.handyMan_balance_due),
        handyMan_down_payment: parseInt(formData.handyMan_down_payment),
        handyMan_total_cost: parseInt(formData.handyMan_total_cost),
        grand_total: parseInt(formData.total_cost, 10) + parseInt(formData.handyMan_total_cost, 10),
        status: status,
        pay_link: formData.pay_link,
        other_paints: formData.other_paints,
        sherwin_paints: selectedSherwin,
        benjamin_paints: selectedBenjamin,
        moreDetails: formData.newForm,
        warranty_type: warrantyType,
        exterior_warranty: exteriorWarranty,
        interior_warranty: interiorWarranty,
        warranty_date: warrantyDate,
        work_started_date: workStartedDate,
        work_started_time: workStartedTime ? workStartedTime.toLocaleTimeString() : null
      }

      console.log('Payload:', payload) // Add this line for debugging

      if (invoiceId) {
        await axios.post(`/api/update`, { payload, invoiceId })
        toast.success('Updated Successfully')
      } else {
        const res = await axios.post('/api/create-invoice', payload)
        reset(defaultValues)
        setSelectedOption('')
        const { _id } = res.data.payload.invoice
        router.push(`create?invoiceId=${_id}&view=true`)
        toast.success('Invoice created successfully')
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
    },
    {
      // paint_code: 'N794',
      img: '/images/b-6.png',
      d_name: 'b-6.png',
      name: 'Aura Exterior'
    },
    {
      // paint_code: 'N794',
      img: '/images/b-7.png',
      d_name: 'b-7.png',
      name: 'Regal Select Exterior'
    },
    {
      // paint_code: 'N794',
      img: '/images/b-8.png',
      d_name: 'b-8.png',
      name: 'Element Guard'
    },
    {
      // paint_code: 'N794',
      img: '/images/b-9.png',
      d_name: 'b-9.png',
      name: 'Aura Interior'
    },
    {
      // paint_code: 'N794',
      img: '/images/b-10.png',
      d_name: 'b-10.png',
      name: 'Regal Select Interior'
    },
    {
      // paint_code: 'N794',
      img: '/images/b-11.png',
      d_name: 'b-11.png',
      name: 'Ben Interior'
    },
    {
      // paint_code: 'N794',
      img: '/images/b-12.png',
      d_name: 'b-12.png',
      name: 'Ultra Spec 500 Interior'
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

  const showOtherPaint = () => {
    const otherPaints = allData?.other_paints || ''
    if (view) {
      return otherPaints.trim().length > 0
    } else {
      return true
    }
  }
  const showNotes = () => {
    const other_notes = allData?.notes || ''
    if (view) {
      return other_notes.trim().length > 0
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
  const StyledTypography = styled(Typography)(({ theme }: any) => ({
    color: '#323232', // Text color from your theme
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    textAlign: 'center',
    padding: theme.spacing(2),
    background: `linear-gradient(45deg, #719E37, #F7F7F9)`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    margin: '1%'
  }))

  const payLink =
    allData && allData['pay_link'] ? (
      <Link href={allData['pay_link']} target='_blank'>
        {allData['pay_link'].length > 30 ? allData['pay_link'] : allData['pay_link']}
      </Link>
    ) : null

  const sendStatusEmail = async () => {
    setStatusLoading(true)

    const serviceID = 'service_pypvnz1'
    const templateID = 'template_nz7lf5l'
    const userID = '1rRx93iEXQmVegiJX'

    const templateParams = {
      customer_name: allData.customer_name,
      to_email: allData.email,
      work_started_date: workStartedDate ? new Date(workStartedDate).toLocaleDateString() : 'N/A',
      work_started_time: workStartedTime ? workStartedTime : 'N/A'
    }

    if (!allData.email) {
      toast.error('No email address provided')
      setStatusLoading(false)

      return
    }

    emailjs
      .send(serviceID, templateID, templateParams, userID)
      .then(() => {
        toast.success('Status email sent')
      })
      .catch(error => {
        console.error('Error sending status email:', error)
        toast.error('Error sending status email')
      })
      .finally(() => {
        setStatusLoading(false)
      })
  }

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
          <Box sx={{ width: '20px' }}></Box>
          <Button
            variant='contained'
            color='primary'
            onClick={handleDialogOpen}
            disabled={statusLoading}
            startIcon={statusLoading ? <CircularProgress size={15} /> : null}
          >
            Send Status
          </Button>
          {/* Dialog Component */}
          <Dialog open={isDialogOpen} onClose={handleDialogClose}>
            <DialogTitle>Select Work Started Date and Time</DialogTitle>
            <DialogContent
              style={{
                width: 600,
                height: 300,
                display: 'flex',
                justifyContent: 'space-evenly'
              }}
            >
              <Grid item xs={12}>
                <TextField
                  value={workStartedDate}
                  type='date'
                  onChange={event => setWorkStartedDate(event.target.value)}
                  style={{
                    width: 250
                  }}
                />
              </Grid>
              <Grid item xs={12} ml={5}>
                <TextField
                  value={workStartedTime}
                  type='time'
                  onChange={event => setWorkStartedTime(event.target.value)}
                  style={{
                    width: 250
                  }}
                />
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={() => handleDialogSubmit()} variant='contained' color='primary'>
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      <Divider sx={{ mt: 6 }} />
      <div id='pdf-content' style={{ padding: 20 }}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div id='CustomerWithSingle'>
              <div id='CustomerWithExterior'>
                <div id='section1'>
                  <CustomerSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
                  {/* <Button onClick={() => reset()}>Reset</Button> */}
                  <StyledTypography>CUSTOMER DETAILS</StyledTypography>

                  <Grid container spacing={5}>
                    {customerDetailsArray.map((c: any) => {
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={c.name}>
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
                          return (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          )
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
                          return (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  )}
                  {/* Add Warranty Dropdown */}
                  {!view && (
                    <FormControl fullWidth margin='normal'>
                      <InputLabel>Add Warranty</InputLabel>
                      <Select
                        value={warrantyType}
                        onChange={e => setWarrantyType(e.target.value as 'None' | 'Interior' | 'Exterior' | 'Both')}
                      >
                        <MenuItem value='None'>None</MenuItem>
                        <MenuItem value='Interior'>Interior</MenuItem>
                        <MenuItem value='Exterior'>Exterior</MenuItem>
                        <MenuItem value='Both'>Both</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  {(invoiceType === InvoiceTypes.INTERIOR ||
                    invoiceType === InvoiceTypes.ALL ||
                    invoiceType === InvoiceTypes.INTERIOR_WITH_EXTERIOR ||
                    invoiceType === InvoiceTypes.INTERIOR_WITH_HANDYMAN) && (
                    <>
                      <StyledTypography>INTERIOR</StyledTypography>
                      <Box marginLeft={'2%'} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                        <TableContainer
                          component={Paper}
                          sx={{
                            borderRadius: 0,
                            width: '820px',
                            height: '100%'
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
                                <TableCell colSpan={6} sx={{ border: '1px solid black', textAlign: 'center' }}>
                                  <b style={{ fontSize: '1.2rem' }}> PAINT CODE</b>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                {headers.map((header, colIndex) => (
                                  <TableCell key={colIndex} sx={{ border: '1px solid black', fontWeight: 'bold' }}>
                                    <p style={{ margin: 0, padding: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                                      {header}
                                    </p>
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
                                    <TableCell sx={{ border: '1px solid black' }}>
                                      {/* <p style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{row.name}</p> */}
                                      <Typography fontWeight={'bold'} variant='h6'>
                                        {row.name}
                                      </Typography>
                                    </TableCell>
                                    {row.columns.map((column: any, colIndex: any) => (
                                      <TableCell key={colIndex} sx={{ border: '1px solid black' }}>
                                        <Controller
                                          name={`interiorRows.row-${rowIndex}-col-${colIndex + 1}`}
                                          control={control}
                                          defaultValue={column.value}
                                          render={({ field }: any) =>
                                            (view && field.value) || !view ? (
                                              <Checkbox
                                                {...field}
                                                icon={
                                                  field.value && !view ? (
                                                    <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                  ) : (
                                                    <Checkbox {...field} checked={field.value} />
                                                  )
                                                }
                                                checkedIcon={
                                                  view ? (
                                                    <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                  ) : (
                                                    <Checkbox {...field} checked={field.value} />
                                                  )
                                                }
                                                checked={field.value}
                                              />
                                            ) : (
                                              <></>
                                            )
                                          }
                                        />
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ) : null
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Box
                          sx={{
                            width: '35%',
                            marginTop: 0
                          }}
                        >
                          <Box flexDirection={'column'} display={'flex'} justifyContent={'space-between'}>
                            {!view && (
                              <FormControl fullWidth>
                                <Controller
                                  name='interiorData.paint_textarea'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField rows={4} multiline label='Paint' fullWidth {...field} />
                                  )}
                                />
                              </FormControl>
                            )}
                            {view && allData?.interiorData?.paint_textarea && (
                              <Box minHeight={150}>
                                <Typography variant='h5' fontWeight={'bold'}>
                                  Paint :{' '}
                                </Typography>
                                <Typography variant='h6' fontWeight={'bold'}>
                                  {allData?.interiorData?.paint_textarea}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ width: 10, height: 10 }}></Box>
                            {!view && (
                              <FormControl fullWidth>
                                <Controller
                                  name='interiorData.stain_textarea'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField rows={4} multiline label='Stain' fullWidth {...field} />
                                  )}
                                />
                              </FormControl>
                            )}
                            {view && allData?.interiorData?.stain_textarea && (
                              <Box minHeight={150}>
                                <Typography variant='h5' fontWeight={'bold'}>
                                  Stain :{' '}
                                </Typography>
                                <Typography variant='h6' fontWeight={'bold'}>
                                  {allData?.interiorData?.stain_textarea}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {showInteriorWindow() && (
                            <TableContainer component={Paper} sx={{ borderRadius: 0, width: '100%', mt: 10 }}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      colSpan={1}
                                      rowSpan={2}
                                      sx={{ border: '1px solid black', textAlign: 'center' }}
                                    ></TableCell>
                                    <TableCell
                                      colSpan={1}
                                      rowSpan={2}
                                      sx={{ border: '1px solid black', textAlign: 'center' }}
                                    >
                                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>YES</p>
                                    </TableCell>
                                    <TableCell
                                      colSpan={1}
                                      rowSpan={2}
                                      sx={{ border: '1px solid black', textAlign: 'center' }}
                                    >
                                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>NO</p>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow key={'0'}>
                                    <TableCell key={'0'} sx={{ border: '1px solid black', fontWeight: 'bold' }}>
                                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}> WINDOW TRIM </p>
                                    </TableCell>
                                    <TableCell key={'1'} sx={{ border: '1px solid black', textAlign: 'center' }}>
                                      <Controller
                                        name={`interiorData.window.row-0-col-2`}
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }: any) =>
                                          (view && field.value) || !view ? (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                              onChange={e => field.onChange(e.target.checked)}
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell key={'2'} sx={{ border: '1px solid black', textAlign: 'center' }}>
                                      <Controller
                                        name={`interiorData.window.row-0-col-3`}
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }: any) =>
                                          (view && field.value) || !view ? (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                              onChange={e => field.onChange(e.target.checked)}
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                  <TableRow key={'1'}>
                                    <TableCell sx={{ border: '1px solid black', fontWeight: 'bold' }}>
                                      {' '}
                                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}> WINDOW SEAL </p>
                                    </TableCell>
                                    <TableCell key={'1'} sx={{ border: '1px solid black', textAlign: 'center' }}>
                                      <Controller
                                        name={`interiorData.window.row-1-col-2`}
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }: any) =>
                                          (view && field.value) || !view ? (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                              onChange={e => field.onChange(e.target.checked)}
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell key={'2'} sx={{ border: '1px solid black', textAlign: 'center' }}>
                                      <Controller
                                        name={`interiorData.window.row-1-col-3`}
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }: any) =>
                                          (view && field.value) || !view ? (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                              onChange={e => field.onChange(e.target.checked)}
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                          {showExtras() && (
                            <Grid container sx={{ mt: 10 }}>
                              {extrasArray.map(e => {
                                return (
                                  ((view && getValues(e.name)) || !view) && (
                                    <Grid item xs={12} sm={6} key={e.name}>
                                      <Box display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}>
                                        <Typography width={'50%'} variant='h6' fontWeight={'bold'}>
                                          {e.label}
                                        </Typography>
                                        <Controller
                                          name={e.name}
                                          control={control}
                                          defaultValue={false}
                                          render={({ field }) => (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                            />
                                          )}
                                        />
                                      </Box>
                                    </Grid>
                                  )
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
                  {(invoiceType === InvoiceTypes.EXTERIOR ||
                    invoiceType === InvoiceTypes.ALL ||
                    invoiceType === InvoiceTypes.INTERIOR_WITH_EXTERIOR ||
                    invoiceType === InvoiceTypes.EXTERIOR_WITH_HANDYMAN) && (
                    <>
                      {!(invoiceType === InvoiceTypes.EXTERIOR) === true && view && (
                        <CustomerSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
                      )}
                      <StyledTypography>EXTERIOR</StyledTypography>
                      <Box marginLeft={'2%'} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                        <TableContainer
                          component={Paper}
                          sx={{
                            borderRadius: 0,
                            width: '820px',
                            height: '100%'
                          }}
                        >
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
                                    {/* <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}> {header}</p> */}
                                    <Typography fontWeight={'bold'} variant='h6'>
                                      {header}
                                    </Typography>
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
                                    <TableCell sx={{ border: '1px solid black' }}>
                                      <Typography variant='h6' fontWeight={'bold'}>
                                        {row.name}
                                      </Typography>
                                    </TableCell>
                                    {row.columns.map((column: any, colIndex: any) => (
                                      <TableCell key={colIndex} sx={{ border: '1px solid black', fontWeight: 'bold' }}>
                                        <Controller
                                          name={`exteriorRows.row-${rowIndex}-col-${colIndex + 1}`}
                                          control={control}
                                          defaultValue={column.value}
                                          render={({ field }: any) =>
                                            (view && field.value) || !view ? (
                                              <Checkbox
                                                {...field}
                                                icon={
                                                  field.value && !view ? (
                                                    <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                  ) : (
                                                    <Checkbox {...field} checked={field.value} />
                                                  )
                                                }
                                                checkedIcon={
                                                  view ? (
                                                    <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                  ) : (
                                                    <Checkbox {...field} checked={field.value} />
                                                  )
                                                }
                                                checked={field.value}
                                              />
                                            ) : (
                                              <></>
                                            )
                                          }
                                        />
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ) : null
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Box
                          sx={{
                            width: '35%',
                            marginTop: 0
                          }}
                        >
                          <Box flexDirection={'column'} display={'flex'} justifyContent={'space-between'}>
                            {!view && (
                              <FormControl fullWidth>
                                <Controller
                                  name='exteriorData.paint_textarea'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField rows={4} multiline label='Paint' fullWidth {...field} />
                                  )}
                                />
                              </FormControl>
                            )}
                            {view && allData?.exteriorData?.paint_textarea && (
                              <Box minHeight={150}>
                                <Typography variant='h5' fontWeight={'bold'}>
                                  Paint :{' '}
                                </Typography>
                                <Typography variant='h6' fontWeight={'bold'}>
                                  {allData?.exteriorData?.paint_textarea}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ width: 10, height: 10 }}></Box>
                            {!view && (
                              <FormControl fullWidth>
                                <Controller
                                  name='exteriorData.stain_textarea'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField rows={4} multiline label='Stain' fullWidth {...field} />
                                  )}
                                />
                              </FormControl>
                            )}
                            {view && allData?.exteriorData?.stain_textarea && (
                              <Box minHeight={150}>
                                <Typography variant='h5' fontWeight={'bold'}>
                                  Stain :{' '}
                                </Typography>
                                <Typography variant='h6' fontWeight={'bold'}>
                                  {allData?.exteriorData?.stain_textarea}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {showExteriorWindow() && (
                            <TableContainer component={Paper} sx={{ borderRadius: 0, width: '100%', mt: 10 }}>
                              <Table>
                                <TableHead>
                                  <TableCell
                                    colSpan={1}
                                    rowSpan={2}
                                    sx={{ border: '1px solid black', textAlign: 'center' }}
                                  ></TableCell>
                                  <TableCell
                                    colSpan={1}
                                    rowSpan={2}
                                    sx={{ border: '1px solid black', textAlign: 'center' }}
                                  >
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}> SIDING</p>
                                  </TableCell>
                                  <TableCell
                                    colSpan={1}
                                    rowSpan={2}
                                    sx={{ border: '1px solid black', textAlign: 'center' }}
                                  >
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}> FACIAL </p>
                                  </TableCell>
                                  <TableCell
                                    colSpan={1}
                                    rowSpan={2}
                                    sx={{ border: '1px solid black', textAlign: 'center' }}
                                  >
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}> TRIM </p>
                                  </TableCell>
                                  <TableCell
                                    colSpan={1}
                                    rowSpan={2}
                                    sx={{ border: '1px solid black', textAlign: 'center' }}
                                  >
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}> SOFFITS </p>
                                  </TableCell>
                                </TableHead>
                                <TableBody>
                                  <TableRow key={'0'}>
                                    <TableCell key={'0'} sx={{ border: '1px solid black' }}>
                                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}> REPAIRS </p>
                                    </TableCell>
                                    <TableCell key={'1'} sx={{ border: '1px solid black' }}>
                                      <Controller
                                        name={`exteriorData.window.row-0-col-2`}
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }: any) =>
                                          (view && field.value) || !view ? (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell key={'2'} sx={{ border: '1px solid black' }}>
                                      <Controller
                                        name={`exteriorData.window.row-0-col-3`}
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }: any) =>
                                          (view && field.value) || !view ? (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell key={'3'} sx={{ border: '1px solid black' }}>
                                      <Controller
                                        name={`exteriorData.window.row-0-col-4`}
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }: any) =>
                                          (view && field.value) || !view ? (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell key={'4'} sx={{ border: '1px solid black', fontWeight: 'bold' }}>
                                      <Controller
                                        name={`exteriorData.window.row-0-col-5`}
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }: any) =>
                                          (view && field.value) || !view ? (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                          {showExteriorExtras() && (
                            <Grid container sx={{ mt: 10 }}>
                              {exteriorExtrasArray.map(e => {
                                return (
                                  ((view && getValues(e.name)) || !view) && (
                                    <Grid item xs={12} sm={6} key={e.name}>
                                      <Box display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}>
                                        <Typography width={'50%'} variant='h6' fontWeight={'bold'}>
                                          {e.label}
                                        </Typography>
                                        <Controller
                                          name={e.name}
                                          control={control}
                                          defaultValue={false}
                                          render={({ field }) => (
                                            <Checkbox
                                              {...field}
                                              icon={
                                                field.value && !view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checkedIcon={
                                                view ? (
                                                  <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
                                                ) : (
                                                  <Checkbox {...field} checked={field.value} />
                                                )
                                              }
                                              checked={field.value}
                                            />
                                          )}
                                        />
                                      </Box>
                                    </Grid>
                                  )
                                )
                              })}
                            </Grid>
                          )}
                        </Box>
                      </Box>
                    </>
                  )}
                </div>
              </div>
              <div id='section6'>
                {(invoiceType === InvoiceTypes.HANDYMAN ||
                  invoiceType === InvoiceTypes.ALL ||
                  invoiceType === InvoiceTypes.INTERIOR_WITH_HANDYMAN ||
                  invoiceType === InvoiceTypes.EXTERIOR_WITH_HANDYMAN) && (
                  <>
                    {!(invoiceType === InvoiceTypes.HANDYMAN) === true && view && (
                      <CustomerSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
                    )}
                    <StyledTypography>HANDYMAN SERVICES</StyledTypography>

                    <Grid container spacing={5} mt={5} mb={10}>
                      <Grid item xs={12} sm={12}>
                        <NewForm view={view} newForm={newForm} />
                      </Grid>
                    </Grid>
                  </>
                )}
              </div>
            </div>
            <div id='section3'>
              {view && <CustomerSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />}
              {showSherwinPaints() && (
                <>
                  <StyledTypography>Sherwin Williams Paints</StyledTypography>
                  <Grid container mt={10}>
                    {sherwinPaints.map(p => {
                      if (view) {
                        if (!selectedSherwin.includes(p.d_name)) return
                      }

                      return (
                        <PaintGridComponent
                          image={p.img}
                          title={p.name}
                          subText={`${p.sub_name.substring(0, 15)}${p.sub_name.length > 15 && '..'}`}
                          checked={selectedSherwin.includes(p.d_name)}
                          onClick={(e: any) => handlePaintSelect(p.d_name, e.target.checked)}
                          key={p.d_name}
                          view={view}
                        />
                      )
                    })}
                  </Grid>
                </>
              )}
              {showBenjaminPaints() && (
                <>
                  <StyledTypography>Benjamin Moore Advance Paints</StyledTypography>
                  <Grid container mt={10}>
                    {benjaminPaints.map(p => {
                      if (view) {
                        if (!selectedBenjamin.includes(p.d_name)) return
                      }

                      return (
                        <PaintGridComponent
                          image={p.img}
                          title={p.name}
                          subText={p.paint_code}
                          checked={selectedBenjamin.includes(p.d_name)}
                          onClick={(e: any) => handlePaintSelectBenjamin(p.d_name, e.target.checked)}
                          key={p.d_name}
                          view={view}
                        />
                      )
                    })}
                  </Grid>
                </>
              )}
              {showOtherPaint() && (
                <>
                  <StyledTypography>Other Paints</StyledTypography>
                  {!view && (
                    <FormControl fullWidth>
                      <Controller
                        name='other_paints'
                        control={control}
                        render={({ field }) => (
                          <TextField rows={2} multiline label='Other Paints' fullWidth {...field} />
                        )}
                      />
                    </FormControl>
                  )}

                  {view && allData?.other_paints && (
                    <Grid item xs={12} sm={4} mb={10} ml={20} mt={10}>
                      <Box minHeight={50}>
                        <Typography variant='h6'>{allData?.other_paints}</Typography>
                      </Box>
                    </Grid>
                  )}
                </>
              )}
              <>
                {showNotes() && (
                  <>
                    <StyledTypography>Comments</StyledTypography>
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='notes'
                          control={control}
                          render={({ field }) => (
                            <TextField rows={2} multiline label='Type Notes Here...' fullWidth {...field} />
                          )}
                        />
                      </FormControl>
                    )}
                  </>
                )}

                {view && allData?.notes && (
                  <Grid item xs={12} sm={4} mb={10} ml={20} mt={10}>
                    <Box minHeight={50}>
                      <Typography variant='h6'>{allData?.notes}</Typography>
                    </Box>
                  </Grid>
                )}
              </>
              <StyledTypography>PAINTING PAYMENT DETAILS</StyledTypography>
              <Grid container spacing={5} mt={5} mb={10}>
                <FormItem
                  name='total_cost'
                  label='Total Cost'
                  control={control}
                  allData={allData}
                  view={view === 'true'}
                />
                <FormItem
                  name='down_payment'
                  label='50% Down Payment'
                  control={control}
                  allData={allData}
                  view={view === 'true'}
                />
                <FormItem
                  name='balance_due'
                  label='Balance Due'
                  control={control}
                  allData={allData}
                  view={view === 'true'}
                />
              </Grid>
              <StyledTypography>HANDYMAN PAYMENT DETAILS</StyledTypography>
              <Grid container spacing={5} mt={5} mb={10}>
                <FormItem
                  name='handyMan_total_cost'
                  label='Total Cost'
                  control={control}
                  allData={`${allData}`}
                  view={view === 'true'}
                />
                <FormItem
                  name='handyMan_down_payment'
                  label='50% Down Payment'
                  control={control}
                  allData={allData}
                  view={view === 'true'}
                />
                <FormItem
                  name='handyMan_balance_due'
                  label='Balance Due'
                  control={control}
                  allData={allData}
                  view={view === 'true'}
                />
              </Grid>
              <StyledTypography>TOTAL COST</StyledTypography>
            </div>
            <div id='section4'>
              <Grid container spacing={5} mt={5} mb={10} justifyContent={'space-between'}>
                <FormItem
                  name='grand_total'
                  label='Grand Total'
                  control={control}
                  allData={allData}
                  view={view === 'true'}
                  disabled={true}
                />
                <FormItem
                  name='total_down_payment'
                  label='Total Down Payment'
                  control={control}
                  allData={allData}
                  view={view === 'true'}
                  disabled={true}
                />
                <Grid item xs={12} sm={4}>
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
                        {payLink}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
              {/* <Grid container spacing={5} mt={5} mb={10}>
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
                          label={'50% Down Payment'}
                          onChange={onChange}
                          aria-describedby='validation-basic-last-name'
                        />
                      )}
                    />
                  </FormControl>
                ) : (
                  <Box>
                    <Typography variant='h5' fontWeight={'bold'} sx={{ textAlign: 'center' }}>
                      {'50% Down Payment'}
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
                        {payLink}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid> */}
            </div>{' '}
            {/* Warranty Content */}
            <div id='section5'>
              {warrantyType !== 'None' && view && (
                <CustomerSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
              )}
              {warrantyType && warrantyType !== 'None' && <StyledTypography>Warranty</StyledTypography>}
              <Grid container spacing={5} mt={5} mb={10}>
                {warrantyType && (
                  <Box mt={4}>
                    <WarrantyContent
                      interiorWarranty={interiorWarranty}
                      setInteriorWarranty={setInteriorWarranty}
                      exteriorWarranty={exteriorWarranty}
                      setExteriorWarranty={setExteriorWarranty}
                      type={warrantyType}
                      view={view}
                      customerName={allData?.customer_name}
                      warrantyDate={warrantyDate}
                      setWarrantyDate={newDate => setWarrantyDate(newDate)}
                    />
                  </Box>
                )}
              </Grid>
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
            {!view && (
              <Button type='submit' variant='contained' fullWidth disabled={apiLoading}>
                {apiLoading ? <CircularProgress /> : invoiceId ? 'Update Invoice' : 'Generate Invoice'}
              </Button>
            )}
          </form>
        </FormProvider>
      </div>
    </Box>
  )
}

export default CreateInvoice
