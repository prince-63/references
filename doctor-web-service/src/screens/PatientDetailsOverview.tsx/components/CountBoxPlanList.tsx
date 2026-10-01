import React from 'react'
import {PlanDataList} from '../types/PlanList.types'
import clsx from 'clsx'
import useAllUserPlan from '@hooks/useAllUserPlan'

const CountBoxPlanList = ({data}: {data: PlanDataList}) => {
  const {isStarterPlanUser} = useAllUserPlan()
  const filteredPlans = data.plans_list.filter((plan) => plan.approver_status !== null)
  return (
    <div className='mb-4 flex w-full flex-wrap gap-3 md:flex-nowrap md:mb-6 md:gap-4'>
      <StatBox
        title='Total Plans'
        value={isStarterPlanUser ? data?.total_plans : filteredPlans.length}
        color='#e5e7eb'
        textColor='#111827'
      />
      <StatBox
        title='Pending Approval'
        value={data.pending_approval}
        color='#fff1f0'
        textColor='#b45309'
      />
      <StatBox title='Approved' value={data.approved} color='#e0f2fe' textColor='#0369a1' />
    </div>
  )
}

export default CountBoxPlanList

const StatBox: React.FC<{title: string; value: number; color: string; textColor: string}> = ({
  title,
  value,
  color,
  textColor,
}) => {
  return (
    <div
      className={clsx(
        'flex w-fit items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium border border-mediumGray md:w-full md:flex-col md:items-center md:gap-0 md:rounded-md md:p-4 md:text-base md:shadow-sm'
      )}
      style={{backgroundColor: color, color: textColor}}
    >
      <div className='text-base font-semibold md:mt-1 md:text-2xl'>{value}</div>
      <div className='text-xs md:text-sm'>{title}</div>
    </div>
  )
}
