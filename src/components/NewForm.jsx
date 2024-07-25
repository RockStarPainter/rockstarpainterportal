import { Box, FormControl, Grid, InputLabel, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import CustomTextField from './CustomTextField'
import CustomSelectField from './CustomSelectField'
import { textAlign } from '@mui/system'

function NewForm() {
  const methods = useFormContext()
  const { watch } = methods

  return (
    <>
      <Box mb={10}>
        <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
          Dry Wall
        </Typography>
        <Grid container spacing={5}>
          <Grid item xs={2}>
            <CustomTextField label='Sheets Quantity' name='newForm.dryWall.sheets' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Corners'} name='newForm.dryWall.corners' />
          </Grid>
          <Grid item xs={3}>
            <CustomSelectField label={'Tapping & Sanding'} name='newForm.dryWall.tapping' />
          </Grid>
          <Grid item xs={3}>
            <CustomSelectField label={'Sheet rock joint compound'} name='newForm.dryWall.sheetRock' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Repairs'} name='newForm.dryWall.repairs' />
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
          Texture or Repair Backing & Drywall included
        </Typography>
        <Grid container spacing={5}>
          <Grid item xs={2}>
            <CustomSelectField label={'Orange Peel'} name='newForm.textureRepair.orangePeel' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Knockdown'} name='newForm.textureRepair.knockDown' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Level 4&5'} name='newForm.textureRepair.level' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Slap Brush'} name='newForm.textureRepair.slapBrush' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Pull Trowel Texture'} name='newForm.textureRepair.pullTrowel' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Custom Texture'} name='newForm.textureRepair.customTexture' />
          </Grid>
          <Grid item xs={3}>
            <CustomSelectField label={'Popcorn Removal Repairs'} name='newForm.textureRepair.popCornRemoval' />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default NewForm
