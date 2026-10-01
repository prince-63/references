import {ReviewAndStep} from './ReviewAndStep'
import {VspCaseFilesSelector} from './VspCaseFileSelector'
import OrderDetailsStep from './OrderDetailsStep'
import {VspPrescriptionSelector} from './VspPrescriptionSelector'
import ShippingDetailsForm from './ShippingDetails'

export const getCreateOrderSteps = () => {
  return [
    {
      title: 'Order details',
      id: 0,
      content: <OrderDetailsStep />,
    },
    {
      title: 'Case Records',
      id: 1,
      content: <VspCaseFilesSelector />,
    },
    {
      title: 'Prescription',
      id: 2,
      content: <VspPrescriptionSelector />,
    },
    {
      title: 'Shipping & Billing',
      id: 3,
      content: <ShippingDetailsForm />,
    },
    {
      title: 'Review And Step',
      id: 4,
      content: <ReviewAndStep />,
    },
  ]
}
