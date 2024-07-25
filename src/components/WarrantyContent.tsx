// import React from 'react'
// import { Typography, Box, TextField } from '@mui/material'

// interface WarrantyContentProps {
//   type: 'Interior' | 'Exterior' | 'Both'
//   setInteriorWarranty: (months: string) => void
//   setExteriorWarranty: (months: string) => void
//   interiorWarranty: string
//   exteriorWarranty: string
// }

// const WarrantyContent: React.FC<WarrantyContentProps> = ({
//   type,
//   setInteriorWarranty,
//   setExteriorWarranty,
//   interiorWarranty,
//   exteriorWarranty
// }) => {
//   const interior = (
//     <Box width={'90%'}>
//       <Typography variant='h6'>Interior Warranty</Typography>
//       <Typography>
//         A warranty of (
//         <TextField
//           value={interiorWarranty}
//           onChange={setInteriorWarranty}
//           type='number'
//           inputProps={{ min: 0 }}
//           style={{ width: '50px' }}
//         />
//         ) months applies to the scope of work described in this contract. Rockstar Painting will repair blistering,
//         chipping, or peeling paint when it is a direct result of poor workmanship. Rockstar Painting's interior warranty
//         does not apply to metal surfaces unless specified otherwise in the contract details. The warranty does not apply
//         to cracks in drywall, mud, tape, or texture. The warranty does not apply to damages caused by harmful chemicals
//         or cleaners or wear and tear. The standard warranty repairs only include prepping, priming (where necessary) and
//         painting individual spots or sections where there is blister, chipping, or peeling paint. Therefore, Rockstar
//         Painting does not guarantee that individual (touch-up) repairs will blend in with the original color due to
//         fading, abrasion, and wear and tear.
//       </Typography>
//     </Box>
//   )

//   const exterior = (
//     <Box width={'90%'}>
//       <Typography variant='h6'>Exterior Warranty</Typography>
//       <Typography>
//         A warranty of
//         <TextField
//           value={exteriorWarranty}
//           onChange={setExteriorWarranty}

//           inputProps={{ min: 0 }}
//           style={{ width: '100px' }}
//         />
//         months applies to the scope of work described in this contract. Rockstar Painting will repair blistering,
//         chipping, or peeling paint when it is a direct result of poor workmanship. Rockstar Painting's exterior warranty
//         only applies to vertical surfaces; it does not apply to any horizontal surfaces unless specified otherwise in
//         the contract details. The standard warranty repairs only include prepping, priming (where necessary) and
//         painting individual spots or sections where there is blister, chipping, or peeling paint. Therefore, Rockstar
//         Painting does not guarantee that individual (touch-up) repairs will blend in with the original color due to
//         fading, abrasion, and wear and tear. Damages caused by weather, such as snow and hail, are not covered by this
//         warranty.
//       </Typography>
//     </Box>
//   )

//   return (
//     <Box paddingLeft={'5%'}>
//       {/* <Box display={'flex'} justifyContent={'center'} alignItems={'center'}> */}
//       {type === 'Interior' && interior}
//       {type === 'Exterior' && exterior}
//       {type === 'Both' && (
//         <>
//           {interior}
//           {exterior}
//         </>
//       )}
//     </Box>
//   )
// }

// export default WarrantyContent

import React from 'react'
import { Typography, Box, TextField } from '@mui/material'

interface WarrantyContentProps {
  type: 'Interior' | 'Exterior' | 'Both' | 'None'
  setInteriorWarranty: (months: string) => void
  setExteriorWarranty: (months: string) => void
  interiorWarranty: string
  exteriorWarranty: string
  view: any
}

const WarrantyContent: React.FC<WarrantyContentProps> = ({
  type,
  setInteriorWarranty,
  setExteriorWarranty,
  interiorWarranty,
  exteriorWarranty,
  view
}) => {
  const handleInteriorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInteriorWarranty(event.target.value)
  }

  const handleExteriorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExteriorWarranty(event.target.value)
  }

  const renderWarranty = (
    title: string,
    warranty: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <Box width={'90%'} marginBottom={'2%'}>
      <Typography variant='h6'>{title} Warranty</Typography>
      <Typography>
        A warranty of{' '}
        {view ? (
          <b> {warranty}</b>
        ) : (
          <TextField
            value={warranty}
            onChange={onChange}
            type='number'
            inputProps={{ min: 0 }}
            style={{ width: '100px' }}
          />
        )}{' '}
        months applies to the scope of work described in this contract. Rockstar Painting will repair blistering,
        chipping, or peeling paint when it is a direct result of poor workmanship. Rockstar Painting's{' '}
        {title.toLowerCase()} warranty does not apply to metal surfaces unless specified otherwise in the contract
        details. The warranty does not apply to cracks in drywall, mud, tape, or texture. The warranty does not apply to
        damages caused by harmful chemicals or cleaners or wear and tear. The standard warranty repairs only include
        prepping, priming (where necessary) and painting individual spots or sections where there is blister, chipping,
        or peeling paint. Therefore, Rockstar Painting does not guarantee that individual (touch-up) repairs will blend
        in with the original color due to fading, abrasion, and wear and tear.
      </Typography>
    </Box>
  )

  return (
    <Box paddingLeft={'5%'}>
      {type === 'Interior' && renderWarranty('Interior', interiorWarranty, handleInteriorChange)}
      {type === 'Exterior' && renderWarranty('Exterior', exteriorWarranty, handleExteriorChange)}
      {type === 'Both' && (
        <>
          {renderWarranty('Interior', interiorWarranty, handleInteriorChange)}
          {renderWarranty('Exterior', exteriorWarranty, handleExteriorChange)}
        </>
      )}
    </Box>
  )
}

export default WarrantyContent
