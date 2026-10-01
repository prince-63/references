import {useContext, useEffect, useRef, useState} from 'react'
import TreatmentProgress from './components/TreatmentProgress'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import When from 'components/when/When'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import jawType from '@constants/jawType'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import productTypes from '@constants/productTypes'
import dayjs from 'dayjs'
import {Dropdown, MenuProps} from 'antd'
import {FiFilter} from 'react-icons/fi'
import ExpandIcon from 'assets/icons/ExpandIcon'
import patientOverviewAlignerActionFilterConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import PatientTimeLine from './components/PatientTimeLine'
import ActionTag from './components/ActionTag'
import {
  getPatientTimeline,
  setSelectedFilter,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {getDueMessageText} from 'utils/getDueMessageText'
import GetCompilance from 'screens/AlignerPatientAnalytics/components/GetCompilance'
import cn from '@utils/cn'
import useProfileBasePath from '@hooks/useProfileBasePath'
import ResumeTreatment from '../LeadsProfile/main/alignersTracking/actionModals/ResumeTreatment'
import actionList from '@staticData/actionList'
import useFilter from '@hooks/useFilter'
import {setIsModalConnectWithPatientOpen} from 'redux/Slices/AppSlice/InvitePatient/AddAndSendInvite'
import PatientNotJoinedModal from './components/PatientNotJoinedModal'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import useAllUserPlan from '@hooks/useAllUserPlan'
import actionTypes from '@constants/actionTypes'
import trackingTypes from '@constants/trackingTypes'
import CalendarPlusIconOutline from 'assets/icons/CalendarPlusIconOutline'
import {ActionItem} from '../LeadsProfile/leadsProfile.types'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {ModalConnectWithPatient} from 'components/modal/Leads/Overview/ModalConnectWithPatient'
import ModalProductionLogs from 'components/modal/PatientProfile/Tabs/TreatmentPlan/ModalProductionLogs'
import ModalForceAlignerWarning from '../LeadsProfile/main/alignersTracking/actionModals/components/ModalForceAlignerWarning'
import ModalViewForceAlignerChange from '../LeadsProfile/main/alignersTracking/actionModals/components/ModalViewForceAlignerChange'
import ForceAlignerChange from '../LeadsProfile/main/alignersTracking/actionModals/ForceAlignerChange'
import PauseTreatment from '../LeadsProfile/main/alignersTracking/actionModals/PauseTreatment'
import UpdateWearDaysAllAligners from '../LeadsProfile/main/alignersTracking/actionModals/UpdateWearDaysAllAligners'
import ChartBarIcon from 'assets/icons/ChartBarIcon'
import PlayCircleIcon from 'assets/icons/PlayCircleIcon'
import FastForwardIcon from 'assets/icons/FastForwardIcon'
import {CompleteTreatment} from '../LeadsProfile/main/alignersTracking/actionModals/CompleteTreatment'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import hasValue from 'utils/hasValue'
import TabHeader from 'screens/PatientDetailsOverview.tsx/items/TabHeader'

dayjs.extend(isSameOrAfter)
export const jawTypeMap = {
  [jawType.BOTH]: 'Both',
  [jawType.LOWER]: 'Lower',
  [jawType.UPPER]: 'Upper',
}

type FilterOption = {
  key: keyof typeof patientOverviewAlignerActionFilterConstants
  label: string
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    key: patientOverviewAlignerActionFilterConstants.ALL_ALIGNERS,
    label: 'All Aligners',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.CURRENT_ALIGNER,
    label: 'Current Aligner',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.PENDING_UPDATES,
    label: 'Pending Updates',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.ISSUES_REPORTED,
    label: 'Issues Reported',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.ALIGNER_CHECKINS,
    label: 'Aligner Check-ins',
  },
  {
    key: patientOverviewAlignerActionFilterConstants.ALIGNER_CHANGES,
    label: 'Aligner Changes',
  },
]

