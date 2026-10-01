import calendarEventsConstants from '@constants/calendarEvents.constants'
import calendarAlignerRelatedEventTypes from '@staticData/calendarAlignerRelatedEventTypes'
import calendarAppointmentEventTypes from '@staticData/calendarAppointmentEventTypes'
import calendarReminderTypes from '@staticData/calendarReminderTypes'

type ColorCombination = {
  primaryColor: string
  secondaryColor: string
}

const colorMappings: {[key: string]: ColorCombination} = {
  appointment: {
    primaryColor: '#0095FF',
    secondaryColor: '#E9F3FA',
  },
  reminder: {
    primaryColor: '#BE8901',
    secondaryColor: '#FFEBB8',
  },
  alignerRelated: {
    primaryColor: '#735BF2',
    secondaryColor: '#F5F4FE',
  },
  default: {
    primaryColor: '#BE8901',
    secondaryColor: '#FFEBB8',
  },
}

export default (eventType: keyof typeof calendarEventsConstants): ColorCombination => {
  if (calendarAppointmentEventTypes.includes(eventType)) {
    return colorMappings.appointment
  }
  if (calendarReminderTypes.includes(eventType)) {
    return colorMappings.reminder
  }
  if (calendarAlignerRelatedEventTypes.includes(eventType)) {
    return colorMappings.alignerRelated
  }
  return colorMappings.default
}
