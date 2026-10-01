import cn from '@utils/cn'
import ActiveRadioIcon from 'assets/icons/ActiveRadioIcon'
import clsx from 'clsx'
import When from 'components/when/When'
import React from 'react'

interface Option {
  value: any
  label: string
  disabled?: boolean
}

interface RadioGroupProps {
  options: Option[]
  selectedOption: string
  label?: React.ReactNode
  onOptionChange: (option: string) => void
  showLabel?: boolean
  className?: string
  labelClassName?: string
  required?: boolean
  disabled?: boolean
  wrapperClassName?: string
  subLabel?: React.ReactNode
  subLabelClassName?: React.ReactNode
  /** 🔹 New prop: hide circular radio indicator (checked/unchecked) */
  showRadioIndicator?: boolean
}

const RadioGroupIcon: React.FC<RadioGroupProps> = ({
  options,
  selectedOption,
  onOptionChange,
  label,
  showLabel = true,
  className = 'rounded-3xl w-32',
  labelClassName = '',
  required,
  disabled,
  wrapperClassName,
  subLabel,
  showRadioIndicator = true, // default true for backward compatibility
}) => {
  return (
    <div className='flex flex-col gap-2'>
      <When isTrue={showLabel}>
        <label className={cn('font-medium text-base', labelClassName)}>
          {label}
          {required && <span className='text-red ml-1'>*</span>}
        </label>
        <label className={cn('font-normal text-sm text-gray-600')}>{subLabel}</label>
      </When>

      <div className={cn('flex gap-4', wrapperClassName)}>
        {options.map((option) => (
          <button
            key={option.value}
            disabled={disabled || option.disabled}
            type='button'
            className={cn(
              `${
                selectedOption === option.value
                  ? 'bg-primarySupport text-primaryColor border border-primaryColor'
                  : `bg-white text-textColor border border-mediumGray ${
                      disabled || option.disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    }`
              } flex gap-2 items-center p-2.5 h-10 font-medium text-xs`,
              className
            )}
            onClick={() => onOptionChange(option.value)}
          >
            {showRadioIndicator &&
              (selectedOption === option.value ? (
                <ActiveRadioIcon />
              ) : (
                <div
                  className={clsx(
                    'w-[17px] h-[17px] rounded-full flex justify-start border border-mediumGray mr-1'
                  )}
                ></div>
              ))}

            <div>{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default RadioGroupIcon
