// Import Task type if defined elsewhere
// import { Task } from '../path/to/task-type';

import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'

// Or define Task type here if not imported
type Task = {
  patient_name?: string
  manufacturing_sub_task_response?: {
    treatment_version?: string
    batch_number?: number
    category?: string
    jaw_type?: string
    aligner_number?: number
  }
}

export const formatManufacturingLabel = (task: Task) => {
  const firstName =
    getFirstLetterCapitalOfWord(task.patient_name || '')
      .trim()
      .split(/\s+/)[0] || 'Unknown'

  const sub = task.manufacturing_sub_task_response || {}

  const version = (sub.treatment_version || '').toUpperCase() || 'V?'

  const batch = typeof sub.batch_number === 'number' ? sub.batch_number : 'X'

  const catMap: Record<string, string> = {
    ALIGNER: 'AL',
    RETAINER: 'RET',
    TEMPLATE: 'TL',
  }
  const category = catMap[(sub.category || '').toUpperCase()] || 'UNK'

  const jaw = (sub.jaw_type || '').toUpperCase().startsWith('U')
    ? 'U'
    : (sub.jaw_type || '').toUpperCase().startsWith('L')
      ? 'L'
      : '?'

  const alignerNo = typeof sub.aligner_number === 'number' ? sub.aligner_number : 'X'

  // Final shape: Test-V1-B1-AL-L6
  return `${firstName}-B${batch}-${version}-${category}-${jaw}${alignerNo}`
}

export const truncateText = (text: string | null | undefined, maxLength = 21) => {
  if (!text) return ''
  const trimmed = String(text).trim()
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed
}

// utils/parsePlanSummary.ts
export type PlanSummaryCounts = {
  /** what you asked for: */
  draft: number
  pendingReview: number // from "Sent for Approval"
  inRevision: number // from "Re-Plan"
  approved: number

  /** full breakdown (optional but handy) */
  raw: Partial<
    Record<
      | 'Draft'
      | 'In Progress'
      | 'Sent for Approval'
      | 'Pending Approval'
      | 'Approved'
      | 'Active'
      | 'Archived'
      | 'Re-Plan'
      | 'Deactivated',
      number
    >
  >
}

const LABELS = [
  'Draft',
  'In Progress',
  'Sent for Approval',
  'Pending Approval',
  'Approved',
  'Active',
  'Archived',
  'Re-Plan',
  'Deactivated',
] as const

const SEGMENT_RE =
  /(\d+)\s+(Draft|In Progress|Sent for Approval|Pending Approval|Approved|Active|Archived|Re-Plan|Deactivated)/g

export function parsePlanSummary(message: string): PlanSummaryCounts {
  const raw: PlanSummaryCounts['raw'] = {}
  let m: RegExpExecArray | null

  while ((m = SEGMENT_RE.exec(message)) !== null) {
    const count = Number(m[1])
    const label = m[2] as (typeof LABELS)[number]
    raw[label] = count
  }

  const draft = raw['Draft'] ?? 0
  const pendingReview = raw['Sent for Approval'] ?? 0
  const inRevision = raw['Re-Plan'] ?? 0
  const approved = raw['Approved'] ?? 0

  return {draft, pendingReview, inRevision, approved, raw}
}
