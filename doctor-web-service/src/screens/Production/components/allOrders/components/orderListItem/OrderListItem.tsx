import {AlignerJourney, IProductionOrder} from 'screens/Production/types/productionOrders.interface'
import OrderListItemHeader from './components/OrderListItemHeader'
import ProductionStatusCardWrapper from './components/ProductionStatusCardWrapper'
import productionStatusFilterOptions from '@staticData/productionStatusFilterOptions'
import AlignerRowsWrapper from './components/AlignerRowsWrapper'
import productionStatusTypesConstants from '@constants/productionStatusTypes.constants'
import AlignerRowsWrapperForInManufacturing from './components/AlignerRowsWrapperForInManufacturing'
import moment from 'moment'
import DueMessage from 'screens/Production/components/DueMessage'
import organize from 'screens/Production/helpers/organize'

const OrderListItem = ({orderItem}: {orderItem: IProductionOrder}) => {
  const structuredAligners = organize(orderItem)
  const formatDate = (date: Date) => {
    if (!moment(date).isValid()) {
      return ''
    }
    return moment(date, 'DD-MM-YYYY').format('DD MMM')
  }
  const getCurrentAligner = (alignerJourney: AlignerJourney) => {
    const currentAligner = alignerJourney.current_aligner_no
    return alignerJourney.aligners?.find((aligner) => aligner.sr_no === currentAligner)
  }

  const currentAligner = getCurrentAligner(orderItem.aligner_journey)!
  return (
    <div className='bg-white rounded-lg shadow p-3 text-textColor flex flex-col gap-5 mb-6'>
      <OrderListItemHeader {...{orderItem}} />
      <div className='w-full border border-mediumGray'></div>
      <div className='flex justify-between gap-2.5 flex-wrap'>
        <ProductionStatusCardWrapper headerText={'Current Aligner'}>
          <div className='flex flex-col gap-3'>
            <p className='text-black font-semibold text-base capitalize'>
              {currentAligner?.jaw_type.toLowerCase()} {currentAligner?.sr_no}
            </p>
            <div className='text-xs text-textColor font-normal'>
              <p>Start date - {formatDate(new Date(currentAligner?.start_date)) ?? ''} </p>
              <p>End date - {formatDate(new Date(currentAligner?.end_date)) ?? ''} </p>
            </div>
            {/* <div>{currentAligner?.end_date}</div> */}
            <DueMessage {...{date: currentAligner?.end_date}} />
          </div>
        </ProductionStatusCardWrapper>
        {[...productionStatusFilterOptions].reverse().map((option) => {
          if (!option.cardTitle) return null
          return (
            <ProductionStatusCardWrapper
              headerIcon={<option.icon />}
              headerText={option.cardTitle}
              key={option.value}
            >
              {option.value !== productionStatusTypesConstants.IN_MANUFACTURING && (
                <AlignerRowsWrapper orderItem={structuredAligners[option.value]} />
              )}
              {option.value === productionStatusTypesConstants.IN_MANUFACTURING && (
                <AlignerRowsWrapperForInManufacturing
                  inManufacturingItems={structuredAligners[option.value]}
                />
              )}
            </ProductionStatusCardWrapper>
          )
        })}
      </div>
    </div>
  )
}

export default OrderListItem
