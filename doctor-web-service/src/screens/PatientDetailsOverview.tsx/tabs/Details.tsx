import {Tabs, Tooltip} from 'antd'
import {useEffect, useState} from 'react'
import {useNavigate, useLocation, useParams, Outlet, Navigate} from 'react-router-dom'
import profileRouteConstants from '@constants/profile.routeConstants'
import patientProfilePaths from '@staticData/patientProfile.paths'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import leadsPatientStatusType from '@constants/leadsPatientStatusType'
import {withKanbanParam} from 'utils/ConstFunctions'
import useProfileBasePath from '@hooks/useProfileBasePath'
import getPatientFolderStatus from '../helpers/getPatientFolderStatus'

const {TabPane} = Tabs

export default function Details() {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const location = useLocation()
  const {patientId} = useParams()
  const {permissionChecks} = useFeatureAccess()
  const patientDetailsTabs = permissionChecks?.patientProfileActions
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const isArchived = data?.patient_details?.status === leadsPatientStatusType.ARCHIVE
  // /profile/:patientId/details/:childTab
  const parts = location.pathname.split('/')
  const child = parts[4]
  const subChild = parts[5]
  const params = new URLSearchParams(window.location.search)
  const kanbanName = params.get('kanban_name')
  const [foldersCreated, setFoldersCreated] = useState(false)

  // Detect prescription editor routes and bypass Tabs for full-height rendering
  const isPrescriptionEditor =
    child === 'prescriptions' && (subChild === 'new' || (subChild && parts[6] === 'edit'))

  const detailsRoute = patientProfilePaths.find(
    (route) => route.value === profileRouteConstants.DETAILS
  )

  const childRoutes = detailsRoute?.children || []
  const allowedChildRoutes = childRoutes.filter(
    (route) => !isArchived || route.path === 'patient-details'
  )
  const defaultChildPath = allowedChildRoutes[0]?.path
  const activeTabKey = child || defaultChildPath || allowedChildRoutes[0]?.path || 'patient-details'

  useEffect(() => {
    if (!patientId) return
    let timer: ReturnType<typeof setTimeout> | null = null
    let isMounted = true

    setFoldersCreated(false)

    const checkFolderStatus = async () => {
      try {
        const areFoldersCreated = await getPatientFolderStatus(patientId)

        if (!isMounted) return

        setFoldersCreated(areFoldersCreated)

        if (!areFoldersCreated) {
          timer = setTimeout(checkFolderStatus, 10000)
        }
      } catch (error) {
        console.error('Error fetching folder status:', error)
        if (!isMounted) return
        setFoldersCreated(false)
        timer = setTimeout(checkFolderStatus, 10000)
      }
    }

    checkFolderStatus()

    return () => {
      isMounted = false
      if (timer) clearTimeout(timer)
    }
  }, [patientId])

  // ✅ if no child in URL, redirect to the first child
  if (!child && allowedChildRoutes.length > 0) {
    return (
      <Navigate
        to={withKanbanParam(
          `${profileBasePath}/${patientId}/details/${defaultChildPath}`,
          kanbanName
        )}
        replace
      />
    )
  }

  if (isPrescriptionEditor) {
    // Render the editor content directly, with scoped full-height styling
    return (
      <div className='h-full flex flex-col prescription-tabs-full'>
        <Outlet />
      </div>
    )
  }

  if (isArchived && child !== 'patient-details') {
    return (
      <Navigate
        to={withKanbanParam(`${profileBasePath}/${patientId}/details/patient-details`, kanbanName)}
        replace
      />
    )
  }

  return (
    <div className='h-full flex flex-col'>
      <Tabs
        className='h-full flex flex-col details-tabs'
        activeKey={activeTabKey}
        onChange={(key) => {
          if (isArchived && key !== 'patient-details') return
          {
            navigate(withKanbanParam(`${profileBasePath}/${patientId}/details/${key}`, kanbanName))
          }
        }}
      >
        {allowedChildRoutes.map((route) => {
          if (patientDetailsTabs?.caseFiles?.isViewable === false && route.path === 'case-files') {
            return null
          }
          if (
            patientDetailsTabs?.prescriptions?.isViewable === false &&
            route.path === 'prescriptions'
          ) {
            return null
          }
          const isCaseFilesTab = route.path === 'case-files'
          const isDisabled = isCaseFilesTab && !foldersCreated
          const tabLabel = isDisabled ? (
            <Tooltip title='Case files will unlock once folders are created'>
              <span className='inline-block cursor-not-allowed text-gray-400'>{route.label}</span>
            </Tooltip>
          ) : (
            route.label
          )

          return (
            <TabPane disabled={isDisabled} tab={tabLabel} key={route.path} className='h-full'>
              {child === route.path && <Outlet />}
            </TabPane>
          )
        })}
      </Tabs>
    </div>
  )
}
