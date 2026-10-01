export interface PermissionAccess {
  isAddable: boolean
  isEditable: boolean
  isViewable: boolean
  isDeletable: boolean
  isHasFullAccess: boolean
}

export interface ProductionPermissions {
  ticketsAssignedToOtherUsers: PermissionAccess

  changeStatusMovingTicketBetweenStatuses: PermissionAccess
}

export interface PracticeLocationSidePanelPermissions {
  practiceLocation: PermissionAccess
}

export interface AlignerTreatmentPermissions {
  alignerUpdates: PermissionAccess
  alignerAnalytics: PermissionAccess
  alignerTracking: PermissionAccess
  patientProfileTrackingTab: PermissionAccess
}

export interface WorkflowActionsPermissions {
  allowMovingToProductionProductionOutsourcedBoard: PermissionAccess
  allowPackaging: PermissionAccess
  allowMarkingAsDelivered: PermissionAccess
  allowMarkingAsReceived: PermissionAccess
  allowMovingToPlanningPlansOutsourcedBoard: PermissionAccess
  allowRequestingSTLFiles: PermissionAccess
  allowRequestingRevision: PermissionAccess
  allowShipping: PermissionAccess
  allowMovingToNeedMoreInformation: PermissionAccess
}

export interface OngoingProductionSidePanelPermissions {
  ongoingProductionSidePanel: PermissionAccess
}

export interface TaskManagementPermissions {
  allowCreatingAndManagingTasksOnPatientProfile: PermissionAccess
  patientProfileTasksTab: PermissionAccess
}

export interface PracticeLocationPermissions {
  changeStatus: PermissionAccess
  practiceLocationDetails: PermissionAccess
  managePracticeLocations: PermissionAccess
}

export interface SupportPermissions {
  support: PermissionAccess
}

export interface UnprocessedPermissions {
  unprocessedPage: PermissionAccess
}

export interface PatientManagementPermissions {
  customerWithoutTrackingPatientsList: PermissionAccess
  viewArchivedPatientList: PermissionAccess
  customerWithTrackingPatientsList: PermissionAccess
  patientManagement: PermissionAccess
  patientInvitation: PermissionAccess
  patientConnectionStatus: PermissionAccess
}

export interface PatientsPermissions {
  patients: PermissionAccess
}

export interface AlignerOrdersPermissions {
  plansOutsourced: PermissionAccess
  newCase: PermissionAccess
  productionOutsourced: PermissionAccess
  planning: PermissionAccess
  production: PermissionAccess
}

export interface ProfilesAccountsAndSettingsPermissions {
  addEditBrandingDetails: PermissionAccess
  addEditBillingDetails: PermissionAccess
}

export interface ManufacturingOrdersPermissions {
  productionOutsourced: PermissionAccess
  production: PermissionAccess
}

export interface SettingsPermissions {
  settings: PermissionAccess
}

export interface TrackingPermissions {
  patientAnalytics: PermissionAccess
  alignerTracking: PermissionAccess
}

export interface UnprocessedBatchesPermissions {
  unprocessedBatches: PermissionAccess
}

export interface GlobalSearchPermissions {
  practiceLocations: PermissionAccess
  patients: PermissionAccess
}

export interface PlanningPermissions {
  changeStatusMovingTicketBetweenStatuses: PermissionAccess
  ticketsAssignedToOtherUsers: PermissionAccess
}

export interface WorkflowManagementPermissions {
  planningTab: PermissionAccess
  productsAndServicesTab: PermissionAccess
  workflowConfigurationProduction: PermissionAccess
  workflowTab: PermissionAccess
  manufacturingTab: PermissionAccess
  workflowConfigurationProductionOutsourced: PermissionAccess
  alignerTab: PermissionAccess
  workflowConfigurationPlansOutsourced: PermissionAccess
  overviewTab: PermissionAccess
  fieldConfiguration: PermissionAccess
  cardDisplayTab: PermissionAccess
  workflowConfigurationOngoingProduction: PermissionAccess
  workflowConfigurationPlanning: PermissionAccess
  workflowConfigurationNewCase: PermissionAccess
}

export interface PatientProfileQuickActionsPermissions {
  updateWearDaysForAllAligners: PermissionAccess
  alignerWearStats: PermissionAccess
  manualAlignerChange: PermissionAccess
  completeTreatment: PermissionAccess
  pauseResumeTreatment: PermissionAccess
}

export interface ProductionOutsourcedPermissions {
  ticketsAssignedToOtherUsers: PermissionAccess
  changeStatusMovingTicketBetweenStatuses: PermissionAccess
}

