import React from 'react'
import RadioGroupIconWithDescription, {
  RadioOptionWithDescription,
} from 'components/RadioGroup/RadioGroupIconWithDescription'
import {CaseType} from './types'
import useAllUserPlan from '@hooks/useAllUserPlan'

type FlowSelectorProps = {
  value: CaseType | null
  onChange: (value: CaseType) => void
}

const FlowSelector: React.FC<FlowSelectorProps> = ({value, onChange}) => {
  const {isPractice, isEnterprisePlanUser, isCustomer, isGrowthPlanUser} = useAllUserPlan()
  const options: RadioOptionWithDescription[] = [
    ...(isPractice || isEnterprisePlanUser || isCustomer
      ? [
          {
            value: 'OUTSOURCE',
            label: <span>Outsource</span>,
            description: (
              <>
                Send the case to one external lab that will handle both planning and aligner
                manufacturing.
              </>
            ),
          },
        ]
      : []),
    ...(isGrowthPlanUser
      ? [
          {
            value: 'IN_HOUSE',
            label: <span>In-house</span>,
            description: (
              <>Plan and produce the aligners internally with your own team and resources.</>
            ),
          },

          {
            value: 'CUSTOM',
            label: <span>Custom</span>,
            description: (
              <>
                Split the work: handle one part in-house and outsource the other, or use different
                providers for each.
              </>
            ),
          },
        ]
      : []),
  ]

  return (
    <RadioGroupIconWithDescription
      wrapperClassName='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-3'
      className='!rounded-xl'
      options={options}
      selectedOption={value ?? ''}
      onOptionChange={(option) => onChange(option as CaseType)}
    />
  )
}

export default FlowSelector
