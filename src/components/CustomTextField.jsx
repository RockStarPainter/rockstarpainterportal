import { TextField } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

function CustomTextField({ name, label, ...others }) {
  const methods = useFormContext()
  const { control } = methods
  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextField value={value} label={label} onChange={onChange} fullWidth {...others} />
        )}
      />
    </>
  )
}

export default CustomTextField
