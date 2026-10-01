import {Popover} from 'antd'
import FilterIcon from 'assets/icons/FilterIcon'
import clsx from 'clsx'
import {useState} from 'react'
interface IOption {
  label: string
  value: 'NEWEST_TO_OLDEST' | 'OLDEST_TO_NEWEST'
}
const ordersSortingOptions = [
  {
    label: 'Newest to oldest',
    value: 'NEWEST_TO_OLDEST',
  },
  {
    label: 'Oldest to newest',
    value: 'OLDEST_TO_NEWEST',
  },
] as IOption[]

const UnprocessedListSort = ({
  handleSortOrder,
}: {
  handleSortOrder: ({sort_option}: {sort_option: 'NEWEST_TO_OLDEST' | 'OLDEST_TO_NEWEST'}) => void
}) => {
  const [selectedSort, setSelectedSort] = useState<'NEWEST_TO_OLDEST' | 'OLDEST_TO_NEWEST'>(
    'NEWEST_TO_OLDEST'
  )
  return (
    <Popover
      content={
        <div className='flex gap-2 p-4'>
          <div className='flex flex-col gap-3 max-h-64 overflow-y-scroll dropdownRadio'>
            {ordersSortingOptions.map((option: IOption, index: number) => {
              const checked = option.value === selectedSort
              return (
                <label key={index} className={clsx(`flex items-center space-x-2 `)}>
                  <input
                    type='radio'
                    className={clsx('form-radio h-5 w-5 accent-primaryColor ')}
                    checked={checked}
                    onChange={() => {
                      setSelectedSort(option.value)
                      handleSortOrder({sort_option: option.value})
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

export default UnprocessedListSort
