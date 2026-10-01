import {IVendorDashboardCounts} from './vendorDashboardCounts.types'

export interface IDashboard {
  dashboard_details: IDashboardDetails
}

export type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

export type IDashboardDetails = Nullable<{
  user_info: IUserInfo
  patients_summary: IPatientsSummary
  practice_summary: IPracticeSummary
  labs_summary: ILabsSummary
  pending_tasks: IPendingTasks
  active_practice_orders: IActivePracticeOrders
  orders_sent: IOrdersSent
  orders_received: IOrdersReceived
  active_orders_sent: IActiveOrdersSent
  ongoing_orders: IOngoingOrders
  professional_plan_workspace_my_task: IProfessionalPlanWorkspaceMyTask
  professional_plan_customer_view_my_task: IProfessionalPlanCustomerViewMyTask
  growth_and_starter_plan_my_task: IGrowthAndStarterPlanMyTask
  practice_connected_to_org_my_task: IPracticeConnectedToOrgMyTask
  patient_compliance: IPatientCompliance
  label_name: LabelName
  sent_order_all_details: IVendorDashboardCounts
  enterprise_plan_details: DashboardMetrics
  received_order_all_details: IVendorDashboardCounts
}>

export interface IPracticeConnectedToOrgVsp {
  counts?: PracticeDashboardCounts
  unread_notification_count: number
}

export interface PracticeDashboardCounts {
  // Lab & Fulfillment Pipeline
  draft: number
  planning: number
  need_info: number
  approval_pending: number
  in_revision: number
  approved: number
  manufacturing: number
  shipped: number

  // Patient Compliance
  ready_to_start: number
  on_track: number
  needs_attention: number
  at_risk: number

  // Case Statistics
  active_cases: number
  completed: number
  cases_this_month: number
  cases_last_month: number
  last_activity_date: string | null
  total_unread_chat_count: number
}

export type IDashboardNewDetails = Nullable<{
  starter_plan: IStarterPlan
  professional_plan: IProfessionalPlan
  practice_connected_to_org: IPracticeConnectedToOrg
  enterprise_professional_plan: IProfessionalEnterprisePlan
  growth_plan: IGrowthPlan

  enterprise_plan: DashboardOverviewForEnterprise
  design_lab: DesignLab
  third_party_customer: ThirdPartyCustomer
  third_party_lab: ThirdPartyLab
  label_name: LabelName
  enterprise_lab_staff: EnterpriseLabStaff

  internal_user_plan: DashboardOverviewForEnterprise

  enterprise_planning_user: DashboardOverviewForEnterprise
  enterprise_manufacturing_user: DashboardOverviewForEnterprise
  planning_practice: PlanningPractice
  vsp_customer: IPracticeConnectedToOrgVsp
  total_unread_chat_count?: number
  unread_chat_count?: number
  chat_unread_count?: number
  unread_notification_count?: number
  notifications_unread_count?: number
  notification_count?: number
}>

export interface PlanningPractice {
  counts?: PlanningPracticeCounts
  action_required: PlanningPatient[]
  pending_approval: PlanningPatient[]
  stl_required: PlanningPatient[]
}

export interface PlanningPracticeCounts {
  active: number
  draft: number
  need_info: number
  in_progress: number
  in_review: number
  in_revision: number
  approved: number
  completed: number
  cases_this_month: number
  cases_last_month: number
  last_activity_date: string | null
  total_unread_chat_count: number
  /** @deprecated kept for backward compatibility */
  refinement?: number
  /** @deprecated kept for backward compatibility */
  pending_approval?: number
  /** @deprecated kept for backward compatibility */
  stl_pending?: number
  counts: number
  unread_notification_count: number
}

export interface PlanningPatient {
  patient_id: string
  full_name: string
  first_name: string
  last_name: string

  profile_picture_url: string | null
  profile_image_id: string | null

  lab_name: string
}

// ENTERPRISE
// Reusable bits
type AssigneeType = 'UNASSIGNED' | 'ASSIGNED'

