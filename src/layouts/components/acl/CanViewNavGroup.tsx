import { ReactNode } from 'react'
import { NavGroup } from 'src/@core/layouts/types'

interface Props {
  navGroup?: NavGroup
  children: ReactNode
}

const CanViewNavGroup = (props: Props) => {
  const { children, navGroup } = props

  if (navGroup && navGroup.auth === false) {
    return <>{children}</>
  }

  return <>{children}</>
}

export default CanViewNavGroup
