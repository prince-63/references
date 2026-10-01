import {Popover} from 'antd'
import clsx from 'clsx'
import FilterOptionSelectDropdown from './FilterOptionSelectDropdown'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useState} from 'react'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import getColorPalette from 'utils/getColorPalette'
export type optionType = {value: string; label: string}

const list = [
  {
    label: 'All Statuses',
    value: 'ALL',
  },
  {
    label: 'Invited',
    value: 'PENDING',
  },
  {
    label: 'Active',
    value: 'ACCEPTED',
  },
  {
    label: 'Deactivated',
    value: 'DEACTIVATED',
  },
]
const SortStatusFilter = ({handleSortByStatus}: {handleSortByStatus: (x: optionType) => void}) => {
  const {selectedStatus} = useSelector((state: RootState) => state.accessControl)
  const [isActive, setIsActive] = useState(false)

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
                  onChange={handleSortByStatus}
                  checked={option.value === selectedStatus}
                />
              )
            })}
          </div>
        </div>
      }
      onOpenChange={() => setIsActive(!isActive)}
      overlayInnerStyle={{padding: '4px', fontFamily: 'Figtree'}}
      placement='bottom'
      trigger={['click']}
      className='transition ease-in-out duration-200'
    >
      <button
        className={clsx(
          'rounded-lg flex gap-2 justify-center items-center border px-3 py-1 ml-2 ',
          isActive ? 'border-primaryColor text-primaryColor' : 'border-mediumGray text-textColor'
        )}
        type='button'
      >
        <span className='ml-1'>All Statuses</span>
        <div className={clsx(isActive ? '-rotate-90' : 'rotate-90')}>
          <CaretRightIcon color={isActive ? getColorPalette().primaryColor : '#666666'} />
        </div>{' '}
      </button>
    </Popover>
  )
}

export default SortStatusFilter
