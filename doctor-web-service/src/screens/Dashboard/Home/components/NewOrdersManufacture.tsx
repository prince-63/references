import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Doughnut} from 'react-chartjs-2'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import cn from '@utils/cn'
import ColorIcon from 'components/colorIcon/ColorIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'

ChartJS.register(ArcElement, Tooltip, Legend)

const NewOrdersManufacture = ({
  isWorkspace,
  isEnterprise,
}: {
  isWorkspace: boolean
  isEnterprise?: boolean
}) => {
  const {professional_plan, enterprise_professional_plan, practice_connected_to_org} =
    useDashboard()

  const {isPractice, isEnterprisePlanUser} = useAllUserPlan()

  const navigate = useNavigate()

  const baseCounts = isEnterprisePlanUser
    ? enterprise_professional_plan?.practice_orders?.manufacturing
    : isPractice
      ? practice_connected_to_org?.manufacturing_status
      : professional_plan?.home?.manufacturing_status

  const counts = {
    pending: baseCounts?.pending ?? 0,
    in_progress: baseCounts?.in_progress ?? 0,
    completed: baseCounts?.completed ?? 0,
    in_transit: baseCounts?.in_transit ?? 0,
    delivered: baseCounts?.delivered ?? 0,
  }

  const {pending, in_progress, completed, in_transit, delivered} = counts

  const totalCounts = pending + in_progress + completed + in_transit + delivered

  const labels = ['Pending', 'In Progress', 'Completed', 'In Transit', 'Delivered']
  const data = [pending, in_progress, completed, in_transit, delivered]
  const backgroundColor = ['#BE8901', '#4F63DD', '#2E7D32', '#E0802C', '#6D59D9']
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

  return (
    <BorderedCardForDashBoardCards
      className={`${
        isWorkspace ? 'flex-grow-0' : isEnterprise ? ' flex-grow-0' : 'md:w-1/2 w-full'
      } `}
    >
      <div className='flex justify-between w-full'>
        <div className='flex-row flex gap-2'>
          <p className='font-semibold text-base'>Manufacturing status</p>
          {isWorkspace ? (
            <div
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium',
                pending > 0 && 'text-orange'
              )}
            >
              <ColorIcon color={pending > 0 ? '#BE8901' : '#666'} />
              {pending} pending
            </div>
          ) : null}
        </div>

        <button
          type='button'
          className='text-textColor text-sm font-semibold flex gap-2 items-center'
          onClick={() => {
            navigate(`/aligner-orders`)
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

export default NewOrdersManufacture
