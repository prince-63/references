import {Table} from '@tanstack/react-table'
import {RowData} from '../types/Aligners.types'

export const setPageIndexBasedOnCurrentAlignerNo = (
  currentAlignerNo: number,
  table: Table<RowData>,
  dataTreatmentPlan: any
) => {
  const lowerRange = dataTreatmentPlan.aligner_journeys[0].lower_range
  const upperRange = dataTreatmentPlan.aligner_journeys[0].upper_range

  const alignerStart = Math.min(...lowerRange, ...upperRange)
  const adjustedAlignerNo = currentAlignerNo - alignerStart
  const pageIndex = Math.floor(adjustedAlignerNo / 10)
  table.setPageIndex(pageIndex)
}
