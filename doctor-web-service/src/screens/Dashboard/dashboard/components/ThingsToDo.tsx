import {ReactNode, useContext, useState} from 'react'
import DashboardCard from './DashboardCard'
import ToDoIcon from 'assets/icons/ToDoIcon'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_DASHBOARD_EMPTY_STATE} from 'utils/ImageConst'
import FilterNavBar from './FilterNavBar'
import thingsToDOFilterOption from '../constants/thingsToDOFilterOption'
import useFilter from '@hooks/useFilter'
import thingsToDoTypes from '../types/thingsToDo.types'
import InfoIcon from 'assets/icons/InfoIcon'
import CrossIcon from 'assets/icons/CrossIcon'
import hasValue from 'utils/hasValue'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import When from 'components/when/When'
import {formatDateForFewMonths, safeParseInt} from 'utils/ConstFunctions'
import Tag from 'components/tags/Tag'
import {
  ThingsToPatient,
  postDismissEvent,
} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import useDispatchAction from '@hooks/useDispatchAction'
import alertType from '@constants/alertType'
import {eventEmitter} from '@utils/eventEmitter'
import {AxiosError} from 'axios'
import {useNavigate} from 'react-router-dom'
import {ThingsToDoFilterOptionsRecord} from '../types/thingsToDoList.type'
import RightArrowIcon from 'assets/icons/RightArrowIcon'
import {AuthContext} from 'context/AuthContext'
import getColorPalette from 'utils/getColorPalette'
import {getStorageType} from 'utils/storage'
import useProfileBasePath from '@hooks/useProfileBasePath'

interface props {
  tableData: ThingsToDoFilterOptionsRecord
  getThingsToDoPatients: () => void
}

const ThingsToDo = (props: props) => {
  const {tableData, getThingsToDoPatients} = props
  const {dispatchAction} = useDispatchAction()
  type ThingsToDoFilterOption = (typeof thingsToDOFilterOption)[number]
  const {filter, handleFilterChange} = useFilter<ThingsToDoFilterOption>(thingsToDOFilterOption)
  const {userId} = useContext(AuthContext)

  const callDismissEvent = (actionId: number) => {
    const postData = {
      actions_ids: [actionId],
      doctor_id: safeParseInt(userId),
    }
    dispatchAction(postDismissEvent(postData) as any)
      .unwrap()
      .then(() => {
        getThingsToDoPatients()
      })
      .catch((error: AxiosError) => {
        eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
      })
  }

  const [isShowInfoCard, setIsShowInfoCard] = useState(
    getStorageType().getItem('things_to_do_info') !== 'true'
  )

  const removeNotification = () => {
    setIsShowInfoCard(false)
    getStorageType().setItem('things_to_do_info', 'true')
  }

  const thingsToDoPatientList =
    tableData[
      getActiveFilter<ThingsToDoFilterOption>({
        filter,
      })
    ]
  return (
    <DashboardCard icon={<ToDoIcon />} title='Things to do '>
      <div className='w-full h-full'>
        <FilterNavBar
          {...{
            filterOptions: thingsToDOFilterOption,
            filter,
            handleFilterChange,
            tableData,
          }}
        />

        <When isTrue={!hasValue(thingsToDoPatientList)}>
          <EmptyState />
        </When>
        <When isTrue={hasValue(thingsToDoPatientList)}>
          <div className='h-[420px] overflow-auto'>
            <When isTrue={isShowInfoCard}>
              <div className='pt-3'>
                <DashboardInfoCard
                  content='Review various updates reported by your patients and provide feedback'
                  onClick={removeNotification}
                />
              </div>
            </When>
            {thingsToDoPatientList.map((patientData: ThingsToPatient, index: number) => (
              <div className='mt-3' key={index}>
                <PatientCard patientData={patientData} callDismissEvent={callDismissEvent} />
              </div>
            ))}{' '}
          </div>
        </When>
      </div>
    </DashboardCard>
  )
}
export default ThingsToDo

export const DashboardInfoCard = ({
  content,
  onClick,
  infoIconColor = getColorPalette().primaryColor,
}: {
  content?: ReactNode
  onClick?: () => void
  infoIconColor?: string
}) => {
  return (
    <div className='flex gap-3 items-center justify-between bg-primarySupport border border-mediumGray p-4 rounded-lg'>
      <div className='flex gap-3 '>
        <InfoIcon color={infoIconColor} height='17' width='18' />
        <div className='text-primaryColor font-medium text-[12px]'>{content}</div>
      </div>
      <button className='' onClick={onClick}>
        <CrossIcon />
      </button>
    </div>
  )
}

interface PatientCardProps {
  patientData: ThingsToPatient
  callDismissEvent: (action_id: number) => void
}

const PatientCard: React.FC<PatientCardProps> = ({patientData, callDismissEvent}) => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()

  const trimPatientName = (name: string) => {
    if (!name) return ''
    return name.length > 15 ? `${name.substring(0, 15)}...` : name
  }

  return (
    <div className='rounded-lg w-full px-4 py-6 border border-mediumGray flex justify-between items-center'>
      <div className='flex gap-2'>
        <div>
          {patientData?.patient_profile !== null ? (
            <Image
              className='min-w-11 h-11 object-cover rounded-full'
              src={patientData?.patient_profile}
            />
          ) : (
            <DefaultImage letter={patientData?.patient_name?.charAt(0)} />
          )}
        </div>
        <div className='w-full flex flex-col'>
          <div className='w-full flex md:flex-row flex-col md:gap-2'>
            <div className='w-full font-semibold text-[16px]'>
              {trimPatientName(patientData?.patient_name)}
              <span>
                {patientData?.action_type === thingsToDoTypes.ALIGNER_CHANGE &&
                  ' made an aligner change'}
                {patientData?.action_type === thingsToDoTypes.CHECK_IN &&
                  ' filled an aligner check-in'}
                {patientData?.action_type === thingsToDoTypes.ISSUE_REPORT &&
                  ' reported an issue with their aligner'}
              </span>
            </div>
            <When isTrue={patientData?.category === 'CRITICAL'}>
              <Tag
                value={'CRITICAL'}
                className='bg-redSupport text-red h-[22px] text-[12px] px-[10px] w-fit'
              />
            </When>
          </div>
          <div className='font-medium text-[12px] text-textColor'>
            {formatDateForFewMonths(patientData?.performed_at)}
          </div>
        </div>
      </div>
      <div className='flex gap-2'>
        <button
          className='font-semibold text-[12px] text-textColor px-2 py-1  hide-on-mobile'
          onClick={() => {
            callDismissEvent(patientData?.action_id)
          }}
        >
          Dismiss
        </button>
        <button
          className='z-5 font-semibold text-[12px] text-textColor md:border-[0.5px] md:border-mediumGray px-2 py-1 rounded-[4px] flex items-center gap-1'
          onClick={() => {
            navigate(`${profileBasePath}/${patientData.patient_id}`)
          }}
        >
          View
          <div className='md:hidden'>
            <RightArrowIcon color='#666666' />
          </div>
        </button>
      </div>
    </div>
  )
}

const EmptyState = () => {
  return (
    <CommonEmptyState
      image={IMAGE_DASHBOARD_EMPTY_STATE}
      boxStyle='w-full h-full justify-center items-center'
      imageStyle='w-[138px] h-[134]'
      title='No tasks remaining'
      titleStyle=' text-textColor font-semibold text-[16px] mt-4 text-center'
      subTitle='Looks like you are all clear for now. We will notify you once something comes up'
      subTitleStyle='md:w-[325px] w-full text-textColor font-medium text-[14px]  text-center'
    />
  )
}
