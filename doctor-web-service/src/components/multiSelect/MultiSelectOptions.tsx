import React from 'react'

interface CheckboxListProps {
  items: {label: string; value: string}[]
  selectedItems: string[]
  setSelectedItems: (items: string[]) => void
  className?: string
}

const MultiSelectOptions: React.FC<CheckboxListProps> = ({
  items,
  selectedItems,
  setSelectedItems,
  className,
}) => {
  const handleCheckboxChange = (item: string): void => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  return (
    <div className='flex flex-col  gap-4'>
      <div className=' text-textColor flex flex-wrap gap-2'>
        {items.map((item, index) => (
          <div key={index} className='md:mb-3'>
            <button
              className={`${
                selectedItems.includes(item.value)
                  ? 'bg-primarySupport text-primaryColor'
                  : 'bg-white text-textColor border border-mediumGray'
              } p-2.5 rounded-3xl h-10 px-4 font-medium text-xs ${className}`}
              onClick={() => handleCheckboxChange(item.value)}
            >
              {item.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultiSelectOptions
