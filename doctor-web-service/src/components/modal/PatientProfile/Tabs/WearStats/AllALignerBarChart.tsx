import {FC} from 'react'
import {Bar} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import getColorPalette from 'utils/getColorPalette'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  chartData?: any
  labelData?: any
  recommendedHours?: any
}

const AllAlignerBarChart: FC<Props> = (props) => {
  const {labelData, chartData, recommendedHours} = props

  const labels = labelData

  const options: any = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to resize properly
    scales: {
      y: {
        beginAtZero: false,
        stepSize: 6,
        suggestedMin: 0,
        max: 24,
        grid: {
          color: '#D9D9D9',
          borderDash: [22, 22],
          drawBorder: true,
        },
        ticks: {
          font: {
            size: 12, // Adjust tick font size for better responsiveness
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Aligners numbers',
          color: '#666666',
          font: {
            size: 14,
          },
        },
        ticks: {
          font: {
            size: 12, // Adjust tick font size for better responsiveness
          },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: {
          topRight: 20,
          bottomRight: 20,
          topLeft: 20,
          bottomLeft: 20,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  const data: any = {
    labels,
    datasets: [
      {
        label: 'Avg Wear Time Hours',
        data: chartData,
        backgroundColor: (ctx: any) => {
          const value = ctx.dataset.data[ctx.dataIndex]
          const percentage = (value / recommendedHours) * 100

          if (percentage >= 90) {
            return '#00B383' // Green
          } else if (percentage < 90 && percentage >= 80) {
            return getColorPalette().primaryColor // Blue
          } else {
            return '#F45045' // Red
          }
        },
        barThickness: 22,
      },
    ],
  }

  return (
    <div className='mt-4 h-[300px] w-full max-w-full md:h-[600px]'>
      <Bar options={options} data={data} />
    </div>
  )
}

export default AllAlignerBarChart
