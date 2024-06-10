const scale: (size: number) => number = (size: number) => {
  return (window.innerWidth / 1024) * size
}

export const moderateScaleValue: (size: number, factor?: number) => number = (size: number, factor: number = 0.3) => {
  return parseInt(size + (scale(size) - size) * factor)
}

export const moderateScale: (size: number, factor?: number) => number = (size: number, factor: number = 0.3) => {
  return parseInt(size + (scale(size) - size) * factor).toString() + 'px'
}
