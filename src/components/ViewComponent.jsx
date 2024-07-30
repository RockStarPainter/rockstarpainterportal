import React from 'react'
import CustomTextField from './CustomTextField'
import CustomSelectField from './CustomSelectField'
import { Box, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { green } from '@mui/material/colors'

function ViewComponent({ name, label, textField = false, view, ...others }) {
  return (
    <>
      {view ? (
        <>
          <Typography textAlign={'center'}>{label}</Typography>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
          </Box>
        </>
      ) : textField ? (
        <CustomTextField name={name} label={label} {...others} />
      ) : (
        <CustomSelectField name={name} label={label} {...others} />
      )}
    </>
  )
}

export default ViewComponent