interface StatusLabel {
  label_name: string
  name: string
  count: number
}

interface KanbanDetail {
  kanban_name: string
  workflow_label_name: string
  status_labels: StatusLabel[]
  total_count: number
}

interface KanbanDetails {
  details: KanbanDetail[]
}

interface AssigneeDistribution {
  user_name: string
  role: string
  case_count: number
  percentage: number // 0 - 100
  assignee_type: AssigneeType
  overdue_count: number
  total_counts: number
}

interface CoreTask {
  new_case: number
  approve_plan: number
  move_to_production: number
  starting_soon: number
  aligner_changes_and_check_ins: number
  invitation_pending: number
}

interface UnprocessedBatches {
  overdue: number
  next_seven_days: number
  next_thirty_days: number
}

interface PatientsSummary {
  active_patients_under_care: number
  new_cases: number
  ongoing_cases: number
  new_cases_this_month: number
  treatment_tracking_count: number
  pending_task: number | null
  case_acceptance_rate: number // percentage (0-100) or ratio (0-1) per your data model
}

interface TreatmentStage {
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  in_refinement: number
  total: number
}

interface PatientCompliance {
  needs_attention: number
  at_risk: number
  on_track: number
  total: number
}

interface AppConnectionStatus {
  connected: number
  pending: number
  not_connected: number
  total: number
}

interface PendingUpdates {
  aligner_changes: number
  aligner_check_ins: number
  issue_reported: number
  total: number
  chat_pending: number | null
  unique_patients_with_pending_updates: number
}

interface SectionCounts {
  new_case_operation_count: number
  planning_operation_count: number
  production_operation_count: number
  treatment_tracking_count: number
  in_house_planning_count: number
  outsource_planning_count: number
  in_house_production_count: number
  outsource_production_count: number
}

// Root interface
export interface DashboardOverviewForEnterprise {
  kanban_details: KanbanDetails
  new_case_assignee_distribution: AssigneeDistribution[]
  planning_operation_assignee_distribution: AssigneeDistribution[]
  production_operation_assignee_distribution: AssigneeDistribution[]
  team_workload_overview: AssigneeDistribution[]
  coretask: CoreTask
  unprocessed_batches: UnprocessedBatches
  patients_summary: PatientsSummary
  treatment_stage: TreatmentStage
  patient_compliance: PatientCompliance
  app_connection_status: AppConnectionStatus
  pending_updates: PendingUpdates
  section_counts: SectionCounts
  total_patient_count: number
  total_unread_chat_count?: number
  unread_notification_count: number
}

export interface EnterpriseLabStaff {
  practice_order: EnterpriseStaffPracticeOrders
  customer_orders: EnterpriseStaffCustomerOrders
}

export interface EnterpriseStaffPracticeOrders {
  ordered: number
  in_progress: number
  in_review: number
  approved: number
  in_re_plan: number
  completed: number
  my_task: EnterpriseStaffMyTask
  need_attention: EnterpriseStaffNeedAttention
  customer_action_pending: EnterpriseStaffCustomerActionPending
}

export interface EnterpriseStaffMyTask {
  in_progress: number
  review_assigned_orders_to_me: number
}

export interface EnterpriseStaffNeedAttention {
  urgent_orders: number
  in_re_plan: number
  stl_files_requested: number
  add_due_date: number
  due_today: number
  overdue: number
}

export interface EnterpriseStaffCustomerActionPending {
  in_review: number
  approved: number
  stl_files_uploaded: number
  invited: number
  active: number
}
export interface EnterpriseStaffCustomerOrders {
  ordered: number
  in_progress: number
  in_review: number
  in_re_plan: number
  approved: number
  stl_files_requested: number
  stl_files_uploaded: number
  completed: number
  my_task: EnterpriseStaffMyTask
  need_attention: EnterpriseStaffNeedAttention
  customer_action_pending: EnterpriseStaffCustomerActionPending
}
export interface IPatientTreatmentStage {
  in_assessment: number
  in_planning: number
  tracking_pending: number
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  refinement: number
  total_patients: number
}

