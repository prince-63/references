import PatientDetailsStep from '../Steps/PatientDetailsStep'
import ReviewAndSendStep from '../Steps/ReviewAndSendStep'
import ShippingDetailsStep from '../Steps/ShippingDetails/ShippingDetailsStep'
import {CaseFilesSelector} from '../Steps/CaseFilesSelector'
import {PrescriptionSelector} from '../Steps/PrescriptionSelector'
import OrderDetailsStep from '../Steps/OrderDetailsStep'

export const getCreateOrderSteps = ({isPlanningOrder}: {isPlanningOrder: boolean}) => {
  const baseSteps = isPlanningOrder
    ? [
        {
          title: 'Patient details',
          id: 0,
          content: <PatientDetailsStep />,
        },

        {
          title: 'Order details',
          id: 1,
          content: <OrderDetailsStep />,
        },

        {
          title: 'Files',
          id: 2,
          content: <CaseFilesSelector />,
        },
        {
          title: 'Prescription',
          id: 3,
          content: <PrescriptionSelector />,
        },
        {
          title: 'Shipping',
          id: 4,
          content: <ShippingDetailsStep />,
        },
        {
          title: 'Review and send',
          id: 5,
          content: <ReviewAndSendStep />,
        },
      ]
    : [
        {
          title: 'Patient details',
          id: 0,
          content: <PatientDetailsStep />,
        },

        {
          title: 'Order details',
          id: 1,
          content: <OrderDetailsStep />,
        },

        {
          title: 'Files',
          id: 2,
          content: <CaseFilesSelector />,
        },
        {
          title: 'Prescription',
          id: 3,
          content: <PrescriptionSelector />,
        },

        {
          title: 'Review and send',
          id: 5,
          content: <ReviewAndSendStep />,
        },
      ]
  return baseSteps
}
