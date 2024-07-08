// ** React Imports
import { ReactNode } from 'react'

// ** Component Imports

// ** Types
import { NavGroup } from 'src/@core/layouts/types'

interface Props {
  navGroup?: NavGroup
  children: ReactNode
}

const CanViewNavGroup = (props: Props) => {
  // ** Props
  const { children, navGroup } = props

  if (navGroup && navGroup.auth === false) {
    return <>{children}</>
  } else {
    return children
  }
}

export default CanViewNavGroup
