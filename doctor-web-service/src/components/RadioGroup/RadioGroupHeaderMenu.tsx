import clsx from 'clsx'
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
}

const RadioGroupHeaderMenu: React.FC<RadioGroupProps> = ({
  options,
  selectedOption,
  onOptionChange,
  className = 'rounded-3xl w-32',
}) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-4'>
        {options.map((option) => (
          <div key={option.value} className='flex flex-col'>
            <button
              key={option.value}
              type='button'
              className={clsx(
                `${
                  selectedOption === option.value
                    ? 'bg-primarySupport text-primaryColor'
                    : 'bg-white text-textColor'
                } h-10 px-4 py-2 rounded-lg justify-center items-center gap-2 inline-flex p-2.5 font-semibold text-base leading-normal`,
                className
              )}
              onClick={() => onOptionChange(option.value)}
            >
              {option.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RadioGroupHeaderMenu
