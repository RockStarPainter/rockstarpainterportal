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
  Divider,
  FormControlLabel
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
import useUserData from 'src/hooks/useUserData';

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
                ? (parseFloat(allData?.['handyMan_total_cost']) || 0) + (parseFloat(allData?.['total_cost']) || 0)
                : (parseFloat(allData?.['handyMan_down_payment']) || 0) + (parseFloat(allData?.['down_payment']) || 0)
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
  const numCols = 5 // Number of columns in each row
  const eNumRows = 17 // Number of rows in your table
  const eNumCols = 2 // Number of columns in each row
  const router = useRouter()
  const { invoiceId, view } = router.query
  const [warrantyType, setWarrantyType] = useState<'None' | 'Interior' | 'Exterior' | 'Both'>('None')
  const [interiorWarranty, setInteriorWarranty] = useState('')
  const [exteriorWarranty, setExteriorWarranty] = useState('')
  const [warrantyDate, setWarrantyDate] = useState('')
  const userData: any = useUserData();

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
    defaultValues.exterior_commercial_comment = ''
    defaultValues.interior_commercial_comment = ''
    defaultValues.interior_exterior_commercial_comment = ''
    defaultValues.handyman_notes = ''
    defaultValues.balance_due = ''
    defaultValues.down_payment = ''
    defaultValues.issue_date = new Date()
    defaultValues.pay_link = ''
    defaultValues.other_paints = ''
    defaultValues.newForm = {
      dryWall: { sheets: 0, corners: '', tapping: '', sheetRock: '', repairs: '', comment: '' },
      textureRepair: {
        orangePeel: '',
        knockDown: '',
        level: '',
        slapBrush: '',
        pullTrowel: '',
        customTexture: '',
        popCornRemoval: '',
        comment: ''
      },
      vinylFlooring: {
        removal: '',
        debrisRemoval: '',
        stairs: '',
        prepping: '',
        baseboardInstallation: '',
        repairs: '',
        comment: ''
      },
      tile: {
        removal: '',
        reguardWaterProofingApplication: '',
        debrisRemoval: '',
        prepping: '',
        groutInstallation: '',
        ditraInstallation: '',
        showerPan: '',
        comment: ''
      },
      carpetInstallation: {
        squareYard: '',
        removal: '',
        debrisRemoval: '',
        stairWay: '',
        carpetStretching: '',
        repairs: '',
        comment: ''
      },
      carpentry: {
        framing: '',
        doorInstallation: '',
        debrisRemoval: '',
        baseboardInstallation: '',
        doorCasingInstallation: '',
        quarterRoundMolding: '',
        crownMolding: '',
        windowSill: '',
        comment: ''
      },
      plumbing: {
        GarbageDesposalRemovalInstallation: '',
        faucetRemovalInstallation: '',
        toiletRemovalInstallation: '',
        replaceValves: '',
        sinkRemovalInstallation: '',
        showerDoorInstallation: '',
        debrisRemoval: '',
        kitRepair: '',
        comment: ''
      },
      fixtures: {
        mirrorInstallation: '',
        vanityInstallation: '',
        lightReplacement: '',
        towelBar: '',
        hardware: '',
        blindInstallation: '',
        comment: ''
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
        comment: '',
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
  const [selectedPrimer, setSelectedPrimer] = useState<any>([])
  const [selectedPrimerConcrete, setSelectedPrimerConcrete] = useState<any>([])
  const [selectedCaulkSealant, setSelectedCaulkSealant] = useState<any>([])
  const [selectedBenjamin, setSelectedBenjamin] = useState<any>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [workStartedDate, setWorkStartedDate] = useState<string | Date | null>(null)
  const [workStartedTime, setWorkStartedTime] = useState<string | Date | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [selectedBenjaminOptions, setSelectedBenjaminOptions] = useState<{ [key: string]: string[] }>({})
  const [showSherwinPaintsList, setShowSherwinPaintsList] = useState(false)
  const [showBenjaminPaintsList, setShowBenjaminPaintsList] = useState(false)
  const [showPrimerPaintsList, setShowPrimerPaintsList] = useState(false)
  const [showPrimerConcretePaintsList, setShowPrimerConcretePaintsList] = useState(false)
  const [showCaulkSealantPaintsList, setShowCaulkSealantPaintsList] = useState(false)

  const rows = 5 // Define the number of rows
  const cols = 3 // Define the number of columns

  const [formValues, setFormValues] = useState(generateDefaultValues(rows, cols))

  const toggleSherwinPaintsList = () => {
    setShowSherwinPaintsList(!showSherwinPaintsList)
  }
  const togglePrimerPaintsList = () => {
    setShowPrimerPaintsList(!showPrimerPaintsList)
  }
  const toggleBenjaminPaintsList = () => {
    setShowBenjaminPaintsList(!showBenjaminPaintsList)
  }
  const togglePrimerConcretePaintsList = () => {
    setShowPrimerConcretePaintsList(!showPrimerConcretePaintsList)
  }
  const toggleCaulkSealantPaintsList = () => {
    setShowCaulkSealantPaintsList(!showCaulkSealantPaintsList)
  }

  // Ensure that the paints list is unfolded in view mode when items are selected
  useEffect(() => {
    if (view && selectedSherwin.length > 0) {
      setShowSherwinPaintsList(true) // Auto-expand Sherwin Williams paints in view mode
    }
    if (view && selectedBenjamin.length > 0) {
      setShowBenjaminPaintsList(true) // Auto-expand Benjamin Moore paints in view mode
    }
    if (view && selectedPrimer.length > 0) {
      setShowPrimerPaintsList(true) // Auto-expand Primer paints in view mode
    }
    if (view && selectedPrimerConcrete.length > 0) {
      setShowPrimerConcretePaintsList(true) // Auto-expand Primer Conctrete paints in view mode
    }
    if (view && selectedCaulkSealant.length > 0) {
      setShowCaulkSealantPaintsList(true) // Auto-expand Caulk Sealant paints in view mode
    }
  }, [view, selectedSherwin, selectedBenjamin, selectedPrimerConcrete, selectedPrimer, selectedCaulkSealant])

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

  const headers = ['WALL', 'CEILING', 'CLOSET', 'DOOR', 'BASEBOARD']

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
        const benjaminOptions: { [key: string]: string[] } = {}
        tableData.benjamin_paints.forEach((paint: any) => {
          benjaminOptions[paint.paint_name] = paint.finishing_types
        })

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
        defaultValues.exterior_commercial_comment = tableData.exterior_commercial_comment
        defaultValues.interior_commercial_comment = tableData.interior_commercial_comment
        defaultValues.interior_exterior_commercial_comment = tableData.interior_exterior_commercial_comment
        defaultValues.handyman_notes = tableData.handyman_notes
        defaultValues.total_cost = tableData.total_cost
        defaultValues.balance_due = tableData.balance_due
        defaultValues.down_payment = tableData.down_payment
        defaultValues.handyMan_total_cost = tableData.handyMan_total_cost
        defaultValues.handyMan_balance_due = tableData.handyMan_balance_due
        defaultValues.handyMan_down_payment = tableData.handyMan_down_payment
        defaultValues.grand_total =
          parseFloat(response.data.payload.data.total_cost || 0) +
          parseFloat(response.data.payload.data.handyMan_total_cost || 0)
        defaultValues.total_down_payment =
          parseFloat(response.data.payload.data.down_payment || 0) +
          parseFloat(response.data.payload.data.handyMan_down_payment || 0)
        defaultValues.pay_link = tableData.pay_link
        defaultValues.other_paints = tableData.other_paints
        defaultValues.issue_date = tableData.issue_date ? new Date(tableData.issue_date) : null
        defaultValues.newForm = tableData.moreDetails

        setAllData(tableData)
        reset(defaultValues)
        setSelectedOption(tableData.form_type)
        setInvoiceType(tableData.invoice_type) // Set the invoice type state
        setData(tableData.interiorRows.slice(0, tableData.interiorRows.length - 1))
        setExteriorData(tableData.exteriorRows)
        setIsLoading(false)
        setStatus(tableData.status)
        setSelectedBenjamin(tableData.benjamin_paints.map((p: any) => p.paint_name))
        setSelectedBenjaminOptions(benjaminOptions)

        setSelectedSherwin(tableData.sherwin_paints)
        setSelectedPrimer(tableData.primer_for_wood)
        setSelectedCaulkSealant(tableData.caulk_sealant)
        setSelectedPrimerConcrete(tableData.primer_for_concrete)
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
        const dateObj = new Date(tableData?.warranty_date)
        setWarrantyDate(dateObj.toISOString().split('T')[0])
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

  async function uploadPdfToCloudinary(pdfBlob: Blob) {
    try {
      const formData = new FormData()
      formData.append('file', pdfBlob) // Append the Blob directly

      const res = await axios.post('/api/upload-file-to-cloudinary', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: localStorage.getItem('token')
        }
      })

      if (res?.data?.url) {
        return res?.data?.url
      } else {
        toast.error('Failed to upload file')
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      toast.error('Failed to upload file')
    }
  }

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
      const section3by2 = document.getElementById('section3by2')
      const section3by4 = document.getElementById('section3by4')
      const section4 = document.getElementById('section4') // Fourth section
      // const section6 = document.getElementById('section6') // Sixth section
      const section6Part1 = document.getElementById('section6-part1') // First part of NewForm
      const section6Part2 = document.getElementById('section6-part2') // Second part of NewForm

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
      await addSectionToPdf(section3by4, pdf, section4, true)
      await addSectionToPdf(section3by2, pdf)
      await addSectionToPdf(section3, pdf)
      if (invoiceType === InvoiceTypes.INTERIOR || invoiceType === InvoiceTypes.EXTERIOR) {
        await addSectionToPdf(CustomerWithSingle, pdf)
        pdf.deletePage(warrantyType !== 'None' ? 6 : 5)
      } else if (invoiceType === InvoiceTypes.HANDYMAN) {
        // await addSectionToPdf(section6, pdf)
        await addSectionToPdf(section6Part2, pdf) // Add section6-part2
        await addSectionToPdf(CustomerWithSingle, pdf)
        pdf.deletePage(warrantyType !== 'None' ? 7 : 6)
      } else if (invoiceType === InvoiceTypes.ALL) {
        // await addSectionToPdf(section6, pdf)
        await addSectionToPdf(section6Part2, pdf)
        await addSectionToPdf(section6Part1, pdf)
        await addSectionToPdf(section2, pdf)
        await addSectionToPdf(section1, pdf)

        pdf.deletePage(warrantyType !== 'None' ? 9 : 8)
      } else {
        if (invoiceType === InvoiceTypes.INTERIOR_WITH_EXTERIOR) {
          await addSectionToPdf(section2, pdf)
          await addSectionToPdf(section1, pdf)
        } else if (invoiceType === InvoiceTypes.INTERIOR_WITH_HANDYMAN) {
          // await addSectionToPdf(section6, pdf)
          await addSectionToPdf(section6Part2, pdf)
          await addSectionToPdf(section6Part1, pdf)
          await addSectionToPdf(section1, pdf)
        } else if (invoiceType === InvoiceTypes.EXTERIOR_WITH_HANDYMAN) {
          // await addSectionToPdf(section6, pdf)
          await addSectionToPdf(section6Part2, pdf)
          await addSectionToPdf(section6Part1, pdf)
          await addSectionToPdf(CustomerWithExterior, pdf)
        }

        pdf.deletePage(warrantyType !== 'None' ? 8 : 7)
      }

      if (str !== 'email') {
        pdf.save('download.pdf')
      }

      setPdfLoading(false)

      const pdfBlob = pdf.output('blob')

      if (str === 'email') {
        const reader = new FileReader()
        reader.readAsDataURL(pdfBlob)
        reader.onloadend = async () => {
          const pdfUrl = await uploadPdfToCloudinary(pdfBlob)
          if (!pdfUrl) {
            toast.error('Failed to upload PDF')
            setemailLoading(false)

            return
          }

          // EmailJS configuration
          const serviceID = 'service_pypvnz1'
          const templateID = 'template_hiu1lu8'
          const userID = '1rRx93iEXQmVegiJX'
          if (!allData.email) {
            toast.error('No email address provided')
            setemailLoading(false)

            return
          }
          const templateParams = {
            // content: base64data,
            customer_name: allData.customer_name,
            to_email: allData.email,
            custom_id: allData.custom_id, // Include the custom_id
            approval_token: allData.approval_token, // Include the approval token
            pdf_url: pdfUrl
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

      const { _id: userId } = userData // Extract role and user ID from localStorage

      const benjaminPaintsData = selectedBenjamin.map((paintName: any) => ({
        paint_name: paintName,
        finishing_types: selectedBenjaminOptions[paintName] || []
      }))
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
        exterior_commercial_comment: formData.exterior_commercial_comment,
        interior_commercial_comment: formData.interior_commercial_comment,
        interior_exterior_commercial_comment: formData.interior_exterior_commercial_comment,
        handyman_notes: formData.handyman_notes,
        balance_due: parseFloat(formData.balance_due),
        down_payment: parseFloat(formData.down_payment),
        total_cost: parseFloat(formData.total_cost),
        handyMan_balance_due: parseFloat(formData.handyMan_balance_due),
        handyMan_down_payment: parseFloat(formData.handyMan_down_payment),
        handyMan_total_cost: parseFloat(formData.handyMan_total_cost),
        grand_total: parseFloat(formData.total_cost) + parseFloat(formData.handyMan_total_cost),
        status: status,
        pay_link: formData.pay_link,
        other_paints: formData.other_paints,
        sherwin_paints: selectedSherwin,
        primer_for_wood: selectedPrimer,
        primer_for_concrete: selectedPrimerConcrete,
        caulk_sealant: selectedCaulkSealant,
        benjamin_paints: benjaminPaintsData,
        moreDetails: formData.newForm,
        warranty_type: warrantyType,
        exterior_warranty: exteriorWarranty,
        interior_warranty: interiorWarranty,
        warranty_date: warrantyDate,
        work_started_date: workStartedDate,
        work_started_time: workStartedTime instanceof Date ? workStartedTime.toLocaleTimeString() : null
      }

      if (invoiceId) {
        await axios.post(`/api/update`, { payload, invoiceId })
        toast.success('Updated Successfully')
      } else {
        const res = await axios.post('/api/create-invoice', payload, {
          headers: {
            authorization: localStorage.getItem('token')
          },
          params: {
            userId: userId // Pass the user ID (for Employees)
          }
        })
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
    },
    { name: 'Shrink-Free Spackling®', sub_name: 'C-77', img: '/images/s-16.png', d_name: 's-16.png' },
    { name: 'Wood Filler®', sub_name: 'C-86', img: '/images/s-17.png', d_name: 's-17.png' },
    { name: 'Spackling Paste®', sub_name: 'C-50', img: '/images/s-18.png', d_name: 's-18.png' },
    { name: 'Glazing Compound®', sub_name: 'C-66', img: '/images/s-19.png', d_name: 's-19.png' },
    { name: 'Spackling and Patching Compound®', sub_name: 'C-70', img: '/images/s-20.png', d_name: 's-20.png' },
    {
      name: 'SuperDeck®',
      sub_name: '9600 Series Acrylic-Alkyd Solid Color Stain',
      img: '/images/s-21.png',
      d_name: 's-21.png'
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
      name: 'Aura Exterior',
      options: ['Flat', 'Low Lustre', 'Satin', 'Soft-Gloss']
    },
    {
      // paint_code: 'N794',
      img: '/images/b-7.png',
      d_name: 'b-7.png',
      name: 'Regal Select Exterior',
      options: ['Flat', 'Eggshell', 'Pearl/Satin', 'Semi-Gloss']
    },
    {
      // paint_code: 'N794',
      img: '/images/b-8.png',
      d_name: 'b-8.png',
      name: 'Element Guard',
      options: ['Flat', 'Low Lustre', 'Soft-Gloss']
    },
    {
      // paint_code: 'N794',
      img: '/images/b-9.png',
      d_name: 'b-9.png',
      name: 'Aura Interior',
      options: ['Matte', 'Eggshell', 'Satin', 'Semi-Gloss']
    },
    {
      // paint_code: 'N794',
      img: '/images/b-10.png',
      d_name: 'b-10.png',
      name: 'Regal Select Interior',
      options: ['Flat', 'Matte', 'Eggshell', 'Pearl/Satin', 'Semi-Gloss']
    },
    {
      // paint_code: 'N794',
      img: '/images/b-11.png',
      d_name: 'b-11.png',
      name: 'Ben Interior',
      options: ['Matte', 'Eggshell', 'Pearl/Satin', 'Semi-Gloss']
    },
    {
      // paint_code: 'N794',
      img: '/images/b-12.png',
      d_name: 'b-12.png',
      name: 'Ultra Spec 500 Interior',
      options: ['Flat', 'Low-Sheen Eggshell', 'Eggshell', 'Satin/Pearl', 'Semi-Gloss']
    }
  ]
  const primerForWood = [
    {
      name: 'Loxon XP™',
      sub_name: 'Concrete & Masonry Systems',
      img: '/images/p-1.png',
      d_name: 'p-1.png'
    },
    {
      name: 'PROMAR 200™',
      sub_name: 'ZERO VOC',
      img: '/images/p-2.png',
      d_name: 'p-2.png'
    },
    {
      name: 'PROMAR 400™',
      sub_name: 'ZERO VOC',
      img: '/images/p-3.png',
      d_name: 'p-3.png'
    }
  ]
  const primerForConcrete = [
    {
      name: 'Loxon®',
      sub_name: 'Self-Cleaning Acrylic Coating',
      img: '/images/pc-1.png',
      d_name: 'pc-1.png'
    },
    {
      name: 'Loxon®™',
      sub_name: 'Concrete & Masonry Primer/Sealer',
      img: '/images/pc-2.png',
      d_name: 'pc-2.png'
    },
    {
      name: 'Loxon®™',
      sub_name: 'Semi-Transparent Concrete Stain',
      img: '/images/pc-3.png',
      d_name: 'pc-3.png'
    }
  ]
  const caulkSealant = [
    {
      name: 'SHER-MAX™',
      sub_name: 'Urethanized Elastomeric Sealant',
      img: '/images/cs-1.png',
      d_name: 'cs-1.png'
    },
    {
      name: 'POWER HOUSE Siliconized',
      sub_name: 'Acrylic Latex Sealant',
      img: '/images/cs-2.png',
      d_name: 'cs-2.png'
    },
    {
      name: 'MAGNUM XL Siliconized',
      sub_name: 'Acrylic Latex Adhesive Sealant',
      img: '/images/cs-3.png',
      d_name: 'cs-3.png'
    },
    {
      name: '1050 QD Quick Dry',
      sub_name: '',
      img: '/images/cs-4.png',
      d_name: 'cs-4.png'
    },
    {
      name: '950A Siliconized Acrylic',
      sub_name: 'Latex Caulk',
      img: '/images/cs-5.png',
      d_name: 'cs-5.png'
    },
    {
      name: '850A Acrylic Latex Caulk',
      sub_name: '',
      img: '/images/cs-6.png',
      d_name: 'cs-6.png'
    },
    {
      name: 'STORM BLASTER®',
      sub_name: 'All Season Sealant',
      img: '/images/cs-7.png',
      d_name: 'cs-7.png'
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
  const handlePrimerPaintSelect = (name: string, checked: any) => {
    if (checked) {
      if (selectedPrimer.includes(name)) {
        return
      } else {
        setSelectedPrimer([...selectedPrimer, name])
      }
    } else {
      const index = selectedPrimer.indexOf(name)
      const temp = [...selectedPrimer]
      temp.splice(index, 1)
      setSelectedPrimer(temp)
    }
  }
  const handlePrimerConcretePaintSelect = (name: string, checked: any) => {
    if (checked) {
      if (selectedPrimerConcrete.includes(name)) {
        return
      } else {
        setSelectedPrimerConcrete([...selectedPrimerConcrete, name])
      }
    } else {
      const index = selectedPrimerConcrete.indexOf(name)
      const temp = [...selectedPrimerConcrete]
      temp.splice(index, 1)
      setSelectedPrimerConcrete(temp)
    }
  }
  const handleCaulkSealantPaintSelect = (name: string, checked: any) => {
    if (checked) {
      if (selectedCaulkSealant.includes(name)) {
        return
      } else {
        setSelectedCaulkSealant([...selectedCaulkSealant, name])
      }
    } else {
      const index = selectedCaulkSealant.indexOf(name)
      const temp = [...selectedCaulkSealant]
      temp.splice(index, 1)
      setSelectedCaulkSealant(temp)
    }
  }

  const handlePaintSelectBenjamin = (name: string, checked: boolean) => {
    if (checked) {
      if (!selectedBenjamin.includes(name)) {
        setSelectedBenjamin([...selectedBenjamin, name])
      }
    } else {
      setSelectedBenjamin(selectedBenjamin.filter((paint: any) => paint !== name))
      setSelectedBenjaminOptions(prevOptions => {
        const updatedOptions = { ...prevOptions }
        delete updatedOptions[name] // Remove options if the paint is deselected

        return updatedOptions
      })
    }
  }
  const handleOptionChange = (paintName: string, option: string, checked: boolean) => {
    setSelectedBenjaminOptions(prevOptions => {
      const options = prevOptions[paintName] || []
      if (checked) {
        return { ...prevOptions, [paintName]: [...options, option] }
      } else {
        return {
          ...prevOptions,
          [paintName]: options.filter(opt => opt !== option)
        }
      }
    })
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
  const show_exterior_commercial_comment = () => {
    const exterior_commercial_comment = allData?.exterior_commercial_comment || ''
    if (view) {
      return exterior_commercial_comment.trim().length > 0
    } else {
      return true
    }
  }
  const show_interior_commercial_comment = () => {
    const interior_commercial_comment = allData?.interior_commercial_comment || ''
    if (view) {
      return interior_commercial_comment.trim().length > 0
    } else {
      return true
    }
  }
  const show_interior_exterior_commercial_comment = () => {
    const interior_exterior_commercial_comment = allData?.interior_exterior_commercial_comment || ''
    if (view) {
      return interior_exterior_commercial_comment.trim().length > 0
    } else {
      return true
    }
  }
  const showHandyman_notes = () => {
    const other_handyman_notes = allData?.handyman_notes || ''
    if (view) {
      return other_handyman_notes.trim().length > 0
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
  const showPrimerPaints = () => {
    if (view) {
      if (selectedPrimer?.length > 0) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }
  const showPrimerConcretePaints = () => {
    if (view) {
      if (selectedPrimerConcrete?.length > 0) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }
  const showCaulkSealantPaints = () => {
    if (view) {
      if (selectedCaulkSealant?.length > 0) {
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

    // console.log(workStartedDate, workStartedTime)

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
  const handleCommentChange = (section: string | number, comment: any) => {
    setFormValues((prevValues: { newForm: { [x: string]: any } }) => ({
      ...prevValues,
      newForm: {
        ...prevValues.newForm,
        [section]: {
          ...prevValues.newForm[section],
          comment: comment
        }
      }
    }))
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
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
              Select Work Start Date and Time
            </DialogTitle>
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

                    {/* <Grid container spacing={2} mt={5} mb={10}> */}
                    <div id='section6-part1'>
                      <Grid container spacing={5} mt={5} mb={10}>
                        <Grid item xs={12} sm={12}>
                          {/* First half of NewForm fields */}
                          {!(invoiceType === InvoiceTypes.HANDYMAN) === true && view && (
                            <CustomerSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
                          )}
                          <StyledTypography>HANDYMAN SERVICES</StyledTypography>
                          <NewForm
                            view={view}
                            newForm={formValues.newForm}
                            fieldsToShow='part1'
                            onCommentChange={handleCommentChange}
                          />
                        </Grid>
                      </Grid>
                    </div>

                    {/* </Grid> */}
                  </>
                )}
              </div>
            </div>
            <div id='section6-part2'>
              {(invoiceType === InvoiceTypes.HANDYMAN ||
                invoiceType === InvoiceTypes.ALL ||
                invoiceType === InvoiceTypes.INTERIOR_WITH_HANDYMAN ||
                invoiceType === InvoiceTypes.EXTERIOR_WITH_HANDYMAN) && (
                <>
                  <Grid container spacing={5} mt={5} mb={10}>
                    <Grid item xs={12} sm={12}>
                      {/* Second half of NewForm fields */}
                      {view && (
                        <CustomerSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
                      )}
                      <StyledTypography>HANDYMAN SERVICES</StyledTypography>
                      <NewForm
                        view={view}
                        newForm={formValues.newForm}
                        fieldsToShow='part2'
                        onCommentChange={handleCommentChange}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </div>
            <div id='section3'>
              {view && <CustomerSection selectedOption={selectedOption} setSelectedOption={setSelectedOption} />}
              {showSherwinPaints() && (
                <>
                  <StyledTypography onClick={toggleSherwinPaintsList} sx={{ cursor: 'pointer' }}>
                    Sherwin Williams Paints
                  </StyledTypography>
                  {showSherwinPaintsList && (
                    <>
                      <Grid container spacing={5} ml={'20px'}>
                        {sherwinPaints.map(p => {
                          if (view && !selectedSherwin.includes(p.d_name)) return null

                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={p.d_name}
                              alignContent={'center'}
                              alignItems={'center'}
                            >
                              <PaintGridComponent
                                image={p.img}
                                title={p.name}
                                subText={`${p.sub_name.substring(0, 15)}${p.sub_name.length > 40 ? '..' : ''}`}
                                checked={selectedSherwin.includes(p.d_name)}
                                onClick={(e: any) => handlePaintSelect(p.d_name, e.target.checked)}
                                view={view}
                              />
                            </Grid>
                          )
                        })}
                      </Grid>
                    </>
                  )}
                </>
              )}
              {showBenjaminPaints() && (
                <>
                  <StyledTypography onClick={toggleBenjaminPaintsList} sx={{ cursor: 'pointer' }}>
                    Benjamin Moore Paints
                  </StyledTypography>
                  {showBenjaminPaintsList && (
                    <>
                      <Grid container spacing={5} ml={'20px'}>
                        {benjaminPaints.map(p => {
                          // In view mode, only render selected paints
                          if (view && !selectedBenjamin.includes(p.d_name)) return null

                          return (
                            <Grid item xs={12} sm={6} md={4} key={p.d_name}>
                              <div>
                                <PaintGridComponent
                                  image={p.img}
                                  title={p.name}
                                  subText={p.paint_code}
                                  checked={selectedBenjamin.includes(p.d_name)}
                                  onClick={(e: any) => handlePaintSelectBenjamin(p.d_name, e.target.checked)}
                                  view={view}
                                />
                                {!view && selectedBenjamin.includes(p.d_name) && p.options && (
                                  <div>
                                    {p.options.map(option => (
                                      <FormControlLabel
                                        key={option}
                                        control={
                                          <Checkbox
                                            checked={selectedBenjaminOptions[p.d_name]?.includes(option) || false}
                                            onChange={e => handleOptionChange(p.d_name, option, e.target.checked)}
                                          />
                                        }
                                        label={option}
                                      />
                                    ))}
                                  </div>
                                )}
                                {view &&
                                  selectedBenjamin.includes(p.d_name) &&
                                  selectedBenjaminOptions[p.d_name]?.length > 0 && (
                                    <div>
                                      <Typography variant='h6'>
                                        <b> Finishing Type: {selectedBenjaminOptions[p.d_name].join(', ')} </b>
                                      </Typography>
                                    </div>
                                  )}
                              </div>
                            </Grid>
                          )
                        })}
                      </Grid>
                    </>
                  )}
                </>
              )}
            </div>
            <div id='section3by2'>
              {showPrimerPaints() && (
                <>
                  <StyledTypography onClick={togglePrimerPaintsList} sx={{ cursor: 'pointer' }}>
                    Primer For Wood
                  </StyledTypography>
                  {showPrimerPaintsList && (
                    <>
                      <Grid container spacing={5} ml={'20px'}>
                        {primerForWood.map(p => {
                          if (view && !selectedPrimer.includes(p.d_name)) return null

                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={p.d_name}
                              alignContent={'center'}
                              alignItems={'center'}
                            >
                              <PaintGridComponent
                                image={p.img}
                                title={p.name}
                                subText={`${p.sub_name.substring(0, 15)}${p.sub_name.length > 40 ? '..' : ''}`}
                                checked={selectedPrimer.includes(p.d_name)}
                                onClick={(e: any) => handlePrimerPaintSelect(p.d_name, e.target.checked)}
                                view={view}
                              />
                            </Grid>
                          )
                        })}
                      </Grid>
                    </>
                  )}
                </>
              )}
              {showPrimerConcretePaints() && (
                <>
                  <StyledTypography onClick={togglePrimerConcretePaintsList} sx={{ cursor: 'pointer' }}>
                    Primer For Concrete
                  </StyledTypography>
                  {showPrimerConcretePaintsList && (
                    <>
                      <Grid container spacing={5} ml={'20px'}>
                        {primerForConcrete.map(p => {
                          if (view && !selectedPrimerConcrete.includes(p.d_name)) return null

                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={p.d_name}
                              alignContent={'center'}
                              alignItems={'center'}
                            >
                              <PaintGridComponent
                                image={p.img}
                                title={p.name}
                                subText={`${p.sub_name.substring(0, 15)}${p.sub_name.length > 40 ? '..' : ''}`}
                                checked={selectedPrimerConcrete.includes(p.d_name)}
                                onClick={(e: any) => handlePrimerConcretePaintSelect(p.d_name, e.target.checked)}
                                view={view}
                              />
                            </Grid>
                          )
                        })}
                      </Grid>
                    </>
                  )}
                </>
              )}
              {showCaulkSealantPaints() && (
                <>
                  <StyledTypography onClick={toggleCaulkSealantPaintsList} sx={{ cursor: 'pointer' }}>
                    Caulking And Sealant
                  </StyledTypography>
                  {showCaulkSealantPaintsList && (
                    <>
                      <Grid container spacing={5} ml={'20px'}>
                        {caulkSealant.map(p => {
                          if (view && !selectedCaulkSealant.includes(p.d_name)) return null

                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={p.d_name}
                              alignContent={'center'}
                              alignItems={'center'}
                              sx={{ height: '5%' }} // Adjust width and height here
                            >
                              <PaintGridComponent
                                image={p.img}
                                title={p.name}
                                subText={`${p.sub_name.substring(0, 15)}${p.sub_name.length > 40 ? '..' : ''}`}
                                checked={selectedCaulkSealant.includes(p.d_name)}
                                onClick={(e: any) => handleCaulkSealantPaintSelect(p.d_name, e.target.checked)}
                                view={view}
                              />
                            </Grid>
                          )
                        })}
                      </Grid>
                    </>
                  )}
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
            </div>
            <div id='section3by4'>
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
              <>
                {showHandyman_notes() && (
                  <>
                    <StyledTypography>Handyman Comments</StyledTypography>
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='handyman_notes'
                          control={control}
                          render={({ field }) => (
                            <TextField rows={2} multiline label='Type Handyman Notes Here...' fullWidth {...field} />
                          )}
                        />
                      </FormControl>
                    )}
                  </>
                )}{' '}
                {view && allData?.handyman_notes && (
                  <Grid item xs={12} sm={4} mb={10} ml={20} mt={10}>
                    <Box minHeight={50}>
                      <Typography variant='h6'>{allData?.handyman_notes}</Typography>
                    </Box>
                  </Grid>
                )}
              </>
              <>
                {show_exterior_commercial_comment() && (
                  <>
                    <StyledTypography>Exterior Commercial Painting</StyledTypography>
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='exterior_commercial_comment'
                          control={control}
                          render={({ field }) => (
                            <TextField
                              rows={2}
                              multiline
                              label='Type Exterior Commercial Notes Here...'
                              fullWidth
                              {...field}
                            />
                          )}
                        />
                      </FormControl>
                    )}
                  </>
                )}{' '}
                {view && allData?.exterior_commercial_comment && (
                  <Grid item xs={12} sm={4} mb={10} ml={20} mt={10}>
                    <Box minHeight={50}>
                      <Typography variant='h6'>{allData?.exterior_commercial_comment}</Typography>
                    </Box>
                  </Grid>
                )}
              </>{' '}
              <>
                {show_interior_exterior_commercial_comment() && (
                  <>
                    <StyledTypography>Interior And Exterior Commercial Painting</StyledTypography>
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='interior_exterior_commercial_comment'
                          control={control}
                          render={({ field }) => (
                            <TextField
                              rows={2}
                              multiline
                              label='Type Exterior Commercial Notes Here...'
                              fullWidth
                              {...field}
                            />
                          )}
                        />
                      </FormControl>
                    )}
                  </>
                )}{' '}
                {view && allData?.interior_exterior_commercial_comment && (
                  <Grid item xs={12} sm={4} mb={10} ml={20} mt={10}>
                    <Box minHeight={50}>
                      <Typography variant='h6'>{allData?.interior_exterior_commercial_comment}</Typography>
                    </Box>
                  </Grid>
                )}
              </>{' '}
              <>
                {show_interior_commercial_comment() && (
                  <>
                    <StyledTypography>Interior Commercial Painting</StyledTypography>
                    {!view && (
                      <FormControl fullWidth>
                        <Controller
                          name='interior_commercial_comment'
                          control={control}
                          render={({ field }) => (
                            <TextField
                              rows={2}
                              multiline
                              label='Type Interior Commercial Notes Here...'
                              fullWidth
                              {...field}
                            />
                          )}
                        />
                      </FormControl>
                    )}
                  </>
                )}{' '}
                {view && allData?.interior_commercial_comment && (
                  <Grid item xs={12} sm={4} mb={10} ml={20} mt={10}>
                    <Box minHeight={50}>
                      <Typography variant='h6'>{allData?.interior_commercial_comment}</Typography>
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
              {(view !== 'true' ||
                (view === 'true' &&
                  (allData?.handyMan_total_cost ||
                    allData?.handyMan_down_payment ||
                    allData?.handyMan_balance_due))) && (
                <>
                  <StyledTypography>HANDYMAN PAYMENT DETAILS</StyledTypography>
                  <Grid container spacing={5} mt={5} mb={10}>
                    <FormItem
                      name='handyMan_total_cost'
                      label='Total Cost'
                      control={control}
                      allData={allData}
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
                </>
              )}
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
            </div>
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
