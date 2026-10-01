import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {getPlanStatus} from '@utils/getPlanStatus'
import useDispatchAction from '@hooks/useDispatchAction'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'

import {Button} from 'antd'
import {
  ArrowRight,
  CircleCheck,
  CircleAlert,
  Clock3,
  FileText,
  ClipboardList,
  SquareArrowOutUpRight,
} from 'lucide-react'
import TreatmentPlanActions from 'screens/PatientDetailsOverview.tsx/components/TreatmentPlanActions'
import PlanStatusTag from 'screens/PatientDetailsOverview.tsx/helpers/PlanStatusTag'
import {NewPlanData} from 'screens/PatientDetailsOverview.tsx/types/PlanList.types'
import getColorPalette from 'utils/getColorPalette'
import CollapseCardWithBorder from './CollapseCardWithBorder'
import {openDocument} from 'utils/ConstFunctions'

interface PlanCardProps {
  plan: NewPlanData
  handleOnClick: (
    plan: NewPlanData,
    treatmentPlanStatus?: keyof typeof treatmentPlanStatusConstants
  ) => Promise<any>
}

const PlanCard: React.FC<PlanCardProps> = ({plan, handleOnClick}) => {
  const navigate = useNavigate()
  const {patientId} = useParams()
  const profileBasePath = useProfileBasePath()
  const {dispatchAction} = useDispatchAction()
  const [isRevisionCommentExpanded, setIsRevisionCommentExpanded] = useState(false)
  const colorPalette = getColorPalette()

  const handleEditClick = ({planId, orderId}: {planId: number; orderId: string}) => {
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: planId?.toString() ?? '',
      })
    )
      .unwrap()
      .then(() =>
        navigate(`/${patientId}/plans-list/edit/setupTreatmentPlan/${planId}?order_id=${orderId}`, {
          state: {isEdit: true},
        })
      )
  }

  const treatmentStatus = getPlanStatus({
    treatmentPlan: plan as any,
  }) as keyof typeof treatmentPlanStatusConstants

  const formatAlignerSeries = (series: string | null | undefined) => {
    if (!series || series === '0-0') return 'Not Added'
    return series.replace(/\s*-\s*/g, ' - ')
  }
  const rawStageCount = Number(
    (plan as NewPlanData & {total_stages?: number | string})?.stages ?? 0
  )
  const stageCount = Number.isFinite(rawStageCount) ? rawStageCount : 0
  const fallbackFilesCount = 0
  const filesCount =
    typeof plan?.total_file_count === 'number' ? plan.total_file_count : fallbackFilesCount
  const upperAlignerSeries = formatAlignerSeries(plan.upper_aligner_series)
  const lowerAlignerSeries = formatAlignerSeries(plan.lower_aligner_series)
  const wearPeriod = plan.wear_days ? `${plan.wear_days} DAYS / ALIGNER` : 'Not Added'
  const isApprovedStatus = treatmentStatus === treatmentPlanStatusConstants.APPROVED
  const isInRevisionStatus = treatmentStatus === treatmentPlanStatusConstants.RE_PLAN
  const isPendingApprovalStatus =
    treatmentStatus === treatmentPlanStatusConstants.PENDING_APPROVAL ||
    treatmentStatus === treatmentPlanStatusConstants.SENT_FOR_APPROVAL
  const isArchivedStatus = treatmentStatus === treatmentPlanStatusConstants.ARCHIVED
  const revisionComment =
    String(
      plan?.treatment_plan_metadata?.replan_reason ?? plan?.description ?? plan?.instructions ?? ''
    ).trim() || 'Revision requested by lab.'
  const revisionCommentPreviewLength = 120
  const shouldShowReadMore = revisionComment.length > revisionCommentPreviewLength
  const displayedRevisionComment =
    shouldShowReadMore && !isRevisionCommentExpanded
      ? `${revisionComment.slice(0, revisionCommentPreviewLength).trimEnd()}...`
      : revisionComment
  const formatApprovalDate = (value?: string | null) => {
    if (!value) return null
    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return null
    const day = String(parsedDate.getDate()).padStart(2, '0')
    const month = parsedDate.toLocaleString('en-US', {month: 'short'}).toUpperCase()
    const year = parsedDate.getFullYear()
    const time = parsedDate.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return `${day}-${month}-${year}, ${time}`
  }
  const approvedOn = formatApprovalDate(plan?.approved_date ?? plan?.order_status_changed_at)
  const webViewerButton = plan?.planning_link ? (
    <Button
      className='h-12 rounded-xl border !bg-white !font-semibold !text-[11px] !uppercase !tracking-[0.14em] transition-all duration-200 hover:!bg-white hover:!opacity-95 hover:shadow-sm'
      style={{
        borderColor: colorPalette.neutralBlack,
        color: colorPalette.neutralBlack,
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (plan.planning_link) {
          openDocument(plan.planning_link, `${plan?.treatment_plan_name || 'Treatment Plan'} PDF`)
        }
      }}
      icon={<SquareArrowOutUpRight size={16} className='mt-[2px]' />}
    >
      Web Viewer
    </Button>
  ) : null

  const renderCardTitle = () => (
    <div className='w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
      <div className='flex items-center gap-3 min-w-0'>
        <div
          className='inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl'
          style={{
            backgroundColor: isArchivedStatus
              ? '#F3F4F6'
              : isApprovedStatus
                ? colorPalette.tertiarySupport
                : colorPalette.secondarySupport,
            color: isArchivedStatus
              ? '#9CA3AF'
              : isApprovedStatus
                ? colorPalette.tertiaryColor
                : isInRevisionStatus
                  ? colorPalette.secondaryColor
                  : colorPalette.primaryColor,
          }}
        >
          <ClipboardList size={20} />
        </div>
        <div className='min-w-0'>
          <h3 className='truncate text-2xl font-extrabold'>
            {plan?.treatment_plan_tag_name ?? plan?.treatment_plan_name ?? ''}
          </h3>
          <div className='text-sm font-medium text-textColor/70'>{plan.version ?? 'V1'}</div>
        </div>
      </div>

      <div className='w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3'>
        <div className='flex items-center gap-5 border-r border-lightGray pr-3 lg:pr-6'>
          <HeaderCountCard value={stageCount} label='Stages' />
          <HeaderCountCard value={filesCount} label='Files' />
        </div>

        <div className='flex items-center gap-2'>
          {isArchivedStatus ? (
            <span
              className='inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]'
              style={{
                borderColor: '#E5E7EB',
                color: '#9CA3AF',
                backgroundColor: '#F9FAFB',
              }}
            >
              Archived
            </span>
          ) : isApprovedStatus ? (
            <span
              className='inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]'
              style={{
                borderColor: `${colorPalette.tertiaryColor}66`,
                color: colorPalette.tertiaryColor,
                backgroundColor: colorPalette.tertiarySupport,
              }}
            >
              Approved
            </span>
          ) : isInRevisionStatus ? (
            <span
              className='inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]'
              style={{
                borderColor: `${colorPalette.secondaryColor}66`,
                color: colorPalette.secondaryColor,
                backgroundColor: colorPalette.secondarySupport,
              }}
            >
              In Revision
            </span>
          ) : isPendingApprovalStatus ? (
            <span
              className='inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]'
              style={{
                borderColor: colorPalette.orange,
                color: colorPalette.orange,
                backgroundColor: colorPalette.orangeSupport2,
              }}
            >
              Pending Approval
            </span>
          ) : (
            <PlanStatusTag treatmentStatus={treatmentStatus} mapReplan />
          )}
        </div>
      </div>
    </div>
  )

  const renderCardContent = () => (
    <>
      <div className='w-full border-t border-lightGray pt-5'>
        {isInRevisionStatus && (
          <div
            className='mb-4 w-full rounded-2xl border px-5 py-4'
            style={{
              borderColor: `${colorPalette.secondaryColor}40`,
              backgroundColor: `${colorPalette.secondarySupport}80`,
            }}
          >
            <div
              className='inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em]'
              style={{color: colorPalette.secondaryColor}}
            >
              <CircleAlert size={16} />
              <span>Lab Revision Comment</span>
            </div>
            <p
              className='mt-4 whitespace-pre-wrap break-words text-lg leading-8'
              style={{color: colorPalette.secondaryColor}}
            >
              {displayedRevisionComment}
            </p>
            {shouldShowReadMore && (
              <button
                type='button'
                className='no-card-nav mt-2 text-base font-semibold'
                style={{color: colorPalette.secondaryColor}}
                onClick={(event) => {
                  event.stopPropagation()
                  setIsRevisionCommentExpanded((previous) => !previous)
                }}
              >
                {isRevisionCommentExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
          <div className='w-full rounded-2xl border border-lightGray bg-lightGray px-4 py-4'>
            <div className='text-[11px] font-bold uppercase tracking-[0.14em] text-textColor/80'>
              Arch Series
            </div>
            <div className='mt-3 flex items-end gap-6'>
              <div>
                <div className='text-[10px] font-bold uppercase tracking-[0.08em] text-textColor/80'>
                  Upper
                </div>
                <div className='mt-1 text-xl font-bold text-titleColor'>{upperAlignerSeries}</div>
              </div>
              <div>
                <div className='text-[10px] font-bold uppercase tracking-[0.08em] text-textColor/80'>
                  Lower
                </div>
                <div className='mt-1 text-xl font-bold text-titleColor'>{lowerAlignerSeries}</div>
              </div>
            </div>
          </div>

          <div className='w-full rounded-2xl border border-lightGray bg-lightGray px-4 py-4'>
            <div className='text-[11px] font-bold uppercase tracking-[0.14em] text-textColor/80'>
              Wear Period
            </div>
            <div className='mt-3 text-xl font-bold text-titleColor'>{wearPeriod}</div>
          </div>

          <button
            type='button'
            className='no-card-nav w-full cursor-pointer rounded-2xl border border-primaryColor/40 bg-white px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primaryColor/70 hover:shadow-[0_14px_30px_rgba(17,24,39,0.16)]'
            onClick={(event) => {
              event.stopPropagation()
              const query = plan?.order_id ? `?order_id=${plan.order_id}` : ''
              navigate(`${profileBasePath}/${patientId}/plans/view-plan/${plan.plan_id}${query}`)
            }}
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                <div className='text-[11px] uppercase tracking-[0.14em] text-textColor/80'>
                  Treatment Summary
                </div>
                <div className='mt-3 inline-flex items-center gap-2 text-xl font-semibold text-titleColor'>
                  <span>Plan Details</span>
                  <ArrowRight size={18} />
                </div>
              </div>
              <div className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondarySupport text-primaryColor'>
                <FileText size={18} />
              </div>
            </div>
          </button>
        </div>
      </div>

      <div
        className='mt-4 border-t border-lightGray pt-4 flex items-center justify-between flex-wrap gap-2 md:gap-3'
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {isApprovedStatus && (
          <div
            className='inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em]'
            style={{color: colorPalette.tertiaryColor}}
          >
            <CircleCheck size={16} />
            <span>{approvedOn ? `Plan approved on ${approvedOn}` : 'Plan approved'}</span>
          </div>
        )}
        {isInRevisionStatus && (
          <div
            className='inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em]'
            style={{color: colorPalette.secondaryColor}}
          >
            <Clock3 size={16} />
            <span>Lab is revising this plan</span>
          </div>
        )}

        <div className='ml-auto flex md:flex-row flex-col items-center gap-2 md:gap-3 w-full'>
          {webViewerButton}
          <TreatmentPlanActions
            {...{
              isPurchasedPlanReceived: false,
              treatmentStatus,
              handleOnClick: (treatmentPlanStatus?: keyof typeof treatmentPlanStatusConstants) =>
                handleOnClick(plan, treatmentPlanStatus),
              handleDeleteDraft: () => {},
              handleEditClick: () => {
                handleEditClick({planId: plan.plan_id, orderId: plan?.order_id})
              },
              styleVariant: 'customerPlanCard',
            }}
          />
        </div>
      </div>
    </>
  )

  return (
    <CollapseCardWithBorder
      title={renderCardTitle()}
      position='end'
      defaultOpen={isPendingApprovalStatus || isApprovedStatus || isArchivedStatus}
      sectionClassName='!rounded-2xl !border-3 !p-3 md:!p-5 !shadow-sm !gap-0'
      sectionStyle={
        isArchivedStatus
          ? {
              borderColor: '#E5E7EB',
            }
          : isApprovedStatus
            ? {
                borderColor: `${colorPalette.tertiaryColor}66`,
              }
            : isInRevisionStatus
              ? {
                  borderColor: `${colorPalette.secondaryColor}4d`,
                }
              : undefined
      }
      collapseClassName='!bg-transparent !gap-0'
    >
      {renderCardContent()}
    </CollapseCardWithBorder>
  )
}

export default PlanCard

const HeaderCountCard = ({value, label}: {value: number | string; label: string}) => {
  return (
    <div className='text-center'>
      <div className='text-3xl font-extrabold leading-none text-titleColor'>{value}</div>
      <div className='mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-textColor/70'>
        {label}
      </div>
    </div>
  )
}
