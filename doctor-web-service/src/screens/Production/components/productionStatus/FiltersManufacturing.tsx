import manufacturingFiltersConstant from '@constants/manufacturingFilters.constant'

interface FiltersManufacturingProps {
  onClick: (e: any) => void
  counts: {
    IN_PRINTING: number
    IN_PRODUCTION: number
    IN_TRANSIT: number
  }
  chosenState: {
    IN_PRINTING: boolean
    IN_PRODUCTION: boolean
    IN_TRANSIT: boolean
  }
}

const FiltersManufacturing = ({
  onClick: handleClick,
  counts,
  chosenState,
}: FiltersManufacturingProps) => {
  const uncheckedStyle = 'text-textColor'
  const checkedStyle = 'text-black font-semibold'
  return (
    <div className='flex'>
      <div className='text-textColor pr-2 border-r border-r-1 border-r-textColor'>Show only</div>
      <div className='flex items-center justify-center px-2 gap-4'>
        <div className='flex items-center justify-center gap-1'>
          <input
            type='checkbox'
            id={manufacturingFiltersConstant.IN_PRINTING}
            className='green-checkbox'
            onChange={handleClick}
            name={manufacturingFiltersConstant.IN_PRINTING}
          />
          <label
            htmlFor='in_printing'
            className={chosenState.IN_PRINTING ? checkedStyle : uncheckedStyle}
          >
            In Printing {`(${counts.IN_PRINTING})`}
          </label>
        </div>

        <div className='flex items-center justify-center gap-1'>
          <input
            type='checkbox'
            id={manufacturingFiltersConstant.IN_PRODUCTION}
            className='green-checkbox'
            onChange={handleClick}
            name={manufacturingFiltersConstant.IN_PRODUCTION}
          />
          <label
            htmlFor='in_transit'
            className={chosenState.IN_PRODUCTION ? checkedStyle : uncheckedStyle}
          >
            In Production {`(${counts.IN_PRODUCTION})`}
          </label>
        </div>

        <div className='flex items-center justify-center gap-1'>
          <input
            type='checkbox'
            id={manufacturingFiltersConstant.IN_TRANSIT}
            className='green-checkbox'
            onChange={handleClick}
            name={manufacturingFiltersConstant.IN_TRANSIT}
          />
          <label
            htmlFor='in_production'
            className={chosenState.IN_TRANSIT ? checkedStyle : uncheckedStyle}
          >
            In Transit {`(${counts.IN_TRANSIT})`}
          </label>
        </div>
      </div>
    </div>
  )
}

export default FiltersManufacturing
