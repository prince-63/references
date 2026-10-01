import filterAlignerPatientAnalyticsConstants from '@constants/filterAlignerPatientAnalyticsConstants'
import useDispatchAction from '@hooks/useDispatchAction'
import CrossIcon from 'assets/icons/CrossIcon'
import clsx from 'clsx'
import When from 'components/when/When'
import React from 'react'
import {setSelectedFilter} from 'redux/Slices/AppSlice/AlignerPatientAnalytics/AlignerPatientAnalytics.slice'

interface OptionType {
  label: string
  value: keyof typeof filterAlignerPatientAnalyticsConstants
  color: string
  bgColor: string
}

export interface InputRadioProps {
  option: OptionType
  checked: boolean
  onChange: ({
    selectedOption,
    isAlignerUpdate,
  }: {
    selectedOption: keyof typeof filterAlignerPatientAnalyticsConstants | null
    isAlignerUpdate?: boolean
  }) => void
}

const OuterFilterSelection: React.FC<InputRadioProps> = ({option, checked, onChange}) => {
  const value = option.value
  const {dispatchAction} = useDispatchAction()

  const colorClasses: Record<
    keyof typeof filterAlignerPatientAnalyticsConstants,
    {
      border: string
      background: string
      dot: string
      text: string
    }
  > = {
    AT_RISK: {
      border: 'border-orange',
      background: 'bg-orangeSupport',
      dot: 'bg-orange',
      text: 'text-orange',
    },
    ON_TRACK: {
      border: 'border-tertiaryColor',
      background: 'bg-tertiarySupport',
      dot: 'bg-tertiaryColor',
      text: 'text-tertiaryColor',
    },
    NEEDS_ATTENTION: {
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
      <button className='flex gap-2 items-center' onClick={() => onChange({selectedOption: value})}>
        <div className={clsx('w-2 h-2 rounded-full', currentColor.dot)}></div>
        <span className={clsx('text-sm font-medium', currentColor.text)}>{option.label}</span>
      </button>
      <When isTrue={checked}>
        <button
          onClick={() => {
            dispatchAction(setSelectedFilter(null))
          }}
        >
          <CrossIcon color={option.color} />
        </button>
      </When>
    </div>
  )
}

export default OuterFilterSelection
