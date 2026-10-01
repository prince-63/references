import React, {useContext, useEffect, useState} from 'react'
import {Collapse, Spin} from 'antd'
import TimelineItemHeader from './TimelineItemHeader'
import TimelineItemContent from './TimelineItemContent'
import Spinner from 'components/spinner/Spinner'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import MarkIssueAsResolvedModal from './MarkIssueAsResolvedModal'
import ExpandIcon from 'screens/Patients/PatientProfile/Tabs/components/ExpandIcon'
import TimelineDetailsDrawer from './TimelineDetailsDrawer'
import {Action, Aligner} from '../patientTimeline.types'
import {AuthContext} from 'context/AuthContext'
import {useSearchParams} from 'react-router-dom'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import apiHelper from '@utils/apiHelper'
import {URL_VALIDATE_AND_APPROVE_ALIGNER} from 'redux/Endpoints/apiEndpoints'
import HttpMethod from '@constants/httpMethods.constants'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import userTypes from '@constants/userTypes'
import {trim} from 'ramda'
import IsThereAlignerChangeModal from 'components/modal/PatientProfile/Tabs/TreatmentPlan/IsThereAlignerChangeModal'
import ModalEditTreatment from 'components/modal/PatientProfile/Tabs/TreatmentPlan/ModalEditTreatment'
import ModalSuccess from 'components/modal/Alert/ModalSuccess'
import {safeParseInt} from 'utils/ConstFunctions'
import ConfirmMoveToPreviousAligner from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/modals/ConfirmMoveToPreviousAligner'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import ModalRevertSuccess from 'components/modal/LeadsProfile/Tracking/ModalRevertSuccess'

export interface TimelineData {
  aligners: Aligner[]
}

export interface PatientTimeLineProps {
  // Core data props
  timelineData: TimelineData | null
  loading?: boolean
  activeKey?: string | null

  // Filter and status props
  selectedFilter: keyof typeof patientOverviewAlignerActionFilterConstantsConstants
  progressStatus: keyof typeof treatmentPlanStatusConstants | null

  // Reminder props
  showSendReminder: boolean
  setShowSendReminder: (showSendReminder: boolean) => void

  // Event handlers
  onResumeTreatment: () => void
  onActiveKeyChange?: (key: string | null) => void
  onTimelineUpdate?: () => Promise<void> // Callback to refresh timeline data

  // Optional customization props
  maxVisibleItems?: number
  isManualTracking?: boolean

  // Optional override for user context (if different from AuthContext)
  userId?: string
  // Optional custom empty state
  emptyStateConfig?: {
    icon?: React.ReactNode
    pendingMessage?: string
    noDataMessage?: string
  }
  disable?: boolean | null
}

