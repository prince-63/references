import React, {createContext, useContext, ReactNode} from 'react'

// Minimal local types to avoid cross-repo imports. Expand as needed.
export type UserRole = 'org' | 'practice' | 'admin' | 'lab' | 'unknown'
export type WorkflowType = 'editable' | 'non-editable'
export type OrderType = 'ALIGNER' | 'PLANNING' | 'MANUFACTURING'

export interface WorkflowPermissions {
  canEditStages: boolean
  canEditStatuses: boolean
  canAddCustomStatuses: boolean
  canDeleteCustomStatuses: boolean
  canReorderStatuses: boolean
  canAddStages: boolean
  canDeleteStages: boolean
  canReorderStages: boolean
}

export interface EnhancedStatus {
  id: string
  name: string
}

interface WorkflowConfigContextType {
  getWorkflowPermissions: (
    userRole: UserRole,
    orderType: OrderType,
    alignerSubtype?: string
  ) => WorkflowPermissions
  determineWorkflowType: (orderType: OrderType, alignerSubtype?: string) => WorkflowType
  validateStatusTransition: (
    orderId: string,
    currentStatus: string,
    newStatus: string,
    userRole: UserRole
  ) => {valid: boolean; reason?: string}
  getAvailableStatusTransitions: (
    orderId: string,
    currentStatus: string,
    userRole: UserRole
  ) => EnhancedStatus[]
  canEditWorkflow: (userRole: UserRole, orderType: OrderType, alignerSubtype?: string) => boolean
}

const WorkflowConfigContext = createContext<WorkflowConfigContextType | undefined>(undefined)

export const WorkflowConfigProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const getWorkflowPermissions = (
    userRole: UserRole,
    orderType: OrderType,
    alignerSubtype?: string
  ): WorkflowPermissions => {
    // Aligner orders with certain subtypes may be non-editable
    if (orderType === 'ALIGNER' && alignerSubtype === 'with-treatment-tracking') {
      return {
        canEditStages: false,
        canEditStatuses: false,
        canAddCustomStatuses: false,
        canDeleteCustomStatuses: false,
        canReorderStatuses: false,
        canAddStages: false,
        canDeleteStages: false,
        canReorderStages: false,
      }
    }

    const isOrgAdmin = userRole === 'org' || userRole === 'admin'
    const canEdit = isOrgAdmin

    return {
      canEditStages: canEdit,
      canEditStatuses: canEdit,
      canAddCustomStatuses: canEdit,
      canDeleteCustomStatuses: canEdit,
      canReorderStatuses: canEdit,
      canAddStages: canEdit,
      canDeleteStages: canEdit,
      canReorderStages: canEdit,
    }
  }

  const determineWorkflowType = (orderType: OrderType, alignerSubtype?: string): WorkflowType => {
    if (orderType === 'ALIGNER' && alignerSubtype === 'with-treatment-tracking') {
      return 'non-editable'
    }
    return 'editable'
  }

  const validateStatusTransition = (
    orderId: string,
    currentStatus: string,
    newStatus: string,
    userRole: UserRole
  ): {valid: boolean; reason?: string} => {
    // Prevent moving back to TODO-like statuses once progressed
    const isTodoStatus = (status: string) => {
      if (!status) return false
      const s = status.toLowerCase()
      return (
        s.includes('send-case') ||
        s.includes('send-a-case') ||
        s.includes('todo') ||
        s.includes('queue') ||
        (s.includes('ordered') && s.includes('new-case'))
      )
    }

    const isCurrentTodo = isTodoStatus(currentStatus)
    const isNewTodo = isTodoStatus(newStatus)

    if (isNewTodo && !isCurrentTodo) {
      return {valid: false, reason: 'Cannot move back to TODO status once progressed'}
    }

    if (currentStatus === newStatus) {
      return {valid: false, reason: 'Status is already set to this value'}
    }

    // Basic role-based guard (extend as needed)
    if (userRole === 'practice' && !['org', 'admin', 'practice'].includes(userRole)) {
      return {valid: false, reason: 'Insufficient permissions to change status'}
    }

    return {valid: true}
  }

  const getAvailableStatusTransitions = () // orderId?: string,
  // currentStatus?: string,
  // userRole?: UserRole
  : EnhancedStatus[] => {
    // Placeholder: return empty array until actual workflow rules are available
    return []
  }

  const canEditWorkflow = (
    userRole: UserRole,
    orderType: OrderType,
    alignerSubtype?: string
  ): boolean => {
    const permissions = getWorkflowPermissions(userRole, orderType, alignerSubtype)
    return permissions.canEditStatuses || permissions.canEditStages
  }

  return (
    <WorkflowConfigContext.Provider
      value={{
        getWorkflowPermissions,
        determineWorkflowType,
        validateStatusTransition,
        getAvailableStatusTransitions,
        canEditWorkflow,
      }}
    >
      {children}
    </WorkflowConfigContext.Provider>
  )
}

export const useWorkflowConfig = () => {
  const context = useContext(WorkflowConfigContext)
  if (context === undefined) {
    throw new Error('useWorkflowConfig must be used within a WorkflowConfigProvider')
  }
  return context
}
