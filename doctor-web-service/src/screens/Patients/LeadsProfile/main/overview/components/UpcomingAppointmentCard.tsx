import CalendarIcon from 'assets/icons/CalendarIcon'
import {useContext, useState} from 'react'
import {IBracesTreatmentPlanDetails} from '../../treatment/types/treatmentPlan.types'
import hasValue from 'utils/hasValue'
import dayjs from 'dayjs'
import AntdButton from 'components/atom/Buttons/AntdButton'
import PlusIcon from 'assets/icons/PlusIcon'
import {
  getBracesNotesDetails,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {useNavigate, useParams} from 'react-router-dom'
import useDispatchAction from '@hooks/useDispatchAction'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import appointmentJawTypes from '@constants/appointmentJawTypes'
import {safeParseInt} from 'utils/ConstFunctions'
import productTypes from '@constants/productTypes'
import cn from '@utils/cn'
import AttachmentIcon from 'assets/icons/AttachmentIcon'
import EditAppointmentIcon from 'assets/icons/EditAppointmentIcon'
import When from 'components/when/When'
import AddAppointmentModal from 'components/addAppointment/AddAppointmentModal'
import AppointmentCreatedSuccessfully from 'components/addAppointment/AppointmentCreatedSuccessfully'
import bracesTreatmentStages from '@constants/bracesTreatmentStages'
import {getBracesTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import getColorPalette from 'utils/getColorPalette'
import moment from 'moment'

const UpcomingAppointmentCard = ({
  bracesTreatmentPlanDetail,
}: {
  bracesTreatmentPlanDetail: IBracesTreatmentPlanDetails
}) => {
  const {upcoming_appointment_reminder_details} = bracesTreatmentPlanDetail
  const {
    braces_notes_added,
    appointment_id,
    start_date,
    end_date,
    braces_journey_id,
    amount,
    practice_location_id,
    braces_notes_id,
    notes,
  } = upcoming_appointment_reminder_details ?? {}
  const {dispatchAction} = useDispatchAction()
  const {userId}: any = useContext(AuthContext)
  const {patientId: patient_id} = useParams()
  const [isAddAppointmentModalVisible, setIsAddAppointmentModalVisible] = useState(false)
  const [appointmentCreatedSuccessfullyVisible, setAppointmentCreatedSuccessfullyVisible] =
    useState(false)
  const {data} = useSelector((state: RootState) => state.leadsProfileDetails)

  const [appointmentSuccessResponse, setAppointmentSuccessResponse] = useState<{
    reminder_id: number
    braces_journey_id?: number | null
    is_tracking_added: boolean
    start_date: string
    end_date: string
    patient_id: number
  } | null>(null)

  const toggleAddAppointmentModal = (value: boolean) => {
    setIsAddAppointmentModalVisible(value)
  }

  const {getBracesNotesDetailsLoading} = useSelector((state: RootState) => state.bracesNotes)
  const navigate = useNavigate()
  const goToViewAppointment = () => {
    if (!braces_notes_id || !patient_id || !braces_journey_id) return
    dispatchAction(
      getBracesNotesDetails({
        appointment_id: braces_notes_id.toString() ?? '',
      })
    )
      .unwrap()
      .then((res: any) => {
        const emptyJawTypes = {
          jaw_type: '',
          treatment_stage_type: '',
          shape: '',
          material_name: '',
          material_size: '',
          space_enclosure_tools: [],
          accessories: [],
          note: '',
          input_material_name: '',
          input_material_size: '',
          input_space_enclosure_tools: '',
          input_accessories: '',
        }

        const createJawDetails = (jaw: {
          note: string
          jaw_type: string
          treatment_stage_type: string
          shape: string
          material_name: string
          material_size: string
          space_enclosure_tools: string
          accessories: string
        }) => ({
          jaw_type: jaw.jaw_type,
          treatment_stage_type: jaw.treatment_stage_type,
          shape: jaw.shape,
          material_name: jaw.material_name,
          material_size: jaw.material_size,
          space_enclosure_tools: jaw.space_enclosure_tools,
          accessories: jaw.accessories,
          note: jaw.note,
          input_material_name: '',
          input_material_size: '',
          input_space_enclosure_tools: '',
          input_accessories: '',
        })

        const bothJaw = res.jaws.find(
          (jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.BOTH
        )
        const upperJaw = res.jaws.find(
          (jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.UPPER
        )
        const lowerJaw =
          res.jaws.length === 2
            ? res.jaws.find((jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.LOWER)
            : null

        const bothJawsDetails = bothJaw ? createJawDetails(bothJaw) : emptyJawTypes
        const upperJawsDetails = upperJaw ? createJawDetails(upperJaw) : emptyJawTypes
        const lowerJawsDetails = lowerJaw ? createJawDetails(lowerJaw) : emptyJawTypes

        const getAppointmentDetailsData = {
          braces_journey_id: safeParseInt(braces_journey_id),
          amount: 0,
          status: res.status,
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patient_id),
          reminder_id: safeParseInt(res.reminder_details?.reminder_id),
          start_date: res?.current_appointment_date,
          end_date: res?.end_date,
          product_type_name: productTypes.BRACES,
          jaw_main_type:
            res.jaws[0].jaw_type === appointmentJawTypes.BOTH
              ? appointmentJawTypes.BOTH
              : appointmentJawTypes.SEPARATE,
          both: bothJawsDetails,
          upper: upperJawsDetails,
          lower: lowerJawsDetails,
          files: res.files,
          draft_files: res.draft_files,
        }

        dispatchAction(setAppointmentDetails(getAppointmentDetailsData))

        if (res.status === treatmentPlanStatusConstants.ACTIVE) {
          const queryParams = new URLSearchParams({
            appointmentId: braces_notes_id.toString(),
            new: 'false',
            isEditAppointment: 'false',
          }).toString()
          navigate(
            `/profile/${patient_id}/bracesNotes/${braces_journey_id}/viewNotes?${queryParams}`
          )
        } else {
          const queryParams = new URLSearchParams({
            appointmentId: braces_notes_id.toString(),
            new: 'false',
          }).toString()
          navigate(
            `/profile/${patient_id}/bracesNotes/${braces_journey_id}/attachNotes?${queryParams}`
          )
        }
      })
      .catch(() => {})
  }
  const formattedStartDate = upcoming_appointment_reminder_details?.start_date
    ? dayjs(upcoming_appointment_reminder_details?.start_date).format('DD MMMM YYYY, hh:mm A')
    : null
  const formattedEndDate = upcoming_appointment_reminder_details?.end_date
    ? dayjs(upcoming_appointment_reminder_details.end_date).format('hh:mm A')
    : null

  const isTodayAppointment =
    moment(upcoming_appointment_reminder_details?.start_date).format('DD-MMM-YYYY') ===
    moment().format('DD-MMM-YYYY')
  return (
    <div className='w-full h-auto p-4 bg-white rounded-lg border border-zinc-300 flex-col justify-start items-start gap-3 inline-flex text-textColor font-medium text-sm'>
      <p>Upcoming appointment</p>
      <div className='flex gap-3 w-full '>
        <div className='flex flex-col md:flex-row gap-3 w-full justify-between'>
          <div className='flex gap-3'>
            <div className='w-12 h-12 pt-1 pl-2 bg-secondarySupport rounded justify-center items-center gap-2.5 inline-flex'>
              <CalendarIcon height='24' width='24' color={getColorPalette().secondaryColor} />
            </div>
            <div className='flex flex-col'>
              <p>Date</p>
              <p className='font-semibold'>
                {hasValue(formattedStartDate)
                  ? `${formattedStartDate} ${
                      hasValue(formattedEndDate) ? `- ${formattedEndDate}` : null
                    }`
                  : 'No upcoming appointments'}
              </p>
            </div>
          </div>
          {/* Amount field removed for braces */}
          <div className='flex gap-1 md:hidden'>
            <p className='text-black '>Notes:</p>
            <div className='break-all text-wrap'>
              {hasValue(upcoming_appointment_reminder_details?.notes)
                ? upcoming_appointment_reminder_details.notes
                : 'No notes added'}
            </div>
          </div>
          <div className='flex flex-col md:flex-row justify-between gap-3 md:w-fit w-full'>
            <When isTrue={hasValue(appointment_id)}>
              <AntdButton
                text={
                  <div className='flex  items-center  justify items gap-2 font-semibold'>
                    <AttachmentIcon color='#735bf2' />
                    {braces_notes_added ? 'View braces notes' : 'Attach braces notes'}
                  </div>
                }
                loading={getBracesNotesDetailsLoading}
                className={cn(
                  'rounded-lg !px-3 !py-4 flex  items-center  justify items gap-2 text-sm  bg-primarySupport hover:!bg-primarySupport text-primaryColor hover:!text-primaryColor border border-primaryColor'
                )}
                onClick={() => {
                  if (braces_notes_added) {
                    goToViewAppointment()
                  } else if (
                    start_date &&
                    braces_journey_id &&
                    patient_id &&
                    end_date &&
                    appointment_id
                  ) {
                    dispatchAction(setAppointmentDetails({}))
                    const queryParams = new URLSearchParams({
                      startDate: start_date.toString(),
                      endDate: end_date.toString(),
                      reminderId: appointment_id.toString(),
                    }).toString()
                    navigate(
                      `/profile/${patient_id}/bracesNotes/${braces_journey_id}/attachNotes?${queryParams}`
                    )
                  }
                }}
              />
            </When>
            <When isTrue={!isTodayAppointment}>
              <AntdButton
                text={
                  <div className='flex  items-center  justify items gap-2 font-semibold'>
                    {!appointment_id ? (
                      <PlusIcon color='#735bf2' />
                    ) : (
                      <EditAppointmentIcon color='#735bf2' />
                    )}
                    {!appointment_id ? 'Add appointment' : 'Edit appointment'}
                  </div>
                }
                className={cn(
                  'rounded-lg !px-3 !py-4 flex  items-center  justify items gap-2 text-sm  bg-primarySupport hover:!bg-primarySupport text-primaryColor hover:!text-primaryColor border border-primaryColor'
                )}
                onClick={() => {
                  toggleAddAppointmentModal(true)
                }}
              />
            </When>
          </div>
        </div>
      </div>
      {/* Amount field removed for braces */}
      <div className='md:flex gap-1 hidden '>
        <p className='text-black '>Notes:</p>
        <p className='break-all'>
          {hasValue(upcoming_appointment_reminder_details?.notes)
            ? upcoming_appointment_reminder_details.notes
            : 'No notes added'}
        </p>
      </div>
      <AddAppointmentModal
        {...{
          isModalVisible: isAddAppointmentModalVisible,
          toggleModal: toggleAddAppointmentModal,
          setAppointmentCreatedSuccessfullyVisible,
          isOnAppointmentsPage: true,
          isOnBracesOverviewPage: true,
          setAppointmentSuccessResponse,
          practiceLocationId: data.patient_details.practice_location_id ?? undefined,
        }}
        {...(appointment_id && {
          editAppointmentDetails: {
            appointment_id,
            start_date,
            end_date,
            amount,
            practice_location_id,
            notes,
          },
        })}
      />
      <AppointmentCreatedSuccessfully
        {...{
          visible: appointmentCreatedSuccessfullyVisible,
          setQuitModalVisible: setAppointmentCreatedSuccessfullyVisible,
          bracesJourneyId: appointmentSuccessResponse?.braces_journey_id,
          onClose: () => {
            if (patient_id && userId) {
              dispatchAction(
                getBracesTreatmentPlanList({
                  doctor_id: String(userId),
                  patient_id: String(patient_id),
                  braces_treatment_stage: bracesTreatmentStages.ACTIVE,
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
    </div>
  )
}

export default UpcomingAppointmentCard
