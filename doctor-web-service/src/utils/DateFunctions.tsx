import moment from 'moment'

export const convertDateToDDMMMYYYY = (props: string): string => {
  const options: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'short', day: 'numeric'}
  const date = new Date(props)

  return date.toLocaleDateString('en-US', options)
}

export const convertDateToDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export const ConvertYYYYMMDDToDDMMMYYYY = (props: string) => {
  return moment(props, 'YYYY-MM-DD').format('DD MMM YYYY')
}

export const getDifferenceInDays = (date1: Date | string, date2: Date | string) => {
  const startDate = moment(date1)
  const endDate = moment(date2)
  return endDate.diff(startDate, 'days')
}

export const addDaysToDate = (startDate: string, noOfDays: number) => {
  const originalDate = moment(startDate)
  return originalDate.add(noOfDays - 1, 'days').format('YYYY-MM-DD')
}

export const minusDaysToDate = (startDate: string, noOfDays: number) => {
  const originalDate = moment(startDate)
  return originalDate.add(noOfDays, 'days').format('YYYY-MM-DD')
}

export const formatDatesForTreatmentPlanTable = (
  startDate: string,
  endDate: string,
  forSort?: boolean
): string => {
  const startMoment = moment(startDate)
  const endMoment = moment(endDate)
  if (forSort) return `${startMoment.format('YYYY-MM-DD')} - ${endMoment.format('YYYY-MM-DD')}`

  const formattedStartDate = startMoment.format('DD MMM')

  const formattedEndDate = endMoment.format('DD MMM')

  const formattedDateString = `${formattedStartDate} - ${formattedEndDate} '${endMoment.format(
    'YY'
  )}`

  return formattedDateString
}

export const fileFormatDateTime = (input: moment.MomentInput) => {
  return moment(input).format('DD-MMM-YYYY, hh:mm A')
}

export const fileFormatDateTimeForTimeline = (input: moment.MomentInput) => {
  return moment(input).format('DD-MMM-YYYY hh:mm A')
}
