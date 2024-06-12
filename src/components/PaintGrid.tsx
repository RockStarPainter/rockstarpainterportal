import React from 'react'
import { Grid, Box, Typography, Checkbox } from '@mui/material'
import { moderateScale } from './Size'

const PaintGridComponent = ({ image, title, subText, view, checked, onClick, key }: any) => {
  return (
    <Grid item xs={12} sm={4} key={key} mb={10}>
      <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
        <Box width={window.innerWidth > 1024 ? 150 : window.innerWidth / 3}>
          <img style={{ width: '100%', marginTop: '8px', height: '100%' }} src={image} />
        </Box>
        <Typography
          style={{
            fontSize: moderateScale(16),
            fontWeight: 'bold',
            color: '#74BC22',
            width: '100%',
            textAlign: 'center'
          }}
        >
          {title.substring(0, 15)}
          {title.length > 15 && '..'}
        </Typography>
        <Typography
          style={{
            fontSize: moderateScale(12),
            fontWeight: 'normal',
            color: '#1C1C1C',
            textAlign: 'center',
            width: '70%'
          }}
        >
          {subText}
        </Typography>

        {!view && <Checkbox checked={checked} onClick={onClick} />}
      </Box>
    </Grid>
  )
}

export default PaintGridComponent
