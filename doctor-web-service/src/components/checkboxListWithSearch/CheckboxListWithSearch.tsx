import React from 'react'
import InputSearch from '../atom/Inputs/InputSearch'
import hasValue from 'utils/hasValue'

interface CheckboxListProps {
  searchInputPlaceHolder: string
  items: string[]
  selectedItems: string[]
  setSelectedItems: (items: string[]) => void
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
}

const CheckboxListWithSearch: React.FC<CheckboxListProps> = ({
  items,
  searchInputPlaceHolder,
  selectedItems,
  setSelectedItems,
  searchTerm,
  setSearchTerm,
}) => {
  const handleCheckboxChange = (item: string): void => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const filteredItems = items.filter(
    (item) => hasValue(item) && item.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const sortedItems = filteredItems.sort((a, b) => {
    if (selectedItems.includes(a) && !selectedItems.includes(b)) {
      return -1
    }
    if (!selectedItems.includes(a) && selectedItems.includes(b)) {
      return 1
    }
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
      <div className='max-h-40 overflow-y-scroll text-textColor'>
        {sortedItems.map((item, index) => (
          <div key={index} className='flex items-center mb-3'>
            <input
              type='checkbox'
              checked={selectedItems.includes(item)}
              onChange={() => handleCheckboxChange(item)}
              className='mr-2 cursor-pointer custom-checkbox'
            />
            <label>{cropItemName(item)}</label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CheckboxListWithSearch
