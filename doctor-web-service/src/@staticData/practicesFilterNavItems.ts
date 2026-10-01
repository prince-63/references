import practiceFilterConstants from '@constants/practiceFilter.constants'

export default [
  {
    value: practiceFilterConstants.ACCEPTED,
    label: 'Active',
    index: true,
  },
  {
    value: practiceFilterConstants.PENDING,
    label: 'Invitations',
    index: false,
  },
]
