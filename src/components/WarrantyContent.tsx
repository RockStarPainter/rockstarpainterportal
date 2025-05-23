import React from 'react'
import { Typography, Box, TextField } from '@mui/material'

interface WarrantyContentProps {
  type: 'Interior' | 'Exterior' | 'Both' | 'None'
  setInteriorWarranty: (months: string) => void
  setExteriorWarranty: (months: string) => void
  interiorWarranty: string
  exteriorWarranty: string
  view: any
  customerName: string
  warrantyDate: string
  setWarrantyDate: (newDate: string) => void
  interiorWarrantyNote: string
  setInteriorWarrantyNote: (note: string) => void
  exteriorWarrantyNote: string
  setExteriorWarrantyNote: (note: string) => void
}

const Something = ({ value, title }: any) => {
  return (
    <Box width={'20%'} flexWrap={'wrap'} display={'flex'} flexDirection={'column'} alignItems={'center'}>
      <Typography
        style={{
          height: '30px',
          marginTop: '30px',
          fontSize: '20px'
        }}
      >
        {value}
      </Typography>
      <Typography
        style={{
          borderTop: '2px solid',
          width: '100%',
          textAlign: 'center',
          fontSize: '20px'
        }}
      >
        {title}
      </Typography>
    </Box>
  )
}

const SetDate = ({ value, setValue, title }: any) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }

  return (
    <Box width={'12%'} display={'flex'} flexDirection={'column'} alignItems={'center'}>
      <TextField
        value={value}
        onChange={handleChange}
        type='date'
        style={{
          height: '60px',
          fontSize: '20px'
        }}
      />
      <Typography
        style={{
          borderTop: '2px solid',
          width: '100%',
          textAlign: 'center',
          fontSize: '20px'
        }}
      >
        {title}
      </Typography>
    </Box>
  )
}

const WarrantyContent: React.FC<WarrantyContentProps> = ({
  type,
  setInteriorWarranty,
  setExteriorWarranty,
  interiorWarranty,
  exteriorWarranty,
  view,
  customerName,
  warrantyDate,
  setWarrantyDate,
  interiorWarrantyNote,
  setInteriorWarrantyNote,
  exteriorWarrantyNote,
  setExteriorWarrantyNote
}) => {
  const handleInteriorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInteriorWarranty(event.target.value)
  }

  const handleExteriorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExteriorWarranty(event.target.value)
  }

  const handleInteriorNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInteriorWarrantyNote(event.target.value)
  }

  const handleExteriorNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExteriorWarrantyNote(event.target.value)
  }

  const renderWarranty = (
    title: string,
    warranty: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    content: string,
    note: string,
    onNoteChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <Box width={'90%'} marginBottom={'2%'}>
      <Typography variant='h4'>{title} Warranty</Typography>
      <Typography fontSize={'20px'}>
        A warranty of
        {view ? (
          <b> {warranty}</b>
        ) : (
          <TextField
            value={warranty}
            onChange={onChange}
            type='number'
            inputProps={{ min: 0 }}
            style={{ width: '100px', margin: '0 5px' }}
          />
        )}{' '}
        months applies to the scope of work described in this contract.
        {content}
      </Typography>
      {/* Heading for the warranty notes */}
      <Typography variant='h6' style={{ marginTop: '20px' }}>
        {title} Warranty Notes
      </Typography>
      <TextField
        multiline
        rows={3}
        fullWidth
        value={note}
        onChange={onNoteChange}
        placeholder={`Enter additional notes for the ${title.toLowerCase()} warranty...`}
        style={{ marginTop: '10px' }}
        variant='outlined'
      />
    </Box>
  )

  const interiorContent = ` Rockstar Painting will repair blistering,
        chipping, or peeling paint when it is a direct result of poor workmanship. Rockstar Painting's interior warranty does not apply to metal surfaces unless specified otherwise in the contract
        details. The warranty does not apply to cracks in drywall, mud, tape, or texture. The warranty does not apply to
        damages caused by harmful chemicals or cleaners or wear and tear. The standard warranty repairs only include
        prepping, priming (where necessary) and painting individual spots or sections where there is blister, chipping,
        or peeling paint. Therefore, Rockstar Painting does not guarantee that individual (touch-up) repairs will blend
        in with the original color due to fading, abrasion, and wear and tear.`

  const exteriorContent =
    " Rockstar Painting will repair blistering, chipping, or peeling paint when it is a direct result of poor workmanship. Rockstar Painting's exterior warranty only applies to vertical surfaces; it does not apply on any horizontal surfaces unless specified otherwise in the contract details. The standard warranty repairs only include prepping, priming (where necessary) and painting individual spots or sections where there is a blister, chipping, or peeling paint. Therefore, Rockstar Painting does not guarantee that individual (touch-up) repairs will blend in with the original color due to fading, abrasion, and wear and tear. Damages caused by weather, such as snow and hail, are not covered by this warranty."

  return (
    <Box paddingLeft={'5%'}>
      {type === 'Interior' &&
        renderWarranty(
          'Interior',
          interiorWarranty,
          handleInteriorChange,
          interiorContent,
          interiorWarrantyNote,
          handleInteriorNoteChange
        )}
      {type === 'Exterior' &&
        renderWarranty(
          'Exterior',
          exteriorWarranty,
          handleExteriorChange,
          exteriorContent,
          exteriorWarrantyNote,
          handleExteriorNoteChange
        )}
      {type === 'Both' && (
        <>
          {renderWarranty(
            'Interior',
            interiorWarranty,
            handleInteriorChange,
            interiorContent,
            interiorWarrantyNote,
            handleInteriorNoteChange
          )}
          {renderWarranty(
            'Exterior',
            exteriorWarranty,
            handleExteriorChange,
            exteriorContent,
            exteriorWarrantyNote,
            handleExteriorNoteChange
          )}
        </>
      )}
      {type !== 'None' && (
        <Box display={'flex'} justifyContent={'space-around'} flexDirection={'row'} alignItems={'center'}>
          <Something value={customerName} title='Customer' />
          <Something value='Angel Verde' title='Contractor' />
          {view ? (
            <Something value={warrantyDate} title='Date' />
          ) : (
            <SetDate value={warrantyDate} setValue={setWarrantyDate} title='Date' />
          )}
        </Box>
      )}
    </Box>
  )
}

export default WarrantyContent
