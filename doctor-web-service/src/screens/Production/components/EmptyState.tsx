import React from 'react'
import {IMAGE_PRODUCTION_SCREEN_EMPTY_STATE} from '../../../utils/ImageConst'
import {ProductionFilter} from '../types/productionModule.types'
import productionStatusTypesConstants from '../../../@constants/productionStatusTypes.constants'

const EmptyState = ({filter}: {filter: ProductionFilter}) => {
  const isAllOrders = filter[productionStatusTypesConstants.ALL_ORDERS]

  return (
    <div className='flex flex-col justify-center items-center gap-5 h-[37rem]'>
      <img src={IMAGE_PRODUCTION_SCREEN_EMPTY_STATE} className='w-64 h-60 ' />
      <div className='flex flex-col justify-center items-center'>
        <p className='font-semibold text-black text-2xl'>
          {isAllOrders
            ? 'You do not have any orders to view here'
            : 'You do not have any orders in this status'}
        </p>
        <p className='text-textColor font-normal text-base'>
          {isAllOrders
            ? "Please set up a patient's treatment plan to view them"
            : 'Change the status of an Aligner in the Patient Profile section to view them here'}
        </p>
      </div>
    </div>
  )
}

export default EmptyState