const PatientTimeLineReusable: React.FC<PatientTimeLineProps> = ({
  timelineData,
  loading = false,
  activeKey: externalActiveKey,
  selectedFilter,
  progressStatus,
  showSendReminder,
  setShowSendReminder,
  onResumeTreatment,
  onActiveKeyChange,
  onTimelineUpdate,
  maxVisibleItems = 3,
  isManualTracking = false,
  userId: externalUserId,
  emptyStateConfig,
  disable = false,
}) => {
  const [searchParams] = useSearchParams()
  const alignerNumber = searchParams.get('aligner_number')
  const {userId: contextUserId} = useContext(AuthContext)

  // Use external props or fallback to context/route values
  const userId = externalUserId || contextUserId
  // Internal active key state (used when no external control provided)
  const [internalActiveKey, setInternalActiveKey] = useState<string | null>(null)

  // Determine which active key to use
  const activeKey = externalActiveKey !== undefined ? externalActiveKey : internalActiveKey

  useEffect(() => {
    if (!hasValue(activeKey)) {
      const newActiveKey = alignerNumber ?? timelineData?.aligners?.[0]?.aligner_number?.toString()
      if (externalActiveKey !== undefined && onActiveKeyChange) {
        onActiveKeyChange(newActiveKey || null)
      } else {
        setInternalActiveKey(newActiveKey || null)
      }
    } else {
      if (activeKey && Number(activeKey) > maxVisibleItems) {
        setShowAll(true)
      }
    }
  }, [
    activeKey,
    timelineData,
    alignerNumber,
    maxVisibleItems,
    externalActiveKey,
    onActiveKeyChange,
  ])

  const [selectedAction, setSelectedAction] = useState<{
    action: Action
    aligner: Aligner
  } | null>(null)
  const [selectedIssueAction, setSelectedIssueAction] = useState<Action | null>(null)
  const [selectedAligner, setSelectedAligner] = useState<Aligner | null>(null)
  const [showAll, setShowAll] = useState(false)

  const handleViewDetails = (action: Action, aligner: Aligner) => {
    setSelectedAction({action, aligner})
  }

  const [isIsThereAlignerChangeModalOpen, setIsThereAlignerChangeModalOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleMarkAsResolved = (action: Action) => {
    setSelectedIssueAction(action)
  }

  const handleCloseModal = () => {
    setSelectedIssueAction(null)
  }

  const [isConfirmMoveToPreviousAlignerModalOpen, setIsConfirmMoveToPreviousAlignerModalOpen] =
    useState(false)
  const [moveToPreviousAlignerSuccess, setMoveToPreviousAlignerSuccess] = useState(false)

  const handleSubmitResolution = async (values: any) => {
    await apiHelper(URL_VALIDATE_AND_APPROVE_ALIGNER, HttpMethod.POST, {
      aligner_action_id: selectedIssueAction?.action_id,
      validated_by: userId,
      remarks: trim(values.remarks),
      validated_by_user_type: userTypes.DOCTOR,
    }).then(async () => {
      // Call the external update function if provided
      if (onTimelineUpdate) {
        await onTimelineUpdate()
      }
      SuccessToast('Issue marked as resolved successfully')
      handleCloseModal()
    })
  }

  const allAligners = timelineData?.aligners || []
  const visibleAligners = showAll ? allAligners : allAligners.slice(0, maxVisibleItems)
  const hiddenAligners = showAll ? [] : allAligners.slice(maxVisibleItems)
  const hiddenPendingCount = hiddenAligners.reduce(
    (sum, aligner) => sum + (aligner.pending_actions_count || 0),
    0
  )

  const [editAlignerData, setEditAlignerData] = useState({})
  const [isEditTreatmentModel, setIsEditTreatmentModel] = useState(false)

  const handleActiveKeyChange = (key: string | string[] | undefined) => {
    const newKey = Array.isArray(key) ? key[0] : key
    if (externalActiveKey !== undefined && onActiveKeyChange) {
      onActiveKeyChange(newKey || null)
    } else {
      setInternalActiveKey(newKey || null)
    }
  }

  const timelineItems = visibleAligners.map((aligner) => {
    const hasActions = aligner.actions?.length > 0
    let alignerStatus: 'current' | 'future' | 'past' = 'future'
    if (Number(aligner.aligner_number) === Number(aligner.current_aligner_number)) {
      alignerStatus = 'current'
    } else if (Number(aligner.aligner_number) < Number(aligner.current_aligner_number)) {
      alignerStatus = 'past'
    }

    let customPanelStyle: React.CSSProperties = {
      marginBottom: 12,
      borderRadius: '8px',
    }
    if (alignerStatus === 'current') {
      customPanelStyle = {
        ...customPanelStyle,
        border: '2px solid #735BF2',
      }
    } else if (alignerStatus === 'future') {
      customPanelStyle = {
        ...customPanelStyle,
        border: '1px solid #E0E0E0',
      }
    } else if (alignerStatus === 'past') {
      customPanelStyle = {
        ...customPanelStyle,
        border: '1px solid #E0E0E0',
      }
    }

    let customHeaderStyle: React.CSSProperties = {
      background: 'white',
      borderTopRightRadius: '8px',
      borderTopLeftRadius: '8px',
    }

    const isCollapsed = activeKey !== aligner.aligner_number.toString()
    if (isCollapsed) {
      customHeaderStyle.borderBottomRightRadius = '8px'
      customHeaderStyle.borderBottomLeftRadius = '8px'
    }

    if (alignerStatus === 'current') {
      customHeaderStyle = {
        ...customHeaderStyle,
        background: '#F5F4FE',
      }
    } else if (alignerStatus === 'past') {
      customHeaderStyle = {
        ...customHeaderStyle,
        background: '#EFEFEF',
      }
    }

    if (disable) {
      customHeaderStyle = {
        ...customHeaderStyle,
        background: '#EFEFEF',
      }
      customPanelStyle = {
        ...customPanelStyle,
        border: '1px solid #d9d9d9',
      }
    }

    return {
      key: aligner.aligner_number.toString(),
      label: (
        <TimelineItemHeader
          aligner={aligner}
          setIsEditTreatmentModel={setIsEditTreatmentModel}
          setSelectedAligner={setSelectedAligner}
          progressStatus={progressStatus}
          isManualTracking={isManualTracking}
          alignerNumberStatus={alignerStatus}
          disable={true}
        />
      ),
      children: hasActions ? (
        <TimelineItemContent
          aligner={aligner}
          onViewDetails={handleViewDetails}
          onMarkAsResolved={handleMarkAsResolved}
          isManualTracking={isManualTracking}
          onSendReminder={() => {
            setShowSendReminder(true)
            setSelectedAligner(aligner)
          }}
          onResumeTreatment={onResumeTreatment}
          selectedFilter={selectedFilter}
          setIsEditTreatmentModel={setIsEditTreatmentModel}
          setSelectedAligner={setSelectedAligner}
          setIsMoveToPreviousAlignerModalOpen={setIsConfirmMoveToPreviousAlignerModalOpen}
          progressStatus={progressStatus}
          disable={true}
        />
      ) : null,
      style: customPanelStyle,
      styles: {body: {padding: 0}, header: customHeaderStyle},
      collapsible: hasActions ? 'header' : 'icon',
      showArrow: hasActions,
    }
  }) as any

  // Default empty state configuration
  const defaultEmptyStateConfig = {
    icon: (
      <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
        <CheckedCircleOutlineIcon color='#666666' />
      </div>
    ),
    pendingMessage: 'No pending updates',
    noDataMessage: 'No timeline data found',
  }

  const emptyConfig = {...defaultEmptyStateConfig, ...emptyStateConfig}

  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 mt-3'>
      <Spin indicator={<Spinner loading />} spinning={loading}>
        <When isTrue={hasValue(timelineData?.aligners)}>
          <Collapse
            items={timelineItems}
            defaultActiveKey={activeKey ?? 0}
            bordered={false}
            style={{
              padding: 0,
              fontFamily: 'figtree',
              backgroundColor: 'transparent',
            }}
            accordion
            onChange={handleActiveKeyChange}
            expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
            expandIconPosition='end'
            className='timeline-collapse'
          />
          {allAligners.length > maxVisibleItems && (
            <div className='flex items-center mt-2'>
              <button
                className='w-full flex items-center justify-between bg-transparent text-textColor text-sm font-semibold p-4 border border-mediumGray rounded-lg'
                onClick={() => setShowAll((prev) => !prev)}
              >
                <span className='text-left'>{showAll ? 'Show less' : 'Show all'}</span>
                <div className='flex items-center gap-2'>
                  {!showAll && hiddenPendingCount > 0 && (
                    <span className='flex items-center text-orange text-xs'>
                      <span className='w-2 h-2 rounded-full bg-orange inline-block mr-1'></span>
                      {hiddenPendingCount} pending
                    </span>
                  )}
                  <ExpandIcon isActive={showAll} />
                </div>
              </button>
            </div>
          )}
          <style>
            {`
              .timeline-collapse .ant-collapse-item .ant-collapse-header {
                padding: 16px;
              }
              .timeline-collapse .ant-collapse-item-active .ant-collapse-header {
                border-bottom: 1px solid #D9D9D9;
              }
              .timeline-collapse .ant-collapse-item .ant-collapse-content {
                border-top: none;
              }
              .timeline-collapse .ant-collapse-item .ant-collapse-content-box {
                padding: 16px;
              }
            `}
          </style>
        </When>

        <TimelineDetailsDrawer
          open={!!selectedAction || showSendReminder}
          onClose={() => {
            setSelectedAction(null)
            setShowSendReminder(false)
            setSelectedAligner(null)
          }}
          action={selectedAction?.action}
          aligner={selectedAction?.aligner ?? selectedAligner}
          isSendReminder={showSendReminder}
          selectedFilter={selectedFilter}
          progressStatus={progressStatus}
          setMoveToPreviousAlignerSuccess={setMoveToPreviousAlignerSuccess}
          onExtendWearDays={() => {
            setIsEditTreatmentModel(true)
            setSelectedAligner(selectedAction?.aligner ?? selectedAligner)
          }}
        />

        <MarkIssueAsResolvedModal
          open={!!selectedIssueAction}
          onClose={handleCloseModal}
          onSubmit={handleSubmitResolution}
        />

        <When isTrue={isIsThereAlignerChangeModalOpen}>
          <IsThereAlignerChangeModal
            setSuccess={setSuccess}
            editAlignerData={editAlignerData}
            setIsThereAlignerChangeModalOpen={setIsThereAlignerChangeModalOpen}
            isPatientTimeLine={true}
            selectedFilter={selectedFilter}
          />
        </When>

        <When isTrue={isEditTreatmentModel}>
          {selectedAligner && (
            <ModalEditTreatment
              setIsEditTreatmentModel={setIsEditTreatmentModel}
              selectedRowDetail={{
                alignerNo: safeParseInt(selectedAligner?.aligner_number),
                alignerType: selectedAligner?.jaw_type ?? '',
                startDate: selectedAligner?.start_date,
                endDate: selectedAligner?.end_date,
                currentAlignerNo: safeParseInt(selectedAligner?.current_aligner_number),
                alignerJourneyId: selectedAligner?.aligner_journey_id,
              }}
              isManualTracking={isManualTracking}
              setIsThereAlignerChangeModalOpen={setIsThereAlignerChangeModalOpen}
              setSuccess={setSuccess}
              setSelectedAligner={setSelectedAligner}
              setEditAlignerData={setEditAlignerData}
              isPatientTimeLine={true}
              selectedFilter={selectedFilter}
            />
          )}
        </When>

        {success && (
          <ModalSuccess
            setIsSuccessModelOpen={setSuccess}
            title={'Aligner details have been successfully updated!'}
          />
        )}

        <When isTrue={isConfirmMoveToPreviousAlignerModalOpen}>
          <ConfirmMoveToPreviousAligner
            setIsConfirmMoveToPreviousAlignerModalOpen={setIsConfirmMoveToPreviousAlignerModalOpen}
            setMoveToPreviousAlignerSuccess={setMoveToPreviousAlignerSuccess}
            alignerJourneyId={selectedAligner?.aligner_journey_id?.toString()}
            selectedFilter={selectedFilter}
            alignerUpdateDetails={{
              previous_aligner_details: {
                jaw_type: selectedAligner?.previous_jaw_type,
                sr_no: selectedAligner?.previous_aligner_number,
              },
            }}
          />
        </When>

        <ModalRevertSuccess
          open={moveToPreviousAlignerSuccess}
          onOkay={() => {
            setMoveToPreviousAlignerSuccess(false)
          }}
        />

        <When isTrue={!hasValue(timelineData?.aligners)}>
          <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-[calc(100vh-14rem)] font-medium'>
            {emptyConfig.icon}
            <p>
              {selectedFilter === 'PENDING_UPDATES'
                ? emptyConfig.pendingMessage
                : emptyConfig.noDataMessage}
            </p>
          </div>
        </When>
      </Spin>
    </div>
  )
}

export default PatientTimeLineReusable
