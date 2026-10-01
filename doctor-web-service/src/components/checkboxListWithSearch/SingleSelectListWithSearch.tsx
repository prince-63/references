import React from 'react'
import InputSearch from '../atom/Inputs/InputSearch'
import hasValue from 'utils/hasValue'
import {Checkbox} from 'antd'
import cn from '@utils/cn'
import {optionType} from 'types/optionType'

interface CheckboxListProps {
  searchInputPlaceHolder: string
  items: optionType[] | []
  selectedItems: optionType[]
  setSelectedItems: (items: optionType[]) => void
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  className?: string
  hideCheckbox?: boolean
  onclick: (x: optionType) => void
}

const SingleSelectListWithSearch: React.FC<CheckboxListProps> = ({
  items,
  searchInputPlaceHolder,
  selectedItems,
  setSelectedItems,
  searchTerm,
  setSearchTerm,
  className,
  hideCheckbox,
  onclick,
}) => {
  const handleItemSelect = (item: optionType): void => {
    const isAlreadySelected = selectedItems.some((i) => i.value === item.value)
    onclick(item)
    if (!isAlreadySelected) {
      setSelectedItems([item])
    } else {
      setSelectedItems([])
    }
  }

  const filteredItems =
    items &&
    items.filter(
      (item) => hasValue(item) && item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const sortedItems = filteredItems.sort((a, b) => {
    if (a.value === 'UNASSIGNED') return -1
    if (b.value === 'UNASSIGNED') return 1

    const aSelected = selectedItems.some((item) => item.value === a.value)
    const bSelected = selectedItems.some((item) => item.value === b.value)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  const cropItemName = (item: string) => {
    if (item.length > 40) {
      return item.substring(0, 40) + '...'
    }
    return item
  }

  return (
    <div className='flex flex-col gap-4'>
      <InputSearch
        name='brandName'
        placeholder={searchInputPlaceHolder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        value={searchTerm}
      />

      <div className={cn('max-h-40 overflow-y-auto text-textColor', className)}>
        {sortedItems.map((item, index) => (
          <div key={index} className='flex items-center mb-2'>
            {!hideCheckbox && (
              <Checkbox
                onChange={() => handleItemSelect(item)}
                checked={selectedItems.some((selectedItem) => selectedItem.value === item.value)}
              >
                {cropItemName(item.label)}
              </Checkbox>
            )}
            {hideCheckbox && (
              <button onClick={() => handleItemSelect(item)}>{cropItemName(item.label)}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SingleSelectListWithSearch
