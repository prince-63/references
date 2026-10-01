import React from 'react'
import clsx from 'clsx'
import practiceSortingConstants from '@constants/practiceSorting.constants'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'

interface InputRadioProps {
  value: string | number | keyof typeof practiceSortingConstants
  label: string
  checked?: boolean
  name?: string
  className?: string
  onChange?: ((option: any) => void) | undefined
  isDisabledOption?: boolean
  subTitle?: string
  labelClassName?: string
}

const FilterOptionSelectDropdown: React.FC<InputRadioProps> = ({
  label,
  subTitle,
  value,
  checked,
  onChange,
  name,
  className,
  isDisabledOption,
  labelClassName,
}) => {
  const handleRadioChange = () => {
    if (onChange && value !== undefined) {
      onChange({value: value, label: label})
    }
  }

  return (
    <label
      className={clsx(
        `flex items-center space-x-2 `,
        className,
        isDisabledOption ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
    >
      <input
        type='radio'
        className={cn(
          'form-radio h-5 w-5 accent-primaryColor ',
          isDisabledOption ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
        value={value}
        checked={checked}
        onChange={handleRadioChange}
        name={name}
        disabled={isDisabledOption}
      />
      <div className='flex flex-col'>
        <span
          className={cn(
            checked ? `text-primaryColor` : 'text-textColor ',
            'truncate font-medium',
            labelClassName
          )}
        >
          {label}
        </span>
        <When isTrue={hasValue(subTitle)}>
          <p className='text-base text-textColor'>{subTitle}</p>
        </When>
      </div>
    </label>
  )
}

export default FilterOptionSelectDropdown
