import React from 'react'
import classNames from 'classnames'

type OrderStepperProps = {
  patientLinkType: 'customer' | 'practice' // Determines the label of the first tab
  selectedLinkType: 'practice' | 'purchase'
  onLinkTypeChange: (type: 'practice' | 'purchase') => void
}

const OrderStepper: React.FC<OrderStepperProps> = ({
  patientLinkType,
  selectedLinkType,
  onLinkTypeChange,
}) => {
  const firstTabLabel =
    patientLinkType === 'customer' ? 'From Customer Order' : 'From Practice Order'

  return (
    <div className='flex bg-gray-200 p-1 rounded-xl w-fit shadow-inner'>
      <button
        onClick={() => onLinkTypeChange('practice')}
        className={classNames('p-2 text-sm font-medium rounded-xl transition', {
          'bg-white shadow text-black': selectedLinkType === 'practice',
          'bg-transparent text-gray-600': selectedLinkType !== 'practice',
        })}
      >
        {firstTabLabel}
      </button>
      <button
        onClick={() => onLinkTypeChange('purchase')}
        className={classNames('p-2 text-sm font-medium rounded-xl transition', {
          'bg-white shadow text-black': selectedLinkType === 'purchase',
          'bg-transparent text-gray-600': selectedLinkType !== 'purchase',
        })}
      >
        From Purchase Order
      </button>
    </div>
  )
}

export default OrderStepper
