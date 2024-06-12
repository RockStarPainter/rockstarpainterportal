const scale: (size: any) => any = (size: any) => {
  return (window.innerWidth / 1024) * size
}

export const moderateScaleValue: (size: any, factor?: any) => any = (size: any, factor: any = 0.3) => {
  return parseInt(size + (scale(size) - size) * factor)
}

export const moderateScale: (size: any, factor?: any) => any = (size: any, factor: any = 0.3) => {
  return parseInt(size + (scale(size) - size) * factor).toString() + 'px'
}
