import { Box, TextField, Typography } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import { green } from '@mui/material/colors'

function CustomTextField({ name, label, view, ...others }) {
  const methods = useFormContext()
  const { control, getValues } = methods

  return (
    <>
      {!view ? (
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange } }) => (
            <TextField value={value} label={label} onChange={onChange} fullWidth {...others} />
          )}
        />
      ) : (
        <>
          {Boolean(getValues(name)) && (
            <>
              <Typography textAlign={'center'}>{label}</Typography>
              <Box sx={{ textAlign: 'center' }}>{getValues(name)}</Box>
            </>
          )}
        </>
      )}
    </>
  )
}

export default CustomTextField
