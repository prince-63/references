import React from 'react'
import StatCard from './components/StatCard'
import SectionHeader from './components/SectionHeader'
import StatusPill from './components/StatusPill'
import useDashboard from '@hooks/useDashboard'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {KanbanDetailItem} from '../growthPlan/types'
import useSubRoleDetails from '@hooks/useSubRoleDetails'
import {useNavigate} from 'react-router-dom'
import patientCountStatTypesConstants from '@constants/patientCountStatTypes.constants'
import {store} from 'redux/store'
import {
  setGlobalFilter as setPatientsGlobalFilter,
  setStatusFilter as setPatientsStatusFilter,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
const InternalDashboard: React.FC = () => {
  const {internal_user_plan, loadingNewDashboard} = useDashboard(true)
  const {permissionModule} = useSubRoleDetails()
  const internalUserRole = permissionModule?.name
  const navigate = useNavigate()
  const getKanbanCounts = (targetName: string) => {
    return (
      internal_user_plan?.kanban_details?.details.find(
        (kanban) => kanban.kanban_name === targetName
      ) ?? {
        kanban_name: '',
        status_labels: [],
        total_count: 0,
      }
    )
  }

  const planningInhouseKanbanCounts: KanbanDetailItem = getKanbanCounts('Planning In House')
  const productionInhouseKanbanCounts: KanbanDetailItem = getKanbanCounts('Production In House')
  const productionOutsourceKanbanCounts: KanbanDetailItem = getKanbanCounts('Production Outsource')
  const ongoingProductionListKanbanCounts: KanbanDetailItem =
    getKanbanCounts('ONGOING PRODUCT LIST')

  return (
    <Spin indicator={<Spinner loading />} spinning={loadingNewDashboard}>
      <div className='flex flex-col gap-4 p-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-lg font-semibold text-gray-900'>Dashboard</h1>
        </div>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <StatCard
            title='Total Patients'
            subtitle='Active patients under care'
            value={internal_user_plan?.total_patient_count ?? 0}
          />
        </div>
        {/* PLANNING USER */}
        {internalUserRole === 'Planning' && (
          <div className='rounded-lg border border-mediumGray bg-white'>
            <nav className='bg-[#F5F5F5] px-4 py-3 border-b rounded-t-lg border-mediumGray'>
              <SectionHeader
                title='Planning Operations'
                count={planningInhouseKanbanCounts?.total_count}
              />
            </nav>
            <div className='p-4'>
              <SectionHeader
                title='Planning In-House'
                count={planningInhouseKanbanCounts?.total_count}
                className='mb-3'
              />
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {planningInhouseKanbanCounts?.status_labels.map((s, index) => (
                  <StatusPill
                    key={index}
                    label={s.label_name?.toUpperCase?.() || s.label_name}
                    count={s.count}
                    onClick={() => {
                      navigate(
                        `/aligner-orders?workFlow=${'planning-in-house'}&status=${encodeURIComponent(
                          s.label_name
                        )}`
                      )
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {/* PRODUCTION USER */}
        {internalUserRole === 'Production ' ||
          (internalUserRole === 'Production' && (
            <div className='rounded-lg border border-mediumGray bg-white'>
              <nav className='bg-[#F5F5F5] px-4 py-3 border-b rounded-t-lg border-mediumGray'>
                <SectionHeader
                  title='Production Operations'
                  count={
                    productionInhouseKanbanCounts?.total_count +
                    productionOutsourceKanbanCounts?.total_count
                  }
                />
              </nav>
              <div className='p-4'>
                <SectionHeader
                  title='Production In-House'
                  count={productionInhouseKanbanCounts?.total_count}
                  className='mb-3'
                />
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {productionInhouseKanbanCounts?.status_labels.map((s, index) => (
                    <StatusPill
                      key={index}
                      label={s.label_name?.toUpperCase?.() || s.label_name}
                      count={s.count}
                      onClick={() => {
                        navigate(
                          `/aligner-orders?workFlow=${'production-in-house'}&status=${encodeURIComponent(
                            s.label_name
                          )}`
                        )
                      }}
                    />
                  ))}
                </div>
              </div>
              <hr></hr>
              <div className='p-4'>
                <SectionHeader
                  title='Ongoing Production'
                  count={ongoingProductionListKanbanCounts?.total_count}
                  className='mb-3'
                />
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {ongoingProductionListKanbanCounts?.status_labels.map((s, index) => (
                    <StatusPill
                      key={index}
                      label={s.label_name?.toUpperCase?.() || s.label_name}
                      count={s.count}
                      onClick={() => {
                        const map: Record<string, string> = {
                          'STARTING SOON': patientCountStatTypesConstants.STARTING_SOON,
                          ONGOING: patientCountStatTypesConstants.ONGOING,
                          PAUSED: patientCountStatTypesConstants.PAUSED,
                          'IN REFINEMENT': patientCountStatTypesConstants.REFINEMENT,
                          COMPLETED: patientCountStatTypesConstants.COMPLETED, // 'COMPLETE'
                        }
                        const key =
                          map[String(s.label_name)?.toUpperCase?.() || ''] ||
                          patientCountStatTypesConstants.STARTING_SOON
                        store.dispatch(setPatientsStatusFilter('ALL'))
                        store.dispatch(setPatientsGlobalFilter(key))
                        navigate('/aligner-tracking?isFiltered=true')
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </Spin>
  )
}

export default InternalDashboard
