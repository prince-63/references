import React, {useMemo} from 'react'
import {Doughnut} from 'react-chartjs-2'
import {Chart as ChartJS, ArcElement, Tooltip, Legend, Animation} from 'chart.js'
import clsx from 'clsx'
import countsFilterOptions from '@staticData/countsFilterOptions'
import useFilter from '@hooks/useFilter'
import {ITreatmentCounts} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import FilterNavBarForCounts from './FilterNavBarForCounts'

ChartJS.register(ArcElement, Tooltip, Legend)

export const TreatmentCounts = (treatmentCountsData: ITreatmentCounts) => {
  const {filter, handleFilterChange} = useFilter(
    countsFilterOptions as (typeof countsFilterOptions)[number][]
  )

  const {data, labels, totalSteps} = useMemo(() => {
    const activeFilter = (Object.keys(filter) as Array<keyof typeof filter>).find(
      (key) => filter[key]
    )
    let counts: number[] = []
    let total = 0

    switch (activeFilter) {
      case 'ALL':
        counts = [
          treatmentCountsData.all_treatments.starting_soon,
          treatmentCountsData.all_treatments.ongoing,
          treatmentCountsData.all_treatments.paused,
          treatmentCountsData.all_treatments.refinement,
        ]
        break
      case 'ALIGNERS':
        counts = [
          treatmentCountsData.aligner_treatments.starting_soon,
          treatmentCountsData.aligner_treatments.ongoing,
          treatmentCountsData.aligner_treatments.paused,
          treatmentCountsData.aligner_treatments.refinement,
        ]
        break
      case 'BRACES':
        counts = [treatmentCountsData.braces_treatments.ongoing]
        break
      default:
        counts = []
    }

    total = counts.reduce((sum, count) => sum + count, 0)

    const labels = counts.map((count, index) => {
      const colors =
        activeFilter !== 'BRACES' ? ['#735BF280', '#735BF2', '#BE8901', '#F45045'] : ['#735BF2']
      const names =
        activeFilter !== 'BRACES'
          ? ['Starting soon', 'Ongoing', 'Paused', 'In Refinement']
          : ['Ongoing']
      return {
        label: names[index] || 'Other',
        count: count || 0,
        color: colors[index] || 'rgb(217, 217, 217',
      }
    })

    return {data: counts, labels, totalSteps: total}
  }, [filter, treatmentCountsData])

  const chartData = {
    labels: labels.map((item) => item.label),
    datasets:
      totalSteps === 0
        ? [
            {
              data: [0, 0, 0, 0, 1],
              backgroundColor: 'rgb(217, 217, 217',
              borderWidth: 2,
              hoverOffset: 10,
              borderRadius: 10,
            },
          ]
        : [
            {
              data,
              backgroundColor: labels.map((item) => item.color),
              borderWidth: 2,
              hoverOffset: 10,
              borderRadius: 10,
            },
          ],
  }

  const chartOptions = {
    cutout: '85%',
    radius: '85%',

    plugins: {
      legend: {
        display: false,
      },
      Animation,
      interaction: {
        intersect: false,
      },
    },
  }

  return (
    <div className='flex flex-col gap-2 border border-mediumGray rounded-lg p-4 h-full'>
      {/* Header */}
      <div className='text-sm font-medium text-textColor'>Active treatments</div>

      {/* Filter Navigation Bar */}
      <FilterNavBarForCounts
        {...{
          filterOptions: countsFilterOptions,
          filter,
          handleFilterChange,
        }}
      />

      <div className='flex flex-col items-center justify-center h-full'>
        <div className='flex items-center justify-evenly'>
          <div className='relative flex justify-center items-center w-[150px] h-[150px]'>
            {/* Chart */}
            <Doughnut data={chartData} options={chartOptions} />

            {/* Total Count in Center */}
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <div className='text-2xl font-bold text-black'>{totalSteps}</div>
            </div>
          </div>

          {/* Legend Labels */}
          <div className='ml-6 flex flex-col gap-1'>
            {labels.map((item, index) => (
              <div key={index} className='flex items-center gap-3'>
                <div
                  className={clsx(
                    'w-3 h-3 rounded-full flex items-center justify-center text-white'
                  )}
                  style={{backgroundColor: item.color}}
                ></div>
                <div className='flex gap-1 text-sm font-medium text-textColor'>
                  <div className='text-black font-semibold'>{item.count}</div>
                  <div>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
