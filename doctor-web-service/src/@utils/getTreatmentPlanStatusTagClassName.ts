import mappedStlFileStatusConstants from '@constants/mappedStlFileStatus.constants'
import mappedTreatmentPlanStatusConstants from '@constants/mappedTreatmentPlanStatus.constants'
export type MappedTreatmentPlanStatus =
  (typeof mappedTreatmentPlanStatusConstants)[keyof typeof mappedTreatmentPlanStatusConstants]
type mappedStlFileStatus =
  (typeof mappedStlFileStatusConstants)[keyof typeof mappedStlFileStatusConstants]
export default (status: MappedTreatmentPlanStatus | mappedStlFileStatus | string) => {
  switch (status) {
    case 'Draft':
    case 'Archived':
      return 'bg-lightGray text-textColor'
    case 'Sent for approval':
      return 'bg-[#F3E5F5] text-[#553291]'
    case 'Sent to patient':
      return 'bg-[#E3F2FD] text-[#135FA2]'
    case 'Pending approval':
      return 'bg-[#FBF3DD] text-[#7E5F08]'
    case 'Paused':
      return 'bg-[#FDEDDE] text-[#9F550F]'
    case 'STL files requested':
      return 'bg-orangeSupport text-orange'
    case 'Patient approved':
      return 'bg-[#E0F2F1] text-[#076B77]'
    case 'Approved':
      return 'bg-[#E8F5E9] text-[#096C0E]'
    case 'STL files uploaded':
      return 'bg-[#F5F4FE] text-[#735bf2]'
    case 'Re-plan':
      return 'bg-[#FFEBEE] text-[#BA2521]'
    case 'Deactivated':
      return 'bg-[#FBE6EA] text-[#AE2241]'
    case 'Active':
      return 'bg-[#E8F5E9] text-[#096C0E]'
    case 'ACTIVE':
      return 'bg-[#E8F5E9] text-[#096C0E]'
    case 'DEACTIVATED':
      return 'bg-[#FBE6EA] text-[#AE2241]'
    case 'APPROVED':
      return 'bg-[#E8F5E9] text-[#096C0E]'
    case 'Completed':
      return 'bg-[#E8F5E9] text-[#096C0E]'
    default:
      return 'bg-lightGray text-textColor'
  }
}
