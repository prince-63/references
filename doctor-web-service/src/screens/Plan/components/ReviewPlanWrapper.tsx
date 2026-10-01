import ArrowRightDownIcon from 'assets/icons/ArrowRightDownIcon'
import React from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const ReviewPlanWrapper = ({isSent, children}: {isSent?: boolean; children: React.ReactNode}) => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const isCustomerPatient = data?.patient_details?.assigned_practice?.is_customer_patient

  return (
    <div className='rounded-lg w-full  border border-mediumGray'>
      <div
        className={
          'flex gap-2 items-center text-textColor text-base font-semibold bg-lightGray border-b border-mediumGray px-4 py-2 rounded-t-lg'
        }
      >
        <ArrowRightDownIcon className={isSent ? 'transform -rotate-90' : ''} />
        {!isSent
          ? 'Received from Lab'
          : isCustomerPatient
            ? 'Sent to Customer'
            : 'Sent to Practice'}
      </div>
      {children}
    </div>
  )
}

export default ReviewPlanWrapper
