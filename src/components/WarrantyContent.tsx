import React from 'react'
import { Typography, Box } from '@mui/material'

interface WarrantyContentProps {
  type: 'Interior' | 'Exterior' | 'Both'
}

const WarrantyContent: React.FC<WarrantyContentProps> = ({ type }) => {
  const interiorWarranty = (
    <Box>
      <Typography variant='h6'>Interior Warranty</Typography>
      <Typography>
        A warranty of ( ) months applies to the scope of work described in this contract. Rockstar Painting will repair
        blistering, chipping, or peeling paint when it is a direct result of poor workmanship. Rockstar Painting's
        interior warranty does not apply to metal surfaces unless specified otherwise in the contract details. The
        warranty does not apply to cracks in drywall, mud, tape, or texture. The warranty does not apply to damages
        caused by harmful chemicals or cleaners or wear and tear. The standard warranty repairs only include prepping,
        priming (where necessary) and painting individual spots or sections where there is blister, chipping, or peeling
        paint. Therefore, Rockstar Painting does not guarantee that individual (touch-up) repairs will blend in with the
        original color due to fading, abrasion, and wear and tear.
      </Typography>
    </Box>
  )

  const exteriorWarranty = (
    <Box>
      <Typography variant='h6'>Exterior Warranty</Typography>
      <Typography>
        A warranty of ( ) months applies to the scope of work described in this contract. Rockstar Painting will repair
        blistering, chipping, or peeling paint when it is a direct result of poor workmanship. Rockstar Painting's
        exterior warranty only applies to vertical surfaces; it does not apply to any horizontal surfaces unless
        specified otherwise in the contract details. The standard warranty repairs only include prepping, priming (where
        necessary) and painting individual spots or sections where there is blister, chipping, or peeling paint.
        Therefore, Rockstar Painting does not guarantee that individual (touch-up) repairs will blend in with the
        original color due to fading, abrasion, and wear and tear. Damages caused by weather, such as snow and hail, are
        not covered by this warranty.
      </Typography>
    </Box>
  )

  return (
    <Box>
      {type === 'Interior' && interiorWarranty}
      {type === 'Exterior' && exteriorWarranty}
      {type === 'Both' && (
        <>
          {interiorWarranty}
          {exteriorWarranty}
        </>
      )}
    </Box>
  )
}

export default WarrantyContent
