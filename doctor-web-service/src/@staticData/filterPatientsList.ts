import filterPatientList from '@constants/filterPatientList'

export default [
  {
    value: filterPatientList.NOT_CONNECTED,
    label: 'Not connected',
    color: '#F45045',
    bgColor: '#FEF4F4',
  },
  {
    value: filterPatientList.PENDING,
    label: 'Pending',
    color: '#BE8901',
    bgColor: '#FFEBB8',
  },
  {
    value: filterPatientList.CONNECTED,
    label: 'Connected',
    color: '#00B383',
    bgColor: '#EBF8F4',
  },
] as {
  label: string
  value: keyof typeof filterPatientList
  color: string
  bgColor: string
}[]
