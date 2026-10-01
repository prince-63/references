import filterByTreatmentConstants from '@constants/filterByTreatment.constants'

export default [
  {
    label: 'Show braces treatments',
    value: filterByTreatmentConstants.SHOW_BRACES_TREATMENTS,
  },
  {
    label: 'Show aligners treatments',
    value: filterByTreatmentConstants.SHOW_ALIGNERS_TREATMENTS,
  },
  {
    label: 'Show unassigned',
    value: filterByTreatmentConstants.UNASSIGNED,
  },
]
