import clsx from 'clsx'
import DropdownIcon from '../../../../../assets/icons/DropdownIcon'

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
        `${isActive ? 'rotate-180' : 'rotate-0'} transition-all duration-500`,
        className
      )}
    >
      <DropdownIcon color={color} />
    </div>
  )
}

export default ExpandIcon
