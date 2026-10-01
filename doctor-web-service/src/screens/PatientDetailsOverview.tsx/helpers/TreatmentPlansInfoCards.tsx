import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {useEffect, useMemo, useState} from 'react'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import InfoCardWithContainer from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCardWithContainer'

export type Status = keyof typeof treatmentPlanStatusConstants

const TreatmentPlansInfoCards = ({
  treatmentPlanStatus,
  date,
  replanReason,
}: {
  treatmentPlanStatus: Status
  date?: string
  replanReason?: string | null
}) => {
  const config = useMemo(() => {
    const draft =
      'This plan is saved as a draft. You can continue editing or submit it for approval when ready.'
    const pending =
      'This plan has been submitted for review and cannot be edited until a response is received.'
    const approved = `This plan has been approved on ${date}. You can finalize it once all confirmations are complete.`
    const finalized = `This plan has been finalized on ${date} and is now active.`
    const revision = `Revision requested on ${date}.`
    const refinement = `This plan was deactivated on ${date}. You can create a new plan once updates are ready.`
    return {
      [treatmentPlanStatusConstants.DRAFT]: {message: draft},
      [treatmentPlanStatusConstants.SENT_FOR_APPROVAL]: {message: pending},
      [treatmentPlanStatusConstants.PENDING_APPROVAL]: {message: pending},
      [treatmentPlanStatusConstants.APPROVED]: {message: approved},
      [treatmentPlanStatusConstants.ACTIVE]: {message: finalized},
      [treatmentPlanStatusConstants.COMPLETE]: {message: finalized},
      [treatmentPlanStatusConstants.RE_PLAN]: {message: revision},
      [treatmentPlanStatusConstants.DEACTIVATED]: {message: refinement},
    } as const
  }, [date])

  const cfg = (config as any)[treatmentPlanStatus]
  const trimmedReplanReason = replanReason?.trim()
  const [isReplanReasonExpanded, setIsReplanReasonExpanded] = useState(false)

  useEffect(() => {
    setIsReplanReasonExpanded(false)
  }, [trimmedReplanReason])

  const {shouldTruncateReplanReason, truncatedReplanReason} = useMemo(() => {
    if (!trimmedReplanReason) {
      return {shouldTruncateReplanReason: false, truncatedReplanReason: ''}
    }

    const normalizedReason = trimmedReplanReason.trim()
    const words = normalizedReason.split(/\s+/).filter(Boolean)
    const wordLimit = 8

    if (words.length <= wordLimit) {
      return {shouldTruncateReplanReason: false, truncatedReplanReason: normalizedReason}
    }

    return {
      shouldTruncateReplanReason: true,
      truncatedReplanReason: words.slice(0, wordLimit).join(' '),
    }
  }, [trimmedReplanReason])

  const displayReplanReason =
    !trimmedReplanReason || isReplanReasonExpanded || !shouldTruncateReplanReason
      ? (trimmedReplanReason ?? '')
      : `${truncatedReplanReason}...`

  // Style mapping for border and 20% bg opacity (Support classes)
  const styleByStatus: Record<Status | 'UNKNOWN', {className: string; icon?: string}> = {
    DEACTIVATED: {className: 'border border-red bg-redSupport', icon: '#D92D20'},
    RE_PLAN: {className: 'border border-red bg-redSupport', icon: '#D92D20'},
    APPROVED: {className: 'border border-tertiaryColor bg-tertiarySupport', icon: '#0E9384'},
    ACTIVE: {className: 'border border-tertiaryColor bg-tertiarySupport', icon: '#0E9384'},
    COMPLETE: {className: 'border border-tertiaryColor bg-tertiarySupport', icon: '#0E9384'},
    IN_PROGRESS: {className: 'border border-secondaryColor bg-secondarySupport', icon: '#735BF2'},
    PAUSED: {className: 'border border-orange bg-orangeSupport', icon: '#BE8901'},
    SENT_FOR_APPROVAL: {className: 'border border-orange bg-orangeSupport', icon: '#BE8901'},
    PENDING_APPROVAL: {className: 'border border-orange bg-orangeSupport', icon: '#BE8901'},
    DRAFT: {className: 'border border-mediumGray bg-primarySupport', icon: '#667085'},
    ARCHIVED: {className: 'border border-lightGray bg-primarySupport', icon: '#667085'},
    UNKNOWN: {className: 'border border-mediumGray bg-primarySupport', icon: '#9CA3AF'},
  }

  const style = styleByStatus[treatmentPlanStatus] || styleByStatus.UNKNOWN

  if (!cfg) return null

  if (treatmentPlanStatus === treatmentPlanStatusConstants.RE_PLAN) {
    const showToggle = Boolean(trimmedReplanReason && shouldTruncateReplanReason)
    const replanComment = trimmedReplanReason ? (
      <span className='flex flex-col gap-1'>
        <span className='ml-1 font-figtree font-medium text-[14px] leading-[20px] tracking-[0.01em] text-[#475467]'>
          Comment
        </span>

        <span className='ml-1 break-words font-figtree font-normal text-[16px] leading-[24px] tracking-normal'>
          {displayReplanReason}
          {showToggle && (
            <>
              {' '}
              <button
                type='button'
                className='text-[#F04438] font-semibold'
                onClick={() => setIsReplanReasonExpanded((prev) => !prev)}
              >
                {isReplanReasonExpanded ? 'See less' : 'See more'}
              </button>
            </>
          )}
        </span>
      </span>
    ) : undefined

    return (
      <>
        <InfoCardWithContainer
          title={cfg.message}
          className='flex md:!justify-between !justify-start border !border-[#F45045]'
          titleClassName='!text-black font-semibold'
          topSectionClassName='bg-[#FEF4F4] rounded-t-xl'
          infoIconColor='#F45045'
          remarksClassName='!bg-transparent'
          hideDismissButton
          remarks={replanComment}
          showRemarksTitle={false}
        />
      </>
    )
  }

  return (
    <InfoCard
      className={`${style.className} text-sm font-normal`}
      infoIconColor={style.icon}
      titleClassName='text-black text-sm font-medium'
      title={cfg.message}
      showButton={false}
    />
  )
}

export default TreatmentPlansInfoCards
