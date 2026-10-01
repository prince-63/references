import React, {FC} from 'react'
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  chartData?: number[] // Use number[] for more specific typing
  labelData?: string[] // Use string[] for better typing
  recommendedHours?: number // Use number for consistency
}

const AlignerWiseBarChart: FC<Props> = (props) => {
  const {labelData = [], chartData = [], recommendedHours = 24} = props // Provide default values to prevent undefined errors

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to resize with container
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
          text: 'Dates',
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
        borderRadius: 10, // Consistent rounded corners for bars
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    },
  }

  const data = {
    labels: labelData,
    datasets: [
      {
        label: 'Wear Time Hours',
        data: chartData,
        backgroundColor: chartData.map((value: number) => {
          const percentage = (value / recommendedHours) * 100
          if (percentage >= 90) {
            return '#00B383' // Green
          } else if (percentage < 80) {
            return '#F45045' // Red
          } else {
            return '#735BF2' // Blue
          }
        }),
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

export default AlignerWiseBarChart
