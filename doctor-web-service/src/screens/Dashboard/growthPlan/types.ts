export type AssigneeType = 'internal' | 'customer' | 'vendor'

export interface StatusLabel {
  label_name: string
  count: number
}

export interface KanbanDetailItem {
  kanban_name: string
  total_count: number
  status_labels: StatusLabel[]
}

export interface GrowthKanbanDetails {
  details: KanbanDetailItem[]
}

export interface AssigneeDistributionItem {
  user_name: string
  role: string
  case_count: number
  percentage: number
  assignee_type: AssigneeType | string
  overdue_count: number
}

export interface UnprocessedBatchesSummary {
  overdue: number
  next_seven_days: number
  next_thirty_days: number
}

export interface PatientsSummary {
  total_patients: number
  active_patients_under_care: number
  in_planning: number
  new_cases: number
  ongoing_cases: number
  pending_task: number
}

export interface TreatmentStageSummary {
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  in_refinement: number
  total: number
}

export interface PatientComplianceSummary {
  needs_attention: number
  at_risk: number
  on_track: number
}

export interface AppConnectionStatusSummary {
  connected: number
  pending: number
  not_connected: number
}

export interface PendingUpdatesSummary {
  aligner_changes: number
  aligner_check_ins: number
  issue_reported: number
  unique_patients_with_pending_updates?: number
}

export interface GrowthPlanDashboardData {
  kanban_details: GrowthKanbanDetails
  new_case_assignee_distribution: AssigneeDistributionItem[]
  planning_operation_assignee_distribution: AssigneeDistributionItem[]
  production_operation_assignee_distribution: AssigneeDistributionItem[]
  unprocessed_batches: UnprocessedBatchesSummary
  patients_summary: PatientsSummary
  treatment_stage: TreatmentStageSummary
  patient_compliance: PatientComplianceSummary
  app_connection_status: AppConnectionStatusSummary
  pending_updates: PendingUpdatesSummary
  team_workload_overview: AssigneeDistributionItem[]
}

export interface DashboardV4Response {
  dashboard_details: {
    growth_plan: GrowthPlanDashboardData
  }
}