export interface IUserInfo {
  display_name: string
  profile_id: string
  roles: string[]
}

export interface IPatientsSummary {
  all_patients: number
  in_assessment: number
  in_planning: number
  tracking_pending: number
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  in_refinement: number

  // New
  active_patients_under_care: number
  new_cases: number
  ongoing_cases: number
  new_cases_this_month: number
  treatment_tracking_count: number
  pending_task: number
  case_acceptance_rate: number
}

export interface IPracticeSummary {
  total: number
}

export interface ILabsSummary {
  total: number
}

export interface IPendingTasks {
  workspace: number
  customer_view: number
}

export interface IActivePracticeOrders {
  total: number
  growth_percentage: number
  ordered: number
  in_review: number
  approved: number
  in_re_plan: number
  in_progress: number
  completed: number
}

export interface IOrdersSent {
  total: number
  ongoing: number
  completed: number
  in_progress: number
  growth_percentage: number
}

export interface IOrdersReceived {
  received: number
  growth_percentage: number
}

export interface IActiveOrdersSent {
  total: number
  ordered: number
  in_review: number
  approved: number
  stl_files_requested: number
  stl_files_approved: number
  in_re_plan: number
  draft: number
  completed: number
}

export interface IOngoingOrders {
  total: number
  ordered: number
  in_review: number
  approved: number
  completed: number
  in_re_plan: number
  draft: number

  in_progress: number
  on_hold: number
  replan: number
  cancelled: number
  stl_file_requested: number
  stl_file_approved: number
  unique_patient_count?: number
}

export interface IPatientCompliance {
  needs_attention: number
  at_risk: number
  on_track: number
}

export interface LabelName {
  home: string
  workspace: string
  customer_view: string
  label_view: string
}

export interface IProfessionalPlanWorkspaceMyTask {
  total_pending: number
  new_orders: number
  confirm_and_send_treatment_plans: number
  in_replan: number
  not_added_due_by: number
  due_today: number
  overdue: number
}

export interface IPracticeConnectedToOrg {
  counts?: PracticeDashboardCounts
  unread_notification_count: number
  total_unread_chat_count?: number
}

export interface PracticeDashboardCounts {
  // Lab & Fulfillment Pipeline
  draft: number
  planning: number
  need_info: number
  approval_pending: number
  in_revision: number
  approved: number
  manufacturing: number
  shipped: number

  // Patient Compliance
  ready_to_start: number
  on_track: number
  needs_attention: number
  at_risk: number

  // Case Statistics
  active_cases: number
  completed: number
  cases_this_month: number
  cases_last_month: number
  last_activity_date: string | null
  total_unread_chat_count: number
  unread_notification_count?: number
}
export interface ThirdPartyCustomer {
  orders: Orders
  my_tasks: IProfessionalPlanCustomerViewMyTask
}
export interface IGrowthPlan {
  home: GrowthPlanHome
  workspace: GrowthPlanWorkSpace
  customer_view: ProfessionalPlanCustomerView
  unread_notification_count: number
}

export interface GrowthPlanHome {
  patients: number
  orders_sent: ProfessionalPlanOrderSent
  pending_tasks: ProfessionalPlanPendingTask
}
export interface GrowthPlanWorkSpace {
  patients_summary: IPatientsSummary
  my_tasks: GrowthPlanMyTask
  patient_compliance: IPatientCompliance
}
export interface IStarterPlan {
  patients_summary: {
    active_patients_under_care: number
    new_cases: number
    ongoing_cases: number
    new_cases_this_month: number
    treatment_tracking_count: number
    pending_task: number
    case_acceptance_rate: number
    aligner: number
    braces: number
  }
  core_task: {
    add_appointment_notes: number
    needs_attention: number
    at_risk: number
    invitation_pending: number
    aligner_change_and_checkin: number
  }
  unread_notification_count: number
}

