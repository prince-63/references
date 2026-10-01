import alignerStatusOptions from '@staticData/alignerStatusOptions'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import ColorIcon from 'components/colorIcon/ColorIcon'
import NoOrders from './NoOrders'
import GroupedAlignerRowsWrapper from './alignerRows/GroupedAlignerRowsWrapper'
import {GroupedInManufacturingStatusTypes} from 'screens/Production/helpers/organize'

const GroupedAlignerRowsWrapperForInManufacturing = ({
  inManufacturingItems,
}: {
  inManufacturingItems: GroupedInManufacturingStatusTypes | undefined
}) => {
  return (
    <div className='justify-start gap-5 h-full text-textColor'>
      {hasValue(inManufacturingItems) &&
        inManufacturingItems &&
        alignerStatusOptions.slice(1, 4).map((alignerStatus) => {
          if (
            alignerStatus.value === 'IN_PRINTING' ||
            alignerStatus.value === 'IN_TRANSIT' ||
            alignerStatus.value === 'IN_PRODUCTION'
          ) {
            if (!hasValue(inManufacturingItems[alignerStatus.value])) return null
            return (
              <div key={alignerStatus.value} className='flex justify-between gap-4'>
                <div className='flex flex-col gap-1 justify-start'>
                  <div className='flex items-center gap-2'>
                    <ColorIcon {...{color: alignerStatus.iconColor}} />
                    <p className='text-sm'>{alignerStatus.label}</p>
                  </div>
                  <GroupedAlignerRowsWrapper
                    {...{groupedAligners: inManufacturingItems[alignerStatus.value]}}
                  />
                </div>
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

export default GroupedAlignerRowsWrapperForInManufacturing
