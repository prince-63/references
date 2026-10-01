export const alignerNumbersArrayToConcatenatedString = (changedAligners: number[]) => {
  if (changedAligners.length === 1) {
    return changedAligners[0].toString()
  } else if (changedAligners.length > 1) {
    // Join all elements except the last one with a comma and space
    // Then add "and" before the last element
    return (
      changedAligners.slice(0, -1).join(', ') +
      ' and ' +
      changedAligners[changedAligners.length - 1]
    )
  } else {
    return '' // Handle empty array case
  }
}
