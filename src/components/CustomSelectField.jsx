import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

function CustomSelectField({ name, label, ...others }) {
  const methods = useFormContext()
  const { control } = methods
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref } }) => (
        <FormControl fullWidth>
          <InputLabel id='demo-simple-select-label'>{label}</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={value}
            onChange={onChange}
            inputRef={ref}
            label={label}
            {...others}
          >
            <MenuItem key={'Yes'} value={'Yes'}>
              {'Yes'}
            </MenuItem>
            <MenuItem key={'No'} value={'No'}>
              {'No'}
            </MenuItem>
          </Select>
        </FormControl>
      )}
    />
  )
}

export default CustomSelectField
