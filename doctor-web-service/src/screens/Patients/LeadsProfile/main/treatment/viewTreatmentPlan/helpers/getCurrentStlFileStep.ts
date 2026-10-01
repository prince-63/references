import {IStlFileMetadata} from '../../types/treatmentPlan.types'

export default ({stlFileMetaData}: {stlFileMetaData?: IStlFileMetadata}) => {
  if (!stlFileMetaData) return -1
  if (stlFileMetaData?.status === 'STL_FILES_REQUESTED') return 0
  if (stlFileMetaData?.status === 'STL_FILES_UPLOADED') return 1
  if (stlFileMetaData?.status === 'APPROVED') return 2
  if (!stlFileMetaData?.requested_at) return -1
}
