import React, {useState} from 'react'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import {optionType} from 'types/optionType'
import InputSearch from 'components/atom/Inputs/InputSearch'
import clsx from 'clsx'
import {Radio} from 'antd'
import When from 'components/when/When'

interface CheckboxListProps {
  items: optionType[] | []
  radioListItems: optionType[] | []
  selectedItems: string
  className?: string
  onclick: (x: number | string | null) => void
  handleRadioChange: (x: string) => void
  isShowRadioSelect: boolean
}

const FilterWithRadioAndSearchForOrg: React.FC<CheckboxListProps> = ({
  items,
  selectedItems,
  className,
  onclick,
  radioListItems,
  handleRadioChange,
  isShowRadioSelect,
}) => {
  const [search, setSearch] = useState<string>('')
  const [radio, setRadio] = useState<string>('')

  const handleItemSelect = (item: optionType): void => {
    onclick(item.value)
    handleRadioChange('BY_PROFILE_ID')
  }

  const handleChange = (e: any) => {
    setRadio(e.target.value)
    handleRadioChange(e.target.value)
    onclick(null)
  }

  const filteredItems =
    items &&
    items.filter(
      (item) => hasValue(item) && item.label.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className='flex flex-col gap-1'>
      <When isTrue={isShowRadioSelect}>
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
      </When>
      <When isTrue={radio !== 'UNASSIGNED'}>
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
                'flex items-center py-1 px-3 text-sm rounded-lg truncate ...',
                item.value === selectedItems
                  ? 'text-primaryColor bg-primarySupport font-medium'
                  : 'text-textColor font-normal'
              )}
            >
              <button onClick={() => handleItemSelect(item)}>{item.label}</button>
            </div>
          ))}
        </div>
      </When>
    </div>
  )
}

export default FilterWithRadioAndSearchForOrg
