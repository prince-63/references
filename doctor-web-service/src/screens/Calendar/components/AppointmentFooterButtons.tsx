import PlusIcon from 'assets/icons/PlusIcon'
import cn from '@utils/cn'
import {useEvent} from './EventContext'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getBracesNotesDetails,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import appointmentJawTypes from '@constants/appointmentJawTypes'
import productTypes from '@constants/productTypes'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {setOpenPopover, setSelectedEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'

const AppointmentFooterButtons = () => {
  const {event} = useEvent()
  const {
    braces_journey_id,
    start_date,
    patient_id,
    end_date,
    is_braces_notes_added,
    appointment_id,
    reminder_id,
  } = event.extendedProps.content.details
  const {dispatchAction} = useDispatchAction()
  const {userId}: any = useContext(AuthContext)

  const {getBracesNotesDetailsLoading} = useSelector((state: RootState) => state.bracesNotes)
  const navigate = useNavigate()
  const goToViewAppointment = () => {
    if (!appointment_id || !patient_id || !braces_journey_id) return
    dispatchAction(
      getBracesNotesDetails({
        appointment_id: appointment_id.toString() ?? '',
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
            appointmentId: appointment_id.toString(),
            new: 'false',
            isEditAppointment: 'false',
          }).toString()
          dispatchAction(setOpenPopover(null))
          dispatchAction(setSelectedEvent(null))
          navigate(
            `/profile/${patient_id}/bracesNotes/${braces_journey_id}/viewNotes?${queryParams}`
          )
        } else {
          const queryParams = new URLSearchParams({
            appointmentId: appointment_id.toString(),
            new: 'false',
          }).toString()
          dispatchAction(setOpenPopover(null))
          dispatchAction(setSelectedEvent(null))
          navigate(
            `/profile/${patient_id}/bracesNotes/${braces_journey_id}/attachNotes?${queryParams}`
          )
        }
      })
      .catch(() => {})
  }

  return (
    <div className='flex gap-3'>
      <When isTrue={hasValue(braces_journey_id)}>
        <AntdButton
          text={
            <div className='flex  items-center   justify items gap-2'>
              {!is_braces_notes_added && <PlusIcon color='white' />}
              {is_braces_notes_added ? 'View braces notes' : 'Attach braces notes'}
              {is_braces_notes_added && (
                <button type='button'>
                  <CaretRightIcon />
                </button>
              )}
            </div>
          }
          loading={getBracesNotesDetailsLoading}
          className={cn(
            'rounded-lg !px-3 !py-5 flex  items-center  justify items gap-2 text-sm  bg-primaryColor text-white '
          )}
          onClick={() => {
            if (is_braces_notes_added) {
              goToViewAppointment()
            } else if (start_date && braces_journey_id && patient_id && end_date && reminder_id) {
              dispatchAction(setAppointmentDetails({}))
              const queryParams = new URLSearchParams({
                startDate: start_date.toString(),
                endDate: end_date.toString(),
                reminderId: reminder_id.toString(),
              }).toString()
              dispatchAction(setOpenPopover(null))
              dispatchAction(setSelectedEvent(null))
              navigate(
                `/profile/${patient_id}/bracesNotes/${braces_journey_id}/attachNotes?${queryParams}`
              )
            }
          }}
        />
      </When>
    </div>
  )
}

export default AppointmentFooterButtons
