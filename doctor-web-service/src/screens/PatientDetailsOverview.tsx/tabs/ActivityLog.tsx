import {Tabs} from 'antd'
import {useNavigate, useLocation, useParams, Outlet, Navigate} from 'react-router-dom'
import profileRouteConstants from '@constants/profile.routeConstants'
import patientProfilePaths from '@staticData/patientProfile.paths'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {withKanbanParam} from 'utils/ConstFunctions'
import useProfileBasePath from '@hooks/useProfileBasePath'

const {TabPane} = Tabs

const ActivityLog = () => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const location = useLocation()
  const {patientId} = useParams()
  const {permissionChecks} = useFeatureAccess()
  const activityLogsTabAccess = permissionChecks?.patientProfileActions
  // /profile/:patientId/activity-logs/:child
  const [, , , , child] = location.pathname.split('/')

  const activityRoute = patientProfilePaths.find(
    (route) => route.value === profileRouteConstants.ACTIVITY_LOGS
  )
  const childRoutes = activityRoute?.children || []
  const params = new URLSearchParams(window.location.search)
  const kanbanName = params.get('kanban_name')

  // Determine which child routes are viewable based on permissions
  const isRouteViewable = (path: string | undefined) => {
    if (!path) return false
    if (path === 'notes') return activityLogsTabAccess?.internalNotesTab?.isViewable !== false
    if (path === 'audit-logs') return activityLogsTabAccess?.auditLogsTab?.isViewable !== false
    if (path === 'comments') return activityLogsTabAccess?.commentsTab?.isViewable !== false
    return true
  }

  const visibleChildRoutes = childRoutes.filter((r) => isRouteViewable(r.path))

  // If no child in URL, redirect to the first *visible* child
  if (!child && visibleChildRoutes.length > 0) {
    return (
      <Navigate
        to={withKanbanParam(
          `${profileBasePath}/${patientId}/activity-logs/${visibleChildRoutes[0].path}`,
          kanbanName
        )}
        replace
      />
    )
  }

  // If the current child in URL is not viewable, redirect to the first visible child
  if (child && !isRouteViewable(child) && visibleChildRoutes.length > 0) {
    return (
      <Navigate
        to={withKanbanParam(
          `${profileBasePath}/${patientId}/activity-logs/${visibleChildRoutes[0].path}`,
          kanbanName
        )}
        replace
      />
    )
  }

  return (
    <div className='h-full flex flex-col'>
      <Tabs
        className='h-full flex flex-col prescription-tabs'
        activeKey={child || childRoutes[0]?.path}
        onChange={(key) =>
          navigate(
            withKanbanParam(`${profileBasePath}/${patientId}/activity-logs/${key}`, kanbanName)
          )
        }
      >
        {visibleChildRoutes.map((route) => {
          return (
            <TabPane tab={route.label} key={route.path} className='h-full'>
              {child === route.path && <Outlet />}
            </TabPane>
          )
        })}
      </Tabs>
    </div>
  )
}

export default ActivityLog
