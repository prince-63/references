import filterByReminderForPaymentsOptions from '@staticData/filterByReminderForPaymentsOptions'
import VerticalRadioGroup from 'components/RadioGroup/VerticalRadioGroup'

const FilterByReminder = () => {
  return (
    <VerticalRadioGroup options={filterByReminderForPaymentsOptions} name='filter_by_reminder' />
  )
}

export default FilterByReminder
