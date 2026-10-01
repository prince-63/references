import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Doughnut} from 'react-chartjs-2'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

ChartJS.register(ArcElement, Tooltip, Legend)

const ActiveNewOrdersSent = () => {
  const {professional_plan} = useDashboard()
  const {
    draft,
    ordered,
    in_review: inreview,
    need_more_info,
    in_progress,
    approved,
    stl_files_approved,
    stl_files_requested,
    in_re_plan: replan,
    completed,
    cancelled,
  } = professional_plan?.home?.order_sent || {}
  const totalCounts =
    (ordered ?? 0) +
    (inreview ?? 0) +
    (approved ?? 0) +
    (stl_files_requested ?? 0) +
    (stl_files_approved ?? 0) +
    (replan ?? 0) +
    (in_progress ?? 0) +
    (completed ?? 0) +
    (draft ?? 0) +
    (need_more_info ?? 0) +
    (cancelled ?? 0)
  const labels = [
    'Draft',
    'Ordered',
    'In Progress',
    'Need more info',
    'In Review',
    'Approved',
    'STL files requested',
    'STL files approved',
    'In Re-Plan',
    'Completed',
    'Cancelled',
  ]

  const data = [
    draft,
    ordered,
    in_progress,
    need_more_info,
    inreview,
    approved,
    stl_files_requested,
    stl_files_approved,
    replan,
    completed,
    cancelled,
  ]

  const backgroundColor = [
    '#6B7280',
    '#0EA5E9',
    '#F97316',
    '#C88F3F',
    '#8B5CF6',
    '#22C55E',
    '#EAB308',
    '#06B6D4',
    '#E53935',
    '#059669',
    '#AE2241',
  ]

  const chartData = {
    labels,
    datasets: [
      {
        data: totalCounts === 0 ? [1] : data,
        backgroundColor: totalCounts === 0 ? ['#d9d9d9'] : backgroundColor,
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
      tooltip: {
        intersect: false,
      },
    },
  }
  const navigate = useNavigate()
  return (
    <BorderedCardForDashBoardCards className='md:w-1/2 w-full'>
      <div className='flex justify-between w-full'>
        <p className='font-semibold text-base'>Orders sent</p>
        <button
          type='button'
          className='text-textColor text-sm font-semibold flex gap-2 items-center'
          onClick={() => {
            const queryParams = new URLSearchParams({
              sent: 'true',
            }).toString()
            navigate(`/orders?${queryParams}`)
          }}
        >
          View all
          <CaretRightIcon color='#666666' />
        </button>
      </div>

      <div className='flex flex-col items-center justify-center h-full'>
        <div className='flex items-center justify-evenly'>
          {/* Doughnut Chart */}
          <div className='relative flex justify-center items-center w-[150px] h-[150px]'>
            <Doughnut data={chartData} options={chartOptions} />

            {/* Total Count in Center */}
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <div className='text-2xl font-bold text-black'>{totalCounts}</div>
            </div>
          </div>

          {/* Legend */}
          <div className='ml-6 flex flex-col gap-1'>
            {labels.map((label, index) => (
              <div key={index} className='flex items-center gap-3'>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{backgroundColor: backgroundColor[index]}}
                ></div>
                <div className='flex gap-1 text-sm font-medium text-textColor'>
                  <div className='text-black font-semibold'>{data[index]} </div>
                  <div>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BorderedCardForDashBoardCards>
  )
}

export default ActiveNewOrdersSent
