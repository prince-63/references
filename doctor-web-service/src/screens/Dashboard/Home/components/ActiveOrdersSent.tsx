import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Doughnut} from 'react-chartjs-2'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

ChartJS.register(ArcElement, Tooltip, Legend)

const ActiveOrdersSent = () => {
  const {active_orders_sent} = useDashboard()
  const {
    ordered,
    in_review: inreview,
    approved,
    stl_files_approved,
    stl_files_requested,
    in_re_plan: replan,
    total,
  } = active_orders_sent || {}
  const totalCounts = total
  const labels = [
    'Ordered',
    'In Review',
    'Approved',
    'STL files requested',
    'STL files uploaded',
    'In Re-Plan',
  ]

  const data = [ordered, inreview, approved, stl_files_requested, stl_files_approved, replan]

  const backgroundColor = ['#0095FF', '#BE8901', '#735BF2', '#0095FF', '#735BF2', '#F45045']

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
        <p className='font-semibold text-base'>Active orders sent</p>
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

export default ActiveOrdersSent
