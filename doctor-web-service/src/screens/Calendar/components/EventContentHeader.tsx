import PencilIconOutline from 'assets/icons/PencilIconOutline'
import TrashOutline from 'assets/icons/TrashOutline'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import calendarEventsHeaderTitle from '@staticData/calendarEventsHeaderTitle'
import moment from 'moment'
import {useEvent} from './EventContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate} from 'react-router-dom'
import getHeaderButtonRules from '../helpers/headerButtonRules'
import When from 'components/when/When'
import {setOpenPopover, setSelectedEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import calendarReminderTypes from '@staticData/calendarReminderTypes'
import calendarAppointmentEventTypes from '@staticData/calendarAppointmentEventTypes'
import getPatientProfileTrackingUrl from '@utils/getPatientProfileTrackingUrl'
import patientOverviewAlignerActionFilterConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useContext, useEffect} from 'react'
import bracesTreatmentStages from '@constants/bracesTreatmentStages'
import {AuthContext} from 'context/AuthContext'
import {RootState} from '@react-three/fiber'
import {useSelector} from 'react-redux'
import {getBracesTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'

const EventContentHeader = ({
  setDeleteEventModalVisible,
  toggleAddReminderFormContainer,
  toggleAddAppointmentFormContainer,
  isAddAppointmentModalVisible,
  deleteEventModalVisible,
  isCreateReminderModalVisible,
}: {
  setDeleteEventModalVisible: (value: boolean) => void
  toggleAddReminderFormContainer: (value: boolean) => void
  toggleAddAppointmentFormContainer: (value: boolean) => void
  isAddAppointmentModalVisible: boolean
  deleteEventModalVisible: boolean
  isCreateReminderModalVisible: boolean
}) => {
  const {event} = useEvent()
  const {isStarterPlanUser} = useAllUserPlan()
  const {
    header,
    calendar_response_type,
    content: {details},
  } = event.extendedProps
  const {manual, patient_id, patient_name} = details
  const {userId} = useContext(AuthContext)
  const {bracesTreatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const headerTitle = calendarEventsHeaderTitle.find(
    (item) => item.value === calendar_response_type
  )?.label

  useEffect(() => {
    dispatchAction(
      getBracesTreatmentPlanList({
        doctor_id: String(userId),
        patient_id: String(patient_id),
        braces_treatment_stage: bracesTreatmentStages.ACTIVE,
      })
    )
  }, [userId, patient_id])
  const formattedDate = moment(header.date).format('dddd, DD MMM YYYY, hh:mm A')
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const handleOnClick = () => {
    dispatchAction(setOpenPopover(null))
    dispatchAction(setSelectedEvent(null))
    if (
      calendar_response_type === 'ALIGNER_CHANGED' ||
      calendar_response_type === 'ALIGNER_CHECK_IN'
    ) {
      if (!manual) {
        const patientTimelineFilter =
          calendar_response_type === 'ALIGNER_CHANGED'
            ? patientOverviewAlignerActionFilterConstants.ALIGNER_CHANGES
            : patientOverviewAlignerActionFilterConstants.ALIGNER_CHECKINS

        navigate(
          getPatientProfileTrackingUrl(patient_id, isStarterPlanUser, {
            patient_timeline_filter: patientTimelineFilter,
          })
        )
      } else {
        navigate(`/profile/${patient_id}/aligner-tracking`)
      }
    }
    if (calendar_response_type === 'RESUME_TREATMENT_REMINDER') {
      navigate(`/profile/${patient_id}/aligner-tracking`)
    }
    if (calendar_response_type === 'PAYMENT_REMINDER') {
      navigate(`/profile/${patient_id}/payments`)
    }
    if (
      calendar_response_type === 'APPOINTMENT_REMINDER' ||
      calendar_response_type === 'APPOINTMENT'
    ) {
      navigate(
        `/profile/${patient_id}/bracesNotes/${bracesTreatmentPlanList[0]?.upcoming_appointment_reminder_details?.braces_journey_id}`
      )
    }
    if (calendar_response_type === 'PRODUCTION_REMINDER') {
      navigate('/production', {state: {patientName: patient_name?.trim()}})
    }
  }
  const headerButtonRules = getHeaderButtonRules(event)
  return (
    <div className='text-textColor flex flex-col gap-3'>
      <div className='flex flex-col gap-1'>
        <div className='flex gap-4'>
          <p className='font-semibold text-xs w-[80%] uppercase'>{headerTitle}</p>
          <div className='flex gap-3 items-center flex-1'>
            <When isTrue={headerButtonRules.showDeleteButton}>
              <button
                type='button'
                className='ml-auto'
                disabled={isAddAppointmentModalVisible || isCreateReminderModalVisible}
                onClick={() => {
                  dispatchAction(
                    setSelectedEvent({
                      eventId: event.id,
                      extendedProps: event.extendedProps,
                    })
                  )
                  dispatchAction(setOpenPopover(null))
                  setDeleteEventModalVisible(true)
                }}
              >
                <TrashOutline
                  {...{
                    width: '20',
                    height: '20',
                  }}
                />
              </button>
            </When>
            <When isTrue={headerButtonRules.showEditButton}>
              <button
                type='button'
                disabled={deleteEventModalVisible}
                onClick={() => {
                  dispatchAction(
                    setSelectedEvent({
                      eventId: event.id,
                      extendedProps: event.extendedProps,
                    })
                  )
                  dispatchAction(setOpenPopover(null))
                  if (calendarReminderTypes.includes(calendar_response_type)) {
                    toggleAddReminderFormContainer(true)
                  } else if (calendarAppointmentEventTypes.includes(calendar_response_type)) {
                    toggleAddAppointmentFormContainer(true)
                  }
                }}
              >
                <PencilIconOutline />
              </button>
            </When>
            <When isTrue={headerButtonRules.showViewDetailsButton}>
              <button type='button' onClick={handleOnClick} className='ml-auto'>
                <CommonSVG
                  svg={SVG_EXPAND_RIGHT}
                  height='15'
                  width='15'
                  className='cursor-pointer'
                />
              </button>
            </When>
          </div>
        </div>
        <p className='text-sm font-medium'>{formattedDate}</p>
      </div>
      <div className='w-full border border-lighterGray'></div>
    </div>
  )
}

export default EventContentHeader