export interface IProfessionalEnterprisePlan {
  home: EnterpriseHome
  practice_orders: ProfessionalPlanWorkSpace
  customer_orders: EnterpriseCustomerOrders
  lab_orders: ProfessionalEnterprisePlanLabOrders
}

export interface EnterpriseCustomerOrders {
  orders: EnterpriseCustomerOrderSent
  my_task: EnterPriseMyTask
  need_attention: EnterPriseNeedAttention
  customer_action_pending: EnterPriseCustomerActionPending
  users: EnterPriseUsers
}

export interface DesignLab {
  orders: EnterpriseCustomerOrderSent
  my_tasks: EnterPriseMyTask
  needs_attention: EnterPriseNeedAttention
  customer_action_pending: EnterPriseCustomerActionPending
  users: EnterPriseUsers
}

export interface ThirdPartyLab {
  orders: EnterpriseCustomerOrderSent
  my_tasks: EnterPriseMyTask
  needs_attention: EnterPriseNeedAttention
  customer_action_pending: EnterPriseCustomerActionPending
  users: EnterPriseUsers
}

export interface EnterPriseUsers {
  active: number
  invited: number
  user_action_pending: number
  customer_action_pending: number
}

export interface EnterPriseCustomerActionPending {
  active: number
  invited: number
  in_review: number
  approved: number
  stl_files_uploaded: number
}
export interface EnterPriseNeedAttention {
  urgent_orders: number
  in_re_plan: number
  stl_files_requested: number
  add_due_date: number
  due_today: number
  overdue: number
}
export interface EnterPriseMyTask {
  unassigned_orders: number
  in_progress: number
  review_assigned_orders_to_me: number
}
export interface EnterpriseHome {
  practice_orders: PracticeOrders
  customers_orders: CustomerOrders
  lab_orders: EnterprisePlanLabOrders
  manufacturing_status: ProfessionalPlanManufacturingStatus
  patients_treatment_stage: EnterPrisePlanTreatmentStage
}

export interface EnterPrisePlanTreatmentStage {
  all_patients: number
  in_assessment: number
  in_planning: number
  in_manufacturing: number
  in_transit: number
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  in_refinement: number
}
export interface EnterprisePlanLabOrders {
  pending_updates: number
  patients: number
  labs: number
  order_growth_percentage: number
  total: number
  draft: number
  ordered: number
  in_progress: number
  in_review: number
  approved: number
  stl_files_requested: number
  stl_files_approved: number
  in_re_plan: number
  need_more_info: number
  cancelled: number
  completed: number
}
export interface PracticeOrders {
  pending_updates: number
  patients: number
  practices: number
  order_growth_percentage: number
  total: number
  ordered: number
  in_progress: number
  in_review: number
  approved: number
  in_re_plan: number
  need_more_info: number
  cancelled: number
  completed: number
}

export interface CustomerOrders {
  pending_updates: number
  patients: number
  customers: number
  orders: EnterprisePlanOrderSent
}
export interface ProfessionalEnterprisePlanLabOrders {
  orders: Orders
  my_task: IProfessionalPlanCustomerViewMyTask
}
export interface IProfessionalPlan {
  home: ProfessionalPlanHome
  workspace: ProfessionalPlanWorkSpace
  customer_view: ProfessionalPlanCustomerView
}

export interface ProfessionalPlanHome {
  patients: number
  practice: number
  labs: number
  order_sent: EnterpriseCustomerOrderSent
  orders_received: ProfessionalPlanOrderReceived
  manufacturing_status: ProfessionalPlanManufacturingStatus
  planning_status: ProfessionalPlanPlanningStatus
  pending_tasks: ProfessionalPlanPendingTask
}
export interface ProfessionalPlanWorkSpace {
  patients_summary: PatientSummary
  planning: PlanningSummary
  manufacturing: ManufacturingSummary
  unprocessed: UnprocessedSummary
  patient_compliance: IPatientCompliance
}

