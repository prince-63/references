import clsx from 'clsx'

type FilterOption = {
  value: string
  label: string
}

type FilterNavBarProps<T extends FilterOption> = {
  filterOptions: T[]
  filter: Record<string, boolean>
  handleFilterChange: (option: T['value']) => void
}

const FilterTimeline = <T extends FilterOption>({
  filterOptions,
  filter,
  handleFilterChange,
}: FilterNavBarProps<T>) => {
  return (
    <div className='w-full flex space-2 border border-lightGray rounded-[6px] text-xs font-medium p-1 z-50'>
      {filterOptions.map((option, index) => (
        <div className='w-full' key={index}>
          <button
            className={clsx(
              'w-full px-2 py-2 rounded-[6px] text-lg font-medium  font-figtree ',
              filter[option.value]
                ? 'bg-primarySupport text-primaryColor p-0'
                : 'bg-transparent text-textColor'
            )}
            onClick={() => handleFilterChange(option?.value)}
          >
            {option.label}
          </button>
        </div>
      ))}
    </div>
  )
}

export default FilterTimeline
