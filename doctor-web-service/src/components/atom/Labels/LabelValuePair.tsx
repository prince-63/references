import cn from '@utils/cn'

const LabelValuePair = ({
  label,
  value,
  valueClassName,
  labelClassName,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  valueClassName?: string
  labelClassName?: string
  className?: string
}) => {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <p className={cn('text-textColor font-medium text-sm', labelClassName)}>{label}</p>
      <p className={cn('text-base font-normal', valueClassName)}>{value}</p>
    </div>
  )
}

export default LabelValuePair
