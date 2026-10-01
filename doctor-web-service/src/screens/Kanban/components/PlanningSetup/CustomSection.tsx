import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import {CustomPlanningMode} from './types'
import OutsourceSection from './OutsourceSection'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  resetPlanningProductSelection,
  setPlanningProductType,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import InHouseSection from './InHouseSection'

const CustomSection = ({
  customFlow,
  setCustomFlow,
}: {
  customFlow: string
  setCustomFlow: (x: CustomPlanningMode) => void
}) => {
  const {dispatchAction} = useDispatchAction()

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <RadioGroupIcon
          options={[
            {label: 'In-House', value: 'IN_HOUSE'},
            {label: 'Outsource', value: 'OUTSOURCE'},
          ]}
          onOptionChange={(value) => {
            setCustomFlow(value as CustomPlanningMode)
            dispatchAction(resetPlanningProductSelection())
            dispatchAction(setPlanningProductType(value))
          }}
          selectedOption={customFlow}
          className='text-center rounded-md md:rounded-lg sm:px-4 text-base !h-12 !px-4'
        />

        {customFlow === 'IN_HOUSE' ? (
          <div className='mt-4'>
            <InHouseSection isFromCustom={true} />
          </div>
        ) : (
          <div className='flex flex-col gap-3 mt-4'>
            <OutsourceSection />
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomSection
