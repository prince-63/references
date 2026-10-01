import PatientDetailsStep from '../Steps/PatientDetailsStep'
import OrderDetailsStep from '../Steps/OrderDetailsStep'
import ReviewAndSendStep from '../Steps/ReviewAndSendStep'
import {CaseFilesSelector} from '../Steps/CaseFilesSelector'
import {PrescriptionSelector} from '../Steps/PrescriptionSelector'

export default [
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
    id: 4,
    content: <ReviewAndSendStep />,
  },
]
