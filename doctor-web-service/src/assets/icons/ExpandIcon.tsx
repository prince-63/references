import clsx from 'clsx'
import CaretRightIcon from './CaretRightIcon'

const ExpandIcon = ({
  isActive,
  className,
  color = '#666666',
}: {
  isActive: boolean | undefined
  className?: string
  color?: string
}) => {
  return (
    <div
      className={clsx(
        `${isActive ? 'rotate-90' : 'rotate-0'} transition-all duration-500`,
        className
      )}
    >
      <CaretRightIcon color={color} />
    </div>
  )
}

export default ExpandIcon
