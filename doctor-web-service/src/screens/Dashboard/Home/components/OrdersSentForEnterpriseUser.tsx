import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Doughnut} from 'react-chartjs-2'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

ChartJS.register(ArcElement, Tooltip, Legend)

const OrdersSentForEnterpriseUser = () => {
  const {enterprise_professional_plan} = useDashboard()
  const {
    draft,
    ordered,
    in_progress,
    need_more_info,
    in_review,
    approved,
    stl_files_requested,
    stl_files_approved,
    in_re_plan,
    completed,
    cancelled,
    total,
  } = enterprise_professional_plan?.home?.lab_orders || {}

  const totalCounts = total
  const labels = [
    'Draft',
    'Ordered',
    'In Progress',
    'Need more info',
    'In Review',
    'Approved',
    'STL files requested',
    'STL files uploaded',
    'In Re-Plan',
    'Completed',
    'Cancelled',
  ]

  const data = [
    draft,
    ordered,
    in_progress,
    need_more_info,
    in_review,
    approved,
    stl_files_requested,
    stl_files_approved,
    in_re_plan,
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
    <BorderedCardForDashBoardCards className='w-full'>
      <div className='flex justify-between w-full'>
        <p className='font-semibold text-base'>Lab orders</p>
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

export default OrdersSentForEnterpriseUser
