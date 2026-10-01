import {Popover} from 'antd'
import FilterIcon from 'assets/icons/FilterIcon'
import clsx from 'clsx'
import FilterOptionSelectDropdown from 'screens/Practices/PracticeList/components/FilterOptionSelectDropdown'
type optionType = {
  value: number
  label: string
}

const FilterSort = ({
  filterName,
  assignee,
  handleChange,
  list,
}: {
  filterName: string
  assignee: number | null
  handleChange: (practiceListSort: optionType) => void
  list: optionType[]
}) => {
  return (
    <Popover
      content={
        <div className='flex gap-2 p-4'>
          <div className='flex flex-col gap-3 max-h-64 overflow-y-scroll dropdownRadio'>
            {list.map((option) => {
              return (
                <FilterOptionSelectDropdown
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  onChange={handleChange}
                  checked={option.value === assignee}
                />
              )
            })}
          </div>
        </div>
      }
      overlayInnerStyle={{padding: '4px', fontFamily: 'Figtree'}}
      placement='bottom'
      trigger={['click']}
      className='transition ease-in-out duration-200'
    >
      <button
        className={clsx(
          'rounded-lg flex justify-center items-center border  px-2 py-1 ml-2 border-mediumGray text-textColor'
        )}
        type='button'
      >
        <FilterIcon color={'#666666'} />
        <span className='ml-1'>{filterName}</span>
      </button>
    </Popover>
  )
}

export default FilterSort
