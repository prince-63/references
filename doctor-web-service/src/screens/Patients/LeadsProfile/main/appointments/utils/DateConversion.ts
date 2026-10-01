import moment from 'moment'

export const convertYYYYMMDDTOddddDDMMMMYY = (value: string) => {
  // "2024-06-15"; To Saturday, 15 June '24
  const momentDate = moment(value)
  const formattedDate = momentDate.format("dddd, DD MMMM 'YY")

  return formattedDate
}

export const capitalizeFirstLetter = (value: string) => {
  const capitalizedStr = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  return capitalizedStr.replace(/_/g, ' ')
}

export const convertDateToRegular = (value: string) => {
  // "2024-06-15"; To Saturday, 15 June '24
  const momentDate = moment(value)
  const formattedDate = momentDate.format(" DD MMMM 'YY")

  return formattedDate
}
