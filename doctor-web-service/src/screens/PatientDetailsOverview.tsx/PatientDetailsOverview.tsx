import useFilter from '@hooks/useFilter'
import patientProfileNavBarItems from '@staticData/patientProfileNavBarItems'
import NavBar from './components/NavBar'
import ActivityLogsPanel from './components/ActivityLogsPanel'
import {useState, useContext, useEffect, useLayoutEffect, useRef, useCallback} from 'react'
import {PanelRightOpen, PanelRightClose} from 'lucide-react'
import {Outlet, useLocation, useParams} from 'react-router-dom'
import PatientInfoCard from './components/PatinetInfoCard'
import PatientInfoCardMobileView from './components/PatientInfoCardMobileView'
import {safeParseInt} from 'utils/ConstFunctions'
import {batch, useDispatch, useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getAllTreatmentPlanList,
  resetTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {resetCaseRecordState} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {getIndividualTask, getNewWorkflow} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {RootState} from 'redux/store'
import Page from 'components/page/Page'
import Spinner from 'components/spinner/Spinner'
import {resetTreatmentPlanState} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import {Drawer} from 'antd'
import {useMediaQuery} from 'react-responsive'
import {CloseIcon} from 'yet-another-react-lightbox'
import useAllUserPlan from '@hooks/useAllUserPlan'
import bracesTreatmentPlanStatusConstants from '@constants/bracesTreatmentPlanStatus.constants'
import {getBracesTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {resetPrescriptionState} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import CustomerPatientProfile from './pages/CustomerPatientProfile/CustomerPatientProfile'
import AddShippingModalTask from './components/AddShippingModalTask'
import MoveToDeliverFromPackageStateTask from './components/MoveToDeliverFromPackageStateTask'
import {getManufacturingListDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {PatientOrderList} from 'redux/Slices/AppSlice/Profile/Profile.slice'

const PatientDetailsOverview = () => {
  const {filter, handleFilterChange} = useFilter(patientProfileNavBarItems)
  const dispatch = useDispatch()
  const {patientId} = useParams()
  const {isPractice} = useAllUserPlan()
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [showActivity, setShowActivity] = useState(true)
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const hasInitializedRef = useRef<string | null>(null)
  const {permissionChecks} = useFeatureAccess()
  const showRecentActivityAccess =
    permissionChecks?.patientProfileActions?.showRecentActivityOnPatientProfile?.isViewable
  const {loading} = useSelector((state: RootState) => state.leadsProfileDetails)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {openShippingDetailsModal} = useSelector((state: RootState) => state.GettingStartedOverview)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {manufacturingPlanId} = useSelector((state: RootState) => state.workFlow)
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {isStarterPlanUser} = useAllUserPlan()
  const location = useLocation()
  const kanbanName =
    new URLSearchParams(location.search).get('kanban_name') ?? location.state?.kanban_name ?? null
  const initializationKey = `${patientId ?? ''}|${kanbanName ?? ''}`
  const isPlanningPractice = serviceConfig?.PLANNING
  const isWearStatsPath = location.pathname.includes('/wear-stats')

  const refreshManufacturingData = useCallback(() => {
    const parsedPatientId = safeParseInt(patientId)
    const parsedUserId = safeParseInt(userId)
    if (!parsedPatientId) return

    const planId = safeParseInt(dataLeadsOverview?.treatment_plan_id ?? manufacturingPlanId)
    if (planId) {
      dispatchAction(
        getManufacturingListDetails({
          patient_id: parsedPatientId,
          treatment_plan_id: planId,
        })
      )
    }

    if (parsedUserId) {
      dispatchAction(
        PatientOrderList({
          doctor_id: parsedUserId,
          patient_id: parsedPatientId,
          sort_criteria: {
            type: 'date',
            sort: 'desc',
          },
        })
      )
      dispatchAction(
        getIndividualTask({
          patient_id: parsedPatientId,
          doctor_id: parsedUserId,
        })
      )
    }
  }, [dataLeadsOverview?.treatment_plan_id, dispatchAction, manufacturingPlanId, patientId, userId])
  // measure header height for desktop sticky activity panel
  useLayoutEffect(() => {
    if (isMobile) return
    const updateHeaderHeight = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight)
    }
    updateHeaderHeight()
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateHeaderHeight) : null
    const current = headerRef.current
    if (current && resizeObserver) resizeObserver.observe(current)
    window.addEventListener('resize', updateHeaderHeight)
    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [isMobile])

  useEffect(() => {
    const parsedPatientId = safeParseInt(patientId)
    const parsedUserId = safeParseInt(userId)
    const parsedOrgId = safeParseInt(organizationId)
    const parsedProfileId = safeParseInt(profileId)

    if (parsedPatientId && parsedUserId && parsedOrgId && parsedProfileId) {
      if (hasInitializedRef.current === initializationKey || isPlanningPractice) {
        return
      }
      hasInitializedRef.current = initializationKey
      batch(() => {
        dispatchAction(resetTreatmentPlanState())
        getLeadsDetails()
        dispatchAction(
          getAllTreatmentPlanList({
            doctor_id: userId,
            patient_id: patientId,
            organization_id: safeParseInt(organizationId),
          })
        )
        dispatchAction(getKanbanCountsByProfile({profile_id: Number(profileId)}))
        dispatchAction(
          getApiLeadsOverview({
            data: {
              patient_id: safeParseInt(patientId),
              doctor_id: safeParseInt(userId),
            },
          })
        )

        dispatchAction(
          getIndividualTask({
            doctor_id: safeParseInt(userId),
            patient_id: safeParseInt(patientId),
            organization_id: safeParseInt(organizationId),
            workflow_name: kanbanName,
          })
        )
          .unwrap()
          .then((res: any) => {
            const tasks = Array.isArray(res) ? res : res ? [res] : []
            const task =
              (kanbanName
                ? tasks.find((item: any) => item?.workflow_name === kanbanName)
                : null) ??
              tasks[tasks.length - 1] ??
              tasks.find((item: any) => item?.workflow_name) ??
              null

            const workflowNameForRequest = kanbanName ?? task?.workflow_name
            if (!workflowNameForRequest) return

            const payload = {
              profile_id: parsedProfileId,
              organization_id: parsedOrgId,
              kanban_header_name: 'ALIGNER',
              kanban_name: workflowNameForRequest,
            }
            dispatchAction(getNewWorkflow(payload as any))
          })
          .catch(() => {})

        // Fetch braces treatment plans to drive UI  (e.g., hide chat when braces plan exists)
        dispatchAction(
          getBracesTreatmentPlanList({
            doctor_id: String(userId),
            patient_id: String(patientId),
            braces_treatment_stage: bracesTreatmentPlanStatusConstants.ACTIVE,
          })
        ).catch(() => {})
      })
    }

    return () => {
      dispatchAction(resetCaseRecordState())
      dispatchAction(resetTreatmentPlanState())
      dispatchAction(resetTreatmentPlan())
      dispatchAction(resetPrescriptionState())
    }
  }, [patientId, userId, organizationId, profileId, isPractice, initializationKey, kanbanName])

  const getLeadsDetails = () => {
    const postData = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
    }
    dispatch(getLeadsProfileDetails(postData) as any)
  }

  if (isPlanningPractice) {
    return <CustomerPatientProfile />
  }

  const isInitializing = hasInitializedRef.current !== initializationKey

  if (loading || isInitializing) {
    return (
      <Page containerClassName='flex flex-col h-screen relative overflow-y-hidden'>
        <div className='flex flex-1 items-center justify-center'>
          <Spinner loading />
        </div>
      </Page>
    )
  }

  return (
    // Route container: full-height, lets inner wrapper control scroll
    <div className='flex flex-col relative'>
      {/* Desktop-only toggle for activity panel */}
      {showRecentActivityAccess && !isMobile && !isStarterPlanUser && !isWearStatsPath && (
        <button
          type='button'
          aria-label={showActivity ? 'Hide activity panel' : 'Show activity panel'}
          title={showActivity ? 'Hide Activity Logs' : 'Show Activity Logs'}
          onClick={() => setShowActivity((s) => !s)}
          className='hidden md:flex fixed right-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow hover:bg-gray-50 active:scale-95 transition'
        >
          {showActivity ? (
            <PanelRightClose className='w-5 h-5 text-gray-600' />
          ) : (
            <PanelRightOpen className='w-5 h-5 text-gray-600' />
          )}
        </button>
      )}

      {/* MAIN SCROLL CONTAINER */}
      <div className='flex-1 min-h-0 pb-20 md:pb-0'>
        {/* HEADER + TABS */}
        {isMobile ? (
          <nav className='bg-white shadow-sm  border-b border-mediumGray'>
            <PatientInfoCardMobileView onOpenActivity={() => setIsActivitySheetOpen(true)} />
            <div className='border-t'>
              <NavBar filter={filter} handleFilterChange={handleFilterChange} isMobile={isMobile} />
            </div>
          </nav>
        ) : (
          // DESKTOP: header sticky, nav sticky below it

          <nav
            ref={headerRef}
            className='sticky top-0 z-20 bg-white shadow-sm border-b border-mediumGray'
          >
            <PatientInfoCard />

            <div className='sticky z-10 bg-white'>
              <div className='flex flex-row items-center gap-4 py-1'>
                <div className='flex-1 overflow-x-auto'>
                  <NavBar
                    filter={filter}
                    handleFilterChange={handleFilterChange}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* MAIN GRID (content + activity panel) */}
        <div
          className={`relative flex items-start md:gap-6 gap-2 min-h-0 overflow-y-scroll h-calc(100vh-${headerHeight || 0}px)`}
        >
          <div className='w-full relative mt-4 ml-4'>
            <Outlet />
          </div>

          {!isMobile && showActivity && showRecentActivityAccess && !isStarterPlanUser ? (
            <div className=''>
              <div
                className='sticky'
                style={{
                  top: headerHeight || 0,
                  height: `calc(100vh - ${headerHeight || 0}px)`,
                  width: 360,
                }}
              >
                <div className='h-full'>
                  <ActivityLogsPanel />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Activity Drawer */}
      {showRecentActivityAccess && isMobile ? (
        <Drawer
          open={isActivitySheetOpen}
          placement='bottom'
          height='80vh'
          title='Recent Activity'
          destroyOnHidden
          extra={
            <div className='cursor-pointer h-full' onClick={() => setIsActivitySheetOpen(false)}>
              <CloseIcon />
            </div>
          }
          closeIcon={null}
          styles={{
            header: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
            },
            body: {padding: 0},
          }}
        >
          <div className='h-full overflow-hidden'>
            <ActivityLogsPanel
              setIsActivitySheetOpen={setIsActivitySheetOpen}
              hideHeader={showRecentActivityAccess && isMobile}
            />
          </div>
        </Drawer>
      ) : null}

      {/* Shipping + Delivery Modals (global across tabs) */}
      <AddShippingModalTask
        openModal={openShippingDetailsModal}
        refreshData={refreshManufacturingData}
      />
      <MoveToDeliverFromPackageStateTask onSuccess={refreshManufacturingData} />
    </div>
  )
}

export default PatientDetailsOverview
