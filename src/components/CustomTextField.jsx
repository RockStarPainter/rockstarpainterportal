import { Box, TextField, Typography } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

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
              <Typography
                style={{
                  border: '1px solid',
                  width: '280px'
                }}
                textAlign={'center'}
              >
                {label}
              </Typography>
              <Box
                style={{
                  border: '1px solid',
                  width: '280px',
                  padding: '7px'
                }}
                sx={{ textAlign: 'center', display: 'inline-block', pl: 1 }}
              >
                {getValues(name)}
              </Box>
            </>
          )}
        </>
      )}
    </>
  )
}

export default CustomTextField
