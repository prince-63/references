import clsx from 'clsx'
import Spinner from 'components/spinner/Spinner'
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
  onOptionChange: (option: {label: string; value: string}) => void
  showLabel?: boolean
  className?: string
  labelClassName?: string
  required?: boolean
  loading?: boolean
}

const RadioGroups: React.FC<RadioGroupProps> = ({
  options,
  selectedOption,
  onOptionChange,
  label,
  showLabel = true,
  className = 'rounded-3xl w-fit min-w-[120px] justify-center',
  labelClassName = '',
  required,
  loading = false,
}) => {
  return (
    <div className='flex flex-col gap-2'>
      <When isTrue={loading}>
        <Spinner loading={loading} />
      </When>
      <When isTrue={!loading}>
        <When isTrue={showLabel}>
          <label className={clsx('font-medium text-base', labelClassName)}>
            {label} {required ? <span className='text-red '>*</span> : ''}
          </label>
        </When>
        <div className='flex md:gap-4 gap-3 flex-wrap'>
          {options?.map((option) => (
            <button
              key={option.value}
              type='button'
              className={clsx(
                `${
                  selectedOption === option.value
                    ? 'bg-primarySupport text-secondaryColor border border-secondaryColor'
                    : 'bg-white text-textColor border border-mediumGray'
                } md:p-5 p-3 h-10  font-medium text-xs flex items-center `,
                className
              )}
              onClick={() => onOptionChange(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </When>
    </div>
  )
}

export default RadioGroups
