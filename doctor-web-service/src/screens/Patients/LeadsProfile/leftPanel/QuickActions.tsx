import leadsPatientStatusType from '@constants/leadsPatientStatusType'
import clsx from 'clsx'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {AuthContext} from 'context/AuthContext'
import {useNavigate} from 'context/CustomNavigationContext'
import React, {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import {identifyUser} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import useDispatchAction from '@hooks/useDispatchAction'
import {setCaseInformation} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {caseInfoEmptyData} from '../main/caseInformation/AddCaseInformation'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'

import ChartBarIcon from 'assets/icons/ChartBarIcon'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import trackingTypes from '@constants/trackingTypes'
import FastForwardIcon from 'assets/icons/FastForwardIcon'
import moment from 'moment'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {ActionItem} from '../leadsProfile.types'
import ForceAlignerChange from '../main/alignersTracking/actionModals/ForceAlignerChange'
import actionTypes from '@constants/actionTypes'
import ModalViewForceAlignerChange from '../main/alignersTracking/actionModals/components/ModalViewForceAlignerChange'
import CalendarPlusIconOutline from 'assets/icons/CalendarPlusIconOutline'
import UserGearIcon from 'assets/icons/UserGearIcon'
import NotesOutlineIcon from 'assets/icons/NotesOutlineIcon'
import ModalProductionLogs from 'components/modal/PatientProfile/Tabs/TreatmentPlan/ModalProductionLogs'
import PauseOutlineIcon from 'assets/icons/PauseOutlineIcon'
import PauseTreatment from '../main/alignersTracking/actionModals/PauseTreatment'
import PlayCircleIcon from 'assets/icons/PlayCircleIcon'
import ResumeTreatment from '../main/alignersTracking/actionModals/ResumeTreatment'
import {ReactComponent as FileIcon} from 'assets/icons/File.svg'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {PatientProfileQuickActionsPermissions} from 'screens/AccessControl/AccessControlList/types/accessControls.types'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {LiaCalendarCheckSolid} from 'react-icons/lia'

const QuickActionItem = ({
  svg,
  text,
  onClick,
  status,
  Icon,
}: {
  svg?: any
  Icon?: React.ReactNode
  onClick: () => void
  text: string
  status: 'DISABLED' | 'ENABLED' | 'NONE'
}) => {
  return (
    <div
      className={clsx(
        'flex gap-2 items-center',
        status === 'DISABLED' ? 'opacity-50 cursor-default' : 'cursor-pointer'
      )}
      onClick={status !== 'DISABLED' ? onClick : undefined}
    >
      {svg && <CommonSVG svg={svg} height='24' width='24' />}
      {Icon && <>{Icon}</>}
      <div className='text-black text-base font-medium truncate'>{text}</div>
    </div>
  )
}

interface QuickActionsProps {
  setIsModalPatientSettingsOpen: Dispatch<SetStateAction<boolean>>
  activeAction: any
  handleFilterChange: (option: ActionItem, toggle?: boolean) => void
}

const QuickActions = ({
  setIsModalPatientSettingsOpen,
  activeAction,
  handleFilterChange,
}: QuickActionsProps) => {
  const {profileId} = useContext(AuthContext)
  const {data: patientData} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {permissionChecks} = useFeatureAccess()
  const quickActionsPermission = permissionChecks?.patientProfileQuickActions
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData?.patient_details)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {navigate} = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {isStarterPlanUser, isGrowthPlanUser} = useAllUserPlan()
  const patient_status = patientData.patient_details?.status
  const {caseInformationOriginal: caseInformation, dataLeadsOverview} = useSelector(
    (state: RootState) => state.leadsProfile
  )
  const trackingStatus =
    patientData?.getting_started_details?.tracking_status ||
    dataLeadsOverview?.tracking?.status ||
    dataLeadsOverview?.treatment_plan?.patient_tracking_status ||
    null
  const isTrackingStatusActive = trackingStatus === 'ACTIVE'
  const alignerJourneyId = dataLeadsOverview?.treatment_plan?.journey_id

  const [forceAlignerDisabled, setForceAlignerDisabled] = useState(false)
  const {loading: loadingTreatmentPlan, data: dataTreatmentPlan}: any = useSelector(
    (state: RootState) => state.apiTreatmentPlan
  )
  useEffect(() => {
    if (!loadingTreatmentPlan && hasValue(dataTreatmentPlan?.aligner_journeys?.[0])) {
      const alignerJourneyData: any = dataTreatmentPlan?.aligner_journeys?.[0]
      alignerJourneyData?.aligners?.forEach((aligner: any) => {
        if (aligner.sr_no === alignerJourneyData.current_aligner_no) {
          setForceAlignerDisabled(aligner?.start_date === moment().format('YYYY-MM-DD'))
        }
      })
    }
  }, [dataTreatmentPlan])
  const treatmentDetail = dataTreatmentPlan?.aligner_journeys[0]
  const progressStatus = treatmentDetail?.progress_status
  const isDeactivated = progressStatus === 'DEACTIVATED'

  // Provide a handleOnClose function for modals
  const handleOnClose = (option: ActionItem) => {
    handleFilterChange(option, true)
  }

  const hasAnyPermissionTrue = (
    obj: PatientProfileQuickActionsPermissions | undefined
  ): boolean => {
    return obj
      ? Object.values(obj).some((perm) => Object.values(perm).some((flag) => flag === true))
      : false
  }

  const isQuickActionsShow = hasAnyPermissionTrue(quickActionsPermission)
  return (
    <When isTrue={isQuickActionsShow}>
      <div className='border border-mediumGray rounded-lg  p-5 flex flex-col'>
        <div className='flex-[1] text-textColor font-semibold text-lg mb-2'>Quick Actions</div>
        <div className='flex flex-col gap-4'>
          <QuickActionItem
            Icon={<UserGearIcon />}
            text='View patient settings'
            status='NONE'
            onClick={() => setIsModalPatientSettingsOpen(true)}
          />
          <When isTrue={!isStarterPlanUser && !isGrowthPlanUser}>
            <QuickActionItem
              Icon={<FileIcon />}
              text='Case records'
              status='NONE'
              onClick={() => {
                navigate(`/case-records/${patientId}`)
                identifyUser()
              }}
            />
          </When>
          <QuickActionItem
            Icon={<NotesOutlineIcon />}
            text={'Case Information'}
            onClick={() => {
              identifyUser()

              if (hasValue(caseInformation.metadata)) {
                const queryParams = new URLSearchParams({
                  new: 'false',
                }).toString()
                navigate(`${profileBasePath}/${patientId}/details/case-files?` + queryParams)
              } else {
                dispatchAction(setCaseInformation(caseInfoEmptyData))
                navigate(`${profileBasePath}/${patientId}/details/case-files`)
              }
            }}
            status={patient_status === leadsPatientStatusType.ARCHIVE ? 'DISABLED' : 'NONE'}
          />
          <When isTrue={patientAssignedTo === 'ASSIGNED_TO_ME'}>
            <QuickActionItem
              Icon={<ClipBoardIcon />}
              text='View treatment summary'
              onClick={() => {
                if (isStarterPlanUser) {
                  navigate(`/summary/${patientId}`)
                } else {
                  navigate(`${profileBasePath}/${patientId}}/view-plan/${alignerJourneyId}`)
                }
                identifyUser()
              }}
              status='NONE'
            />
          </When>
          <When
            isTrue={
              dataLeadsOverview?.tracking?.type === trackingTypes.PATIENTAPP &&
              quickActionsPermission?.alignerWearStats?.isViewable
            }
          >
            <QuickActionItem
              Icon={<ChartBarIcon />}
              text='Aligner wear stats'
              onClick={() => {
                navigate(
                  `${profileBasePath}/${patientId}/aligner-tracking/${alignerJourneyId}/wear-stats`
                )
                identifyUser()
              }}
              status='NONE'
            />
          </When>
          <When
            isTrue={
              quickActionsPermission?.pauseResumeTreatment?.isViewable &&
              dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
                treatmentPlanStatusConstants.ACTIVE &&
              !isDeactivated
            }
          >
            <QuickActionItem
              Icon={<PauseOutlineIcon />}
              text='Pause treatment'
              onClick={() => handleFilterChange(actionTypes.PAUSE_TREATMENT)}
              status='NONE'
            />
          </When>
          <When
            isTrue={
              quickActionsPermission?.pauseResumeTreatment?.isViewable &&
              dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
                treatmentPlanStatusConstants.PAUSED &&
              !isDeactivated
            }
          >
            <QuickActionItem
              Icon={<PlayCircleIcon />}
              text='Resume treatment'
              onClick={() => handleFilterChange(actionTypes.RESUME_TREATMENT)}
              status='NONE'
            />
          </When>
          <When
            isTrue={
              quickActionsPermission?.updateWearDaysForAllAligners?.isViewable &&
              isTrackingStatusActive &&
              !isDeactivated
            }
          >
            <QuickActionItem
              Icon={<CalendarPlusIconOutline />}
              text='Update wear days for all aligners'
              onClick={() => {
                navigate(`${profileBasePath}/${patientId}`)
                handleFilterChange(actionTypes.EXTEND_WEAR_DAYS, true)
                identifyUser()
              }}
              status='NONE'
            />
          </When>
          <When
            isTrue={
              dataLeadsOverview?.tracking?.type === trackingTypes.PATIENTAPP &&
              quickActionsPermission?.manualAlignerChange?.isViewable
            }
          >
            <QuickActionItem
              Icon={<FastForwardIcon />}
              text={'Manual aligner change'}
              onClick={() => {
                handleFilterChange(actionTypes.FORCE_CHANGE_ALIGNER)
                identifyUser()
              }}
              status={
                dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
                  treatmentPlanStatusConstants.PAUSED || forceAlignerDisabled
                  ? 'DISABLED'
                  : 'NONE'
              }
            />
          </When>
          <When isTrue={activeAction.FORCE_CHANGE_ALIGNER}>
            <ForceAlignerChange
              handleOnClose={handleOnClose}
              handleActionOnClick={handleFilterChange}
            />
          </When>
          <When
            isTrue={
              dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
                treatmentPlanStatusConstants.ACTIVE &&
              patientAssignedTo !== 'ASSIGNED_TO_PRACTICE' &&
              !isDeactivated
            }
          >
            <QuickActionItem
              Icon={<LiaCalendarCheckSolid size={20} color='#666666' />}
              text='Complete treatment'
              onClick={() => handleFilterChange(actionTypes.COMPLETE_TREATMENT)}
              status='NONE'
            />
          </When>{' '}
        </div>
        <When isTrue={activeAction.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL}>
          <ModalViewForceAlignerChange handleOnClose={handleOnClose} />
        </When>
        <When isTrue={activeAction.VIEW_LOGS}>
          <ModalProductionLogs handleOnClose={handleOnClose} alignerJourneyId={alignerJourneyId} />
        </When>
        <When isTrue={activeAction.PAUSE_TREATMENT}>
          <PauseTreatment handleOnClose={handleOnClose} alignerJourneyId={alignerJourneyId} />
        </When>
        <When isTrue={activeAction.RESUME_TREATMENT}>
          <ResumeTreatment handleOnClose={handleOnClose} alignerJourneyId={alignerJourneyId} />
        </When>
      </div>
    </When>
  )
}

export default QuickActions
