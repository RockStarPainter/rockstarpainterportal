// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'))

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2 }}>
        {`© ${new Date().getFullYear()}, Powered `}

        {` by `}
        <LinkStyled target='_blank' href='https://rankorbit.com/'>
          Rank Orbit LLC
        </LinkStyled>
      </Typography>
      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}>
          <LinkStyled target='_blank' href='https://www.facebook.com/rockstarpaintingco/'>
            Facebook
          </LinkStyled>
          <LinkStyled target='_blank' href='https://www.youtube.com/channel/UCumqERLNz-vJfoNsjJHwmnw'>
            YouTube
          </LinkStyled>
          <LinkStyled target='_blank' href='https://www.instagram.com/rockstarpaint/'>
            Instagram
          </LinkStyled>
          <LinkStyled target='_blank' href='https://rockstarpaintingdenver.com/'>
            Website
          </LinkStyled>
        </Box>
      )}
    </Box>
  )
}

export default FooterContent
