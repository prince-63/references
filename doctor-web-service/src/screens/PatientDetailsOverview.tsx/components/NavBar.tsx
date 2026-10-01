import {useEffect, useMemo, useRef} from 'react'
import patientProfileNavBarItems from '@staticData/patientProfileNavBarItems'
import clsx from 'clsx'
import {useNavigate} from 'context/CustomNavigationContext'
import {useLocation, useParams} from 'react-router-dom'
import profileRouteConstants from '@constants/profile.routeConstants'
import {ReactComponent as WarningCircleIcon} from 'assets/images/WarningCircle.svg'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useProfileBasePath from '@hooks/useProfileBasePath'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import leadsPatientStatusType from '@constants/leadsPatientStatusType'
import useServiceConfigurationState from 'screens/settings/services/hooks/useServiceConfigurationState'
import {ServiceConfigurationItemName} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import {withKanbanParam} from 'utils/ConstFunctions'

export type PatientProfileTabs = (typeof patientProfileNavBarItems)[number]
export type PatientProfileNavBar = Record<PatientProfileTabs['value'], boolean>

interface INavBar {
  filter: PatientProfileNavBar
  handleFilterChange: (option: PatientProfileTabs['value']) => void
  isMobile?: boolean
}

const NavBar = ({filter, handleFilterChange, isMobile = false}: INavBar) => {
  const {patientId} = useParams()
  const navigation = useNavigate()
  const {shouldBlock, navigate} = navigation
  const profileBasePath = useProfileBasePath()
  const {permissionChecks} = useFeatureAccess()
  const tabsAccess = permissionChecks?.patientProfileActions
  const patientProfileTrackingTab =
    permissionChecks?.alignerTreatment?.patientProfileTrackingTab?.isViewable

  const myTaskTab = permissionChecks?.taskManagement?.patientProfileTasksTab?.isViewable
  const chatTab = permissionChecks?.chat?.chatWithPatients?.isViewable

  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const isPatientConnected = useMemo(() => {
    return data?.invitation_details?.is_patient_connected
  }, [data])
  const {bracesTreatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const customerTrackingEnabled = useMemo(() => {
    return data?.is_customer_tracking_enabled === true
  }, [data])

  const isArchived = data?.patient_details?.status === leadsPatientStatusType.ARCHIVE
  const {sections} = useServiceConfigurationState()
  const canShowAggregatedProgress = sections.some(
    (section) =>
      section.itemName === ServiceConfigurationItemName.PAYMENT_AND_BILLING && section.isActive
  )
  const hasBracesTreatmentPlan = (bracesTreatmentPlanList || []).length > 0
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  // braces_journey_id from leads overview
  const bracesJourneyId = dataLeadsOverview?.braces_journey_tracking_response?.braces_journey_id
  const hasBracesJourney = Boolean(bracesJourneyId)

  const activeTabRef = useRef<string | null>(null)
  const {isStarterPlanUser, isGrowthPlanUser} = useAllUserPlan()
  const params = new URLSearchParams(window.location.search)
  const kanbanName = params.get('kanban_name')

  const callFilterNavBar = (item: (typeof patientProfileNavBarItems)[number]) => {
    const basePath = `${profileBasePath}/${patientId}`
    if (shouldBlock) return

    handleFilterChange(item.value)
    activeTabRef.current = item.value

    let path = item.path
    if (item.value === profileRouteConstants.APPOINTMENTS && bracesJourneyId) {
      path = `bracesNotes/${bracesJourneyId}`
    }

    navigate(withKanbanParam(`${basePath}/${path}`, kanbanName))
  }

  const location = useLocation()

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    const isProfileRoute = pathParts[0] === 'profile' && pathParts[1] === patientId
    if (!isProfileRoute) return

    const tabPath = pathParts[2] || ''
    const matched = patientProfileNavBarItems.find((it) => it.path === tabPath)

    const detailsNavItem = patientProfileNavBarItems.find(
      (item) => item.value === profileRouteConstants.DETAILS
    )

    const selectTab = (tab?: (typeof patientProfileNavBarItems)[number] | undefined) => {
      if (!tab) return false
      if (activeTabRef.current === tab.value) return false
      activeTabRef.current = tab.value
      handleFilterChange(tab.value)
      return true
    }

    if (isArchived && tabPath !== profileRouteConstants.DETAILS && detailsNavItem) {
      selectTab(detailsNavItem)
      const desiredPath = `${profileBasePath}/${patientId}/details/patient-details`
      if (location.pathname !== desiredPath) {
        navigate(desiredPath)
      }
      return
    }

    // Highlight PLANS tab when URL is /view-plan
    if (tabPath === 'view-plan') {
      const plansNavItem = patientProfileNavBarItems.find(
        (item) => item.value === profileRouteConstants.PLANS
      )
      selectTab(plansNavItem)
    }

    if (matched) {
      selectTab(matched)
    }
  }, [location.pathname, isArchived, navigate, patientId, handleFilterChange])

  return (
    // OUTER: horizontally scrollable container (for mobile)
    <div className='w-full overflow-x-auto'>
      {/* INNER: flex row that can be wider than screen */}
      <div className='flex gap-x-12 w-max text-textColor font-medium'>
        {patientProfileNavBarItems.map((item) => {
          const isActive = filter[item.value]
          const isChatTab = item.value === profileRouteConstants.CHAT
          const isDisabled = isArchived && item.value !== profileRouteConstants.DETAILS

          if (item.value === 'PLANS') {
            if (serviceConfig?.MANUFACTURING || tabsAccess?.plansTab?.isViewable === false)
              return null
          }
          if (item.value === 'PRODUCTION') {
            if (
              (serviceConfig?.PLANNING ||
                tabsAccess?.productionTab?.isViewable === false ||
                hasBracesTreatmentPlan) &&
              !isStarterPlanUser
            )
              return null
          }
          if (tabsAccess?.patientDetails?.isViewable === false && item.value === 'DETAILS')
            return null
          if (tabsAccess?.activityLogsTab?.isViewable === false && item.value === 'ACTIVITY_LOGS')
            return null

          if (
            !isGrowthPlanUser &&
            !isStarterPlanUser &&
            item.value === profileRouteConstants.TRACKING
          ) {
            if (patientProfileTrackingTab === false) return null
            if (customerTrackingEnabled !== true) return null
            if (serviceConfig?.PLANNING) return null
          }

          if (
            !isGrowthPlanUser &&
            !isStarterPlanUser &&
            item.value === profileRouteConstants.CHAT
          ) {
            if (chatTab === false) return null
            if (customerTrackingEnabled !== true) return null
          }

          if (myTaskTab === false && item.value === 'TASKS') return null
          if (hasBracesTreatmentPlan && item.value === 'CHAT') return null

          if ((isStarterPlanUser || serviceConfig?.MANUFACTURING) && item.value === 'ORDERS')
            return null
          if (!isStarterPlanUser && item.value === profileRouteConstants.PAYMENT) return null
          if (
            isStarterPlanUser &&
            item.value === profileRouteConstants.PAYMENT &&
            !canShowAggregatedProgress
          )
            return null

          // Starter plan users: show Appointments ONLY if braces_journey_id is present
          if (
            (!isStarterPlanUser && item.value === 'APPOINTMENTS') ||
            (isStarterPlanUser && item.value === 'APPOINTMENTS' && !hasBracesJourney)
          ) {
            return null
          }

          return (
            <div
              key={item.value}
              className={clsx(
                'relative top-0 py-2 min-w-max rounded-t-lg transition-colors',
                item.value === 'TASKS' && 'ml-6',
                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
                !isActive &&
                  !isDisabled &&
                  'text-textColor hover:text-primaryColor hover:border-primaryColor',
                isActive && 'text-primaryColor border-b-2 border-primaryColor'
              )}
              onClick={() => {
                if (isDisabled) return
                if (isChatTab && isMobile && isPatientConnected) {
                  if (shouldBlock) return
                  handleFilterChange(item.value)
                  activeTabRef.current = item.value
                  navigate(`/chat-list/${patientId}`)
                  return
                }
                callFilterNavBar(item)
              }}
            >
              <span className='flex items-center gap-2'>
                <span>{item.label}</span>
                {isChatTab && !isArchived ? <WarningCircleIcon className='h-5 w-5' /> : null}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default NavBar
