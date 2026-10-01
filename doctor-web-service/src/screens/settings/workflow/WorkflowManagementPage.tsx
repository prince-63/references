import React from 'react'
import {Outlet, useNavigate, useLocation} from 'react-router-dom'
import settingsPaths from '@staticData/settings.paths'
import settingsRouteConstants from '@constants/settings.routeConstants'
import clsx from 'clsx'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'

const WorkflowManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {isStarterPlanUser} = useAllUserPlan()

  // find the workflow management parent in settingsPaths
  const parent = settingsPaths.find((p) => p.value === settingsRouteConstants.WORKFLOW_MANAGEMENT)
  const allChildren = parent?.children || []

  // Filter children based on isStarterPlanUser
  const children = isStarterPlanUser
    ? allChildren.filter((child) => child.value === settingsRouteConstants.ADD_ONS)
    : allChildren.filter((child) => child.value !== settingsRouteConstants.ADD_ONS)

  const {permissionChecks} = useFeatureAccess()
  const workflowManagementAccess = permissionChecks?.workflowManagement

  const parentPath = parent?.path || 'workflow-management'

  const openChild = (path: string) => {
    navigate(`/settings/${parentPath}/${path}`)
  }

  return (
    <div className='flex flex-col md:flex-row gap-4 md:gap-6 mt-4'>
      {/* Sidebar - Horizontal on mobile, Vertical on desktop */}
      <div className='w-full md:w-64 md:p-4 bg-white md:border rounded overflow-x-auto'>
        <div className='flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 min-w-max md:min-w-0'>
          {children.map((c: any) => {
            // disable specific workflow children when corresponding service offering is not enabled
            const pathKey = String(c.path || '').toLowerCase()
            let disabled = false
            if (pathKey.includes('overview')) {
              disabled = !workflowManagementAccess?.overviewTab?.isViewable
            }
            if (pathKey.includes('services')) {
              disabled = !workflowManagementAccess?.productsAndServicesTab?.isViewable
            }
            if (pathKey.includes('workflow')) {
              disabled = !workflowManagementAccess?.workflowTab?.isViewable
            }
            if (pathKey.includes('card-display')) {
              disabled = !workflowManagementAccess?.cardDisplayTab?.isViewable
            }

            const enabled = !disabled
            const expectedPath = `/settings/${parentPath}/${c.path}`
            const isActive = location.pathname.startsWith(expectedPath)

            return (
              <button
                key={c.path}
                onClick={() => enabled && openChild(c.path)}
                disabled={!enabled}
                className={clsx(
                  'text-left p-2 md:p-2 text-sm md:text-base whitespace-nowrap md:whitespace-normal',
                  // selected - horizontal border on mobile, left border on desktop
                  isActive
                    ? 'text-primaryColor bg-primarySupport font-medium'
                    : 'text-textColor bg-transparent font-normal',
                  // when disabled and not active show not-allowed cursor and reduced opacity
                  !enabled && !isActive ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
                )}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className='flex-1 min-w-0'>
        <Outlet />
      </div>
    </div>
  )
}

export default WorkflowManagementPage
