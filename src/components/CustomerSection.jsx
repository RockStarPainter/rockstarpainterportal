import React, { useState, useEffect } from 'react'
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
              <CheckCircleIcon sx={{ color: green[500] }} />
            ) : (
              <Checkbox checked={isChecked} onChange={handleCheckboxChange} name={name} />
            )}
          </Box>
        }
        label={label}
      />
    )
  }

  return (
    <Box
      display={'flex'}
      alignItems={'center'}
      flexDirection={window.innerWidth > 1024 ? 'row' : 'column'}
      justifyContent={'space-between'}
      marginTop={'2%'}
    >
      <Box
        width={window.innerWidth > 1024 ? window.innerWidth / 2 - 40 + 100 : '100%'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Box width={250}>
          <img src='/images/rockstar-logo.png' style={{ width: '100%' }} />
        </Box>
        <Box width={250}>
          <img src='/images/rockstarDetails.png' style={{ width: '100%' }} />
        </Box>
      </Box>

      <Box width={window.innerWidth > 1024 ? 200 : '100%'}>
        <FormGroup row={window.innerWidth > 1024 ? false : true}>
          {renderCheckbox('INVOICE', 'INVOICE')}
          {renderCheckbox('ESTIMATE', 'ESTIMATE')}
          {renderCheckbox('CONTRACT', 'CONTRACT')}
        </FormGroup>
      </Box>
    </Box>
  )
}

export default CustomerSection
