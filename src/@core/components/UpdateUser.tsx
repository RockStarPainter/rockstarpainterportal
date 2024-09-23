// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import TextField from '@mui/material/TextField'
import { MenuItem, Select } from '@mui/material'

// ** Third Party Imports
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

// ** Icon Imports
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'

// ** Define Interfaces
interface State {
  password: string
  showPassword: boolean
}

interface FormInputs {
  user_name: string
  password: string
  role: string
}

// ** Validation Schema
const validationSchema = yup.object({
  user_name: yup
    .string()
    .required('Username is required')
    .matches(
      /^[a-zA-Z0-9_-]{3,20}$/,
      'Invalid username. Only alphanumeric characters, underscores, and hyphens are allowed (3-20 characters)'
    ),
  password: yup.string().required('Password is required'),
  role: yup.string().required('Role is required')
})

const UpdateUser = (props: any) => {
  // ** States
  const [loading, setLoading] = useState<boolean>(false)
  const [state, setState] = useState<State>({
    password: '',
    showPassword: false
  })

  // ** Extract userDetails from props
  const { userDetails } = props

  // ** Hook for form control
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormInputs>({
    resolver: yupResolver(validationSchema),
    mode: 'onChange'
  })

  // Use useEffect to reset form values when userDetails prop changes
  useEffect(() => {
    if (userDetails) {
      reset({
        user_name: userDetails.user_name,
        password: userDetails.password,
        role: userDetails.role || '' // Ensure role is reset properly
      })
    }
  }, [userDetails, reset])

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setState({ ...state, showPassword: !state.showPassword })
  }

  // Form submission handler
  const onSubmit = async (data: FormInputs) => {
    if (loading) return
    try {
      setLoading(true)
      const res = await axios.post(
        '/api/user/update',
        {
          user_name: data.user_name,
          password: data.password,
          role: data.role,
          user_id: userDetails._id
        },
        { headers: { authorization: localStorage.getItem('token') } }
      )
      toast.success('User updated successfully')
      props.handleUpdateUser(res.data.payload.user)
      props.setShow(false)
    } catch (error: any) {
      console.log(error)
      toast.error(error.response?.data || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Update User' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <Grid container spacing={5}>
            {/* Username Field */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='user_name'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label='Username'
                      {...field}
                      error={Boolean(errors.user_name)}
                      helperText={errors.user_name?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Password Field */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel error={Boolean(errors.password)} htmlFor='validation-password'>
                  Password
                </InputLabel>
                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <OutlinedInput
                      {...field}
                      id='validation-password'
                      label='Password'
                      type={state.showPassword ? 'text' : 'password'}
                      error={Boolean(errors.password)}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <Icon icon={state.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  )}
                />
                {errors.password && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Role Field */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel error={Boolean(errors.role)}>Role</InputLabel>
                <Controller
                  name='role'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      label='Role'
                      value={value || ''} // Ensure it gets a value
                      onChange={onChange} // Ensure onChange is handled
                      error={Boolean(errors.role)}
                    >
                      <MenuItem value='Admin'>Admin</MenuItem>
                      <MenuItem value='Employee'>Employee</MenuItem>
                    </Select>
                  )}
                />
                {errors.role && <FormHelperText sx={{ color: 'error.main' }}>{errors.role.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button fullWidth variant='contained' size='large' type='submit' disabled={loading}>
                {loading ? (
                  <CircularProgress
                    sx={{
                      color: 'common.white',
                      width: '20px !important',
                      height: '20px !important',
                      mr: theme => theme.spacing(2)
                    }}
                  />
                ) : null}
                Update User
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default UpdateUser
