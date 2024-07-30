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
              <Typography textAlign={'center'} sx={{ display: 'inline-block', borderRight: '2px solid', pr: 1 }}>
                {label}
              </Typography>
              <Box sx={{ textAlign: 'center', display: 'inline-block', pl: 1 }}>{getValues(name)}</Box>
            </>
          )}
        </>
      )}
    </>
  )
}

export default CustomTextField
