import When from 'components/when/When'
import {IConsecutiveAlignerRow} from 'screens/Production/types/productionModule.types'
import hasValue from 'utils/hasValue'
import NoOrders from './NoOrders'
import AlignerRows from './alignerRows/AlignerRows'

const AlignerRowsWrapper = ({orderItem}: {orderItem: IConsecutiveAlignerRow[] | undefined}) => {
  return (
    <div className='flex flex-col h-full'>
      <When isTrue={!hasValue(orderItem)}>
        <NoOrders />
      </When>
      {hasValue(orderItem) && (
        <AlignerRows
          {...{
            orderItem,
          }}
        />
      )}
    </div>
  )
}

export default AlignerRowsWrapper
