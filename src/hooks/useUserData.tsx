import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

// Custom hook to get user data from localStorage
const useUserData = () => {
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Check if the code is running on the client-side
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('userData')
      if (storedData) {
        setUserData(JSON.parse(storedData))
      } else {
        toast.error('User data missing, please log in again')
      }
    }
  }, [])

  return userData
}

export default useUserData
