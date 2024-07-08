// ** React Imports
import { ReactNode } from 'react'

// ** Types
import { NavLink } from 'src/@core/layouts/types'

interface Props {
  navLink?: NavLink
  children: ReactNode
}

const CanViewNavLink = (props: Props) => {
  // ** Props
  const { children, navLink } = props

  if (navLink && navLink.auth === false) {
    return <>{children}</>
  } else {
    return children
  }
}

export default CanViewNavLink
