import React, {useContext, useState} from 'react'
import dayjs from 'dayjs'
import Tag from 'components/tags/Tag'
import ALIGNER_ACTIONS, {
  ACTION_DESCRIPTION,
  ACTION_LABELS,
} from '@constants/alignerActions.constants'
import CircledAlertIcon from 'assets/icons/CircledAlertIcon'
import AlertIconFill from 'assets/icons/AlertIconFill'
import CheckedCircleIcon from 'assets/icons/CheckedCircleIcon'
import WaitIcon from 'assets/icons/WaitIcon'
import ChatTextIcon from 'assets/icons/ChatTextIcon'
import cn from '@utils/cn'
import {Action, Aligner, AlignerPhoto} from '../patientTimeline.types'
import ActionLabel from 'components/atom/ActionLabel'
import When from 'components/when/When'
import {Modal} from 'antd'
import {Image} from 'assets/images/Images/Image'
import hasValue from 'utils/hasValue'
import ViewDetails from './ViewDetails'
import WearDuration from 'screens/Patients/PatientProfile/components/WearDuration'
import ChecksIcon from 'assets/icons/ChecksIcon'
import FooterButtons from './FooterButtons'
import PausedIcon from 'assets/icons/PausedIcon'
import CalendarPlusIcon from 'assets/icons/CalendarPlusIcon'
import PlayIcon from 'assets/icons/PlayIcon'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import MinusCircleIcon from 'assets/icons/MinusCircleIcon'
import alignerIssues from '@staticData/alignerIssues'
import AntdButton from 'components/atom/Buttons/AntdButton'
import apiHelper from '@utils/apiHelper'
import {URL_VALIDATE_AND_APPROVE_ALIGNER} from 'redux/Endpoints/apiEndpoints'
import HttpMethod from '@constants/httpMethods.constants'
import userTypes from '@constants/userTypes'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {useParams, useNavigate} from 'react-router-dom'
import {getPatientTimeline} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import CounterClockWiseIcon from 'assets/icons/CounterClockWiseIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getImageUrl} from 'utils/ConstFunctions'
interface TimelineItemContentProps {
  aligner: Aligner
  onViewDetails: (action: Action, aligner: Aligner) => void
  onMarkAsResolved: (action: Action) => void
  isManualTracking: boolean
  onSendReminder: () => void
  selectedFilter: keyof typeof patientOverviewAlignerActionFilterConstantsConstants
  setIsEditTreatmentModel: (isEditTreatmentModel: boolean) => void
  setSelectedAligner: (aligner: Aligner) => void
  setIsMoveToPreviousAlignerModalOpen: (isMoveToPreviousAlignerModalOpen: boolean) => void
  onResumeTreatment: () => void
  progressStatus: keyof typeof treatmentPlanStatusConstants | null
  disable?: boolean
}

