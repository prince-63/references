import {useContext, useEffect, useState} from 'react'
import Page from 'components/page/Page'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import {Outlet, useNavigate, useParams} from 'react-router-dom'
import {RootState} from 'redux/store'

import useDispatchAction from '@hooks/useDispatchAction'
import {setAppointmentDetails} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import AddAppointmentModal from 'components/addAppointment/AddAppointmentModal'
import AppointmentCreatedSuccessfully from 'components/addAppointment/AppointmentCreatedSuccessfully'
import FilterBar from './components/FilterBar'
import useFilter from '@hooks/useFilter'
import appointmentsFilterNavItems from '@staticData/appointmentsFilterNavItems'
import {getAppointmentsList} from 'redux/Slices/AppSlice/Appointment/Appointments.slice'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {appointmentNavTabs, RowDataForAppointmentsList} from './types/appointments.types'
import DeleteEvent from 'components/deleteEvent/DeleteEvent'
import {deleteEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import PlusIcon from 'assets/icons/PlusIcon'
import getColorPalette from 'utils/getColorPalette'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import When from 'components/when/When'
import InfoCard from '../alignersTracking/components/InfoCard'
import hasValue from 'utils/hasValue'
import useAllUserPlan from '@hooks/useAllUserPlan'

const Appointments = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {data} = useSelector((state: RootState) => state.leadsProfileDetails)
  const {isStarterPlanUser} = useAllUserPlan()
  const [isAddAppointmentModalVisible, setIsAddAppointmentModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [appointmentCreatedSuccessfullyVisible, setAppointmentCreatedSuccessfullyVisible] =
    useState(false)
  const {appointmentsList} = useSelector((state: RootState) => state.appointments)
  const [appointmentSuccessResponse, setAppointmentSuccessResponse] = useState<{
    reminder_id: number
    braces_journey_id?: number | null
    is_tracking_added: boolean
    start_date: string
    end_date: string
    patient_id: number
  } | null>(null)

  const [selectedAppointmentDetails, setSelectedAppointmentDetails] =
    useState<RowDataForAppointmentsList>()

  const toggleAddAppointmentModal = (value: boolean) => {
    setIsAddAppointmentModalVisible(value)
  }

  const toggleAddAppointmentFormContainer = (value: boolean) => {
    toggleAddAppointmentModal(value)
  }
  const {filter, handleFilterChange} = useFilter(appointmentsFilterNavItems)

  useEffect(() => {
    if (patientId && userId) {
      dispatchAction(
        getAppointmentsList({
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patientId),
          status: getActiveFilter<appointmentNavTabs>({filter}),
        })
      )
    }
  }, [filter])

  useEffect(() => {
    dispatchAction(
      getApiLeadsOverview({
        data: {
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        },
      })
    )
  }, [])

  return (
    <Page
      title='Appointments'
      showBorder
      showBackButton={false}
      extraHeader={
        <button
          className='rounded-lg px-3 py-1 border border-secondaryColor bg-secondarySupport text-secondaryColor font-semibold flex items-center gap-3 justify-center'
          onClick={() => {
            toggleAddAppointmentFormContainer(true)
            identifyUser()
          }}
        >
          <PlusIcon color={getColorPalette().secondaryColor} />
          Add appointment
        </button>
      }
    >
      <When isTrue={hasValue(appointmentsList) && isStarterPlanUser}>
        <InfoCard
          className='border border-primaryColor'
          title={'Braces notes can be added by clicking on the “•••” (3 dots) button'}
          showButton={false}
        />
      </When>
      <FilterBar
        {...{
          filter,
          handleFilterChange,
        }}
      />
      <div className='md:border md:border-lighterGray rounded-lg flex flex-col gap-3'>
        <div className='h-full overflow-auto '>
          <Outlet
            context={{
              filter,
              toggleAddAppointmentFormContainer,
              setSelectedAppointmentDetails,
              setIsDeleteModalVisible,
            }}
          />
        </div>
      </div>

      <AddAppointmentModal
        {...{
          isModalVisible: isAddAppointmentModalVisible,
          toggleModal: toggleAddAppointmentModal,
          setAppointmentCreatedSuccessfullyVisible,
          isOnAppointmentsPage: true,
          setAppointmentSuccessResponse,
          practiceLocationId: data.patient_details?.practice_location_id ?? undefined,
          editAppointmentDetails: selectedAppointmentDetails,
          onClose: () => {
            setSelectedAppointmentDetails(undefined)
          },
          filter,
        }}
      />
      <DeleteEvent
        {...{
          eventType: 'APPOINTMENT',
          visible: isDeleteModalVisible,
          setDeleteModalVisible: setIsDeleteModalVisible,
          onClose: () => {
            setSelectedAppointmentDetails(undefined)
          },
          onOkClick: async () => {
            if (selectedAppointmentDetails) {
              await dispatchAction(
                deleteEvent({
                  reminder_id: safeParseInt(selectedAppointmentDetails.appointment_id),
                  isAppointment: true,
                  braces_journey_id: safeParseInt(selectedAppointmentDetails.braces_journey_id),
                  patient_id: safeParseInt(patientId),
                  isReminder: false,
                })
              )
              await dispatchAction(
                getAppointmentsList({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                  status: getActiveFilter<appointmentNavTabs>({filter}),
                })
              )
              SuccessToast('Appointment deleted successfully.')
              setSelectedAppointmentDetails(undefined)
            }
          },
        }}
      />
      <AppointmentCreatedSuccessfully
        {...{
          visible: appointmentCreatedSuccessfullyVisible,
          setQuitModalVisible: setAppointmentCreatedSuccessfullyVisible,
          bracesJourneyId: appointmentSuccessResponse?.braces_journey_id,
          onClose: () => {
            if (patientId && userId) {
              dispatchAction(
                getAppointmentsList({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                  status: getActiveFilter<appointmentNavTabs>({filter}),
                })
              )
            }
          },
          isAlignerOrLeadPatient: false,
          onViewAppointmentClick: () => {
            if (appointmentSuccessResponse) {
              navigate('/calendar', {
                state: {
                  reminderId: appointmentSuccessResponse?.reminder_id,
                  eventDate: appointmentSuccessResponse?.start_date,
                },
              })
            }
          },
          onOkClick: () => {
            if (appointmentSuccessResponse) {
              const {reminder_id, braces_journey_id, start_date, patient_id, end_date} =
                appointmentSuccessResponse
              if (start_date && braces_journey_id && patient_id && end_date && reminder_id) {
                dispatchAction(setAppointmentDetails({}))
                const queryParams = new URLSearchParams({
                  startDate: start_date.toString(),
                  endDate: end_date.toString(),
                  reminderId: reminder_id.toString(),
                }).toString()
                navigate(
                  `/profile/${patient_id}/bracesNotes/${braces_journey_id}/attachNotes?${queryParams}`
                )
              }
            }
          },
        }}
      />
    </Page>
  )
}

export default Appointments
