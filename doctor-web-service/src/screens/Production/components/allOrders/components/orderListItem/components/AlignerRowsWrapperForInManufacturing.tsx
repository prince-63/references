import AlignerRows from './alignerRows/AlignerRows'
import alignerStatusOptions from '@staticData/alignerStatusOptions'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import ColorIcon from 'components/colorIcon/ColorIcon'
import NoOrders from './NoOrders'
import {GroupedInManufacturingStatusTypes} from 'screens/Production/helpers/organize'

const AlignerRowsWrapperForInManufacturing = ({
  inManufacturingItems,
}: {
  inManufacturingItems: GroupedInManufacturingStatusTypes | undefined
}) => {
  return (
    <div className='flex justify-start gap-2 h-full'>
      {hasValue(inManufacturingItems) &&
        inManufacturingItems &&
        alignerStatusOptions.slice(1, 4).map((alignerStatus) => {
          if (
            alignerStatus.value === 'IN_PRINTING' ||
            alignerStatus.value === 'IN_TRANSIT' ||
            alignerStatus.value === 'IN_PRODUCTION'
          ) {
            return (
              <div key={alignerStatus.value} className='flex justify-between gap-2'>
                <div className='flex flex-col gap-1 justify-start'>
                  <div className='flex items-center gap-2'>
                    <ColorIcon {...{color: alignerStatus.iconColor}} />
                    <p className='text-sm'>{alignerStatus.label}</p>
                  </div>
                  <AlignerRows {...{orderItem: inManufacturingItems[alignerStatus.value]}} />
                </div>
                <When isTrue={alignerStatus.value !== 'IN_TRANSIT'}>
                  <div className='border-r border-mediumGray h-16' />
                </When>
              </div>
            )
          }
        })}

      <When isTrue={!hasValue(inManufacturingItems)}>
        <NoOrders />
      </When>
    </div>
  )
}

export default AlignerRowsWrapperForInManufacturing
