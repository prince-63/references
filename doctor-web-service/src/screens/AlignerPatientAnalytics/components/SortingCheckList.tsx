import React from 'react'
import {Checkbox} from 'antd'
import cn from '@utils/cn'
import {optionType} from 'types/optionType'
import InputSearch from 'components/atom/Inputs/InputSearch'
import hasValue from 'utils/hasValue'

interface CheckboxListProps {
  searchInputPlaceHolder: string
  items: optionType[] | []
  selectedItems: optionType[]
  setSelectedItems: (items: optionType[]) => void
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  showSelectAll?: boolean
  className?: string
}

const SortingCheckList: React.FC<CheckboxListProps> = ({
  items,
  searchInputPlaceHolder,
  selectedItems,
  setSelectedItems,
  searchTerm,
  setSearchTerm,
  className,
}) => {
  const handleCheckboxChange = (item: optionType): void => {
    if (selectedItems.map((i) => i.value).includes(item.value)) {
      setSelectedItems(selectedItems.filter((i) => i.value !== item.value))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const cropItemName = (item: string) => {
    if (item.length > 40) {
      return item.substring(0, 40) + '...'
    }
    return item
  }

  const filteredItems = items.filter(
    (item) => hasValue(item) && item.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedItems = filteredItems.sort((a, b) => {
    if (a.value === 'UNASSIGNED') return -1
    if (b.value === 'UNASSIGNED') return 1

    const aSelected = selectedItems.some((item) => item.value === a.value)
    const bSelected = selectedItems.some((item) => item.value === b.value)
    if (aSelected && !bSelected) {
      return -1
    }
    if (!aSelected && bSelected) {
      return 1
    }
    return 0
  })

  return (
    <div className='flex flex-col gap-4 '>
      <InputSearch
        name='brandName'
        placeholder={searchInputPlaceHolder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        value={searchTerm}
      />

      <div className={cn('max-h-40 overflow-y-auto text-textColor ', className)}>
        {sortedItems.map((item, index) => (
          <div key={index} className='flex items-center mb-2'>
            <Checkbox
              onChange={() => handleCheckboxChange(item)}
              checked={selectedItems.some((selectedItem) => selectedItem.value === item.value)}
            >
              {cropItemName(item.label)}
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  )
}
export default SortingCheckList
