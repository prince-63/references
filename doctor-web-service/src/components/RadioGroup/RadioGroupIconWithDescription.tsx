import React from 'react'
import clsx from 'clsx'
import ActiveRadioIcon from 'assets/icons/ActiveRadioIcon'

export interface RadioOptionWithDescription {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

interface RadioGroupIconWithDescriptionProps {
  options: RadioOptionWithDescription[]
  selectedOption: string
  onOptionChange: (value: string) => void
  className?: string
  wrapperClassName?: string
  disabled?: boolean
}

const RadioGroupIconWithDescription: React.FC<RadioGroupIconWithDescriptionProps> = ({
  options,
  selectedOption,
  onOptionChange,
  className = '',
  wrapperClassName = '',
  disabled = false,
}) => {
  return (
    <div className={clsx('flex flex-col gap-3', wrapperClassName)}>
      {options.map((option) => {
        const isSelected = selectedOption === option.value
        const isDisabled = disabled || option.disabled

        return (
          <button
            key={option.value}
            type='button'
            disabled={isDisabled}
            onClick={() => !isDisabled && onOptionChange(option.value)}
            className={clsx(
              'flex items-start gap-3 p-4 w-full rounded-lg border transition text-left',
              isSelected
                ? 'border-primaryColor bg-primarySupport text-primaryColor'
                : 'border-mediumGray bg-white hover:bg-gray-50',
              isDisabled && 'cursor-not-allowed opacity-50',
              className
            )}
          >
            <div className='pt-1'>
              {isSelected ? (
                <ActiveRadioIcon />
              ) : (
                <div className='w-[17px] h-[17px] rounded-full border border-mediumGray' />
              )}
            </div>

            <div className='flex flex-col'>
              <div className='text-sm font-medium text-gray-900'>{option.label}</div>
              {option.description && (
                <div className='text-xs text-gray-500 mt-1 leading-snug'>{option.description}</div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default RadioGroupIconWithDescription
