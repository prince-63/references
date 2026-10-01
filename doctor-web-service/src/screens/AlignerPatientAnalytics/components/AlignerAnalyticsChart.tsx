import InfoIcon from 'assets/icons/InfoIcon'
import When from 'components/when/When'
import {ReactNode, useState} from 'react'
import {Doughnut} from 'react-chartjs-2'
import getColorPalette from 'utils/getColorPalette'
import InfoModal from './InfoModal'
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const AlignerAnalyticsChart = ({
  title,
  labels,
  data,
  backgroundColor,
  CenterContent,
  showInfo = false,
}: {
  title: string
  labels: string[]
  data: number[]
  backgroundColor: string[]
  CenterContent: ReactNode
  showInfo?: boolean
}) => {
  const [showModal, setShowModal] = useState(false)

  const chartData = {
    labels,
    datasets: [
      {
        data: data.every((item) => item === 0) ? [1] : data,
        backgroundColor: data.every((item) => item === 0) ? ['#d9d9d9'] : backgroundColor,
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
    <div className='flex flex-col gap-2 border border-mediumGray rounded-lg md:p-4 p-2 h-full md:min-w-12 min-w-[95%]'>
      <InfoModal showModal={showModal} setShowModal={setShowModal} />
      {/* Header */}
      <div className='flex gap-1 text-sm font-medium text-textColor w-fit'>
        {title}
        <When isTrue={showInfo}>
          <button onClick={() => setShowModal(true)}>
            <InfoIcon width='18' height='18' color={getColorPalette().primaryColor} />
          </button>
        </When>
      </div>

      <div className='flex flex-col items-center justify-center h-full'>
        <div className='flex items-center justify-evenly'>
          {/* Doughnut Chart */}
          <div className='relative flex justify-center items-center w-[150px] h-[150px]'>
            <Doughnut data={chartData} options={chartOptions} />

            {/* Total Count in Center */}
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              {CenterContent}
            </div>
          </div>

          {/* Legend */}
          <div className='ml-4 flex flex-col gap-2'>
            {labels.map((label, index) => (
              <div key={index} className='flex items-center gap-1'>
                <div
                  className='w-2 h-2 rounded-full'
                  style={{backgroundColor: backgroundColor[index]}}
                ></div>
                <div className='flex gap-1 text-sm font-medium text-textColor'>
                  <div className='text-black font-semibold'>{data[index]}</div>
                  <div>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlignerAnalyticsChart
