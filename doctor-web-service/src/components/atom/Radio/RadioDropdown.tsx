import React from 'react'
import clsx from 'clsx'
import type {optionType} from 'types/optionType'
import alignerStatusType from '@constants/alignerStatusType'

interface InputRadioProps {
  value: string | number
  label: string
  checked?: boolean
  name?: string
  className?: string
  onChange?: ((option: optionType) => void) | undefined
}

const Radio: React.FC<InputRadioProps> = ({label, value, checked, onChange, name, className}) => {
  const handleRadioChange = () => {
    if (onChange && value !== undefined) {
      onChange({value: value, label: label} as optionType)
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

export default Radio
