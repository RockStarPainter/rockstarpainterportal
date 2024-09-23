// ** React Imports
import { ReactElement, Ref, forwardRef, useState } from 'react'

// ** MUI Imports

import Dialog from '@mui/material/Dialog'

import IconButton from '@mui/material/IconButton'

import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import { FadeProps } from '@mui/material/Fade'

import { Icon as MuiIcon, Slide, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'

import UpdateUser from 'src/@core/components/UpdateUser'
import EditIcon from '@mui/icons-material/Edit'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const UpdateUserDialog = (props: any) => {
  // ** States
  const [show, setShow] = useState<boolean>(false)

  return (
    <>
      <Tooltip title='Update'>
        <MuiIcon
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setShow(true)
          }}
        >
          <EditIcon />
        </MuiIcon>
      </Tooltip>
      <Dialog
        fullScreen
        open={show}
        onClose={() => setShow(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow(false)}
      >
        <DialogContent
          sx={{
            backgroundColor: '#282A42',
            position: 'relative',
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <IconButton
            size='small'
            onClick={() => setShow(false)}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <UpdateUser userDetails={props.userDetails} setShow={setShow} handleUpdateUser={props.handleUpdateUser} />
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: '#282A42',
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        ></DialogActions>
      </Dialog>
    </>
  )
}

export default UpdateUserDialog
