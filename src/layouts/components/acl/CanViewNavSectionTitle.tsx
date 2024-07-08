// ** React Imports
import { ReactNode } from 'react'

// ** Types
import { NavSectionTitle } from 'src/@core/layouts/types'

interface Props {
  children: ReactNode
  navTitle?: NavSectionTitle
}

const CanViewNavSectionTitle = (props: Props) => {
  // ** Props
  const { children, navTitle } = props

  if (navTitle && navTitle.auth === false) {
    return <>{children}</>
  } else {
    return children
  }
}

export default CanViewNavSectionTitle
