import cn from '@utils/cn'
import When from 'components/when/When'
import React from 'react'

interface Option {
  value: any
  label: string
}

interface RadioGroupProps {
  options: Option[]
  selectedOption: string
  label?: string
  onOptionChange: (option: string) => void
  showLabel?: boolean
  className?: string
  labelClassName?: string
  required?: boolean
  disabled?: boolean
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  selectedOption,
  onOptionChange,
  label,
  showLabel = true,
  className = 'rounded-3xl w-32',
  labelClassName = '',
  required,
  disabled,
}) => {
  return (
    <div className='flex flex-col gap-2'>
      <When isTrue={showLabel}>
        <label className={cn('font-medium text-base', labelClassName)}>{label}</label>
        {required ? <span className='text-red ml-1'>*</span> : ''}
      </When>
      <div className='flex gap-4 flex-wrap'>
        {options.map((option) => (
          <button
            key={option.value}
            disabled={disabled}
            type='button'
            className={cn(
              `${
                selectedOption === option.value
                  ? 'bg-secondarySupport text-secondaryColor border border-secondaryColor'
                  : `bg-white text-textColor border border-mediumGray ${
                      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`
              } p-2.5  h-10  font-medium text-xs`,
              className
            )}
            onClick={() => onOptionChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RadioGroup
