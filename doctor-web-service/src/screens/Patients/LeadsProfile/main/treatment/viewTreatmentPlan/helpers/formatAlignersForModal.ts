export default (aligners: number[]): string => {
  if (aligners.length === 0) {
    return ''
  }

  const sortedAligners = [...aligners].sort((a, b) => a - b)
  const ranges: string[] = []

  let start = sortedAligners[0]
  let end = sortedAligners[0]

  for (let i = 1; i < sortedAligners.length; i++) {
    if (sortedAligners[i] - end === 1) {
      end = sortedAligners[i]
    } else {
      ranges.push(
        start === end
          ? `${start.toString().padStart(2, '0')}`
          : `${start.toString().padStart(2, '0')} to ${end.toString().padStart(2, '0')}`
      )
      start = end = sortedAligners[i]
    }
  }

  ranges.push(
    start === end
      ? `${start.toString().padStart(2, '0')}`
      : `${start.toString().padStart(2, '0')} to ${end.toString().padStart(2, '0')}`
  )

  return ranges.length > 1 ? ranges.join(', ') : ranges[0]
}
