import {Dispatch, SetStateAction, useContext} from 'react'
import PatientDetails from '../leftPanel/PatientDetails'
import {useNavigate, useParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import leadsPatientStatusType from '@constants/leadsPatientStatusType'
import {identifyUser} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {Dropdown, MenuProps} from 'antd'
import UserGearIcon from 'assets/icons/UserGearIcon'
import NotesOutlineIcon from 'assets/icons/NotesOutlineIcon'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import ChartBarIcon from 'assets/icons/ChartBarIcon'
import PauseOutlineIcon from 'assets/icons/PauseOutlineIcon'
import PlayCircleIcon from 'assets/icons/PlayCircleIcon'
import CalendarPlusIconOutline from 'assets/icons/CalendarPlusIconOutline'
import FastForwardIcon from 'assets/icons/FastForwardIcon'
import trackingTypes from '@constants/trackingTypes'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {ActionItem} from '../leadsProfile.types'
import actionTypes from '@constants/actionTypes'
import FileIcon from 'assets/icons/FileIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {LiaCalendarCheckSolid} from 'react-icons/lia'

interface TopPanelProps {
  setIsModalPatientSettingsOpen: Dispatch<SetStateAction<boolean>>
  handleFilterChange: (option: ActionItem, toggle?: boolean) => void
}

const TopPanel = ({setIsModalPatientSettingsOpen, handleFilterChange}: TopPanelProps) => {
  const {profileId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {data: patientData} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patient_status = patientData?.patient_details?.status
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData.patient_details)
  const {isPractice, isOrganization, isStarterPlanUser, isAlignerCompanyOrg} = useAllUserPlan()
  const {caseInformationOriginal: caseInformation, dataLeadsOverview} = useSelector(
    (state: RootState) => state.leadsProfile
  )
  const {data: dataTreatmentPlan}: any = useSelector((state: RootState) => state.apiTreatmentPlan)
  const isAccessibleActionButton = isOrganization || isStarterPlanUser || isPractice
  const treatmentDetail = dataTreatmentPlan?.aligner_journeys[0]
  const progressStatus = treatmentDetail?.progress_status
  const treatmentCompleteDate =
    dataTreatmentPlan?.aligner_journeys[0]?.doctor_treatment_complete_date

  const isDeactivated = progressStatus === 'DEACTIVATED'
  const trackingStatus =
    patientData?.getting_started_details?.tracking_status ||
    dataLeadsOverview?.tracking?.status ||
    dataLeadsOverview?.treatment_plan?.patient_tracking_status ||
    null
  const isTrackingStatusActive = trackingStatus === 'ACTIVE'
  const handleActionOnClick = (option: ActionItem) => {
    handleFilterChange(option, true)
  }

  const quickActionsMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <UserGearIcon />
          View patient settings
        </span>
      ),
      onClick: () => setIsModalPatientSettingsOpen(true),
      hidden: patientAssignedTo === 'ASSIGNED_TO_PRACTICE',
    },
    {
      key: 'caseInfo',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <NotesOutlineIcon />
          Case Information
        </span>
      ),
      onClick: () => {
        identifyUser()
        if (hasValue(caseInformation.metadata)) {
          const queryParams = new URLSearchParams({
            new: 'false',
          }).toString()
          navigate(`/leads-profile/${patientId}/case-information-details?` + queryParams)
        } else {
          navigate(`/leads-profile/${patientId}/add-case-information-details`)
        }
      },
      disabled: patient_status === leadsPatientStatusType.ARCHIVE,
      hidden: !(patientAssignedTo === 'ASSIGNED_TO_ME' && !isPractice),
    },
    {
      key: 'summary',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <ClipBoardIcon />
          View treatment summary
        </span>
      ),
      onClick: () => {
        navigate(`/summary/${patientId}`)
        identifyUser()
      },
      hidden: !(patientAssignedTo === 'ASSIGNED_TO_ME'),
    },
    {
      key: 'wearStats',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <ChartBarIcon />
          Aligner wear stats
        </span>
      ),
      onClick: () => {
        navigate(
          `/leads-profile/${patientId}/${dataLeadsOverview?.treatment_plan?.journey_id}/wear-stats`
        )
        identifyUser()
      },
      hidden:
        dataLeadsOverview?.tracking?.type !== trackingTypes.PATIENTAPP &&
        hasValue(treatmentCompleteDate),
    },
    // {
    //   key: 'activityLogs',
    //   label: (
    //     <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
    //       <ProductionIcon />
    //       View activity logs
    //     </span>
    //   ),
    //   onClick: () => {
    //     handleActionOnClick(actionTypes.VIEW_LOGS)
    //   },
    //   hidden: !isAccessible && !isPractice && !isAlignerCompanyOrg,
    // },
    {
      key: 'pauseTreatment',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <PauseOutlineIcon />
          Pause treatment
        </span>
      ),
      onClick: () => handleActionOnClick(actionTypes.PAUSE_TREATMENT),
      hidden: !(
        isAccessibleActionButton &&
        dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
          treatmentPlanStatusConstants.ACTIVE &&
        patientAssignedTo !== 'ASSIGNED_TO_PRACTICE' &&
        !isOrganization &&
        !isDeactivated
      ),
    },
    {
      key: 'resumeTreatment',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <PlayCircleIcon />
          Resume treatment
        </span>
      ),
      onClick: () => handleActionOnClick(actionTypes.RESUME_TREATMENT),
      hidden: !(
        isAccessibleActionButton &&
        dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
          treatmentPlanStatusConstants.PAUSED &&
        !isOrganization &&
        !isDeactivated
      ),
    },
    {
      key: 'extendWearDays',
      onClick: () => {
        handleFilterChange(actionTypes.EXTEND_WEAR_DAYS, true)
        identifyUser()
      },
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <CalendarPlusIconOutline />
          Update wear days for all aligners
        </span>
      ),
      hidden: !((isStarterPlanUser || isPractice) && isTrackingStatusActive && !isDeactivated),
    },
    {
      key: 'manualAlignerChange',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <FastForwardIcon />
          Manual aligner change
        </span>
      ),
      onClick: () => {
        handleActionOnClick(actionTypes.FORCE_CHANGE_ALIGNER)
        identifyUser()
      },
      disabled:
        dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
        treatmentPlanStatusConstants.PAUSED,
      hidden: !(
        dataLeadsOverview?.tracking?.type === trackingTypes.PATIENTAPP &&
        patientAssignedTo !== 'ASSIGNED_TO_PRACTICE' &&
        !isDeactivated &&
        !isOrganization
      ),
    },
    {
      key: 'caseRecords',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <FileIcon color='#666666' />
          Case records
        </span>
      ),
      onClick: () => {
        navigate(`/case-records/${patientId}`)
        identifyUser()
      },

      hidden: !(isAlignerCompanyOrg || isPractice),
    },
    {
      key: 'completeTreatment',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <LiaCalendarCheckSolid size={20} />
          Complete Treatment
        </span>
      ),
      onClick: () => handleActionOnClick(actionTypes.COMPLETE_TREATMENT),
      hidden: !(
        isAccessibleActionButton &&
        dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
          treatmentPlanStatusConstants.ACTIVE &&
        patientAssignedTo !== 'ASSIGNED_TO_PRACTICE' &&
        !isDeactivated
      ),
    },
  ].filter((item) => !item.hidden)

  return (
    <div className='md:hidden'>
      <PatientDetails />
      <div className='w-full mt-4 flex flex-col items-stretch'>
        <Dropdown menu={{items: quickActionsMenuItems}} trigger={['click']} placement='bottomLeft'>
          <div className='border border-mediumGray rounded-md px-4 py-2 bg-white cursor-pointer flex items-center justify-between w-full'>
            <span className='text-base font-medium'>Quick actions</span>
            <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
              <path
                d='M7 10l5 5 5-5'
                stroke='#333'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}

export default TopPanel
