import calendarEventsConstants from '@constants/calendarEvents.constants'

export default [
  calendarEventsConstants.APPOINTMENT_REMINDER,
  calendarEventsConstants.GENERAL_REMINDER,
  calendarEventsConstants.PAYMENT_REMINDER,
  calendarEventsConstants.PRODUCTION_REMINDER,
  calendarEventsConstants.RESUME_TREATMENT_REMINDER,
  calendarEventsConstants.TRIAL_PLAN_EXPIRING,
  calendarEventsConstants.BASIC_PLAN_EXPIRING,
  calendarEventsConstants.TREATMENT_START_REMINDER,
] as const
