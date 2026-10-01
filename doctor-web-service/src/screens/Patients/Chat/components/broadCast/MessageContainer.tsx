import clsx from 'clsx'
import {FilterOption} from './broadCastTypes'

type FilterMessageItemProps = {
  content: string
  className?: string
  title: string
  handleFilterChange: (option: FilterOption) => void
  filter: Record<string, boolean>
}
const MessageContainer = ({
  title,
  content,
  className,
  handleFilterChange,
  filter,
}: FilterMessageItemProps) => {
  return (
    <div
      className={clsx(
        'rounded-lg border border-mediumGray px-4 py-3 flex flex-col font-semibold text-base cursor-pointer',
        filter[title]
          ? 'bg-primarySupport border border-primaryColor'
          : 'bg-transparent text-black',
        className
      )}
      onClick={() => handleFilterChange({value: title, label: content})}
    >
      <p>{title}</p>
      <p className='text-sm font-medium text-textColor'>{content}</p>
    </div>
  )
}

export default MessageContainer
