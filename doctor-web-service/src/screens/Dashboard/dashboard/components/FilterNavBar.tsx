import clsx from 'clsx'
import {ThingsToDoFilterOptionsRecord} from '../types/thingsToDoList.type'
import {PendingPatientsFilterOptionsRecord} from '../types/pendingPatientsList.type'

type FilterOption = {
  value: string
  label: string
}

type FilterNavBarProps<T extends FilterOption> = {
  filterOptions: T[]
  filter: Record<string, boolean>
  handleFilterChange: (option: T['value']) => void
  tableData: ThingsToDoFilterOptionsRecord | PendingPatientsFilterOptionsRecord
}

const FilterNavBar = <T extends FilterOption>({
  filterOptions,
  filter,
  handleFilterChange,
  tableData,
}: FilterNavBarProps<T>) => {
  return (
    <div className='w-full '>
      <div className='w-full flex space-x-2 text-[14px] font-medium px-2 bottom-[1px] overflow-x-auto whitespace-nowrap z-0 '>
        {filterOptions.map((option, index) => (
          <div key={index} className={clsx('')}>
            <button
              className={clsx(
                'relative z-2 px-2 py-2 font-semibold',
                filter[option.value]
                  ? 'text-primaryColor border-b-[2px] border-primaryColor p-0'
                  : 'text-textColor'
              )}
              onClick={() => handleFilterChange(option?.value)}
            >
              {`${option.label} (${(tableData as any)[option?.value]?.length})`}
            </button>
          </div>
        ))}
      </div>
      <div className='relative bottom-[1px] w-full h-[1px] bg-lightGray z-0 rounded-lg'></div>
    </div>
  )
}

export default FilterNavBar
