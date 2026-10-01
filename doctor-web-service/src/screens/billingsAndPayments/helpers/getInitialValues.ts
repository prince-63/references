import filterByReminderForPaymentsConstants from '@constants/filterByReminderForPayments.constants'
import sortByConstants from '@constants/sortBy.constants'
import filterByTreatmentList from '@staticData/filterByTreatmentList'

export default () => {
  return {
    patient_search: '',
    checked_treatment_list: filterByTreatmentList.map((item) => item.value),
    checked_practice_location_list: [],
    filter_by_reminder: filterByReminderForPaymentsConstants.ALL,
    sort_by: {
      type: sortByConstants.PATIENT_CREATED_ON,
      sort: 'NEWEST_TO_OLDEST',
    },
    filter_by_payment_date: {
      from_date: null,
      to_date: null,
    },
  }
}
