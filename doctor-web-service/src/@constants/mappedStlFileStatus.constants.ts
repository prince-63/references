import stlFileUploadStatusConstants from './stlFileUploadStatus.constants'

export default {
  [stlFileUploadStatusConstants.STL_FILES_REQUESTED]: 'STL files requested',
  [stlFileUploadStatusConstants.STL_FILES_UPLOADED]: 'STL files uploaded',
  [stlFileUploadStatusConstants.APPROVED]: 'Approved',
} as const
