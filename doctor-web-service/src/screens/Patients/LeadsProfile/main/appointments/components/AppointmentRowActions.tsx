import appointmentListActionsConstants from '@constants/appointmentListActions.constants'
import appointmentsListActionsList from '@staticData/appointmentsListActionsList'
import cn from '@utils/cn'
import AttachmentIcon from 'assets/icons/AttachmentIcon'
import EditAppointmentIcon from 'assets/icons/EditAppointmentIcon'
import NotesIcon from 'assets/icons/NotesIcon'
import TrashOutline from 'assets/icons/TrashOutline'
import When from 'components/when/When'
import {useContext, useState} from 'react'
import {outletContext, RowDataForAppointmentsList} from '../types/appointments.types'
import {useNavigate, useOutletContext, useParams} from 'react-router-dom'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getBracesNotesDetails,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {safeParseInt} from 'utils/ConstFunctions'
import appointmentJawTypes from '@constants/appointmentJawTypes'
import productTypes from '@constants/productTypes'
import {AuthContext} from 'context/AuthContext'
import {Table} from '@tanstack/react-table'
import hasValue from 'utils/hasValue'
import dayjs from 'dayjs'
import getColorPalette from 'utils/getColorPalette'

const AppointmentRowActions = ({
  setOpenPopover,
  table,
  selectedAppointment,
}: {
  setOpenPopover: (value: boolean) => void
  table?: Table<RowDataForAppointmentsList>
  selectedAppointment: RowDataForAppointmentsList
}) => {
  const [selectedOption, setSelectedOption] = useState<
    keyof typeof appointmentListActionsConstants | null
  >(null)
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {patientId: patient_id} = useParams()
  const {braces_journey_id, braces_notes_id} = selectedAppointment
  const {
    setSelectedAppointmentDetails,
    toggleAddAppointmentFormContainer,
    setIsDeleteModalVisible,
  } = useOutletContext<outletContext>()
  const {userId} = useContext(AuthContext)
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
  return (
    <div className='flex flex-col text-textColor'>
      {appointmentsListActionsList.map((option) => {
        if (
          (option.value === 'ATTACH_BRACES_NOTES' &&
            !hasValue(selectedAppointment.braces_journey_id)) ||
          (option.value === 'EDIT' && dayjs(selectedAppointment.start_date).isBefore(dayjs()))
        ) {
          return null
        }
        return (
          <button
            onMouseEnter={() => {
              setSelectedOption(option.value)
            }}
            key={option.value}
            onClick={() => {
              switch (option.value) {
                case 'ATTACH_BRACES_NOTES':
                  const {start_date, braces_journey_id, end_date, appointment_id} =
                    selectedAppointment
                  if (selectedAppointment.braces_notes_added) {
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
                  break
                case 'VIEW_SUMMARY':
                  navigate(`/summary/${patient_id}`)
                  break
                case 'EDIT':
                  setSelectedAppointmentDetails(selectedAppointment)
                  toggleAddAppointmentFormContainer(true)
                  break
                case 'DELETE_APPOINTMENT':
                  setIsDeleteModalVisible(true)
                  setSelectedAppointmentDetails(selectedAppointment)
                  break
                default:
                  break
              }
              table?.toggleAllRowsSelected(false)
              setOpenPopover(false)
              setSelectedOption(null)
            }}
            type='button'
            className={cn(
              'flex items-center gap-3 p-3 rounded-[4px] font-medium',
              selectedOption === option.value && 'bg-primarySupport text-primaryColor'
            )}
          >
            <When isTrue={option.value === 'ATTACH_BRACES_NOTES'}>
              <AttachmentIcon
                color={selectedOption === option.value ? getColorPalette().primaryColor : '#666666'}
              />
            </When>
            <When isTrue={option.value === 'VIEW_SUMMARY'}>
              <NotesIcon
                color={selectedOption === option.value ? getColorPalette().primaryColor : '#666666'}
              />
            </When>
            <When isTrue={option.value === 'EDIT'}>
              <EditAppointmentIcon
                color={selectedOption === option.value ? getColorPalette().primaryColor : '#666666'}
              />
            </When>
            <When isTrue={option.value === 'DELETE_APPOINTMENT'}>
              <TrashOutline
                color={selectedOption === option.value ? getColorPalette().primaryColor : '#666666'}
              />
            </When>
            {option.value !== 'ATTACH_BRACES_NOTES'
              ? option.label
              : selectedAppointment.braces_notes_added && hasValue(braces_notes_id)
                ? 'View braces notes'
                : 'Attach braces notes'}
          </button>
        )
      })}
    </div>
  )
}

export default AppointmentRowActions
