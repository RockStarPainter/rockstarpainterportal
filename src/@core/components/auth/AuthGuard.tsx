// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  // Public routes that don't require authentication
  const publicRoutes = ['/approveInvoice', '/api/update-email-status/[custom_id]']

  useEffect(() => {
    if (!router.isReady) {
      return
    }
    if (!publicRoutes.includes(router.pathname)) {
      // Check if the user is logged in or if userData exists in localStorage
      if (auth.user === null && !window.localStorage.getItem('userData')) {
        if (router.asPath !== '/') {
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        } else {
          router.replace('/login')
        }
      }
    }
  }, [router.route, auth.user, router.isReady])

  // Show fallback while loading or if user is not authenticated
  if (auth.loading || (auth.user === null && !publicRoutes.includes(router.pathname))) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
