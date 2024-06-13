import React from 'react'
import { Box, FormGroup, FormControlLabel, Checkbox } from '@mui/material'
import { green } from '@mui/material/colors'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useRouter } from 'next/router'

const CustomerSection = ({ selectedOption, setSelectedOption }) => {
  const router = useRouter()
  const { view } = router.query

  // Convert view to boolean if it's not already
  const isView = view === 'true'

  const handleCheckboxChange = event => {
    setSelectedOption(event.target.name)
  }

  const renderCheckbox = (name, label) => {
    const isChecked = selectedOption === name
    if (isView && !isChecked) {
      return null
    }

    return (
      <FormControlLabel
        key={name}
        control={
          <Box display='flex' alignItems='center'>
            {isView && isChecked ? (
              <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
            ) : (
              <Checkbox checked={isChecked} onChange={handleCheckboxChange} name={name} />
            )}
          </Box>
        }
        label={<span style={{ fontWeight: 'bold' }}>{label}</span>}
      />
    )
  }

  return (
    <Box display={'flex'} alignItems={'center'} flexDirection={'column'} justifyContent={'center'} marginTop={'0.5%%'}>
      <Box width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Box width={250}>
          <img src='/images/rockstar-logo.png' style={{ width: '100%' }} />
        </Box>
        <Box width={250}>
          <img src='/images/rockstarDetails.png' style={{ width: '100%' }} />
        </Box>
      </Box>

      <Box width={'100%'} justifyContent={'center'} display={'flex'}>
        <FormGroup row={true}>
          {renderCheckbox('INVOICE', 'INVOICE')}
          {renderCheckbox('ESTIMATE', 'ESTIMATE')}
          {renderCheckbox('CONTRACT', 'CONTRACT')}
        </FormGroup>
      </Box>
    </Box>
  )
}

export default CustomerSection
