import {AlignerJourney} from 'screens/Production/types/productionOrders.interface'

export const getCurrentAligner = (alignerJourney: AlignerJourney) => {
  const currentAligner = alignerJourney.current_aligner_no
  return alignerJourney.aligners?.find((aligner) => aligner.sr_no === currentAligner)
}
