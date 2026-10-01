import React from 'react'
import {useNavigate} from 'react-router-dom'
import userOrderDetails from '../hooks/userOrderDetails'
import getColorPalette from 'utils/getColorPalette'
import RightArrowIcon from 'assets/icons/RightArrowIcon'

const PurchaseOrderCard = () => {
  const navigate = useNavigate()

  const {order} = userOrderDetails()
  return (
    <div className='mt-4 rounded-lg p-4 border border-mediumGray max-w-md'>
      <h2 className='text-xl font-semibold text-black mb-4'>
        {!order?.is_purchase_order ? 'Purchase order created' : 'Linked Customer order'}
      </h2>
      <button
        onClick={() => {
          navigate(`/orders/${order?.purchase_order_details?.order_id}`)
        }}
        className='flex items-center justify-center px-4 py-2 gap-2 border border-primaryColor rounded-xl text-primaryColor font-semibold bg-primarySupport transition'
      >
        View order
        <RightArrowIcon color={getColorPalette().primaryColor} width='20' height='20' />
      </button>
    </div>
  )
}

export default PurchaseOrderCard
