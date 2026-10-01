import CreateTreatmentPlanStep from '../steps/CreateTreatmentPlanStep'
import ManufacturingStep from '../steps/ManufacturingStep'
import PatientDetailsStep from '../steps/PatientDetailsStep'
import StartTreatmentPlanStep from '../steps/StartTreatmentPlanStep'
import ExistingCaseProductSelection from './ExistingCaseProductSelection'

export default [
  {
    title: 'Patient details',
    id: 0,
    content: <PatientDetailsStep />,
  },
  {
    title: 'Product selection',
    id: 1,
    content: <ExistingCaseProductSelection />,
  },
  {
    title: 'Treatment plan',
    id: 2,
    content: <CreateTreatmentPlanStep />,
  },
  {
    title: 'Manufacturing',
    id: 3,
    content: <ManufacturingStep />,
  },
  {
    title: 'Start treatment',
    id: 4,
    content: <StartTreatmentPlanStep />,
  },
]
