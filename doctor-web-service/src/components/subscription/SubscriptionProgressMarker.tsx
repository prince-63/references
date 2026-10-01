import {Progress} from 'antd'

const SubscriptionProgressMarker = ({
  label,
  value,
  color,
  percentage,
}: {
  label: {icon: React.ReactNode; title: string}
  value: React.ReactNode
  color: string
  percentage: number
}) => {
  return (
    <div className='flex flex-col'>
      <div className='flex justify-between gap-4 text-sm font-medium'>
        <div className='flex gap-2 items-center'>
          {label.icon}
          <p className=' text-textColor '>{label.title}</p>
        </div>
        <div>{value}</div>
      </div>
      <Progress
        percent={percentage}
        showInfo={false}
        trailColor='#EFEFEF'
        strokeColor={color}
        className='h-[1rem]'
      />
    </div>
  )
}

export default SubscriptionProgressMarker
