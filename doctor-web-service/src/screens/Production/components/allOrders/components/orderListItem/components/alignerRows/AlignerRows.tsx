import {IConsecutiveAlignerRow} from 'screens/Production/types/productionModule.types'
import AlignerRow from './AlignerRow'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import NoOrders from '../NoOrders'

interface AlignerRowsProps {
  orderItem: IConsecutiveAlignerRow[] | undefined
}

const AlignerRows: React.FC<AlignerRowsProps> = ({orderItem}) => {
  return (
    <div className=''>
      {hasValue(orderItem) &&
        orderItem &&
        orderItem
          .sort((a, b) => a.startAlignerNumber - b.startAlignerNumber)
          .map((alignerGroup, index) => <AlignerRow key={index} alignerRow={alignerGroup} />)}
      <When isTrue={!hasValue(orderItem)}>
        <NoOrders />
      </When>
    </div>
  )
}

export default AlignerRows
