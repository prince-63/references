import React, {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Collapse, Spin} from 'antd'
import type {CollapseProps} from 'antd'
import TimelineItemHeader from './TimelineItemHeader'
import TimelineItemContent from './TimelineItemContent'
import Spinner from 'components/spinner/Spinner'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import MarkIssueAsResolvedModal from './MarkIssueAsResolvedModal'
import ExpandIcon from 'screens/Patients/PatientProfile/Tabs/components/ExpandIcon'
import TimelineDetailsDrawer from './TimelineDetailsDrawer'
import {Action, Aligner} from '../patientTimeline.types'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useParams, useSearchParams} from 'react-router-dom'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import apiHelper from '@utils/apiHelper'
import {URL_VALIDATE_AND_APPROVE_ALIGNER} from 'redux/Endpoints/apiEndpoints'
import HttpMethod from '@constants/httpMethods.constants'
import {
  getPatientTimeline,
  setActiveKey,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
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
import {PiConfetti} from 'react-icons/pi'
import ModalRevertSuccess from 'components/modal/LeadsProfile/Tracking/ModalRevertSuccess'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
const PatientTimeLine = ({
  selectedFilter,
  showSendReminder,
  setShowSendReminder,
  onResumeTreatment,
  progressStatus,
}: {
  selectedFilter: keyof typeof patientOverviewAlignerActionFilterConstantsConstants
  showSendReminder: boolean
  setShowSendReminder: (showSendReminder: boolean) => void
  onResumeTreatment: () => void
  progressStatus: keyof typeof treatmentPlanStatusConstants | null
}) => {
  const {patientTimeline, getPatientTimelineLoading, activeKey} = useSelector(
    (state: RootState) => state.leadsProfile
  )
  const treatmentPlanStatus =
    patientTimeline?.patient_profile_overview_response?.treatment_plan_status

  const treatmentPlanCompleted =
    patientTimeline?.patient_profile_overview_response?.treatment_plan_completed

  const limit = 50

  const {dataLeadsOverview: dataLeadsData} = useSelector((state: RootState) => state.leadsProfile)

  const disable =
    treatmentPlanStatus === treatmentPlanStatusConstants.DEACTIVATED ||
    treatmentPlanStatus === treatmentPlanStatusConstants.COMPLETE
      ? true
      : false
  const [searchParams] = useSearchParams()
  const alignerNumber = searchParams.get('aligner_number')

  useEffect(() => {
    if (!hasValue(activeKey)) {
      dispatchAction(
        setActiveKey(alignerNumber ?? patientTimeline?.aligners?.[0]?.aligner_number?.toString())
      )
    } else {
      if (activeKey && activeKey > 3) {
        setShowAll(true)
      }
    }
  }, [activeKey])

  const [selectedAction, setSelectedAction] = useState<{
    action: Action
    aligner: Aligner
  } | null>(null)
  const [selectedIssueAction, setSelectedIssueAction] = useState<Action | null>(null)
  const [selectedAligner, setSelectedAligner] = useState<Aligner | null>(null)
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const [showAll, setShowAll] = useState(false)
  const handleViewDetails = (action: Action, aligner: Aligner) => {
    setSelectedAction({action, aligner})
  }
  const [isIsThereAlignerChangeModalOpen, setIsThereAlignerChangeModalOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const treatment_completion_date = dataLeadsOverview?.treatment_plan?.treatment_plan_completed_date
  const handleMarkAsResolved = (action: Action) => {
    setSelectedIssueAction(action)
  }
  const {permissionChecks} = useFeatureAccess()
  const alignerUpdatesActionsPermissions =
    permissionChecks?.alignerTreatment?.alignerUpdates?.isViewable

  let formatted = ''

  if (treatment_completion_date) {
    const date = new Date(treatment_completion_date)

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }

    formatted = date.toLocaleDateString('en-GB', options).replace(',', '').replace(/\s/g, '-')
  }

  let secondFormat = ''

  if (treatment_completion_date) {
    const date = new Date(treatment_completion_date)

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }

    const formattedDate = date
      .toLocaleDateString('en-GB', dateOptions)
      .replace(',', '')
      .replace(/\s/g, '-')

    const formattedTime = date.toLocaleTimeString('en-US', timeOptions)

    secondFormat = `${formattedDate}, ${formattedTime}`
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
      await dispatchAction(
        getPatientTimeline({
          doctor_id: parseInt(userId as string),
          patient_id: parseInt(patientId as string),
          filter: selectedFilter,
        })
      )
        .unwrap()
        .then(() => {
          SuccessToast('Issue marked as resolved successfully')
          handleCloseModal()
        })
    })
  }
  const {dispatchAction} = useDispatchAction()

  const allAligners = patientTimeline?.aligners || []
  const visibleAligners = showAll ? allAligners : allAligners.slice(0, 3)
  const hiddenAligners = showAll ? [] : allAligners.slice(3)
  const hiddenPendingCount = hiddenAligners.reduce(
    (sum, aligner) => sum + (aligner.pending_actions_count || 0),
    0
  )
  const [editAlignerData, setEditAlignerData] = useState({})
  const [isEditTreatmentModel, setIsEditTreatmentModel] = useState(false)

  const [expanded, setExpanded] = useState(false)
  const remarks = dataLeadsData?.treatment_plan_completed_remarks || ''

  const shouldTruncate = remarks.length > limit
  const displayText = expanded || !shouldTruncate ? remarks : remarks.slice(0, limit) + '...'

  type TimelineItem = NonNullable<CollapseProps['items']>[number]

  const timelineItems: CollapseProps['items'] = [
    ...visibleAligners.map((aligner) => {
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
        customPanelStyle = {...customPanelStyle, border: '2px solid #735BF2'}
      } else {
        customPanelStyle = {...customPanelStyle, border: '1px solid #E0E0E0'}
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
        customHeaderStyle = {...customHeaderStyle, background: '#F5F4FE'}
      } else if (alignerStatus === 'past') {
        customHeaderStyle = {...customHeaderStyle, background: '#EFEFEF'}
      }

      if (disable) {
        customHeaderStyle = {...customHeaderStyle, background: '#EFEFEF'}
        customPanelStyle = {...customPanelStyle, border: '1px solid #d9d9d9'}
      }

      const collapsible: TimelineItem['collapsible'] = hasActions ? 'header' : 'icon'

      const item: TimelineItem = {
        key: aligner.aligner_number.toString(),
        label: (
          <TimelineItemHeader
            aligner={aligner}
            setIsEditTreatmentModel={setIsEditTreatmentModel}
            setSelectedAligner={setSelectedAligner}
            progressStatus={progressStatus}
            isManualTracking={dataLeadsOverview?.tracking?.type === 'MANUAL'}
            alignerNumberStatus={alignerStatus}
            disable={disable}
          />
        ),
        children: hasActions ? (
          <TimelineItemContent
            aligner={aligner}
            onViewDetails={handleViewDetails}
            onMarkAsResolved={handleMarkAsResolved}
            isManualTracking={dataLeadsOverview?.tracking?.type === 'MANUAL'}
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
            disable={disable || !alignerUpdatesActionsPermissions}
          />
        ) : null,
        style: customPanelStyle,
        styles: {body: {padding: 0}, header: customHeaderStyle},
        collapsible,
        showArrow: hasActions,
      }

      return item
    }),

    // 👇 Add treatment completed as the final item
    ...(treatmentPlanCompleted && selectedFilter === 'ALL_ALIGNERS'
      ? [
          {
            key: 'treatment-completed',
            label: (
              <div className='flex justify-between items-center gap-3  py-3 rounded-t-lg'>
                <div className='w-8 h-8 flex items-center justify-center rounded-full bg-[#735BF2]'>
                  <PiConfetti color='white' size={16} />
                </div>
                <div>
                  <div className='font-semibold flex items-center text-black gap-2'>
                    Treatment completion
                  </div>
                  <div className='text-xs text-textColor font-semibold'>
                    {hasValue(treatment_completion_date) ? formatted : ''}
                  </div>
                </div>
              </div>
            ),
            children: (
              <div className='p-6 text-sm'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center rounded-full bg-[#00B383]'>
                    <CheckedCircleOutlineIcon
                      width='16'
                      height='16'
                      withBorder={false}
                      color='white'
                    />
                  </div>

                  <div className='flex flex-col'>
                    <div className='text-xs font-semibold text-textColor'>{secondFormat}</div>
                  </div>
                </div>
                <div className='px-7 flex flex-col'>
                  <div className='text-base font-semibold'>Treatment Completed</div>
                  <div>
                    <span className='text-sm text-textColor font-[500]'>Remarks: </span>

                    <span>{displayText}</span>
                    {shouldTruncate && (
                      <button
                        onClick={() => setExpanded((prev) => !prev)}
                        className='ml-2 text-primary text-[#735BF2] text-sm font-medium hover:underline'
                      >
                        {expanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ),

            style: {
              marginBottom: 12,
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            },
            styles: {
              body: {padding: 0},
            },
            // 👇 make collapsible like other items
            collapsible: 'header',
            showArrow: true,
          } as TimelineItem,
        ]
      : []),
  ]

  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 mt-3'>
      <Spin indicator={<Spinner loading />} spinning={getPatientTimelineLoading}>
        <When isTrue={hasValue(patientTimeline?.aligners)}>
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
            onChange={(key) => dispatchAction(setActiveKey(Array.isArray(key) ? key[0] : key))}
            expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
            expandIconPosition='end'
            className='timeline-collapse'
          />
          {allAligners.length > 3 && (
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
              isManualTracking={dataLeadsOverview?.tracking?.type === 'MANUAL' || false}
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

        <When isTrue={!hasValue(patientTimeline?.aligners)}>
          <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-[calc(100vh-14rem)] font-medium'>
            <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
              <CheckedCircleOutlineIcon color='#666666' />
            </div>
            <p>
              {selectedFilter === 'PENDING_UPDATES'
                ? 'No pending updates'
                : 'No timeline data found'}
            </p>
          </div>
        </When>
      </Spin>
    </div>
  )
}

export default PatientTimeLine
