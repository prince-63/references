import filterPatientList from '@constants/filterPatientList'
import CrossIcon from 'assets/icons/CrossIcon'
import clsx from 'clsx'
import When from 'components/when/When'
import React from 'react'

interface OptionType {
  label: string
  value: keyof typeof filterPatientList
  color: string
  bgColor: string
}

export interface InputRadioProps {
  option: OptionType
  checked: boolean
  onChange: (selectedOption: keyof typeof filterPatientList | 'ALL') => void
  disabled?: boolean
}

const OuterFilterSelection: React.FC<InputRadioProps> = ({
  option,
  checked,
  onChange,
  disabled = false,
}) => {
  const value = option.value
  const colorClasses: Record<
    keyof typeof filterPatientList,
    {
      border: string
      background: string
      dot: string
      text: string
    }
  > = {
    PENDING: {
      border: 'border-orange',
      background: 'bg-orangeSupport',
      dot: 'bg-orange',
      text: 'text-orange',
    },
    CONNECTED: {
      border: 'border-tertiaryColor',
      background: 'bg-tertiarySupport',
      dot: 'bg-tertiaryColor',
      text: 'text-tertiaryColor',
    },
    NOT_CONNECTED: {
      border: 'border-red',
      background: 'bg-redSupport',
      dot: 'bg-red',
      text: 'text-red',
    },
  }

  const currentColor = colorClasses[value]

  return (
    <div
      className={clsx(
        'flex items-center space-x-2 px-3 py-2 rounded-3xl border w-fit shrink-0',
        currentColor.border,
        checked && currentColor.background
      )}
    >
      <button
        className='flex gap-2 items-center'
        onClick={(e) => {
          e.stopPropagation()
          onChange(value)
        }}
        disabled={disabled}
      >
        <div className={clsx('w-2 h-2 rounded-full', currentColor.dot)}></div>
        <span className={clsx('text-sm font-medium', currentColor.text)}>{option.label}</span>
      </button>
      <When isTrue={checked}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onChange('ALL')
          }}
        >
          <CrossIcon color={option.color} />
        </button>
      </When>
    </div>
  )
}

export default OuterFilterSelection