export interface ProfessionalPlanCustomerView {
  orders: Orders
  my_task: IProfessionalPlanCustomerViewMyTask
}

export interface Orders {
  draft: number
  ordered: number
  in_progress: number
  in_review: number
  approved: number
  stl_files_requested: number
  stl_files_approved: number
  in_re_plan: number
  need_more_info: number
  cancelled: number
  completed: number
}
export interface PatientSummary {
  all_patients: number
  in_assessment: number
  in_planning: number
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  in_refinement: number
  in_transit: number
  in_manifacturing: number
}
export interface PlanningSummary {
  pending: number
  new_cases: number
  in_progress: number
  in_review: number
  re_plan: number
  approved: number
  need_more_info: number
  cancelled: number
  total: number
}

export interface UnprocessedSummary {
  add_due_date: number
  overdue: number
  due_today: number
  due_this_week: number
  due_later: number
  total: number
}
export interface ManufacturingSummary {
  pending: number
  in_progress: number
  in_transit: number
  delivered: number
  completed: number
  total: number
  pending_total: number
}
export interface ProfessionalPlanOrderSent {
  total: number
  ordered: number
  in_progress: number
  in_review: number
  in_re_plan: number
  approved: number
  completed: number
  draft: number
  cancelled: number
  stl_file_requested: number
  stl_file_approved: number
  growth_percentage: number
}

export interface EnterpriseCustomerOrderSent {
  total: number
  ordered: number
  in_progress: number
  in_review: number
  in_re_plan: number
  approved: number
  completed: number
  draft: number
  cancelled: number
  need_more_info: number
  stl_files_requested: number
  stl_files_approved: number
  growth_percentage: number
}

export interface EnterprisePlanOrderSent {
  total: number
  ordered: number
  in_progress: number
  in_review: number
  in_re_plan: number
  approved: number
  completed: number
  cancelled: number
  need_more_info: number
  stl_files_requested: number
  stl_files_approved: number
  growth_percentage: number
}

export interface ProfessionalPlanOrderReceived {
  received: number
  growth_percentage: number
}

export interface ProfessionalPlanManufacturingStatus {
  pending: number
  in_progress: number
  in_transit: number
  delivered: number
  completed: number
  total: number
  pending_total: number
}

export interface ProfessionalPlanPlanningStatus {
  pending: number
  new_cases: number
  in_progress: number
  in_review: number
  re_plan: number
  approved: number
  need_more_info: number
  cancelled: number
  total: number
}

export interface PracticeCOnnectedToOrgPlanPlanningStatus {
  pending: number
  new_cases: number
  in_progress: number
  in_review: number
  re_plan: number
  approved: number
  total: number
  need_more_info: number
  cancelled: number
  total_pending: number
}

export interface ProfessionalPlanPendingTask {
  workspace: number
  customer_view: number
}

export interface IProfessionalPlanCustomerViewMyTask {
  total_pending: number
  confirm_and_send_draft_orders: number
  approve_treatment_plan: number
  request_stl_files: number
  need_more_info: number
  review_approve_stl_files: number
}

export interface IGrowthAndStarterPlanMyTask {
  total_pending: number
  aligner_updates: number
  todays_appointments: number
  complete_assessment: number
  finalize_treatment_plan: number
  resume_paused_treatments: number
  approve_treatment_plan: number
  confirm_and_send_cases: number
  create_new_refinement_plan: number
}

export interface GrowthPlanMyTask {
  total_pending: number
  aligner_updates: number
  todays_appointments: number
  complete_assessment: number
  finalize_treatment_plan: number
  resume_paused_treatments: number
  create_new_refinement_plan: number
}
export interface MyTaskStarterPlan {
  total_pending: number
  aligner_updates: number
  todays_appointments: number
  complete_assessment: number
  finalize_treatment_plan: number
  resume_paused_treatments: number
  create_new_refinement_plan: number
}
export interface IPracticeConnectedToOrgMyTask {
  total_pending: number
  aligner_updates: number
  todays_appointments: number
  complete_assessment: number
  confirm_and_send_cases: number
  approve_treatment_plan: number
  finalize_treatment_plan: number
  resume_paused_treatments: number
  create_new_refinement_plan: number
}

