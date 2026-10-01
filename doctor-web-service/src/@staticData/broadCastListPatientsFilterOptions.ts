import broadCastListPatientsFilterOptionType from '@constants/broadCastListPatientsFilterOptionType'

export default [
  {
    value: broadCastListPatientsFilterOptionType.ALL,
    label: 'All',
  },
  {
    value: broadCastListPatientsFilterOptionType.ALIGNER_CHECK_IN_PENDING,
    label: 'Aligner check in pending',
  },
  {
    value: broadCastListPatientsFilterOptionType.MISSED_ALIGNER_CHANGE_DATE,
    label: 'Missed aligner change date',
  },
  {
    value: broadCastListPatientsFilterOptionType.UPCOMING_ALIGNER_CHANGE,
    label: 'Upcoming aligner change',
  },
  {value: broadCastListPatientsFilterOptionType.POOR_COMPLIANCE, label: 'Poor compliance'},
  {value: broadCastListPatientsFilterOptionType.GOOD_COMPLIANCE, label: 'Good compliance'},
]