const PatientProfileOverview = ({
  alignerJourneyId,
  patientId,
  loading,
  treatmentStatus,
  hideTimeline,
  hideTrackingHeaderAndQuickActions,
}: {
  alignerJourneyId: number | null
  patientId: number
  loading: boolean
  treatmentStatus: keyof typeof treatmentPlanStatusConstants | null
  hideTimeline?: boolean
  hideTrackingHeaderAndQuickActions?: boolean
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId, profileId} = useContext(AuthContext)
  const [searchParams] = useSearchParams()
  const patientTimelineFilter = searchParams.get('patient_timeline_filter')
  const selectedFilter = useSelector((state: RootState) => state.leadsProfile.selectedFilter)
  const pendingInitialTimelineFilterRef = useRef<string | null>(null)
  useEffect(() => {
    const initialFilter =
      FILTER_OPTIONS.find((option) => option.key === patientTimelineFilter) ?? FILTER_OPTIONS[1]

    if (selectedFilter.key === initialFilter.key) {
      pendingInitialTimelineFilterRef.current = null
      return
    }

    pendingInitialTimelineFilterRef.current = initialFilter.key
    dispatchAction(setSelectedFilter(initialFilter))
  }, [dispatchAction, patientTimelineFilter])

  useEffect(() => {
    getTreatmentData()
  }, [])

  // Treatment Plan
  const getTreatmentData = () => {
    const postData: any = {
      data: {
        patient_id: patientId,
        alignerJourneyId: alignerJourneyId,
      },
    }
    dispatchAction(postApiDataTreatmentPlan(postData))
  }
  const handleFilterChanges = (
    filter: keyof typeof patientOverviewAlignerActionFilterConstants
  ) => {
    const filterOption = FILTER_OPTIONS.find((opt) => opt.key === filter)!

    dispatchAction(setSelectedFilter(filterOption))

    if (hideTrackingHeaderAndQuickActions) {
      navigate(`${profileBasePath}/${patientId}/aligner-tracking`, {
        state: {selectedFilterKey: filter}, // optional, but useful
      })
    }
  }
  const [isPatientNotJoinedModalOpen, setIsPatientNotJoinedModalOpen] = useState(false)
  const {loading: loadingTreatmentPlan, data: dataTreatmentPlan}: any = useSelector(
    (state: RootState) => state.apiTreatmentPlan
  )
  const {patientTimeline, dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const treatmentDetail = dataTreatmentPlan?.aligner_journeys[0]
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const connectionStatus = data?.invitation_details
  //  const patientData = data.patient_details
  const {isPractice, isStarterPlanUser} = useAllUserPlan()
  // const is_your_patient = patientData?.assigned_practice?.practice_doctor_id == userId
  const [open, setOpen] = useState(false)
  const [forceAlignerDisabled, setForceAlignerDisabled] = useState(false)

  // const isAccessibleActionButton =
  // (isOrganization && is_your_patient) || isStarterPlanUser || isPractice || isGrowthPlanUser

  const menuItems: MenuProps['items'] = FILTER_OPTIONS.map((option) => ({
    key: option.key,
    className: 'text-left',
    label: (
      <span className={selectedFilter.key === option.key ? 'text-primaryColor font-semibold' : ''}>
        {option.label}
      </span>
    ),
    onClick: () => handleFilterChanges(option.key),
  }))

  const status = dataLeadsOverview?.treatment_plan?.aligner_treatment_status
  const isTreatmentCompleted = status === treatmentPlanStatusConstants.COMPLETE

  useEffect(() => {
    if (!userId || !patientId || !selectedFilter?.key) return
    if (pendingInitialTimelineFilterRef.current) {
      if (selectedFilter.key !== pendingInitialTimelineFilterRef.current) return
      pendingInitialTimelineFilterRef.current = null
    }

    dispatchAction(
      getPatientTimeline({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        filter: selectedFilter.key,
      })
    )
  }, [dispatchAction, patientId, selectedFilter?.key, userId])

  const [showSendReminder, setShowSendReminder] = useState(false)
  // const {isVisible} = useFeatureAccess(controlledFeaturesConstants.EXTEND_WEAR_DAYS)

  const overdue = patientTimeline?.patient_profile_overview_response?.over_due ?? 0
  const isManualTracking = dataLeadsOverview?.tracking?.type === 'MANUAL'
  const pendingActionsCount =
    patientTimeline?.patient_profile_overview_response?.pending_actions_count
  const {filter: activeAction, handleFilterChange} = useFilter(actionList, false)
  const trackingStatus =
    data?.getting_started_details?.tracking_status ||
    dataLeadsOverview?.tracking?.status ||
    dataLeadsOverview?.treatment_plan?.patient_tracking_status ||
    null

  const patientTimeLineClassName = isStarterPlanUser
    ? 'w-full flex flex-col gap-4'
    : 'w-full md:w-1/2 flex flex-col gap-4'

  const isTrackingStatusActive = trackingStatus === 'ACTIVE'
  //  const patient_status = data?.patient_details?.status
  const patientAssignedTo = getPatientAssignedTo(profileId, data.patient_details)
  const progressStatus = treatmentDetail?.progress_status
  const isDeactivated = progressStatus === 'DEACTIVATED'
  const {permissionChecks} = useFeatureAccess()
  const patientInvitationPermissions =
    permissionChecks?.patientManagement?.patientInvitation?.isAddable

  const quickActionPermissions = permissionChecks?.patientProfileQuickActions
  useEffect(() => {
    if (loadingTreatmentPlan) return
    if (!hasValue(dataTreatmentPlan?.aligner_journeys?.[0])) {
      setForceAlignerDisabled(false)
      return
    }

    const alignerJourneyData: any = dataTreatmentPlan?.aligner_journeys?.[0]
    const currentAligner =
      alignerJourneyData?.aligners?.find(
        (aligner: any) => aligner?.sr_no === alignerJourneyData?.current_aligner_no
      ) ?? null

    if (!currentAligner) {
      setForceAlignerDisabled(false)
      return
    }

    const isCurrentAlignerStartToday = currentAligner?.start_date
      ? dayjs(currentAligner.start_date).isSame(dayjs(), 'day')
      : false
    setForceAlignerDisabled(isCurrentAlignerStartToday)
  }, [dataTreatmentPlan, loadingTreatmentPlan])

  const handleActionOnClick = (option: ActionItem) => {
    handleFilterChange(option)
  }
  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )

  const canShowManualAlignerChange =
    !!quickActionPermissions?.manualAlignerChange?.isViewable &&
    !isTreatmentCompleted &&
    dataLeadsOverview?.tracking?.type === trackingTypes.PATIENTAPP &&
    patientAssignedTo !== 'ASSIGNED_TO_PRACTICE' &&
    !isDeactivated

  const canShowExtendWearDays =
    !!quickActionPermissions?.updateWearDaysForAllAligners?.isViewable &&
    isTrackingStatusActive &&
    !isDeactivated

  const canShowResumeTreatment =
    !!quickActionPermissions?.pauseResumeTreatment?.isViewable &&
    dataLeadsOverview?.treatment_plan?.aligner_treatment_status ===
      treatmentPlanStatusConstants.PAUSED

  const canShowWearStats =
    !!quickActionPermissions?.alignerWearStats?.isViewable &&
    !isTreatmentCompleted &&
    dataLeadsOverview?.tracking?.type === trackingTypes.PATIENTAPP

  const quickActionsMenuItems: NonNullable<MenuProps['items']> = []

  if (canShowManualAlignerChange) {
    quickActionsMenuItems.push({
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
          treatmentPlanStatusConstants.PAUSED || forceAlignerDisabled,
    })
  }

  if (canShowExtendWearDays) {
    quickActionsMenuItems.push({
      key: 'extendWearDays',
      onClick: () => {
        handleActionOnClick(actionTypes.EXTEND_WEAR_DAYS)
        identifyUser()
      },
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <CalendarPlusIconOutline />
          Update wear days for all aligners
        </span>
      ),
    })
  }

  // if (canShowPauseTreatment) {
  //   quickActionsMenuItems.push({
  //     key: 'pauseTreatment',
  //     label: (
  //       <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
  //         <PauseOutlineIcon />
  //         Pause treatment
  //       </span>
  //     ),
  //     onClick: () => handleActionOnClick(actionTypes.PAUSE_TREATMENT),
  //   })
  // }

  if (canShowResumeTreatment) {
    quickActionsMenuItems.push({
      key: 'resumeTreatment',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <PlayCircleIcon />
          Resume treatment
        </span>
      ),
      onClick: () => handleActionOnClick(actionTypes.RESUME_TREATMENT),
    })
  }

  if (canShowWearStats) {
    quickActionsMenuItems.push({
      key: 'wearStats',
      label: (
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <ChartBarIcon />
          Aligner wear stats
        </span>
      ),
      onClick: () => {
        navigate(
          `${profileBasePath}/${patientId}/aligner-tracking/${dataLeadsOverview?.treatment_plan?.journey_id}/wear-stats`
        )
        identifyUser()
      },
    })
  }

  return (
    <Page title={''} loading={loading || loadingTreatmentPlan}>
      <When isTrue={isModalConnectWithPatientOpen}>
        <ModalConnectWithPatient />
      </When>

      {/* Centralized modals for quick actions */}
      <When isTrue={activeAction.FORCE_CHANGE_ALIGNER}>
        <ForceAlignerChange
          handleOnClose={(option) => handleFilterChange(option, true)}
          handleActionOnClick={handleFilterChange}
        />
      </When>
      <When isTrue={activeAction.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL}>
        <ModalViewForceAlignerChange handleOnClose={(option) => handleFilterChange(option, true)} />
      </When>
      <When isTrue={activeAction.FORCE_CHANGE_ALIGNER_WARNING_MODAL}>
        <ModalForceAlignerWarning
          handleOnClose={(option) => handleFilterChange(option, true)}
          handleActionOnClick={handleFilterChange}
        />
      </When>
      <When isTrue={activeAction.VIEW_LOGS}>
        <ModalProductionLogs
          handleOnClose={(option) => handleFilterChange(option, true)}
          alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id}
        />
      </When>
      <When isTrue={activeAction.PAUSE_TREATMENT}>
        <PauseTreatment
          handleOnClose={(option) => handleFilterChange(option, true)}
          alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id}
        />
      </When>
      <When isTrue={activeAction.RESUME_TREATMENT}>
        <ResumeTreatment
          handleOnClose={(option) => handleFilterChange(option, true)}
          alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id}
        />
      </When>
      <When isTrue={activeAction.EXTEND_WEAR_DAYS}>
        <UpdateWearDaysAllAligners
          open={activeAction.EXTEND_WEAR_DAYS}
          onCancel={() => handleFilterChange(actionTypes.EXTEND_WEAR_DAYS, true)}
          onConfirm={() => {
            handleFilterChange(actionTypes.EXTEND_WEAR_DAYS, true)
          }}
          alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id?.toString() ?? ''}
        />{' '}
      </When>
      <When isTrue={activeAction.COMPLETE_TREATMENT}>
        <CompleteTreatment
          handleOnClose={() => handleFilterChange(actionTypes.COMPLETE_TREATMENT, true)}
          alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id ?? null}
        />
      </When>

      <div className='flex flex-col gap-4'>
        <When isTrue={!hideTrackingHeaderAndQuickActions}>
          <div className='flex items-center gap-2 justify-between'>
            <TabHeader title='Tracking' description='' />

            <div>
              <Dropdown
                menu={{items: quickActionsMenuItems}}
                trigger={['click']}
                placement='bottomRight'
                open={open}
                onOpenChange={(flag) => setOpen(flag)}
              >
                <div
                  className='border border-mediumGray rounded-md px-4 py-2 bg-white cursor-pointer flex items-center justify-between w-full
                   hover:!bg-primarySupport hover:!border-primaryColor hover:text-primaryColor transition-colors gap-1'
                >
                  <span className='text-base font-medium'>Quick actions</span>
                  <svg
                    width='16'
                    height='16'
                    fill='none'
                    viewBox='0 0 24 24'
                    className='stroke-current transition-transform duration-200' // 👈 inherits text color
                    style={{
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)', // smooth arrow flip
                    }}
                  >
                    <path
                      d='M7 10l5 5 5-5'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              </Dropdown>
            </div>
          </div>
        </When>
        <div className='w-full flex flex-col-reverse md:flex-row gap-4'>
          <When isTrue={!hideTimeline}>
            <div className='w-full md:w-1/2'>
              <div className='mb-4 flex flex-col gap-4'>
                <div>
                  <div className='flex gap-2 mb-1'>
                    <span className='font-semibold text-textColor text-lg'>Patient timeline</span>

                    <When
                      isTrue={Boolean(
                        patientTimeline?.pending_actions_count &&
                          patientTimeline?.pending_actions_count > 0 &&
                          !isManualTracking
                      )}
                    >
                      <ActionTag
                        label={`${patientTimeline?.pending_actions_count ?? 0} pending`}
                        className='text-orange bg-orangeSupport2'
                        iconClassName='bg-orange'
                      />
                    </When>
                  </div>

                  <Dropdown
                    menu={{
                      items: menuItems,
                      selectable: true,
                      selectedKeys: [selectedFilter.key],
                    }}
                    trigger={['click']}
                    className='rounded-lg'
                  >
                    <button className='w-full flex items-center justify-between border border-primaryColor rounded px-4 py-2 bg-white hover:shadow focus:outline-none'>
                      <div className='flex justify-between items-center gap-2 w-full'>
                        <div className='flex items-center gap-2'>
                          <FiFilter className='text-lg' />
                          {selectedFilter.label}
                        </div>
                        <ExpandIcon isActive={true} />
                      </div>
                    </button>
                  </Dropdown>
                  <PatientTimeLine
                    selectedFilter={selectedFilter.key}
                    showSendReminder={showSendReminder}
                    setShowSendReminder={setShowSendReminder}
                    progressStatus={status}
                    onResumeTreatment={() => {
                      handleFilterChange('RESUME_TREATMENT')
                    }}
                  />
                </div>
              </div>
            </div>
          </When>
          <div className={patientTimeLineClassName}>
            <div className='flex gap-4'>
              <When isTrue={hideTimeline}>
                <div className='w-full'>
                  <TreatmentProgress
                    productType={productTypes.ALIGNERS}
                    status={treatmentStatus}
                    currentAligner={
                      patientTimeline?.patient_profile_overview_response?.current_aligner ?? 0
                    }
                    totalAligners={
                      patientTimeline?.patient_profile_overview_response?.total_aligner ?? 0
                    }
                  />
                </div>
              </When>
              <BorderedCardForDashBoardCards className='w-1/2 h-auto'>
                <div className='flex flex-col gap-1'>
                  <GetCompilance
                    app_invite_status={
                      overdue < -7 ? 'NEED_ATTENTION' : overdue < 0 ? 'AT_RISK' : 'ON_TRACK'
                    }
                  />

                  <div className={cn('text-base text-black')}>
                    {getDueMessageText({
                      offSetDays: overdue,
                    })}
                  </div>
                  <When
                    isTrue={
                      isPractice && overdue < 0 && !isManualTracking && patientInvitationPermissions
                    }
                  >
                    <button
                      className='text-primaryColor text-sm font-medium mt-1 flex items-center gap-1 hover:underline'
                      type='button'
                      onClick={() => {
                        if (connectionStatus?.is_patient_connected) {
                          setShowSendReminder(true)
                        } else if (
                          !connectionStatus?.is_patient_connected &&
                          !connectionStatus?.is_patient_invited
                        ) {
                          dispatchAction(setIsModalConnectWithPatientOpen(true))
                        } else {
                          setIsPatientNotJoinedModalOpen(true)
                        }
                      }}
                    >
                      Send message <CaretRightIcon color='#735BF2' />
                    </button>
                  </When>
                </div>
              </BorderedCardForDashBoardCards>
              <BorderedCardForDashBoardCards className='w-1/2 h-auto'>
                <div className='flex flex-col gap-1'>
                  <div className='text-sm text-textColor font-medium'>Aligner updates</div>
                  <div className='text-base text-black'>{pendingActionsCount} pending review</div>
                  <When
                    isTrue={
                      !isManualTracking &&
                      pendingActionsCount != undefined &&
                      pendingActionsCount > 0
                    }
                  >
                    <button
                      type='button'
                      className='text-primaryColor text-sm font-medium mt-1 flex items-center gap-1 hover:underline'
                      onClick={() => {
                        handleFilterChanges('PENDING_UPDATES')
                      }}
                    >
                      View all pending updates <CaretRightIcon color='#735BF2' />
                    </button>
                  </When>
                </div>
              </BorderedCardForDashBoardCards>
            </div>
            <When isTrue={!hideTimeline}>
              <div className='w-full'>
                <TreatmentProgress
                  productType={productTypes.ALIGNERS}
                  status={treatmentStatus}
                  currentAligner={
                    patientTimeline?.patient_profile_overview_response?.current_aligner ?? 0
                  }
                  totalAligners={
                    patientTimeline?.patient_profile_overview_response?.total_aligner ?? 0
                  }
                />
              </div>
            </When>
          </div>
        </div>
      </div>

      <When isTrue={activeAction.RESUME_TREATMENT}>
        <ResumeTreatment
          handleOnClose={(option) => handleFilterChange(option, true)}
          alignerJourneyId={alignerJourneyId}
        />
      </When>
      <When isTrue={isPatientNotJoinedModalOpen && patientInvitationPermissions}>
        <PatientNotJoinedModal
          open={isPatientNotJoinedModalOpen}
          onClose={() => setIsPatientNotJoinedModalOpen(false)}
          onSendMessage={() => {
            setShowSendReminder(true)
            setIsPatientNotJoinedModalOpen(false)
          }}
          onResendInvite={() => {
            dispatchAction(setIsModalConnectWithPatientOpen(true))
            setIsPatientNotJoinedModalOpen(false)
          }}
        />
      </When>
    </Page>
  )
}

export default PatientProfileOverview
