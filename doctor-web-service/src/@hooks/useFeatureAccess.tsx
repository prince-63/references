import {useMemo} from 'react'
import {Permissions} from 'screens/AccessControl/AccessControlList/types/accessControls.types'
import useSubRoleDetails from './useSubRoleDetails'
import {Sub_Role_Data} from 'screens/AccessControl/AccessControlList/types/accessControlList.types'

// Utility function to convert to camelCase more reliably
function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return ''
      return index === 0 ? match.toLowerCase() : match.toUpperCase()
    })
    .replace(/\s+/g, '')
}

// Type for sidebar access

// Map module names to sidebar access keys

// Enhanced permission type to match your data structure
interface PermissionObject {
  isAddable: boolean
  isEditable: boolean
  isViewable: boolean
  isDeletable: boolean
}

// Type-safe permission builder
export function buildPermissionsMap(permissionModuleData?: Sub_Role_Data): {
  permissions: Partial<Permissions>
} {
  const permissions: Partial<Permissions> = {}

  if (!permissionModuleData?.modules) {
    return {permissions}
  }

  permissionModuleData.modules.forEach((module) => {
    const moduleKey = toCamelCase(module.name) as keyof Permissions

    if (!moduleKey) {
      return
    }

    // Initialize permissions object for this module
    permissions[moduleKey] = {} as any

    module.sub_modules?.forEach((sub) => {
      const subKey = toCamelCase(sub.name)
      const permissionsList = sub.permissions ?? []

      const permissionObj: PermissionObject = {
        isAddable: permissionsList.includes('ADD'),
        isEditable: permissionsList.includes('EDIT'),
        isViewable: permissionsList.includes('VIEW'),
        isDeletable: permissionsList.includes('DELETE'),
      }

      if (permissions[moduleKey]) {
        ;(permissions[moduleKey] as Record<string, any>)[subKey] = permissionObj
      }
    })
  })

  return {permissions}
}

export const useFeatureAccess = () => {
  const {permissionModule} = useSubRoleDetails()
  const permissionModuleData: Sub_Role_Data | undefined = permissionModule

  const {permissions: permissionChecks} = useMemo(() => {
    return buildPermissionsMap(permissionModuleData)
  }, [permissionModuleData])

  const sidebarAccess = {
    customers: permissionChecks?.customersPractices?.customersPractices?.isViewable,
    patients: permissionChecks?.patients?.patients?.isViewable,
    alignerOrders: {
      alignerOrders:
        permissionChecks?.alignerOrders?.newCase?.isViewable ||
        permissionChecks?.alignerOrders?.planning?.isViewable ||
        permissionChecks?.alignerOrders?.plansOutsourced?.isViewable ||
        permissionChecks?.alignerOrders?.production?.isViewable ||
        permissionChecks?.alignerOrders?.productionOutsourced?.isViewable,
      newCase: permissionChecks?.alignerOrders?.newCase?.isViewable,
      planning: permissionChecks?.alignerOrders?.planning?.isViewable,
      plansOutsourced: permissionChecks?.alignerOrders?.plansOutsourced?.isViewable,
      production: permissionChecks?.alignerOrders?.production?.isViewable,
      productionOutsourced: permissionChecks?.alignerOrders?.productionOutsourced?.isViewable,
    },

    tracking: {
      tracking:
        permissionChecks?.tracking?.alignerTracking?.isViewable ||
        permissionChecks?.tracking?.patientAnalytics?.isViewable,
      alignerTracking: permissionChecks?.tracking?.alignerTracking?.isViewable,
      patientAnalytics: permissionChecks?.tracking?.patientAnalytics?.isViewable,
    },
    patientChat: permissionChecks?.patientChat?.patientChat?.isViewable,
    practiceLocations: permissionChecks?.practiceLocationSidePanel?.practiceLocation?.isViewable,
    settings: permissionChecks?.settings?.settings?.isViewable,
    notifications: permissionChecks?.notifications?.notifications?.isViewable,
    support: permissionChecks?.support?.support?.isViewable,
    aiSmile: permissionChecks?.aISmile?.aISmile?.isViewable,
    ongoingProduction:
      permissionChecks?.ongoingProductionSidePanel?.ongoingProductionSidePanel?.isViewable,
    unprocessedList: permissionChecks?.unprocessedBatches?.unprocessedBatches?.isViewable,
    globalSearch: permissionChecks?.globalSearch?.patients?.isViewable,
  }

  return {
    permissionChecks,
    sidebarAccess,
  }
}
