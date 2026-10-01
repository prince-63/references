import React, {useState} from 'react'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import {optionType} from 'types/optionType'
import InputSearch from 'components/atom/Inputs/InputSearch'
import clsx from 'clsx'

interface CheckboxListProps {
  items: optionType[] | []
  selectedItems: string
  className?: string
  onclick: (x: string | number) => void
  needValue?: boolean
}

const FilterWithSearchBox: React.FC<CheckboxListProps> = ({
  items,
  selectedItems,
  className,
  onclick,
  needValue = false,
}) => {
  const [search, setSearch] = useState<string>('')
  const handleItemSelect = (item: optionType): void => {
    if (needValue) {
      onclick(item.value)
    } else {
      onclick(item.label)
    }
  }
  const filteredItems =
    items &&
    items.filter(
      (item) => hasValue(item) && item.label.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className='flex flex-col gap-1'>
      <InputSearch
        name='search'
        placeholder={'Search'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        value={search}
        maxLength={200}
        wrapperClassName='max-h-8'
      />

      <div className={cn('max-h-32 overflow-y-auto text-textColor', className)}>
        {filteredItems.map((item, index) => (
          <div
            key={index}
            className={clsx(
              'flex items-center py-1 px-3 text-sm rounded-lg font-normal truncate ...',
              item.value === selectedItems || item.label === selectedItems
                ? 'text-primaryColor bg-primarySupport'
                : 'text-textColor'
            )}
          >
            <button onClick={() => handleItemSelect(item)}>{item.label}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilterWithSearchBox
