export default (aligners: number[]): string[] => {
  if (aligners.length === 0) {
    return []
  }
  const sortedAligners = [...aligners].sort((a, b) => a - b)

  const ranges = []
  let start = sortedAligners[0]
  let end = sortedAligners[0]

  for (let i = 1; i < sortedAligners.length; i++) {
    if (sortedAligners[i] - end === 1) {
      end = sortedAligners[i]
    } else {
      ranges.push(
        start === end
          ? `Aligner ${start.toString().padStart(2, '0')}`
          : `Aligner ${start.toString().padStart(2, '0')} - ${end.toString().padStart(2, '0')}`
      )
      start = end = sortedAligners[i]
    }
  }

  ranges.push(
    start === end
      ? `Aligner ${start.toString().padStart(2, '0')}`
      : `Aligner ${start.toString().padStart(2, '0')} - ${end.toString().padStart(2, '0')}`
  )

  return ranges
}
