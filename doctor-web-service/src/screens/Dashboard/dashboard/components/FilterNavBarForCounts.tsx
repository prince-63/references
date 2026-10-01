import React from 'react'
import filterCountsConstants from '@constants/filterCounts.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
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

const FilterNavBarForCounts = <T extends FilterOption>({
  filterOptions,
  filter,
  handleFilterChange,
}: FilterNavBarProps<T>) => {
  const {isStarterPlanUser} = useAllUserPlan()
  return (
    <div className='w-full flex gap-2'>
      {filterOptions.map((option, index) => {
        if (!isStarterPlanUser && option.value === filterCountsConstants.BRACES) return null
        return (
          <div key={index} className={clsx('')}>
            <button
              className={clsx(
                ' px-3 py-2 font-semibold text-sm',
                filter[option.value]
                  ? 'text-primaryColor bg-primarySupport p-0 rounded-lg'
                  : 'text-textColor'
              )}
              onClick={() => handleFilterChange(option?.value)}
            >
              {option.label}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default FilterNavBarForCounts
