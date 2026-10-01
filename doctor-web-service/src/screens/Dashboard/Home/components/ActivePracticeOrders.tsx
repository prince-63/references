import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Doughnut} from 'react-chartjs-2'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import useAllUserRoles from '@hooks/useAllUserPlan'
import {IActivePracticeOrders} from 'redux/Slices/AppSlice/DoctorDashboard/dashboardCounts.types'

ChartJS.register(ArcElement, Tooltip, Legend)

const ActivePracticeOrders = () => {
  const {active_practice_orders, enterprise_plan_details} = useDashboard()
  const {isEnterprisePlanUser} = useAllUserRoles()
  const aligner_orders =
    enterprise_plan_details?.home_practice_order_metrics?.active_practice_orders

  const counts: IActivePracticeOrders | undefined = (isEnterprisePlanUser
    ? aligner_orders
    : active_practice_orders) ?? {
    approved: 0,
    growth_percentage: 0,
    in_re_plan: 0,
    in_review: 0,
    ordered: 0,
    total: 0,
    in_progress: 0,
    completed: 0,
  }

  const {
    ordered,
    in_review: inreview,
    approved,
    in_re_plan: replan,
    total,
    in_progress,
    completed,
  } = counts || {
    approved: 0,
    growth_percentage: 0,
    in_re_plan: 0,
    in_review: 0,
    ordered: 0,
    total: 0,
    in_progress: 0,
    completed: 0,
  }
  const totalCounts = total

  const labels = ['Ordered', 'In Progress', 'In Review', 'Approved', 'In Re-Plan', 'Completed']

  const data = [ordered, in_progress, inreview, approved, replan, completed]

  const backgroundColor = ['#0EA5E9', '#F97316', '#8B5CF6', '#22C55E', '#E53935', '#059669']

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
    <BorderedCardForDashBoardCards className='flex-grow-0 !min-h-[255px]'>
      <div className='flex justify-between w-full'>
        <p className='font-semibold text-base'>Practice orders</p>
        <button
          type='button'
          className='text-textColor text-sm font-semibold flex gap-2 items-center'
          onClick={() => {
            navigate('/orders')
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

export default ActivePracticeOrders
