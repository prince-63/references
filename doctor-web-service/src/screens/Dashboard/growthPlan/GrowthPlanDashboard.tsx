import React, {useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Page from 'components/page/Page'
import getColorPalette from 'utils/getColorPalette'
import QuickInviteDropdown from 'components/QuickInvite/QuickInviteDropdown'
import {KanbanDetailItem} from './types'
import useDashboard from '@hooks/useDashboard'
import {RootState, store} from 'redux/store'
import {
  setSelectedFilter as setAnalyticsSelectedFilter,
  setIsAlignerUpdates as setAnalyticsIsAlignerUpdates,
} from 'redux/Slices/AppSlice/AlignerPatientAnalytics/AlignerPatientAnalytics.slice'
import patientCountStatTypesConstants from '@constants/patientCountStatTypes.constants'
import {
  setGlobalFilter as setPatientsGlobalFilter,
  setStatusFilter as setPatientsStatusFilter,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'

// Charts removed for App Connection section

// kept for reference previously; no longer used after tab extraction

type TabKey = 'ALL' | 'NEW' | 'PLANNING' | 'PRODUCTION' | 'TRACKING'
// Section used inside tab components; not directly in this file anymore
import ToggleSwitch from './components/ToggleSwitch'
import MetricCard from './components/MetricCard'
import DashIcon from './components/DashIcon'
import TabButton from './components/TabButton'
import AllTab from './tabs/AllTab'
import NewTab from './tabs/NewTab'
import PlanningTab from './tabs/PlanningTab'
import ProductionTab from './tabs/ProductionTab'
import TrackingTab from './tabs/TrackingTab'
import PracticeHeaderMetrics from './tabs/PracticeHeaderMetrics'
import useActiveProfile from '@hooks/useActiveProfile'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import useAllUserPlan from '@hooks/useAllUserPlan'

const GrowthPlanDashboard = ({
  headerRight,
  title,
}: {
  headerRight?: React.ReactNode
  title?: string
} = {}) => {
  const navigate = useNavigate()
  const {isEnterprisePlanUser, isAdmin} = useAllUserPlan()
  const {
    loadingDashboard,
    loadingNewDashboard,
    growth_plan,
    practice_connected_to_org,
    enterprise_plan,
    enterprise_planning_user,
    enterprise_manufacturing_user,
  } = useDashboard(true)
  const [hideZero, setHideZero] = useState(false)
  const growth =
    (practice_connected_to_org as any) ??
    (enterprise_plan as any) ??
    (growth_plan as any) ??
    enterprise_planning_user ??
    enterprise_manufacturing_user
  const loading = Boolean(loadingDashboard || loadingNewDashboard)
  const isPracticeView = Boolean(practice_connected_to_org)
  const {customerTrackingEnabled} = useActiveProfile()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const getDefaultTab = () => {
    if (serviceConfig?.PLANNING || serviceConfig?.VSP_PLANNING) return 'PLANNING'
    if (serviceConfig?.MANUFACTURING) return 'PRODUCTION'
    return 'ALL'
  }
  const [activeTab, setActiveTab] = useState<TabKey>(getDefaultTab())

  const normalizeKanbanKey = (name: unknown): string => {
    const key = String(name ?? '')
      .trim()
      .toUpperCase()
    // Planning
    if (['PLANNING', 'PLANNING IN HOUSE', 'PLANNING INHOUSE', 'PLANNING IN-HOUSE'].includes(key))
      return 'PLANNING'
    if (
      ['PLANS OUTSOURCED', 'PLAN OUTSOURCED', 'PLANNING OUTSOURCE', 'PLANNING OUTSOURCED'].includes(
        key
      )
    )
      return 'PLANS OUTSOURCED'
    // Production
    if (
      ['PRODUCTION', 'PRODUCTION IN HOUSE', 'PRODUCTION INHOUSE', 'PRODUCTION IN-HOUSE'].includes(
        key
      )
    )
      return 'PRODUCTION'
    if (['PRODUCTION OUTSOURCED', 'PRODUCTION OUTSOURCE', 'PRODUCTION OUT-SOURCE'].includes(key))
      return 'PRODUCTION OUTSOURCED'
    if (['ONGOING PRODUCTION', 'ONGOING PRODUCT LIST'].includes(key)) return 'ONGOING PRODUCTION'
    // New case
    if (['NEW CASE', 'NEW CASES'].includes(key)) return 'NEW CASE'
    return key
  }

  const kanbanByName = useMemo(() => {
    const map = new Map<string, KanbanDetailItem>()
    const details = (growth as any)?.kanban_details?.details ?? []
    ;(details as any[]).forEach((d: any) => {
      if (d?.kanban_name) {
        const key = normalizeKanbanKey(d.kanban_name)
        if (!map.has(key)) {
          map.set(key, {...d, kanban_name: key} as KanbanDetailItem)
        } else {
          const prev = map.get(key)!
          map.set(key, {
            kanban_name: key,
            total_count: (Number(prev.total_count) || 0) + (Number(d.total_count) || 0),
            status_labels: prev.status_labels,
          })
        }
      }
    })
    return map
  }, [growth])

  const goToAnalyticsWithCompliance = (key: 'NEEDS_ATTENTION' | 'AT_RISK' | 'ON_TRACK') => {
    store.dispatch(setAnalyticsIsAlignerUpdates(false))
    store.dispatch(setAnalyticsSelectedFilter(key))
    navigate('/aligner-patient-analytics')
  }

  const goToAnalyticsPendingUpdates = () => {
    store.dispatch(setAnalyticsIsAlignerUpdates(true))
    navigate('/aligner-patient-analytics')
  }

  const goToAlignerTrackingByStage = (
    stage: 'Starting Soon' | 'Ongoing' | 'Paused' | 'In Refinement' | 'Completed'
  ) => {
    const map: Record<string, string> = {
      'Starting Soon': patientCountStatTypesConstants.STARTING_SOON,
      Ongoing: patientCountStatTypesConstants.ONGOING,
      Paused: patientCountStatTypesConstants.PAUSED,
      'In Refinement': patientCountStatTypesConstants.REFINEMENT,
      Completed: patientCountStatTypesConstants.COMPLETED, // 'COMPLETE'
    }
    const key = map[String(stage)] || patientCountStatTypesConstants.STARTING_SOON

    store.dispatch(setPatientsStatusFilter('ALL'))
    store.dispatch(setPatientsGlobalFilter(key))
    navigate('/aligner-tracking?isFiltered=true')
  }

  // Tracking -> App Connection navigation to Patients List with app-invite status filter
  const goToPatientsByAppConnection = (status: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED') => {
    store.dispatch(setPatientsGlobalFilter('ALL'))
    store.dispatch(setPatientsStatusFilter(status))
    const queryParams = new URLSearchParams({isFiltered: 'true'}).toString()
    navigate(`/patients-list?${queryParams}`)
  }

  // Tab counts
  const newCaseTotal =
    kanbanByName.get('NEW CASE')?.total_count ?? (growth as any)?.patients_summary?.new_cases ?? 0
  const planningTotal = isPracticeView
    ? (kanbanByName.get('PLANS OUTSOURCED')?.total_count ?? 0)
    : (kanbanByName.get('PLANNING')?.total_count ?? 0) +
      (kanbanByName.get('PLANS OUTSOURCED')?.total_count ?? 0)
  const productionTotal = isPracticeView
    ? (kanbanByName.get('PRODUCTION OUTSOURCED')?.total_count ?? 0)
    : (kanbanByName.get('PRODUCTION')?.total_count ?? 0) +
      (kanbanByName.get('PRODUCTION OUTSOURCED')?.total_count ?? 0)
  const trackingTotal = (() => {
    const ts = (growth as any)?.treatment_stage
    if (!ts) return 0
    return (
      (ts.starting_soon ?? 0) +
      (ts.ongoing ?? 0) +
      (ts.paused ?? 0) +
      (ts.in_refinement ?? 0) +
      (ts.completed ?? 0)
    )
  })()

  return (
    <Page loading={loading}>
      {/* Fixed spacing: removed max-w-[auto] and reduced left padding */}
      <div className='w-full px-2 md:px-4 py-2 flex flex-col gap-4 md:gap-6 font-sans pb-[70px] md:pb-0'>
        {/* Header: Key Metrics */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
          <h1
            className='text-2xl md:text-3xl font-bold'
            style={{color: getColorPalette().neutralBlack}}
          >
            {title ?? 'Dashboard'}
          </h1>
          <div className='self-start sm:self-auto flex items-center gap-3 flex-wrap'>
            <ToggleSwitch checked={hideZero} onChange={setHideZero} label='Show Only With Values' />
            {headerRight ? <div className='shrink-0'>{headerRight}</div> : null}
            {isEnterprisePlanUser && !isAdmin && <QuickInviteDropdown />}
          </div>
        </div>

        {/* Header Metrics */}

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <MetricCard
            label='Total Patients'
            description='Active patients under care'
            value={
              growth?.total_patient_count ??
              (growth as any)?.patients_summary?.active_patients_under_care ??
              '-'
            }
            variant='header'
            icon={<DashIcon name='users' />}
          />
          {serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && (
            <MetricCard
              label='New Cases'
              description='In planning or production, yet to start treatment'
              value={(growth as any)?.patients_summary?.new_cases ?? 0}
              variant='header'
              icon={<DashIcon name='case' />}
            />
          )}
          {serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && (
            <MetricCard
              label='Ongoing Cases'
              description='Treatment currently in progress'
              value={(growth as any)?.patients_summary?.ongoing_cases ?? 0}
              variant='header'
              icon={<DashIcon name='ongoing' />}
            />
          )}
          {serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && (
            <>
              {!isPracticeView ? (
                <MetricCard
                  label='New Cases This Month'
                  description='Cases added this month'
                  value={(growth as any)?.patients_summary?.new_cases_this_month ?? 0}
                  variant='header'
                  icon={<DashIcon name='month' />}
                />
              ) : (
                <MetricCard
                  label='Case Acceptance Rate'
                  description='Percentage of consultations converted to starts'
                  value={computePracticeAcceptanceRate(growth)}
                  variant='header'
                  icon={<DashIcon name='acceptance' />}
                />
              )}
            </>
          )}
        </div>

        {/* CORE TASKS (Practice Connected Org only) - positioned after header metrics */}
        {isPracticeView && (
          <PracticeHeaderMetrics
            goToAlignerTrackingByStage={goToAlignerTrackingByStage}
            goToAnalyticsWithCompliance={goToAnalyticsWithCompliance}
            goToAnalyticsPendingUpdates={goToAnalyticsPendingUpdates}
            goToPatientsByAppConnection={goToPatientsByAppConnection}
          />
        )}

        {/* Tabs Switcher */}
        <div className='w-full'>
          <div className='flex flex-wrap gap-2 overflow-x-auto pb-1'>
            {serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && (
              <TabButton
                active={activeTab === 'ALL'}
                label='ALL'
                count={newCaseTotal + planningTotal + productionTotal + trackingTotal}
                onClick={() => setActiveTab('ALL')}
              />
            )}
            {serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && (
              <TabButton
                active={activeTab === 'NEW'}
                label='NEW CASE OPERATIONS'
                count={newCaseTotal}
                onClick={() => setActiveTab('NEW')}
              />
            )}
            {(serviceConfig?.ALIGNER_PLANNING_MANUFACTURING ||
              serviceConfig?.PLANNING ||
              serviceConfig?.VSP_PLANNING) && (
              <TabButton
                active={activeTab === 'PLANNING'}
                label='PLANNING OPERATIONS'
                count={planningTotal}
                onClick={() => setActiveTab('PLANNING')}
              />
            )}
            {(serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || serviceConfig?.MANUFACTURING) && (
              <TabButton
                active={activeTab === 'PRODUCTION'}
                label='PRODUCTION OPERATIONS'
                count={productionTotal}
                onClick={() => setActiveTab('PRODUCTION')}
              />
            )}
            <When
              isTrue={customerTrackingEnabled! && serviceConfig?.ALIGNER_PLANNING_MANUFACTURING}
            >
              <TabButton
                active={activeTab === 'TRACKING'}
                label='TREATMENT TRACKING'
                count={trackingTotal}
                onClick={() => setActiveTab('TRACKING')}
              />
            </When>
          </div>
        </div>

        {/* ALL (default) */}
        {activeTab === 'ALL' && (
          <AllTab
            newCaseTotal={newCaseTotal}
            planningTotal={planningTotal}
            productionTotal={productionTotal}
            trackingTotal={trackingTotal}
            setActiveTab={setActiveTab}
            growth={growth}
          />
        )}

        {/* NEW CASE (tab) */}
        {activeTab === 'NEW' && (
          <NewTab
            newCaseTotal={newCaseTotal}
            kanbanByName={kanbanByName}
            hideZero={hideZero}
            isPracticeView={isPracticeView}
            growth={growth}
          />
        )}

        {/* PLANNING (tab) */}
        {activeTab === 'PLANNING' && (
          <PlanningTab
            planningTotal={planningTotal}
            isPracticeView={isPracticeView}
            kanbanByName={kanbanByName}
            hideZero={hideZero}
            growth={growth}
            criticalTone={criticalTone}
          />
        )}

        {/* PRODUCTION (tab) */}
        {activeTab === 'PRODUCTION' && (
          <ProductionTab
            productionTotal={productionTotal}
            isPracticeView={isPracticeView}
            kanbanByName={kanbanByName}
            hideZero={hideZero}
            growth={growth}
          />
        )}

        {/* TRACKING (tab) */}
        <When isTrue={customerTrackingEnabled!}>
          {activeTab === 'TRACKING' && (
            <TrackingTab
              trackingTotal={trackingTotal}
              growth={growth}
              hideZero={hideZero}
              goToAlignerTrackingByStage={goToAlignerTrackingByStage}
              goToAnalyticsWithCompliance={goToAnalyticsWithCompliance}
              goToPatientsByAppConnection={goToPatientsByAppConnection}
              goToAnalyticsPendingUpdates={goToAnalyticsPendingUpdates}
            />
          )}
        </When>
      </div>
    </Page>
  )
}

export default GrowthPlanDashboard

function criticalTone(label: string): 'success' | 'warning' | 'error' | 'info' {
  const critical = ['Need Info', 'In Review', 'Revision']
  if (critical.includes(label)) return 'error'
  return 'info'
}

function computePracticeAcceptanceRate(growth: any): string {
  try {
    const ps = growth?.patients_summary || {}
    const ongoing = Number(ps.ongoing_cases ?? ps.ongoing ?? 0)
    const total = Number(ps.active_patients_under_care ?? ps.all_patients ?? 0)
    if (!total) return '0%'
    const pct = (ongoing / total) * 100
    return `${Math.round(pct)}%`
  } catch {
    return '0%'
  }
}