export interface PatientProfileActionsPermissions {
  submitForApproval: PermissionAccess
  caseFiles: PermissionAccess
  showRecentActivityOnPatientProfile: PermissionAccess
  beginNextBatch: PermissionAccess
  activityLogsTab: PermissionAccess
  patientDetails: PermissionAccess
  deactivatePlan: PermissionAccess
  customerName: PermissionAccess
  editPlan: PermissionAccess
  productionTab: PermissionAccess
  saveAsDraft: PermissionAccess
  createNewPlan: PermissionAccess
  approvePlan: PermissionAccess
  auditLogsTab: PermissionAccess
  finalizePlan: PermissionAccess
  batchDetails: PermissionAccess
  prescriptions: PermissionAccess
  deleteDraft: PermissionAccess
  commentsTab: PermissionAccess
  batchDetailsProductionChecklist: PermissionAccess
  requestRevision: PermissionAccess
  plansTab: PermissionAccess
  assignee: PermissionAccess
  internalNotesTab: PermissionAccess
  displayPracticeName: PermissionAccess
}

export interface CustomersPracticesPermissions {
  customersPractices: PermissionAccess
}

export interface PlansOutsourcedPermissions {
  changeStatusMovingTicketBetweenStatuses: PermissionAccess
  ticketsAssignedToOtherUsers: PermissionAccess
}

export interface PatientDetailsPermissions {
  patientContactDetails: PermissionAccess
  patientPersonalInformation: PermissionAccess
}

export interface NewCasePermissions {
  ticketsAssignedToOtherUsers: PermissionAccess
  changeStatusMovingTicketBetweenStatuses: PermissionAccess
}

export interface CustomerManagementPermissions {
  customerManagement: PermissionAccess
  customerInvitations: PermissionAccess
}

export interface ChatPermissions {
  chatWithPatients: PermissionAccess
}

export interface NotificationsPermissions {
  notifications: PermissionAccess
}

export interface LabManagementPermissions {
  labInvitations: PermissionAccess
  labManagement: PermissionAccess
}

export interface AISmilePermissions {
  aISmile: PermissionAccess
}

export interface RolesPermissions {
  managingRolesPermissionsExceptAdminRole: PermissionAccess
}

export interface UserManagementPermissions {
  deactivateUser: PermissionAccess
  userManagement: PermissionAccess
  userInvitations: PermissionAccess
}

export interface PatientChatPermissions {
  patientChat: PermissionAccess
}

export interface DashboardPermission {
  dashboard: PermissionAccess
}

export interface PlanningOrdersPermissions {
  planningInHouse: PermissionAccess
  plansOutsourced: PermissionAccess
}

export interface OngoingProductionPermissions {
  ongoingProductionPage: PermissionAccess
  dueDate: PermissionAccess
  status: PermissionAccess
  assignee: PermissionAccess
}

// MAIN EXPORT - In exact order from JSON
export interface Permissions {
  production: ProductionPermissions
  practiceLocationSidePanel: PracticeLocationSidePanelPermissions
  alignerTreatment: AlignerTreatmentPermissions
  workflowActions: WorkflowActionsPermissions
  ongoingProductionSidePanel: OngoingProductionSidePanelPermissions
  taskManagement: TaskManagementPermissions
  practiceLocation: PracticeLocationPermissions
  support: SupportPermissions
  unprocessed: UnprocessedPermissions
  patientManagement: PatientManagementPermissions
  patients: PatientsPermissions
  alignerOrders: AlignerOrdersPermissions
  profilesAccountsAndSettings: ProfilesAccountsAndSettingsPermissions
  manufacturingOrders: ManufacturingOrdersPermissions
  settings: SettingsPermissions
  tracking: TrackingPermissions
  unprocessedBatches: UnprocessedBatchesPermissions
  globalSearch: GlobalSearchPermissions
  planning: PlanningPermissions
  workflowManagement: WorkflowManagementPermissions
  patientProfileQuickActions: PatientProfileQuickActionsPermissions
  productionOutsourced: ProductionOutsourcedPermissions
  patientProfileActions: PatientProfileActionsPermissions
  customersPractices: CustomersPracticesPermissions
  plansOutsourced: PlansOutsourcedPermissions
  patientDetails: PatientDetailsPermissions
  newCase: NewCasePermissions
  customerManagement: CustomerManagementPermissions
  chat: ChatPermissions
  notifications: NotificationsPermissions
  labManagement: LabManagementPermissions
  aISmile: AISmilePermissions
  rolesPermissions: RolesPermissions
  userManagement: UserManagementPermissions
  patientChat: PatientChatPermissions
  dashboard: DashboardPermission
  planningOrders: PlanningOrdersPermissions
  ongoingProduction: OngoingProductionPermissions
}
