import { FormControl, InputLabel, MenuItem, Select, Typography, Box } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { green } from '@mui/material/colors'

function CustomSelectField({ name, label, view, ...others }) {
  const methods = useFormContext()
  const { control, getValues } = methods

  return (
    <>
      {!view ? (
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
      ) : (
        <>
          {Boolean(getValues(name)) && getValues(name) !== 'No' && (
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
                  paddingTop: '5px'
                }}
                sx={{ textAlign: 'center' }}
              >
                <CheckCircleIcon sx={{ color: green[500], fontSize: '1.7rem' }} />
              </Box>
            </>
          )}
        </>
      )}
    </>
  )
}

export default CustomSelectField
