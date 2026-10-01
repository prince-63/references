import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import {AppointmentListData} from '../types/appointments.types'
import Tag from 'components/tags/Tag'
import {getFirstLetterCapitalOfWord, safeParseInt} from 'utils/ConstFunctions'
import bracesTreatmentStages from '@constants/bracesTreatmentStages'
import {useNavigate, useParams} from 'react-router-dom'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getBracesNotesDetails,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import appointmentJawTypes from '@constants/appointmentJawTypes'
import productTypes from '@constants/productTypes'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import processAppointmentListItem from '../utils/processAppointmentListItem'
import dayjs from 'dayjs'
import JawDetailsForBracesNotesListItem from '../../bracesNotes/components/JawDetailsForBracesNotesListItem'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import cn from '@utils/cn'
interface props {
  item: AppointmentListData
  setIsAppointmentDeleted: any
}

export const BracesNotesCard = (props: props) => {
  const {item} = props
  const {userId}: any = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  const {patientId, bracesJourneyId} = useParams()
  const {upperJaw, lowerJaw} = processAppointmentListItem(item)
  const jawType = upperJaw?.jaw_type === 'BOTH' ? 'Both' : 'Separate'
  const goToViewAppointment = () => {
    dispatchAction(
      getBracesNotesDetails({
        appointment_id: item.appointment_id.toString() ?? '',
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
          braces_journey_id: safeParseInt(bracesJourneyId),
          amount: 0,
          status: res.status,
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patientId),
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
            appointmentId: item.appointment_id.toString(),
            new: 'false',
            isEditAppointment: 'false',
          }).toString()

          navigation(
            `/profile/${patientId}/bracesNotes/${bracesJourneyId}/viewNotes?${queryParams}`
          )
        } else {
          const queryParams = new URLSearchParams({
            appointmentId: item.appointment_id.toString(),
            new: 'false',
          }).toString()
          navigation(
            `/profile/${patientId}/bracesNotes/${bracesJourneyId}/attachNotes?${queryParams}`
          )
        }
      })
      .catch(() => {})
  }

  // const postDeleteAppointmentItem = (item: any) => {
  //   dispatchAction(
  //     postDeleteAppointment({
  //       appointment_id: safeParseInt(item.appointment_id),
  //     })
  //   )
  //     .unwrap()
  //     .then(() => {
  //       SuccessToast('Appointment deleted successfully!')
  //       setIsAppointmentDeleted(true)
  //     })
  //     .catch((error: any) => {
  //       eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
  //     })
  // }
  const formattedStartDate = dayjs(item.start_date).format('DD MMMM YYYY')
  return (
    <div className='flex flex-col my-3 cursor-pointer' onClick={() => goToViewAppointment()}>
      <div className='w-full md:h-20 md:pl-5 md:pr-4 p-4 rounded-lg border border-neutral-200 md:justify-between md:items-center flex  md:flex-row flex-col '>
        <div className='flex flex-row gap-2 flex-[10] md:border-none md:pb-0 pb-3 border-b border-lightGray items-center'>
          <div className='text-black/opacity-20 text-base font-semibold leading-normal'>
            {formattedStartDate}
          </div>
          <div>
            {item.status === bracesTreatmentStages.UPCOMING ? (
              <Tag
                value={getFirstLetterCapitalOfWord(bracesTreatmentStages.UPCOMING)}
                className='text-xs bg-primarySupport text-primaryColor'
              />
            ) : item.status === bracesTreatmentStages.DRAFT ? (
              <Tag
                value={getFirstLetterCapitalOfWord(bracesTreatmentStages.DRAFT)}
                className='text-xs bg-secondarySupport text-secondaryColor'
              />
            ) : null}
          </div>
          <div className='flex-1 flex items-center justify-end md:hidden gap-3'>
            <Tag
              value={jawType}
              className={cn(
                'border border-lighterGray',
                jawType === 'Both'
                  ? 'bg-orangeSupport text-orange'
                  : 'bg-secondarySupport text-secondaryColor'
              )}
            />
            <button type='button' onClick={() => goToViewAppointment()}>
              <CaretRightIcon color='#666666' />
            </button>
          </div>
        </div>
        <div className='flex flex-col gap-2 mt-2'>
          <div className='flex flex-col gap-2 border-b border-lightGray pb-2'>
            <p className='text-xs text-textColor font-medium '>UPPER JAW DETAILS</p>
            <JawDetailsForBracesNotesListItem {...{item: upperJaw}} />
          </div>
          <div className='flex flex-col gap-2'>
            <p className='text-xs text-textColor font-medium '>LOWER JAW DETAILS</p>
            <JawDetailsForBracesNotesListItem {...{item: lowerJaw}} />
          </div>
        </div>
        <div className='flex-[0.1] items-center justify-center md:flex hidden'>
          <div
            className='w-8 h-8 bg-primarySupport rounded-2xl justify-center items-center gap-2 inline-flex cursor-pointer'
            onClick={() => goToViewAppointment()}
          >
            <CommonSVG svg={SVG_EXPAND_RIGHT} height='15' width='15' />
          </div>
        </div>
      </div>
    </div>
  )
}
