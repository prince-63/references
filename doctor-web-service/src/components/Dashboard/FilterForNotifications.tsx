import clsx from 'clsx'
import notificationTypes from './types/notification.types'

type FilterOption = {
  value: string
  label: string
}

type FilterNavBarProps<T extends FilterOption> = {
  filterOptions: T[]
  filter: Record<string, boolean>
  handleFilterChange: (option: T['value']) => void
  tableDataCounts: {
    total_active_event_count: number
    total_aligner_event_active_count: number
    total_file_added_active_count: number
  }
}

const FilterForNotifications = <T extends FilterOption>({
  filterOptions,
  filter,
  handleFilterChange,
  tableDataCounts,
}: FilterNavBarProps<T>) => {
  const getCountValue = (value: string) => {
    if (value === notificationTypes.ALL) {
      return tableDataCounts.total_active_event_count ?? 0
    } else if (value === notificationTypes.ALIGNER_CHANGE) {
      return tableDataCounts.total_aligner_event_active_count ?? 0
    } else {
      return tableDataCounts.total_file_added_active_count ?? 0
    }
  }

  return (
    <div className='w-full relative'>
      <div className='absolute bg-lightGray h-[2px] w-full rounded-xl bottom-0'> </div>
      <div className='absolute flex space-2 text-[14px] font-medium px-2 bottom-0'>
        {filterOptions.map((option, index) => (
          <div key={index} className={clsx('')}>
            <button
              className={clsx(
                'z-1 px-2 py-2 font-semibold',
                filter[option.value]
                  ? 'text-primaryColor border-b-[2px] border-primaryColor p-0'
                  : 'text-textColor'
              )}
              onClick={(e) => {
                e.preventDefault()
                handleFilterChange(option?.value)
              }}
            >
              {`${option.label}  (${getCountValue(option?.value)})`}
            </button>
          </div>
        ))}
      </div>{' '}
    </div>
  )
}

export default FilterForNotifications
