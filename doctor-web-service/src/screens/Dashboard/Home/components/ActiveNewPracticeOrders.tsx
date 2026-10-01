import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Doughnut} from 'react-chartjs-2'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {ProfessionalPlanPlanningStatus} from 'redux/Slices/AppSlice/DoctorDashboard/dashboardCounts.types'
import cn from '@utils/cn'
import ColorIcon from 'components/colorIcon/ColorIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'

ChartJS.register(ArcElement, Tooltip, Legend)

const ActiveNewPracticeOrders = ({
  isWorkspace,
  isEnterprise,
}: {
  isWorkspace: boolean
  isEnterprise?: boolean
}) => {
  const {enterprise_professional_plan, professional_plan, practice_connected_to_org} =
    useDashboard()

  const {isPractice, isAlignerCompanyOrg, isEnterprisePlanUser} = useAllUserPlan()
  const baseCounts = isEnterprisePlanUser
    ? enterprise_professional_plan?.practice_orders?.planning
    : isPractice
      ? practice_connected_to_org?.planning_status
      : professional_plan?.home?.planning_status

  const counts: ProfessionalPlanPlanningStatus = {
    approved: baseCounts?.approved ?? 0,
    re_plan: baseCounts?.re_plan ?? 0,
    in_review: baseCounts?.in_review ?? 0,
    total: baseCounts?.total ?? 0,
    new_cases: baseCounts?.new_cases ?? 0,
    in_progress: baseCounts?.in_progress ?? 0,
    pending: baseCounts?.pending ?? 0,
    need_more_info: baseCounts?.need_more_info ?? 0,
    cancelled: baseCounts?.cancelled ?? 0,
  }

  const {
    in_progress,
    new_cases,
    need_more_info,
    in_review: inreview,
    approved,
    re_plan: replan,
    cancelled,
  } = counts || {
    approved: 0,
    new_cases: 0,
    need_more_info: 0,
    re_plan: 0,
    in_review: 0,
    ordered: 0,
    total: 0,
    in_progress: 0,
    cancelled: 0,
  }

  const totalCounts =
    new_cases + inreview + approved + replan + in_progress + need_more_info + cancelled

  const labels = [
    'New Cases',
    'In Progress',
    'Need more info',
    'In Review',
    'Re-Plan',
    'Approved',
    'Cancelled',
  ]
  const data = [new_cases, in_progress, need_more_info, inreview, replan, approved, cancelled]
  const backgroundColor = [
    '#1E88E5',
    '#00ACC1',
    '#C88F3F',
    '#7E57C2',
    '#AE2241',
    '#43A047',
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

  const totalPendingItems =
    (isEnterprisePlanUser
      ? enterprise_professional_plan?.practice_orders?.planning?.pending
      : professional_plan?.workspace?.planning?.pending) ?? 0
  return (
    <BorderedCardForDashBoardCards
      className={`${
        isWorkspace ? 'flex-grow-0' : isEnterprise ? 'flex-grow-0 ' : 'md:w-1/2 w-full'
      } `}
    >
      {/* Header */}
      <div className='flex justify-between w-full'>
        <div className='flex-row flex gap-2'>
          <p className='font-semibold text-base'>Planning status</p>
          {isWorkspace ? (
            <div
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium',
                totalPendingItems > 0 && 'text-orange'
              )}
            >
              <ColorIcon {...{color: totalPendingItems > 0 ? '#BE8901' : '#666'}} />
              {totalPendingItems} pending
            </div>
          ) : null}
        </div>
        <button
          type='button'
          className='text-textColor text-sm font-semibold flex gap-2 items-center'
          onClick={() => {
            if (isAlignerCompanyOrg || isPractice) {
              navigate(`/aligner-orders`)
            } else {
              navigate(`/orders`)
            }
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

export default ActiveNewPracticeOrders
