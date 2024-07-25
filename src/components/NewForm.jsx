import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import CustomTextField from './CustomTextField'
import CustomSelectField from './CustomSelectField'

// import { textAlign } from '@mui/system'

function NewForm() {
  const methods = useFormContext()
  const { watch } = methods

  return (
    <>
      <Box mb={10} mt={10}>
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
      <Box mb={10}>
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
      </Box>{' '}
      <Box mb={10}>
        <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
          Vinyl Flooring
        </Typography>
        <Grid container spacing={5}>
          <Grid item xs={2}>
            <CustomSelectField label={'Removal'} name='newForm.vinylFlooring.removal' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Debris Removal'} name='newForm.vinylFlooring.debrisRemoval' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Stairs'} name='newForm.vinylFlooring.stairs' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Prepping'} name='newForm.vinylFlooring.prepping' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Baseboard Installation'} name='newForm.vinylFlooring.baseboardInstallation' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Repairs'} name='newForm.vinylFlooring.repairs' />
          </Grid>
        </Grid>
      </Box>{' '}
      <Box mb={10}>
        <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
          Tile
        </Typography>
        <Grid container spacing={5}>
          <Grid item xs={2}>
            <CustomSelectField label={'Removal'} name='newForm.tile.removal' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField
              label={'Reguard Water Proofing Application'}
              name='newForm.tile.reguardWaterProofingApplication'
            />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Debris Removal'} name='newForm.tile.debrisRemoval' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Prepping'} name='newForm.tile.prepping' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Grout Installation'} name='newForm.tile.groutInstallation' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Ditra Installation'} name='newForm.tile.ditraInstallation' />
          </Grid>{' '}
          <Grid item xs={2}>
            <CustomSelectField label={'Shower Pan'} name='newForm.tile.showerPan' />
          </Grid>
        </Grid>
      </Box>{' '}
      <Box mb={10}>
        <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
          Carpet Installation
        </Typography>
        <Grid container spacing={5}>
          <Grid item xs={2}>
            <CustomTextField label='Sqaure Y/D' name='newForm.carpetInstallation.squareYard' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Removal'} name='newForm.carpetInstallation.removal' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Debris Removal'} name='newForm.carpetInstallation.debrisRemoval' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Stair Way'} name='newForm.carpetInstallation.stairWay' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Carpet Stretching'} name='newForm.carpetInstallation.carpetStretching' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Repairs'} name='newForm.carpetInstallation.repairs' />
          </Grid>
        </Grid>
      </Box>{' '}
      <Box mb={10}>
        <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
          Carpentry
        </Typography>
        <Grid container spacing={5}>
          <Grid item xs={2}>
            <CustomSelectField label={'Framing'} name='newForm.carpentry.framing' />
            {/* this has a dropdown of wood and metal and user can select one or both */}
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Crown Molding'} name='newForm.carpentry.crownMolding' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Debris Removal'} name='newForm.carpentry.debrisRemoval' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Door Casing Installation'} name='newForm.carpentry.doorCasingInstallation' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Door Installation'} name='newForm.carpentry.doorInstallation' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Baseboard Installation'} name='newForm.carpentry.baseboardInstallation' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Quarter Round Molding'} name='newForm.carpentry.quarterRoundMolding' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Window Seal'} name='newForm.carpentry.windowSill' />
          </Grid>
        </Grid>
      </Box>{' '}
      <Box mb={10}>
        <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
          Plumbing
        </Typography>
        <Grid container spacing={5}>
          <Grid item xs={2}>
            <CustomSelectField
              label={'Garbage Desposal Removal Installation'}
              name='newForm.plumbing.GarbageDesposalRemovalInstallation'
            />
            {/* this has a dropdown of wood and metal and user can select one or both */}
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField
              label={'Faucet Removal Installation'}
              name='newForm.plumbing.faucetRemovalInstallation'
            />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Debris Removal'} name='newForm.plumbing.debrisRemoval' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField
              label={'Toilet Removal Installation'}
              name='newForm.plumbing.toiletRemovalInstallation'
            />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Replace Valves'} name='newForm.plumbing.replaceValves' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Sink Removal Installation'} name='newForm.plumbing.sinkRemovalInstallation' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Shower Door Installation'} name='newForm.plumbing.showerDoorInstallation' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Kit Repair'} name='newForm.plumbing.kitRepair' />
          </Grid>
        </Grid>
      </Box>{' '}
      <Box mb={10}>
        <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
          Fixtures
        </Typography>
        <Grid container spacing={5}>
          <Grid item xs={2}>
            <CustomSelectField label={'Mirror Installation'} name='newForm.fixtures.mirrorInstallation' />
            {/* this has a dropdown of wood and metal and user can select one or both */}
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Vanity Installation'} name='newForm.fixtures.vanityInstallation' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Light Replacement'} name='newForm.fixtures.lightReplacement' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Towel Bar'} name='newForm.fixtures.towelBar' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Hardware'} name='newForm.fixtures.hardware' />
          </Grid>
          <Grid item xs={2}>
            <CustomSelectField label={'Blind Installation'} name='newForm.fixtures.blindInstallation' />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default NewForm
