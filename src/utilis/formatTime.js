const formatTime = time => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const period = +hours >= 12 ? 'PM' : 'AM'
  const formattedHours = +hours % 12 || 12

  return `${formattedHours}:${minutes} ${period}`
}

export default formatTime
