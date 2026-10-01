import {useState, useCallback, useMemo, useEffect} from 'react'
import hasValue from 'utils/hasValue'

type FilterOption = {
  value: string
  label: string
}

type FilterStatus = FilterOption['value']

const useFilter = <T extends FilterOption>(
  filterOptions: T[],
  firstItemActive: boolean = true,
  defaultActiveValue?: T['value']
): {
  filter: Record<T['value'], boolean>
  handleFilterChange: (option: T['value'], toggle?: boolean) => void
  resetFilter: () => void
} => {
  const initialFilterState: Record<FilterStatus, boolean> = useMemo(() => {
    const state: Record<FilterStatus, boolean> = {} as Record<FilterStatus, boolean>
    filterOptions.forEach(({value}, index) => {
      state[value] = hasValue(defaultActiveValue)
        ? value === defaultActiveValue
        : index === 0 && firstItemActive
    })
    return state
  }, [filterOptions, firstItemActive, defaultActiveValue])

  const [filter, setFilter] = useState(initialFilterState)

  useEffect(() => {
    setFilter(initialFilterState)
  }, [initialFilterState])

  // Update the filter state in a single setState call and memoize the
  // handler so components can safely use it inside useEffect dependencies.
  const handleFilterChange = useCallback((option: FilterStatus, toggle: boolean = false) => {
    setFilter((prev) => {
      const next: Record<FilterStatus, boolean> = {...prev}
      Object.keys(prev).forEach((filterKey) => {
        if (filterKey === option) {
          next[filterKey] = toggle ? !prev[filterKey] : true
        } else {
          next[filterKey] = false
        }
      })
      return next
    })
  }, [])

  const resetFilter = useCallback(() => {
    setFilter(initialFilterState)
  }, [initialFilterState])

  return {filter, handleFilterChange, resetFilter}
}

export default useFilter