//ENTERPRISE
interface ActivePracticeOrders {
  total: number
  growth_percentage: number
  ordered: number
  in_review: number
  approved: number
  in_re_plan: number
  in_progress: number
  completed: number
}

interface PatientTreatmentStage {
  total: number | null
  total_patients: number
  in_assessment: number
  in_planning: number
  tracking_pending: number
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  refinement: number
}

interface HomePracticeOrderMetrics {
  pending_updates: number
  patients: number
  practice_count: number
  order_received_by_practice: number
  order_received_by_practice_percentage: number
  active_practice_orders: ActivePracticeOrders
  patient_treatment_stage: PatientTreatmentStage
}

interface ActiveCustomerOrders {
  total: number
  in_review: number
  ordered: number
  approved: number
  stl_file_approved: number
  stl_file_requested: number
  in_re_plan: number
}

interface HomeCustomerOrderMetrics {
  pending_updates: number
  patients: number
  customer_counts: number
  order_received_by_customer: number
  order_received_by_customer_percentage: number
  active_customer_orders: ActiveCustomerOrders
}

interface SentOrdersCount {
  total: number
  ordered: number
  in_progress: number
  in_review: number
  on_hold: number
  replan: number
  approved: number
  completed: number
  draft: number
  cancelled: number
  stl_file_requested: number
  stl_file_approved: number
  unique_patient_count: number
}

interface HomeLabOrdersMetrics {
  pending_updates: number
  patients: number
  labs_counts: number
  order_sent: number
  growth_percentage: number
  sent_orders_count: SentOrdersCount
}

interface WorkspacePatientSummary {
  all_patients: number
  in_assessment: number
  in_planning: number
  tracking_pending: number
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  in_refinement: number
  in_transit?: number
  in_manifacturing?: number
}

interface WorkspaceOngoingOrders {
  total: number
  ordered: number
  in_review: number
  approved: number
  completed: number
  in_re_plan: number
}

interface WorkspaceMetrics {
  workspace_global_metrics: IProfessionalPlanWorkspaceMyTask
  workspace_patient_summary: WorkspacePatientSummary
  workspace_ongoing_orders: WorkspaceOngoingOrders
  workspace_patient_compliance: IPatientCompliance
}

interface LabMetrics {
  ordered: number
  in_review: number
  in_replan: number
  approved: number
  stl_file_requested: number
  completed: number
  total_pending: number
  draft_order: number
  approve_treatment_plans: number
  request_stl_files: number
  review_and_approve_stl_files: number
  due_today: number
  overdue: number
  draft: number
  in_progress: number
  stl_file_approved: number
  total?: number
}

interface CustomerTask {
  new_order: number
  unassigned_orders: number
  urgent_orders: number
  in_progress: number
  review_assigned_orders_to_me: number
  total_pending: number
}

interface CustomerNeedsAttention {
  in_replan: number
  stl_file_requested: number
  due_today: number
  overdue: number
  not_added_due_by: number
}

interface CustomerGettingStarted {
  customer_count: number
  user_count: number
  invited_lab_staff_count: number
  active_lab_staff_count: number
  invited_customer_count: number
  active_customer_count: number
  brand_and_company_details_added: boolean
  customer_action_pending: number
  user_action_pending: number
}

interface CustomerMetrics {
  count: IOngoingOrders
  task: CustomerTask
  needs_attention: CustomerNeedsAttention
  getting_started: CustomerGettingStarted
}

interface DashboardMetrics {
  home_practice_order_metrics: HomePracticeOrderMetrics
  home_lab_order_metrics: HomeLabOrdersMetrics
  home_customer_orders_metrics: HomeCustomerOrderMetrics
  workspace_metrics: WorkspaceMetrics
  lab_metrics: LabMetrics
  customer_metrics: CustomerMetrics
}
