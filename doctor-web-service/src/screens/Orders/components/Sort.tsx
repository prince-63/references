import {Popover} from 'antd'
import clsx from 'clsx'
import ordersSortingOptions from '@staticData/ordersSortingOptions'
import FilterIcon from 'assets/icons/FilterIcon'
import {useState} from 'react'
import orderSortingConstants from '@constants/orderSorting.constants'
export interface IOptionTypeOrderSort {
  label: string
  value: keyof typeof orderSortingConstants
  valueOption: {
    type: string
    sort: string
  }
}
const Filter = ({
  handleChange,
}: {
  handleChange: (orderListSort: {type: string; sort: string}) => void
}) => {
  const [selectedSort, setSelectedSort] = useState<keyof typeof orderSortingConstants>(
    orderSortingConstants.LAST_UPDATED_NEW_TO_OLD
  )
  return (
    <Popover
      content={
        <div className='flex gap-2 p-4'>
          <div className='flex flex-col gap-3 max-h-64 overflow-y-scroll dropdownRadio'>
            {ordersSortingOptions.map((option: IOptionTypeOrderSort, index: number) => {
              const checked = option.value === selectedSort
              return (
                <label key={index} className={clsx(`flex items-center space-x-2 `)}>
                  <input
                    type='radio'
                    className={clsx('form-radio h-5 w-5 accent-primaryColor ')}
                    checked={checked}
                    onChange={() => {
                      setSelectedSort(option.value)
                      handleChange(option.valueOption)
                    }}
                  />
                  <span
                    className={clsx(
                      checked ? `text-primaryColor` : 'text-textColor ',
                      'truncate font-medium'
                    )}
                  >
                    {option.label}
                  </span>
                </label>
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
          'md:w-fit w-full rounded-lg flex justify-center items-center border  px-2 py-1 ml-2 border-mediumGray text-textColor'
        )}
        type='button'
      >
        <FilterIcon color={'#666666'} />
        <span className='ml-1'>Sort</span>
      </button>
    </Popover>
  )
}

export default Filter
