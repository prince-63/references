import React from 'react'
import InputSearch from '../atom/Inputs/InputSearch'
interface props {
  globalFilter?: any
  setGlobalFilter?: any
  resetPaginationState?: () => void
  max?: number
  showFilter?: boolean
  onFilterClick?: () => void
}
const Search: React.FC<props> = (props) => {
  const {setGlobalFilter, globalFilter, max, showFilter, onFilterClick, resetPaginationState} =
    props

  const handleChange = (e: any) => {
    resetPaginationState && resetPaginationState()
    setGlobalFilter(e.target.value)
  }

  return (
    <div>
      <InputSearch
        className='w-80 h-16'
        placeholder='Search Patient'
        value={globalFilter || ''}
        maxLength={max}
        onChange={handleChange}
        showFilter={showFilter}
        onFilterClick={onFilterClick}
      />
    </div>
  )
}
export default Search
