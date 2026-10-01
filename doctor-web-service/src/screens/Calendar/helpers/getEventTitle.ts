import calendarAppointmentEventTypes from '@staticData/calendarAppointmentEventTypes'
import {CustomEventContentArg} from '../calendar.types'
import calendarReminderTypes from '@staticData/calendarReminderTypes'
import calendarEventsHeaderTitle from '@staticData/calendarEventsHeaderTitle'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'

export default (eventContent: CustomEventContentArg) => {
  const {calendar_response_type} = eventContent.event.extendedProps
  const viewType = eventContent.view.type
  const {
    patient_name,
    previous_aligner_jaw_type,
    previous_aligner_number,
    current_aligner_jaw_type,
    current_aligner_number,
    jaw_type,
    check_in_for_aligner_no,
  } = eventContent.event.extendedProps?.content?.details

  const formatJawType = (jawType?: string) => {
    if (!jawType) {
      return ''
    }
    if (viewType === 'listWeek' || viewType === 'timeGridDay') {
      return capitalizeFirstLetter(jawType)
    }
    return jawType.charAt(0).toUpperCase()
  }

  if (calendar_response_type === 'ALIGNER_CHANGED') {
    return `${patient_name} | ${formatJawType(
      previous_aligner_jaw_type
    )} ${previous_aligner_number} to ${formatJawType(
      current_aligner_jaw_type
    )} ${current_aligner_number}`
  }
  if (calendar_response_type === 'ALIGNER_CHECK_IN') {
    return `${patient_name} | ${formatJawType(jaw_type)} ${check_in_for_aligner_no} check-in`
  }
  if (calendarAppointmentEventTypes.includes(calendar_response_type)) {
    return `${patient_name}'s Appointment`
  }
  if (calendarReminderTypes.includes(calendar_response_type)) {
    return calendarEventsHeaderTitle.find((item) => item.value === calendar_response_type)?.label
  }
}
