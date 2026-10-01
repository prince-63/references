import {CaseFilesSelector} from 'screens/Orders/Steps/CaseFilesSelector'
import {PrescriptionSelector} from 'screens/Orders/Steps/PrescriptionSelector'
import ReviewAndSendStep from 'screens/Orders/Steps/ReviewAndSendStep'
import OrderDetailsStep from './OrderDetailsStep'

export const getCreateOrderSteps = () => {
  return [
    {
      title: 'Order details',
      id: 0,
      content: <OrderDetailsStep />,
    },
    {
      title: 'Files',
      id: 1,
      content: <CaseFilesSelector />,
    },
    {
      title: 'Prescription',
      id: 2,
      content: <PrescriptionSelector />,
    },

    {
      title: 'Review and send',
      id: 3,
      content: <ReviewAndSendStep />,
    },
  ]
}
