import calendarAlignerRelatedEventTypes from '@staticData/calendarAlignerRelatedEventTypes'
import {CustomEventContentArg} from '../calendar.types'
import calendarEventsConstants from '@constants/calendarEvents.constants'
import calendarAppointmentEventTypes from '@staticData/calendarAppointmentEventTypes'
import dayjs from 'dayjs'

interface HeaderButtonRules {
  showViewDetailsButton: boolean
  showEditButton: boolean
  showDeleteButton: boolean
}

const getHeaderButtonRules = (eventContent: CustomEventContentArg['event']): HeaderButtonRules => {
  const {
    calendar_response_type,
    header: {date},
  } = eventContent.extendedProps
  const headerButtonRules: HeaderButtonRules = {
    showViewDetailsButton: false,
    showEditButton: false,
    showDeleteButton: false,
  }
  const isEventInPast = dayjs(date).isBefore(dayjs())

  const viewableReminders = [
    calendarEventsConstants.APPOINTMENT_REMINDER,
    calendarEventsConstants.PAYMENT_REMINDER,
    calendarEventsConstants.PRODUCTION_REMINDER,
    calendarEventsConstants.RESUME_TREATMENT_REMINDER,
  ]

  const isAlignerRelated = calendarAlignerRelatedEventTypes.includes(calendar_response_type)
  const isViewableReminder = viewableReminders.includes(calendar_response_type)
  const isAppointmentEvent = calendarAppointmentEventTypes.includes(calendar_response_type)

  if (isAlignerRelated || isViewableReminder || isAppointmentEvent) {
    headerButtonRules.showViewDetailsButton = true
  }

  if (isViewableReminder || isAppointmentEvent) {
    headerButtonRules.showEditButton = true
    headerButtonRules.showDeleteButton = true
  }
  if (calendar_response_type === 'RESUME_TREATMENT_REMINDER') {
    headerButtonRules.showEditButton = false
    headerButtonRules.showDeleteButton = false
  }

  if (calendar_response_type === 'GENERAL_REMINDER') {
    headerButtonRules.showEditButton = true
    headerButtonRules.showDeleteButton = true
    headerButtonRules.showViewDetailsButton = false
  }
  if (isEventInPast) {
    headerButtonRules.showEditButton = false
  }

  if (calendar_response_type === calendarEventsConstants.APPOINTMENT_REMINDER) {
    headerButtonRules.showViewDetailsButton = false
  }
  if (calendar_response_type === calendarEventsConstants.PAYMENT_REMINDER) {
    headerButtonRules.showViewDetailsButton = false
  }

  return headerButtonRules
}

export default getHeaderButtonRules
