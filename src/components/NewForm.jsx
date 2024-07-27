import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import CustomTextField from './CustomTextField'
import CustomSelectField from './CustomSelectField'

function NewForm(props) {
  const methods = useFormContext()
  const { view, newForm } = props

  const show = bool => {
    if (view) {
      if (bool) return true
      else return false
    }
    return true
  }
  return (
    <>
      {show(newForm.dryWall) && (
        <Box mb={10} mt={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Dry Wall
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomTextField label='Sheets Quantity' name='newForm.dryWall.sheets' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Corners'} name='newForm.dryWall.corners' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 3}>
              <CustomSelectField label={'Tapping & Sanding'} name='newForm.dryWall.tapping' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 3}>
              <CustomSelectField label={'Sheet rock joint compound'} name='newForm.dryWall.sheetRock' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Repairs'} name='newForm.dryWall.repairs' view={view} />
            </Grid>
          </Grid>
        </Box>
      )}

      {show(newForm.textureRepair) && (
        <Box mb={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Texture or Repair Backing & Drywall included
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Orange Peel'} name='newForm.textureRepair.orangePeel' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Knockdown'} name='newForm.textureRepair.knockDown' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Level 4&5'} name='newForm.textureRepair.level' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Slap Brush'} name='newForm.textureRepair.slapBrush' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Pull Trowel Texture'} name='newForm.textureRepair.pullTrowel' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Custom Texture'} name='newForm.textureRepair.customTexture' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 3}>
              <CustomSelectField
                label={'Popcorn Removal Repairs'}
                name='newForm.textureRepair.popCornRemoval'
                view={view}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {show(newForm.vinylFlooring) && (
        <Box mb={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Vinyl Flooring
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Removal'} name='newForm.vinylFlooring.removal' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Debris Removal'} name='newForm.vinylFlooring.debrisRemoval' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Stairs'} name='newForm.vinylFlooring.stairs' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Prepping'} name='newForm.vinylFlooring.prepping' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Baseboard Installation'}
                name='newForm.vinylFlooring.baseboardInstallation'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Repairs'} name='newForm.vinylFlooring.repairs' view={view} />
            </Grid>
          </Grid>
        </Box>
      )}

      {show(newForm.tile) && (
        <Box mb={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Tile
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Removal'} name='newForm.tile.removal' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Reguard Water Proofing Application'}
                name='newForm.tile.reguardWaterProofingApplication'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Debris Removal'} name='newForm.tile.debrisRemoval' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Prepping'} name='newForm.tile.prepping' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Grout Installation'} name='newForm.tile.groutInstallation' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Ditra Installation'} name='newForm.tile.ditraInstallation' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Shower Pan'} name='newForm.tile.showerPan' view={view} />
            </Grid>
          </Grid>
        </Box>
      )}

      {show(newForm.carpetInstallation) && (
        <Box mb={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Carpet Installation
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomTextField label='Square Y/D' name='newForm.carpetInstallation.squareYard' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Removal'} name='newForm.carpetInstallation.removal' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Debris Removal'} name='newForm.carpetInstallation.debrisRemoval' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Stair Way'} name='newForm.carpetInstallation.stairWay' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Carpet Stretching'}
                name='newForm.carpetInstallation.carpetStretching'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Repairs'} name='newForm.carpetInstallation.repairs' view={view} />
            </Grid>
          </Grid>
        </Box>
      )}

      {show(newForm.carpentry) && (
        <Box mb={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Carpentry
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Framing'} name='newForm.carpentry.framing' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Crown Molding'} name='newForm.carpentry.crownMolding' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Debris Removal'} name='newForm.carpentry.debrisRemoval' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Door Casing Installation'}
                name='newForm.carpentry.doorCasingInstallation'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Door Installation'} name='newForm.carpentry.doorInstallation' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Baseboard Installation'}
                name='newForm.carpentry.baseboardInstallation'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Quarter Round Molding'}
                name='newForm.carpentry.quarterRoundMolding'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Window Seal'} name='newForm.carpentry.windowSill' view={view} />
            </Grid>
          </Grid>
        </Box>
      )}

      {show(newForm.plumbing) && (
        <Box mb={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Plumbing
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Garbage Disposal Removal Installation'}
                name='newForm.plumbing.GarbageDisposalRemovalInstallation'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Faucet Removal Installation'}
                name='newForm.plumbing.faucetRemovalInstallation'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Debris Removal'} name='newForm.plumbing.debrisRemoval' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Toilet Removal Installation'}
                name='newForm.plumbing.toiletRemovalInstallation'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Replace Valves'} name='newForm.plumbing.replaceValves' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Sink Removal Installation'}
                name='newForm.plumbing.sinkRemovalInstallation'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField
                label={'Shower Door Installation'}
                name='newForm.plumbing.showerDoorInstallation'
                view={view}
              />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Kit Repair'} name='newForm.plumbing.kitRepair' view={view} />
            </Grid>
          </Grid>
        </Box>
      )}

      {show(newForm.fixtures) && (
        <Box mb={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Fixtures
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Mirror Installation'} name='newForm.fixtures.mirrorInstallation' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Vanity Installation'} name='newForm.fixtures.vanityInstallation' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Light Replacement'} name='newForm.fixtures.lightReplacement' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Towel Bar'} name='newForm.fixtures.towelBar' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Hardware'} name='newForm.fixtures.hardware' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Blind Installation'} name='newForm.fixtures.blindInstallation' view={view} />
            </Grid>
          </Grid>
        </Box>
      )}

      {show(newForm.cleaning) && (
        <Box mb={10}>
          <Typography sx={{ textAlign: 'center' }} variant='h5' mb={5}>
            Cleaning
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Deep Cleaning'} name='newForm.cleaning.deepCleaning' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Basic Cleaning'} name='newForm.cleaning.basicCleaning' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomTextField label={'Inside Windows'} name='newForm.cleaning.insideWindows' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Stove'} name='newForm.cleaning.stove' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Microwave'} name='newForm.cleaning.microwave' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Baseboard'} name='newForm.cleaning.baseBoard' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Refrigerator'} name='newForm.cleaning.refrigerator' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Cabinets In or Out'} name='newForm.cleaning.cabinets' view={view} />
            </Grid>

            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Walls'} name='newForm.cleaning.walls' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Pantry'} name='newForm.cleaning.pantry' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Stove Hood'} name='newForm.cleaning.stoveHood' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomTextField label='Bathrooms' name='newForm.cleaning.bathrooms' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Mopping or Sweeping Floors'} name='newForm.cleaning.mopping' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomTextField label='Bedrooms' name='newForm.cleaning.bedrooms' view={view} />
            </Grid>

            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Carpet Vacuum'} name='newForm.cleaning.carpetVacuum' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Power wash'} name='newForm.cleaning.powerWash' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Basement'} name='newForm.cleaning.basement' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Garage'} name='newForm.cleaning.garage' view={view} />
            </Grid>
            <Grid item xs={view ? 'auto' : 2}>
              <CustomSelectField label={'Patio'} name='newForm.cleaning.patio' view={view} />
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  )
}

export default NewForm
