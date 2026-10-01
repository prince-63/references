const workflowNameConstants = {
  NEW_CASE: 'New Case',
  PLANNING_IN_HOUSE: 'Planning Inhouse',
  PLANNING_OUTSOURCE: 'Planning Outsource',
  PLANNING_ORDER: 'Planning Order',
  PRODUCTION_IN_HOUSE: 'Production In House',
  PRODUCTION_OUTSOURCE: 'Production Outsource',
} as const

export type WorkflowNameKey = keyof typeof workflowNameConstants
export type WorkflowNameValue = (typeof workflowNameConstants)[WorkflowNameKey]

export default workflowNameConstants
