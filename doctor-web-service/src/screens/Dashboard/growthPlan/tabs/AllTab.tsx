import React from 'react'
import getColorPalette from 'utils/getColorPalette'
import MetricCard from '../components/MetricCard'
import Section from '../components/Section'
import When from 'components/when/When'
import useActiveProfile from '@hooks/useActiveProfile'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'

export type TabKey = 'ALL' | 'NEW' | 'PLANNING' | 'PRODUCTION' | 'TRACKING'

const AllTab = ({
  newCaseTotal,
  planningTotal,
  productionTotal,
  trackingTotal,
  setActiveTab,
  growth,
}: {
  newCaseTotal: number
  planningTotal: number
  productionTotal: number
  trackingTotal: number
  setActiveTab: (k: TabKey) => void
  growth: any
}) => {
  const pal = getColorPalette()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {customerTrackingEnabled} = useActiveProfile()
  return (
    <>
      {/* Top summary boxes */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && (
          <MetricCard
            label='New Case Operations'
            value={newCaseTotal}
            onClick={() => setActiveTab('NEW')}
          />
        )}
        {(serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || serviceConfig?.PLANNING) && (
          <MetricCard
            label='Planning Operations'
            value={planningTotal}
            onClick={() => setActiveTab('PLANNING')}
          />
        )}
        {(serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || serviceConfig?.MANUFACTURING) && (
          <MetricCard
            label='Production Operations'
            value={productionTotal}
            onClick={() => setActiveTab('PRODUCTION')}
          />
        )}

        <When isTrue={customerTrackingEnabled! && serviceConfig?.ALIGNER_PLANNING_MANUFACTURING}>
          <MetricCard
            label='Treatment Tracking'
            value={trackingTotal}
            onClick={() => setActiveTab('TRACKING')}
          />
        </When>
      </div>

      {/* Team Workload Overview */}
      {growth?.team_workload_overview?.length ? (
        <Section title='Team workload overview'>
          <p className='text-xs mb-3' style={{color: pal.textColor}}>
            Monitor team capacity including Customer and Vendor assigned cases. Click to filter by
            assignee.
          </p>
          <div className='grid gap-3'>
            {growth?.team_workload_overview?.map((m: any, i: number) => (
              <div
                key={m.user_name + i}
                className={`grid items-center gap-4 p-3 rounded md:[grid-template-columns:280px_1fr_80px] border-b border-lighterGray`}
              >
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full text-textColor bg-lightGray flex items-center justify-center text-xs font-semibold'>
                    {getInitials(m.user_name)}
                  </div>
                  <div>
                    <div className='text-sm font-medium '>
                      {m.user_name}
                      {(m.assignee_type === 'customer' || m.assignee_type === 'vendor') && (
                        <span className='text-gray-400 text-xs ml-1'>(External)</span>
                      )}
                    </div>
                    <div className='text-xs text-textColor'>{m.role}</div>
                  </div>
                </div>
                <div className='h-2 rounded overflow-hidden'>
                  <div
                    className='h-full rounded bg-secondaryColor'
                    style={{
                      width: `${m.percentage}%`,
                    }}
                  />
                </div>
                <div className='text-sm font-semibold text-right text-textColor'>
                  {m.percentage}%
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  )
}

export default AllTab

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
