import React from 'react'
import clsx from 'clsx'
import alignerStatusType from '@constants/alignerStatusType'
import {optionTypeCustomers} from '../types/customerList.types'
import practiceSortingConstants from '@constants/practiceSorting.constants'

interface InputRadioProps {
  value: string | number | keyof typeof practiceSortingConstants
  label: string
  checked?: boolean
  name?: string
  className?: string
  onChange?: ((option: optionTypeCustomers) => void) | undefined
}

const FilterOptionSelectDropdown: React.FC<InputRadioProps> = ({
  label,
  value,
  checked,
  onChange,
  name,
  className,
}) => {
  const handleRadioChange = () => {
    if (onChange && value !== undefined) {
      onChange({value: value, label: label} as optionTypeCustomers)
    }
  }
  const isDisabledOption =
    value === alignerStatusType.NOT_TRACKED || value === alignerStatusType.COMPLETED
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
        className={clsx(
          'form-radio h-5 w-5 accent-primaryColor ',
          isDisabledOption ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
        value={value}
        checked={checked}
        onChange={handleRadioChange}
        name={name}
        disabled={isDisabledOption}
      />
      <span
        className={clsx(checked ? `text-primaryColor` : 'text-textColor ', 'truncate font-medium')}
      >
        {label}
      </span>
    </label>
  )
}

export default FilterOptionSelectDropdown
