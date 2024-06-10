import React from 'react'
import { Box, Typography } from '@mui/material'
import { moderateScale } from './Size'

const CustomText = ({ children }) => {
  return (
    <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} margin={10}>
      {children.split(' ').map(k => {
        return (
          <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
            <Typography
              borderColor={'#1C1C1C'}
              style={{
                color: '#74BC22',
                fontWeight: 'bold',
                fontSize: moderateScale(26),
                textAlign: 'center'
              }}
            >
              {k.charAt(0)}
            </Typography>
            <Typography
              borderColor={'#1C1C1C'}
              style={{
                color: '#1C1C1C',
                fontWeight: 'bold',
                fontSize: moderateScale(26),
                textAlign: 'center',
                paddingRight: 10
              }}
            >
              {k.substring(1)}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

{
  /* <Typography
variant='h4'
sx={{
  mb: 5,
  textAlign: 'center',
  mt: 10,
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  color: 'white',
  fontWeight: 'bold',
  backgroundImage: 'linear-gradient(to right, #161615, #cbbeb5)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}}
></Typography> */
}

export default CustomText
