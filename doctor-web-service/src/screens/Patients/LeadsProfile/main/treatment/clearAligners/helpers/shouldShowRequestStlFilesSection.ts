import stlFileUploadStatusConstants from '@constants/stlFileUploadStatus.constants'
import {AllTreatmentPlanListItem, ITreatmentPlan} from '../../types/treatmentPlan.types'

interface ShouldShowRequestStlFilesSectionParams {
  treatmentPlanList: AllTreatmentPlanListItem[]
  treatmentPlan: AllTreatmentPlanListItem | ITreatmentPlan
  isCustomer: boolean
  isClone?: boolean
}

const shouldShowRequestStlFilesSection = ({
  treatmentPlanList,
  treatmentPlan,
  isCustomer,
  isClone,
}: ShouldShowRequestStlFilesSectionParams): boolean => {
  if (!isCustomer && !isClone) return false
  const hasStlFilesRequested = treatmentPlanList.some(
    (item) =>
      item.stl_file_metadata?.status === stlFileUploadStatusConstants.STL_FILES_REQUESTED ||
      item.stl_file_metadata?.status === stlFileUploadStatusConstants.STL_FILES_UPLOADED ||
      item.stl_file_metadata?.status === stlFileUploadStatusConstants.APPROVED
  )

  if (hasStlFilesRequested) return false
  return treatmentPlan.initiator_status === 'APPROVED'
}

export default shouldShowRequestStlFilesSection
