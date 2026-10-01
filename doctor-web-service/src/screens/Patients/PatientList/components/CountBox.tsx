import patientCountStatTypesConstants from '@constants/patientCountStatTypes.constants'
import clsx from 'clsx'

export type GlobalStatusType = keyof typeof patientCountStatTypesConstants | 'COMPLETE'

interface CountBoxProps {
  count: number
  title: string
  value: GlobalStatusType
  selected?: boolean
  disabled?: boolean
  onClick: (selectedStatus: GlobalStatusType) => void
  activeClassName?: string
  inactiveClassName?: string
  className?: string
}

const CountBox: React.FC<CountBoxProps> = ({
  count,
  title,
  value,
  selected = false,
  onClick,
  disabled = false,
  activeClassName,
  inactiveClassName,
  className,
}) => {
  return (
    <div
      className={clsx(
        'border rounded-lg px-4 py-3 min-w-32 cursor-pointer flex-shrink flex-grow md:flex-grow-0',
        selected
          ? activeClassName || 'border-primaryColor bg-primarySupport'
          : inactiveClassName || 'bg-[#F5F5F5] border-mediumGray',
        className
      )}
      onClick={() => {
        if (!disabled) {
          onClick(value)
        }
      }}
    >
      <div className='flex gap-2 items-center'>
        <p className='text-sm font-medium text-textColor'>{title}</p>
      </div>
      <p className='text-xl font-semibold'>{count}</p>
    </div>
  )
}

export default CountBox
