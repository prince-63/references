import React, {useState} from 'react'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import {optionType} from 'types/optionType'
import InputSearch from 'components/atom/Inputs/InputSearch'
import clsx from 'clsx'
import {Radio} from 'antd'

interface CheckboxListProps {
  items: optionType[] | []
  radioListItems: optionType[] | []
  selectedItems: string
  className?: string
  onclick: (x: string) => void
}

const FilterWithRadioAndSearch: React.FC<CheckboxListProps> = ({
  items,
  selectedItems,
  className,
  onclick,
  radioListItems,
}) => {
  const [search, setSearch] = useState<string>('')
  const [radio, setRadio] = useState<string>('')

  const handleItemSelect = (item: optionType): void => {
    onclick(item.label)
  }

  const handleChange = (e: any) => {
    setRadio(e.target.value)
    onclick(e.target.value)
  }

  const filteredItems =
    items &&
    items.filter(
      (item) => hasValue(item) && item.label.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className='flex flex-col gap-1'>
      <Radio.Group
        onChange={handleChange}
        value={radio}
        style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8}}
      >
        {radioListItems.map((item, index) => (
          <Radio key={index} value={item.value} className='text-textColor'>
            {item.label}
          </Radio>
        ))}
      </Radio.Group>

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
              item.label === selectedItems
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

export default FilterWithRadioAndSearch