const TimelineItemContent: React.FC<TimelineItemContentProps> = ({
  aligner,
  onViewDetails,
  onMarkAsResolved,
  isManualTracking,
  onSendReminder,
  selectedFilter,
  setIsEditTreatmentModel,
  setSelectedAligner,
  setIsMoveToPreviousAlignerModalOpen,
  onResumeTreatment,
  progressStatus,
  disable = false,
}) => {
  const extractDriveFileId = (url?: string) => {
    if (!url) return undefined
    const match = url.match(/patient\/drive\/image\/([^/?#]+)/)
    return match?.[1]
  }

  const renderImages = (photos?: AlignerPhoto[]) => {
    if (!photos?.length) return null

    const maxVisible = 2
    const resolved = photos
      .map((photo) => {
        const urlCandidate = (photo as any)?.image_url
        const driveId = extractDriveFileId(urlCandidate)
        const isDrive = Boolean((photo as any)?.is_gdrive_platform)
        const fileForUrl = {
          url: urlCandidate,
          is_gdrive_platform: isDrive,
          drive_file_id: driveId,
        }
        const src = getImageUrl(fileForUrl)
        return src ? {src, key: photo.image_url} : null
      })
      .filter(Boolean) as {src: string; key: any}[]

    if (!resolved.length) return null

    const extraCount = resolved.length - maxVisible

    return (
      <div className='flex gap-2'>
        {resolved.slice(0, maxVisible).map((photo, index) => (
          <Image
            key={photo.key ?? index}
            src={photo.src}
            className='!w-16 !h-16 object-cover rounded-lg cursor-pointer'
            alt='Aligner photo'
            onClick={() => openPreview(resolved, index)}
          />
        ))}
        {extraCount > 0 && (
          <button
            type='button'
            className='w-16 h-16 rounded-lg border border-mediumGray flex items-center justify-center bg-white text-primaryColor text-lg font-semibold'
            onClick={() => openPreview(resolved, Math.min(maxVisible, resolved.length - 1))}
          >
            {extraCount}+
          </button>
        )}
      </div>
    )
  }

  const getIcon = (action: Action) => {
    const iconProps = {height: '18', width: '18', color: '#00B383'}

    switch (action.action_type) {
      case ALIGNER_ACTIONS.ALIGNER_CHANGE:
      case ALIGNER_ACTIONS.FORCE_ALIGNER_CHANGE:
        return <CheckedCircleIcon {...iconProps} />
      case ALIGNER_ACTIONS.ISSUE_REPORT:
        return <AlertIconFill {...iconProps} />
      case ALIGNER_ACTIONS.CHECK_IN:
        return <CheckedCircleIcon {...iconProps} />
      case ALIGNER_ACTIONS.CHECK_IN_PENDING_APPROVAL:
      case ALIGNER_ACTIONS.ALIGNER_CHANGE_PENDING_APPROVAL:
      case ALIGNER_ACTIONS.CREATE_REFINEMENT_REMINDER:
      case ALIGNER_ACTIONS.ALIGNER_CHANGE_OVERDUE_PENDING_ACTION:
      case ALIGNER_ACTIONS.AWAITING_RESUME_APPROVAL:
      case ALIGNER_ACTIONS.ALIGNER_CHANGE_SCHEDULED:
        return <WaitIcon {...iconProps} />
      case ALIGNER_ACTIONS.ALIGNER_CHANGE_OVERDUE:
        return <AlertIconFill {...iconProps} />
      case ALIGNER_ACTIONS.REMINDER_SENT:
        return <CircledAlertIcon {...iconProps} />
      case ALIGNER_ACTIONS.TREATMENT_PAUSED:
        return <PausedIcon />
      case ALIGNER_ACTIONS.WEAR_DAYS_UPDATED:
        return <CalendarPlusIcon />
      case ALIGNER_ACTIONS.TREATMENT_RESUMED:
        return <PlayIcon />
      case ALIGNER_ACTIONS.REMINDER_SENT_TO_PATIENT:
        return <ChatTextIcon />
      case ALIGNER_ACTIONS.TREATMENT_DEACTIVATED:
        return <MinusCircleIcon />
      case ALIGNER_ACTIONS.MOVE_TO_PREVIOUS_ALIGNER:
        return <CounterClockWiseIcon />
      default:
        return null
    }
  }
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null)
  const [currentSelectedAction, setCurrentSelectedAction] = useState<Action | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewImages, setPreviewImages] = useState<{src: string; key: any}[]>([])
  const {isPractice, isStarterPlanUser, isOrganization ,isGrowthPlanUser} = useAllUserPlan()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const [showPendingAlignerCheckInModal, setShowPendingAlignerCheckInModal] =
    useState<boolean>(false)

  const [actionCheckIn, setActionCheckIn] = useState<Action | null>(null)
  const isDeactivated = progressStatus === treatmentPlanStatusConstants.DEACTIVATED
  const isPaused = progressStatus === treatmentPlanStatusConstants.PAUSED
  const onSubmit = async (
    action: Action,
    actionId: number | null,
    action_type: keyof typeof ALIGNER_ACTIONS
  ) => {
    setCurrentSelectedAction(action)
    if (action_type === ALIGNER_ACTIONS.ALIGNER_CHANGE) {
      const isAlignerCheckInPresent = aligner.actions.some(
        (action) => action.action_type === ALIGNER_ACTIONS.CHECK_IN && !action.details?.approved
      )
      const checkInAction = aligner.actions.find(
        (action) => action.action_type === ALIGNER_ACTIONS.CHECK_IN && !action.details?.approved
      )

      setActionCheckIn(checkInAction || null)
      if (isAlignerCheckInPresent) {
        setIsSubmitting(null)
        setShowPendingAlignerCheckInModal(true)
        return null
      }
    }
    setIsSubmitting(actionId)

    await apiHelper(URL_VALIDATE_AND_APPROVE_ALIGNER, HttpMethod.POST, {
      aligner_action_id: actionId,
      validated_by: userId,
      validated_by_user_type: userTypes.DOCTOR,
    }).then(async () => {
      await dispatchAction(
        getPatientTimeline({
          doctor_id: parseInt(userId as string),
          patient_id: parseInt(patientId as string),
          filter: selectedFilter,
        })
      )
      setIsSubmitting(actionId)
    })
  }

  const navigate = useNavigate()
  const openPreview = (images: {src: string; key: any}[], index: number) => {
    setPreviewImages(images)
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  const renderActionContent = (action: Action) => {
    const actionLabel = ACTION_LABELS[action.action_type] || ''
    const details = action.details ?? null
    // reuse isOrganization from the top-level hook call to avoid calling hooks conditionally

    switch (action.action_type) {
      case ALIGNER_ACTIONS.ISSUE_REPORT:
        return (
          <div className={cn('flex flex-col gap-2')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            {details?.issue && (
              <div className='flex  gap-1'>
                <span className='text-gray-500'>Feedback:</span>
                <span className='text-sm font-bold'>
                  {alignerIssues.find((issue) => issue.name === details.issue)?.value ?? ''}
                </span>
              </div>
            )}
            {hasValue(details?.other_issues) && (
              <div className='flex gap-1'>
                <span className='text-gray-500'>Other issues:</span>
                <span className='text-sm text-textColor font-bold'>{details?.other_issues}</span>
              </div>
            )}
            {details?.approved ? (
              <div className='flex items-center gap-2'>
                <CheckedCircleIcon height='18' width='18' color='#00B383' />
                <span className='text-sm text-textColor'>
                  Resolved on {dayjs(details?.approved_on).format('DD-MMM-YYYY')}
                </span>
              </div>
            ) : (
              !isDeactivated &&
              !isOrganization && (
                <button
                  onClick={() => onMarkAsResolved(action)}
                  className='text-primaryColor text-sm font-semibold flex items-center gap-1 hover:underline'
                >
                  <ChecksIcon />
                  Mark as resolved
                </button>
              )
            )}
            {details?.remark && (
              <div className='flex gap-1 items-baseline'>
                <span className='text-gray-500'>Remarks:</span>
                <span className='text-sm text-textColor text-wrap'>{details?.remark}</span>
              </div>
            )}
          </div>
        )
      case ALIGNER_ACTIONS.ALIGNER_CHANGE:
        const showMoveToPreviousAligner =
          details?.move_to_previous_aligner_enable && !isDeactivated && !isPaused

        return (
          <div className={cn('flex flex-col gap-1 ')}>
            <ActionLabel>
              {details?.approved ? 'Change approved' : 'Aligner changed'}
              <WearDuration
                changeOffset={details?.due_by ?? 0}
                showDateRange={false}
                isManualTracking={false}
              />
              <ViewDetails
                onClick={onViewDetails}
                action={action}
                aligner={aligner}
                className='mt-1'
              />
              <div className='mt-2 flex items-center gap-2'>
                {!details?.approved &&
                  (isStarterPlanUser || isPractice || isGrowthPlanUser) &&
                  !isDeactivated &&
                  !isManualTracking && (
                    <AntdButton
                      text={
                        <span>
                          <div className='flex items-center gap-2'>Approve change</div>
                        </span>
                      }
                      onClick={() => {
                        onSubmit(action, action.action_id, action.action_type)
                      }}
                      loading={isSubmitting === action.action_id}
                      className={cn(
                        'h-10 text-sm border font-semibold rounded-lg',
                        'bg-primaryColor  text-white hover:!bg-primaryColor hover:!text-white'
                      )}
                    />
                  )}
                {showMoveToPreviousAligner && !isOrganization && !disable && (
                  <ViewDetails
                    onClick={() => {
                      setSelectedAligner(aligner as Aligner)
                      setIsMoveToPreviousAlignerModalOpen(true)
                    }}
                    action={action}
                    aligner={aligner}
                    text='Revert aligner change'
                    showIcon={false}
                  />
                )}
              </div>
            </ActionLabel>
          </div>
        )
      case ALIGNER_ACTIONS.CHECK_IN:
        return (
          <div className={cn('flex flex-col gap-1')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <When isTrue={details?.category === 'CRITICAL'}>
              <Tag value={'CRITICAL'} className='bg-red text-white w-fit' />
            </When>
            {renderImages(details?.aligner_photos)}
            <ViewDetails
              onClick={onViewDetails}
              action={action}
              aligner={aligner}
              className='mt-3'
            />

            <div className='flex items-center gap-2 mt-1'>
              {!details?.approved && (isStarterPlanUser || isPractice || isGrowthPlanUser) && !isDeactivated && (
                <AntdButton
                  text={
                    <span>
                      <div className='flex items-center gap-2'>Approve check-in</div>
                    </span>
                  }
                  onClick={() => {
                    onSubmit(action, action.action_id, action.action_type)
                  }}
                  loading={isSubmitting === action.action_id}
                  className={cn(
                    'h-10 text-base border font-semibold rounded-lg',
                    'bg-primaryColor  text-white hover:!bg-primaryColor hover:!text-white'
                  )}
                />
              )}
            </div>
          </div>
        )
      case ALIGNER_ACTIONS.FORCE_ALIGNER_CHANGE:
        return (
          <div className={cn('flex flex-col gap-1')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <WearDuration
              changeOffset={details?.due_by ?? 0}
              showDateRange={false}
              isManualTracking={false}
            />{' '}
            <span className={cn('text-sm text-textColor')}>
              {ACTION_DESCRIPTION[action.action_type as keyof typeof ACTION_DESCRIPTION]}
            </span>
            {/* TODO: Add images */}
            {renderImages(details?.aligner_photos)}
          </div>
        )
      case ALIGNER_ACTIONS.ALIGNER_CHANGE_OVERDUE:
        return (
          <div className={cn('flex flex-col')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <p className='text-sm text-textColor font-medium'>Reminder sent to patient.</p>
          </div>
        )
      case ALIGNER_ACTIONS.TREATMENT_PAUSED:
        return (
          <div className={cn('flex flex-col')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <p className='text-sm text-textColor font-medium'>
              Reason: {details?.reason_for_pause ?? '-'}
            </p>
          </div>
        )
      case ALIGNER_ACTIONS.MOVE_TO_PREVIOUS_ALIGNER:
        return (
          <div className={cn('flex flex-col')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <p className='text-sm text-textColor font-medium'>
              Reason: {details?.reason_for_move_to_previous_aligner ?? '-'}
            </p>
          </div>
        )
      case ALIGNER_ACTIONS.TREATMENT_DEACTIVATED:
        return (
          <div className={cn('flex flex-col')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <p className='text-sm text-textColor font-medium'>Reason: {details?.reason ?? '-'}</p>
            {details?.remarks && (
              <div className='flex gap-1 items-baseline'>
                <span className='text-gray-500'>Remarks:</span>
                <span className='text-sm text-textColor text-wrap'>{details?.remarks}</span>
              </div>
            )}
          </div>
        )
      case ALIGNER_ACTIONS.TREATMENT_RESUMED:
        return (
          <div className={cn('flex flex-col')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <p className='text-sm text-textColor font-medium'>
              Treatment resumed on {dayjs(details?.resumed_date).format('DD-MMM-YYYY')}
            </p>
          </div>
        )
      case ALIGNER_ACTIONS.WEAR_DAYS_UPDATED:
        return (
          <div className={cn('flex flex-col')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <p className='text-sm text-textColor font-medium'>
              End date of the aligner was updated from{' '}
              {dayjs(details?.old_aligner_end_date).format('DD-MMM-YYYY')} to{' '}
              {dayjs(details?.new_aligner_end_date).format('DD-MMM-YYYY')}
            </p>
          </div>
        )

      case ALIGNER_ACTIONS.ALIGNER_CHANGE_SCHEDULED:
      case ALIGNER_ACTIONS.ALIGNER_CHANGE_OVERDUE_PENDING_ACTION:
      case ALIGNER_ACTIONS.ALIGNER_CHANGE_PENDING_APPROVAL:
      case ALIGNER_ACTIONS.CHECK_IN_PENDING_APPROVAL:
      case ALIGNER_ACTIONS.AWAITING_RESUME_APPROVAL:
      case ALIGNER_ACTIONS.CREATE_REFINEMENT_REMINDER:
        return (
          <div className={cn('flex flex-col')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <When
              isTrue={hasValue(
                ACTION_DESCRIPTION[action.action_type as keyof typeof ACTION_DESCRIPTION]
              )}
            >
              <span className={cn('text-sm text-textColor')}>
                {ACTION_DESCRIPTION[action.action_type as keyof typeof ACTION_DESCRIPTION]}{' '}
                {action.action_type === 'AWAITING_RESUME_APPROVAL' ? (
                  <span className=''>{`${dayjs(details?.resumed_date).format(
                    'DD-MMM-YYYY'
                  )}`}</span>
                ) : null}
              </span>
            </When>
          </div>
        )
      case ALIGNER_ACTIONS.REMINDER_SENT_TO_PATIENT:
        return (
          <div className={cn('flex flex-col')}>
            <ActionLabel>{actionLabel}</ActionLabel>
            <p className='text-sm text-textColor'>A message was sent to the patient.</p>
            <button
              type='button'
              className='flex gap-2 items-center text-primaryColor font-semibold text-sm mt-2'
              onClick={() => {
                navigate(`/profile/${patientId}/chat`)
              }}
            >
              View
              <CaretRightIcon color='#735BF2' />
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='mt-4'>
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        zIndex={2100}
        width={760}
      >
        <div className='flex flex-col gap-4'>
          {previewImages[previewIndex]?.src ? (
            <Image
              src={previewImages[previewIndex].src}
              className='w-full max-h-[70vh] object-contain'
              alt='Aligner preview'
              showLoading
              size={48}
            />
          ) : null}
          {previewImages.length > 1 && (
            <div className='flex gap-2 flex-wrap'>
              {previewImages.map((photo, index) => (
                <button
                  key={photo.key ?? index}
                  type='button'
                  className={cn(
                    'rounded-lg border',
                    index === previewIndex ? 'border-primaryColor' : 'border-mediumGray'
                  )}
                  onClick={() => setPreviewIndex(index)}
                >
                  <Image
                    src={photo.src}
                    className='!w-16 !h-16 object-cover rounded-lg'
                    alt='Aligner thumbnail'
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={showPendingAlignerCheckInModal}
        onCancel={() => {
          setShowPendingAlignerCheckInModal(false)
        }}
        footer={[]}
        zIndex={2000}
        closeIcon={false}
      >
        <div className='pt-3'>
          <div>
            <p className='font-semibold text-2xl '>Pending Aligner Check-in</p>
            <p className=' text-textColor text-base font-normal'>
              There’s an Aligner check-in for this patient that needs your approval. Approve the
              check-in first and then approve Aligner change.{' '}
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              className='w-full h-12 bg-primarySupport text-primaryColor border border-primaryColor font-semibold rounded-lg mt-6'
              onClick={() => {
                setShowPendingAlignerCheckInModal(false)
                if (currentSelectedAction !== null) {
                  onViewDetails(currentSelectedAction, aligner)
                }
              }}
            >
              View change details
            </button>
            <button
              className='w-full h-12 bg-primaryColor text-white font-semibold rounded-lg mt-6'
              onClick={() => {
                setShowPendingAlignerCheckInModal(false)
                if (actionCheckIn !== null) {
                  onViewDetails(actionCheckIn, aligner)
                }
              }}
            >
              View check-in details
            </button>
          </div>
        </div>
      </Modal>
      {aligner.actions.map((action: Action, index: number) => (
        <div key={index} className='flex items-stretch px-3'>
          <div className='flex flex-col items-center'>
            <div>{getIcon(action)}</div>
            {index !== aligner.actions.length - 1 && (
              <div className='flex-1 border-l border-dashed border-grayDisabled mt-2' />
            )}
          </div>

          <div className='ml-4 flex-1 mb-5'>
            <div className='text-xs text-textColor font-semibold flex justify-between'>
              <p>
                {[
                  ALIGNER_ACTIONS.ALIGNER_CHANGE_OVERDUE,
                  ALIGNER_ACTIONS.AWAITING_RESUME_APPROVAL,
                  ALIGNER_ACTIONS.TREATMENT_DEACTIVATED,
                ].includes(action.action_type as any)
                  ? dayjs(action.performed_at).format('DD MMM YYYY')
                  : [
                        ALIGNER_ACTIONS.ALIGNER_CHANGE_OVERDUE_PENDING_ACTION,
                        ALIGNER_ACTIONS.ALIGNER_CHANGE_PENDING_APPROVAL,
                        ALIGNER_ACTIONS.CHECK_IN_PENDING_APPROVAL,
                        ALIGNER_ACTIONS.CREATE_REFINEMENT_REMINDER,
                      ].includes(action.action_type as any)
                    ? 'now'
                    : dayjs(action.performed_at).format('DD MMM YYYY, hh:mm A')}
              </p>
              <When
                isTrue={
                  action.details?.approved === false &&
                  (action.action_type === 'CHECK_IN' || action.action_type === 'ALIGNER_CHANGE') &&
                  !isManualTracking
                }
              >
                <Tag value={'PENDING ACTION'} className='bg-orangeSupport text-orange' />
              </When>
            </div>
            <div className='mt-1'>{renderActionContent(action)}</div>
          </div>
        </div>
      ))}
      <When isTrue={!isManualTracking && !disable}>
        <FooterButtons
          {...{
            aligner,
            onSendReminder,
            setIsEditTreatmentModel,
            setSelectedAligner,
            onResumeTreatment,
            isDeactivated,
            isPaused,
          }}
        />
      </When>
    </div>
  )
}

export default TimelineItemContent
