import React from 'react'
import StatCard from './components/StatCard'
import useDashboard from '@hooks/useDashboard'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {useNavigate} from 'react-router-dom'
import AggregatedTreatmentProgress from '../dashboard/components/AggregatedTreatmentCostProgress'
import CoreTaskMetrics from './components/CoreTaskMetrics'
import {store} from 'redux/store'
import {
  setSelectedFilter as setAnalyticsSelectedFilter,
  setIsAlignerUpdates as setAnalyticsIsAlignerUpdates,
} from 'redux/Slices/AppSlice/AlignerPatientAnalytics/AlignerPatientAnalytics.slice'
import {
  setGlobalFilter as setPatientsGlobalFilter,
  setStatusFilter as setPatientsStatusFilter,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import useServiceConfigurationState from 'screens/settings/services/hooks/useServiceConfigurationState'
import {ServiceConfigurationItemName} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'

const StarterPlanUserDashboard: React.FC = () => {
  const {starter_plan, loadingNewDashboard} = useDashboard(true)
  const {sections} = useServiceConfigurationState()
  const canShowAggregatedProgress = sections.some(
    (section) =>
      section.itemName === ServiceConfigurationItemName.PAYMENT_AND_BILLING && section.isActive
  )
  const canShowBracketsProgress = sections.some(
    (section) => section.itemName === ServiceConfigurationItemName.BRACES_ADD_ON && section.isActive
  )
  const navigate = useNavigate()

  const goToAnalyticsWithCompliance = (key: 'NEEDS_ATTENTION' | 'AT_RISK' | 'ON_TRACK') => {
    store.dispatch(setAnalyticsIsAlignerUpdates(false))
    store.dispatch(setAnalyticsSelectedFilter(key))
    navigate('/aligner-patient-analytics')
  }

  const goToAnalyticsPendingUpdates = () => {
    store.dispatch(setAnalyticsIsAlignerUpdates(true))
    navigate('/aligner-patient-analytics')
  }

  // Tracking -> App Connection navigation to Patients List with app-invite status filter
  const goToPatientsByAppConnection = (status: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED') => {
    store.dispatch(setPatientsGlobalFilter('ALL'))
    store.dispatch(setPatientsStatusFilter(status))
    const queryParams = new URLSearchParams({isFiltered: 'true'}).toString()
    navigate(`/patients-list?${queryParams}`)
  }
  return (
    <Spin indicator={<Spinner loading />} spinning={loadingNewDashboard}>
      <div className='flex flex-col md:gap-6 gap-4 md:pb-0 pb-[96px]'>
        <div className='flex items-center justify-between'>
          <h1 className='text-lg font-semibold text-gray-900'>Dashboard</h1>
        </div>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <StatCard
            title='Total Patients'
            subtitle='Active patients under care'
            value={starter_plan?.patients_summary?.active_patients_under_care ?? 0}
          />
          <StatCard
            title='New Cases'
            subtitle='In planning or production, yet to start treatment'
            value={starter_plan?.patients_summary?.new_cases ?? 0}
          />
          <StatCard
            title='Ongoing Cases'
            subtitle='Treatment currently in progress'
            value={starter_plan?.patients_summary?.ongoing_cases ?? 0}
            showExtraValue={true}
            aligner={starter_plan?.patients_summary?.aligner}
            braces={canShowBracketsProgress ? starter_plan?.patients_summary?.braces : undefined}
          />
          <StatCard
            title='Case Acceptance Rate'
            subtitle='Percentage of consultations converted to starts'
            value={Math.floor(starter_plan?.patients_summary?.case_acceptance_rate ?? 0)}
          />
        </div>
        <CoreTaskMetrics
          goToAnalyticsWithCompliance={goToAnalyticsWithCompliance}
          goToAnalyticsPendingUpdates={goToAnalyticsPendingUpdates}
          goToPatientsByAppConnection={goToPatientsByAppConnection}
        />
        {canShowAggregatedProgress && <AggregatedTreatmentProgress />}
      </div>
    </Spin>
  )
}

export default StarterPlanUserDashboard
