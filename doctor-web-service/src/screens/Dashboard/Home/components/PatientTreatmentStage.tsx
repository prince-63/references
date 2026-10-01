import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Doughnut} from 'react-chartjs-2'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

ChartJS.register(ArcElement, Tooltip, Legend)

const PatientTreatmentStage = () => {
  const {enterprise_professional_plan} = useDashboard()
  const aligner_orders = enterprise_professional_plan?.home?.patients_treatment_stage
  const {
    all_patients: total_patients = 0,
    in_assessment,
    in_planning,
    in_manufacturing,
    in_transit,
    starting_soon,
    ongoing,
    paused,
    in_refinement,
    completed,
  } = aligner_orders || {}

  const totalCounts = total_patients
  const labels = [
    'In Assessment',
    'In Planning',
    'In Manufacturing',
    'In Transit',
    'Starting soon',
    'Ongoing',
    'Paused',
    'In Refinement',
    'Completed',
  ]

  const data = [
    in_assessment,
    in_planning,
    in_manufacturing,
    in_transit,
    starting_soon,
    ongoing,
    paused,
    in_refinement,
    completed,
  ]

  const backgroundColor = [
    '#757575',
    '#7E57C2',
    '#00ACC1',
    '#1E88E5',
    '#FB8C00',
    '#43A047',
    '#BE8901',
    '#AE2241',
    '#2E7D32',
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
    <BorderedCardForDashBoardCards className='flex-grow-0'>
      <div className='flex justify-between w-full'>
        <p className='font-semibold text-base'>Patient treatment stage</p>
        <button
          type='button'
          className='text-textColor text-sm font-semibold flex gap-2 items-center'
          onClick={() => {
            navigate('/patients-list')
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

export default PatientTreatmentStage
