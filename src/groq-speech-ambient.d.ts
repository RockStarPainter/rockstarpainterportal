declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module 'react-dom' {
  import type { ReactNode, ReactPortal } from 'react'

  export function createPortal(
    children: ReactNode,
    container: Element | DocumentFragment,
    key?: null | string
  ): ReactPortal | null

  export function flushSync<R>(fn: () => R): R
}
