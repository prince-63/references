import practiceSortingConstants from '@constants/practiceSorting.constants'

export default [
  {label: 'Practice name, ascending', value: practiceSortingConstants.PRACTICE_NAME_ASC},
  {label: 'Practice name, descending', value: practiceSortingConstants.PRACTICE_NAME_DESC},
  {
    label: 'Invite sent date, newest to oldest',
    value: practiceSortingConstants.INVITE_DATE_NEWEST_TO_OLDEST,
  },
  {
    label: 'Invite sent date, oldest to newest',
    value: practiceSortingConstants.INVITE_DATE_OLDEST_TO_NEWEST,
  },
  {label: 'Added on, newest to oldest', value: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST},
  {label: 'Added on, oldest to newest', value: practiceSortingConstants.ADDED_ON_OLDEST_TO_NEWEST},
]
