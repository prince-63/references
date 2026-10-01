import cn from '@utils/cn'

const LabelValuePairVertical = ({
  label,
  value,
  valueClassName,
  labelClassName,
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
  labelClassName?: string
}) => {
  return (
    <div className='flex flex-col gap-1'>
      <p className={cn('text-textColor font-medium text-sm', labelClassName)}>{label}</p>
      <p className={cn('text-base font-normal break-words', valueClassName)}>{value}</p>
    </div>
  )
}

export default LabelValuePairVertical
