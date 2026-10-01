import React from 'react'
import {capitalizeFirstLetter} from '../../appointments/utils/DateConversion'
import {listType} from '../types/payments.types'

interface PropsTypes {
  paymentHeaderList: listType[]
}

const PaymentHeaderCard = (props: PropsTypes) => {
  const {paymentHeaderList} = props

  return (
    <div className='flex md:flex-row flex-col justify-between gap-3'>
      {paymentHeaderList.map((element: listType, index) => (
        <div key={index} className='flex-1 bg-white border-mediumGray'>
          <div className='h-auto p-4 rounded-lg border  flex flex-col justify-start items-start gap-3'>
            <div className='w-6 h-6 relative'>{element.icon}</div>
            <div className='self-stretch h-12 flex-col justify-start items-start gap-0.5 flex'>
              <div className="text-textColor text-sm font-medium font-['Figtree'] leading-tight tracking-tight">
                {capitalizeFirstLetter(element.title)}
              </div>
              <div className="text-black text-xl font-semibold font-['Figtree'] leading-7">
                {element.value ? `₹ ${Number(element.value).toLocaleString('en-IN')}` : '--'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PaymentHeaderCard
