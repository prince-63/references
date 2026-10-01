import React from 'react'
import cn from '../../../@utils/cn'
import {
  CaseCreationIcon,
  RecordUploadIcon,
  SubmissionIcon,
  InfoRequestIcon,
  InitialPlanIcon,
  RevisionFeedbackIcon,
  IterativePlanIcon,
  ApprovalIcon,
  PrimaryClosureIcon,
  RefinementStartIcon,
} from './ActivityIcons'
import ACTIVITY_ICON_CONFIG from '../helpers/activityIconConfig'
import {ActivityType} from '../helpers/caseHistory.types'

interface ActivityIconBadgeProps {
  activityType: ActivityType
}

const ICON_MAP: Record<ActivityType, React.FC<{color?: string; size?: number}>> = {
  CASE_CREATION: CaseCreationIcon,
  RECORD_UPLOAD: RecordUploadIcon,
  SUBMISSION: SubmissionIcon,
  INFORMATION_REQUEST: InfoRequestIcon,
  INITIAL_PLAN: InitialPlanIcon,
  REVISION_FEEDBACK: RevisionFeedbackIcon,
  ITERATIVE_PLAN: IterativePlanIcon,
  APPROVAL: ApprovalIcon,
  PRIMARY_CLOSURE: PrimaryClosureIcon,
  REFINEMENT_START: RefinementStartIcon,
  STL_REQUESTED: InfoRequestIcon,
  STL_UPLOADED: RecordUploadIcon,
  PLANNING_DONE: PrimaryClosureIcon,
  SHIPPED: SubmissionIcon,
  DELIVERED: ApprovalIcon,
  VSP_CASE_CREATED: CaseCreationIcon,
  VSP_CASE_SUBMITTED: SubmissionIcon,
  VSP_FILES_UPLOADED: RecordUploadIcon,
  VSP_PLAN_READY_FOR_REVIEW: InitialPlanIcon,
  VSP_PLAN_APPROVED: ApprovalIcon,
  VSP_REVISION_REQUESTED: RevisionFeedbackIcon,
  VSP_MORE_INFORMATION_REQUIRED: InfoRequestIcon,
  VSP_PLANNING_COMPLETED: PrimaryClosureIcon,
  VSP_PRODUCTION_ORDER_CREATED: IterativePlanIcon,
  VSP_ORDER_SHIPPED: SubmissionIcon,
  VSP_ORDER_DELIVERED: ApprovalIcon,
}

/**
 * Renders a colored circular badge with the appropriate icon for the given activity type.
 */
const ActivityIconBadge: React.FC<ActivityIconBadgeProps> = ({activityType}) => {
  const config = ACTIVITY_ICON_CONFIG[activityType]
  const IconComponent = ICON_MAP[activityType]

  if (!config || !IconComponent) return null

  return (
    <div
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
        config.bgColor
      )}
    >
      <IconComponent color={config.iconColor} size={12} />
    </div>
  )
}

export default ActivityIconBadge
