import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import MuiTable from './MuiTable'
import { UserColumns } from './columns/userTableColumns'

function UserTable() {
  const [data, setData] = useState<any[]>([]) // Initially an empty array
  const [isLoading, setIsLoading] = useState(false)

  // Function to handle updating a specific user in the table
  const handleUpdateUser = (updatedUser: any) => {
    const newData = data.map((user: any) => {
      if (user._id === updatedUser._id) return updatedUser

      return user
    })
    setData(newData)
  }

  // Function to handle deleting a user
  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoading(true)
      await axios.delete('/api/user/delete', {
        data: { user_id: userId },
        headers: { authorization: localStorage.getItem('token') }
      })
      setData(data.filter((user: any) => user._id !== userId)) // Remove deleted user from the state
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const columns = useMemo(() => UserColumns(handleUpdateUser, handleDeleteUser), [data])

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get('/api/user/get-all', {
          headers: { authorization: localStorage.getItem('token') }
        })
        setData(res.data.payload.users) // Set the data once it's fetched
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Network error. Please refresh the page')
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch the data when the component mounts
    getData()
  }, [])

  return (
    <>
      <MuiTable
        data={data}
        columns={columns}
        options={{
          state: {
            isLoading
          }
        }}
      />
    </>
  )
}

export default UserTable
