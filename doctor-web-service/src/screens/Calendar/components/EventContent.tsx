import PatientDetails from './PatientDetails'
import {CustomEventContentArg} from '../calendar.types'
import AlignerCheckInDetails from './AlignerCheckInDetails'
import {EventProvider} from './EventContext'
import EventContentHeader from './EventContentHeader'
import AlignerChangeDetails from './AlignerChangeDetails'
import When from 'components/when/When'
import ResumeTreatmentDetails from './ResumeTreatmentDetails'
import ReminderEventDetails from './ReminderEventDetails'
import calendarEventsConstants from '@constants/calendarEvents.constants'
import hasValue from 'utils/hasValue'
import SubscriptionEventDetails from './SubscriptionEventDetails'
import AppointmentEventDetails from './AppointmentEventDetails'
import reminderTypeOptions from '@staticData/reminderTypeOptions'
import reminderTypeConstants from '@constants/reminderType.constants'

const EventContent = ({
  event,
  setDeleteEventModalVisible,
  toggleAddReminderFormContainer,
  toggleAddAppointmentFormContainer,
  deleteEventModalVisible,
  isAddAppointmentModalVisible,
  isCreateReminderModalVisible,
}: {
  event: CustomEventContentArg['event']
  setDeleteEventModalVisible: (value: boolean) => void
  toggleAddReminderFormContainer: (value: boolean) => void
  toggleAddAppointmentFormContainer: (value: boolean) => void
  deleteEventModalVisible: boolean
  isAddAppointmentModalVisible: boolean
  isCreateReminderModalVisible: boolean
}) => {
  const {calendar_response_type} = event.extendedProps
  const reminderEvents = [
    calendarEventsConstants.APPOINTMENT_REMINDER,
    calendarEventsConstants.GENERAL_REMINDER,
    calendarEventsConstants.PAYMENT_REMINDER,
    calendarEventsConstants.PRODUCTION_REMINDER,
    calendarEventsConstants.TRIAL_PLAN_EXPIRING,
    calendarEventsConstants.TRIAL_PLAN_EXPIRING,
  ]

  const getEventTitle = (event: CustomEventContentArg['event']) => {
    if (
      reminderTypeOptions
        .map((item) => item.value)
        .includes(calendar_response_type as keyof typeof reminderTypeConstants)
    ) {
      return event.title
    } else {
      return null
    }
  }
  const title = getEventTitle(event)
  return (
    <EventProvider event={event}>
      <div className='flex flex-col gap-3 text-sm font-medium text-textColor'>
        <EventContentHeader
          setDeleteEventModalVisible={setDeleteEventModalVisible}
          {...{
            toggleAddReminderFormContainer,
            toggleAddAppointmentFormContainer,
            deleteEventModalVisible,
            isCreateReminderModalVisible,
            isAddAppointmentModalVisible,
          }}
        />
        {title && <p className='text-black font-semibold text-base'>{getEventTitle(event)}</p>}
        <When
          isTrue={
            !(
              calendar_response_type === 'TRIAL_PLAN_EXPIRING' ||
              calendar_response_type === 'BASIC_PLAN_EXPIRING'
            ) && hasValue(event.extendedProps.content.details.patient_name)
          }
        >
          <PatientDetails />
        </When>
        <When isTrue={calendar_response_type === 'ALIGNER_CHECK_IN'}>
          <AlignerCheckInDetails />
        </When>
        <When isTrue={calendar_response_type === 'ALIGNER_CHANGED'}>
          <AlignerChangeDetails />
        </When>
        <When isTrue={calendar_response_type === 'RESUME_TREATMENT_REMINDER'}>
          <ResumeTreatmentDetails />
        </When>
        <When isTrue={calendar_response_type === 'APPOINTMENT'}>
          <AppointmentEventDetails />
        </When>
        <When isTrue={reminderEvents.includes(calendar_response_type)}>
          <ReminderEventDetails />
        </When>
        <When
          isTrue={
            calendar_response_type === 'TRIAL_PLAN_EXPIRING' ||
            calendar_response_type === 'BASIC_PLAN_EXPIRING'
          }
        >
          <SubscriptionEventDetails />
        </When>
      </div>
    </EventProvider>
  )
}

export default EventContent
