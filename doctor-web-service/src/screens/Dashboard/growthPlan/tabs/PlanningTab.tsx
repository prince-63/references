import React from 'react'
import Section from '../components/Section'
import StatusPill from '../components/StatusPill'
import TabMetricItem from '../components/TabMetricItem'
import AssigneeItem from '../components/AssigneeItem'
import {useNavigate} from 'react-router-dom'
import {KanbanDetailItem} from '../types'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {ServiceConfiguration} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'

const PlanningTab = ({
  planningTotal,
  isPracticeView,
  kanbanByName,
  hideZero,
  growth,
  criticalTone,
}: {
  planningTotal: number
  isPracticeView: boolean
  kanbanByName: Map<string, KanbanDetailItem>
  hideZero: boolean
  growth: any
  criticalTone: (label: string) => 'success' | 'warning' | 'error' | 'info'
}) => {
  const navigate = useNavigate()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const getCountsArray = (isPracticeView: boolean, serviceConfig: ServiceConfiguration) => {
    if (isPracticeView) {
      return ['PLANS OUTSOURCED']
    } else if (serviceConfig?.PLANNING || serviceConfig?.VSP_PLANNING) {
      return ['PLANNING']
    } else {
      return ['PLANNING', 'PLANS OUTSOURCED']
    }
  }
  return (
    <Section
      title={
        <>
          <span>PLANNING OPERATIONS</span>
          <StatusPill count={planningTotal} tone='info' />
        </>
      }
    >
      <div
        className={`grid grid-cols-1 ${isPracticeView ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-4`}
      >
        <div className='lg:col-span-2 flex flex-col gap-4'>
          {getCountsArray(isPracticeView, serviceConfig).map((group) => (
            <div
              key={group}
              className='rounded-lg border border-lighterGray bg-white p-3 md:p-4 flex flex-col gap-2'
            >
              <h4 className='text-sm font-semibold uppercase flex items-center gap-2'>
                <span>
                  {isPracticeView && group === 'PLANS OUTSOURCED'
                    ? 'PLANNING'
                    : group === 'PLANNING'
                      ? 'PLANNING INHOUSE'
                      : group}
                </span>
                <StatusPill count={kanbanByName.get(group)?.total_count ?? 0} tone='info' />
              </h4>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                {kanbanByName
                  .get(group)
                  ?.status_labels.filter((s) => !hideZero || s.count > 0)
                  .map((s) => (
                    <TabMetricItem
                      key={group + s.label_name}
                      label={String(s.label_name)}
                      count={s.count}
                      tone={criticalTone(s.label_name)}
                      onClick={() =>
                        navigate(
                          `/aligner-orders?workFlow=${
                            group === 'PLANNING' ? 'planning-in-house' : 'planning-outsource'
                          }&status=${encodeURIComponent(s.label_name)}`
                        )
                      }
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
        {!isPracticeView && (
          <div className='flex flex-col gap-3'>
            <h4 className='text-base font-semibold'>Assignee Distribution</h4>
            <div className='max-h-[320px] overflow-y-auto pr-1'>
              {growth?.planning_operation_assignee_distribution?.map((m: any, i: number) => (
                <AssigneeItem key={m.user_name + i} m={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

export default PlanningTab
