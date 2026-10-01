import filterAlignerPatientAnalyticsConstants from '@constants/filterAlignerPatientAnalyticsConstants'

export default [
  {
    value: filterAlignerPatientAnalyticsConstants.NEEDS_ATTENTION,
    label: 'Needs attention',
    color: '#F45045',
    bgColor: '#FEF4F4',
  },
  {
    value: filterAlignerPatientAnalyticsConstants.AT_RISK,
    label: 'At risk',
    color: '#BE8901',
    bgColor: '#FFEBB8',
  },
  {
    value: filterAlignerPatientAnalyticsConstants.ON_TRACK,
    label: 'On track',
    color: '#00B383',
    bgColor: '#EBF8F4',
  },
] as {
  label: string
  value: keyof typeof filterAlignerPatientAnalyticsConstants
  color: string
  bgColor: string
}[]
