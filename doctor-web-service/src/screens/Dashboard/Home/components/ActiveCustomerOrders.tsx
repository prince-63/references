import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Doughnut} from 'react-chartjs-2'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

ChartJS.register(ArcElement, Tooltip, Legend)

const ActiveCustomerOrders = () => {
  const {enterprise_professional_plan} = useDashboard()
  const {
    ordered,
    in_review: inreview,
    approved,
    stl_files_approved: stl_file_approved,
    stl_files_requested: stl_file_requested,
    in_re_plan,
    completed,
    need_more_info,
    cancelled,
    total,
  } = enterprise_professional_plan?.home?.customers_orders?.orders || {}
  const totalCounts = total
  const labels = [
    'Ordered',
    'In Review',
    'Need more Info',
    'Approved',
    'STL files requested',
    'STL files uploaded',
    'In Re-Plan',
    'Completed',
    'Cancelled',
  ]

  const data = [
    ordered,
    inreview,
    need_more_info,
    approved,
    stl_file_approved,
    stl_file_requested,
    in_re_plan,
    completed,
    cancelled,
  ]

  const backgroundColor = [
    '#0EA5E9',
    '#F97316',
    '#C88F3F',
    '#8B5CF6',
    '#22C55E',
    '#EAB308',
    '#06B6D4',
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
    <BorderedCardForDashBoardCards className='w-full  min-h-[245px]'>
      <div className='flex justify-between w-full'>
        <p className='font-semibold text-base'>Customer orders</p>
        <button
          type='button'
          className='text-textColor text-sm font-semibold flex gap-2 items-center'
          onClick={() => {
            const queryParams = new URLSearchParams({
              customerOrders: 'true',
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
          <div className='relative flex justify-center items-center w-[150px] h-[150px]'>
            <Doughnut data={chartData} options={chartOptions} />

            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <div className='text-2xl font-bold text-black'>{totalCounts}</div>
            </div>
          </div>

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

export default ActiveCustomerOrders
