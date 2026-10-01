import AssessmentStep from './AssessmentStep'
import InManufacturingStep from './InManufacturingStep'
import InPlanningStep from './InPlanningStep'
import InTransitStep from './InTransitStep'
import StartingSoonStep from './StartingSoonStep'

export default [
  {
    title: 'Assessment',
    id: 0,
    content: <AssessmentStep />,
  },
  {
    title: 'In Planning',
    id: 1,
    content: <InPlanningStep />,
  },
  {
    title: 'In Manufacturing',
    id: 2,
    content: <InManufacturingStep />,
  },
  {
    title: 'In Transit',
    id: 3,
    content: <InTransitStep />,
  },
  {
    title: 'Starting soon',
    id: 4,
    content: <StartingSoonStep />,
  },
]
