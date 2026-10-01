import {Popover} from 'antd'
import clsx from 'clsx'
import FilterOptionSelectDropdown from './FilterOptionSelectDropdown'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {useState} from 'react'
import {getRole} from 'utils/ConstFunctions'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import getColorPalette from 'utils/getColorPalette'
export type optionType = {value: number; label: string}

const SortRolesFilter = ({
  handleSortByRole,
  rolesOptionList,
}: {
  handleSortByRole: (x: optionType) => void
  rolesOptionList: optionType[]
}) => {
  const {selectedRole} = useSelector((state: RootState) => state.accessControl)
  const [isActive, setIsActive] = useState(false)
  const rolesListForSorting: optionType[] = [
    {
      label: 'All Roles',
      value: 0,
    },
    ...rolesOptionList,
  ]

  return (
    <Popover
      content={
        <div className='flex gap-2 p-4'>
          <div className='flex flex-col gap-3 max-h-64 overflow-y-scroll dropdownRadio'>
            {rolesListForSorting.map((option) => {
              return (
                <FilterOptionSelectDropdown
                  key={option.value}
                  value={option.value}
                  label={getRole(option.label)}
                  onChange={handleSortByRole}
                  checked={option.value === selectedRole}
                />
              )
            })}
          </div>
        </div>
      }
      overlayInnerStyle={{padding: '4px', fontFamily: 'Figtree'}}
      placement='bottom'
      trigger={['click']}
      onOpenChange={() => setIsActive(!isActive)}
      className='transition ease-in-out duration-200'
    >
      <button
        className={clsx(
          'rounded-lg flex gap-2 justify-center items-center border px-3 py-1 ml-2 ',
          isActive ? 'border-primaryColor text-primaryColor' : 'border-mediumGray text-textColor'
        )}
        type='button'
      >
        <span className='ml-1'>All Roles</span>
        <div className={clsx(isActive ? '-rotate-90' : 'rotate-90')}>
          <CaretRightIcon color={isActive ? getColorPalette().primaryColor : '#666666'} />
        </div>
      </button>
    </Popover>
  )
}

export default SortRolesFilter
