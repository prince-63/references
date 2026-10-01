import React from 'react'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

type Status = keyof typeof treatmentPlanStatusConstants

const statusClassMap: Record<Status | 'UNKNOWN', string> = {
  DEACTIVATED: 'bg-[#DC2626] text-white', // red-600
  APPROVED: 'bg-[#059669] text-white', // emerald-600
  ACTIVE: 'bg-[#059669] text-white', // emerald-600
  DRAFT: 'bg-[#6B7280] text-white', // gray-500
  IN_PROGRESS: 'bg-[#6B7280] text-white', // gray-500
  PAUSED: 'bg-[#6B7280] text-white', // gray-500
  COMPLETE: 'bg-[#16A34A] text-white', // green-600
  SENT_FOR_APPROVAL: 'bg-[#7C3AED] text-white', // violet-600
  PENDING_APPROVAL: 'bg-[#F59E0B] text-white', // amber-500
  ARCHIVED: 'bg-[#64748B] text-white', // slate-500
  RE_PLAN: 'bg-[#DC2626] text-white', // red-600
  UNKNOWN: 'bg-[#9CA3AF] text-white', // gray-400
}

const humanize = (s?: string) =>
  (s || 'UNKNOWN')
    .toString()
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

type PlanStatusTagProps = {treatmentStatus?: Status; mapReplan?: boolean}

const PlanStatusTag: React.FC<PlanStatusTagProps> = ({treatmentStatus, mapReplan = false}) => {
  const effectiveKey: Status | 'UNKNOWN' =
    (treatmentStatus === 'IN_PROGRESS' ? 'DRAFT' : treatmentStatus) || 'UNKNOWN'
  const classes = statusClassMap[effectiveKey] || statusClassMap.UNKNOWN
  let label = treatmentStatus === 'IN_PROGRESS' ? 'Draft' : humanize(treatmentStatus)
  if (mapReplan && treatmentStatus === treatmentPlanStatusConstants.RE_PLAN) {
    label = 'Revision Requested'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  )
}

export default PlanStatusTag
