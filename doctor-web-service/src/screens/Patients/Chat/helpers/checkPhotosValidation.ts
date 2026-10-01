import ErrorToast from '../../../../components/modal/Alert/ErrorToast'
import {isAllowedFileExtension, isFileSizeValid} from '../../../../utils/ConstFunctions'
import {eventEmitter} from '@utils/eventEmitter'

const validateAndProcessPhotos = ({
  files,
  filesAlreadySelected,
  fileCount = 5,
  toastMessage = `You can upload up to ${fileCount} photos/documents only at a time.`,
  chatFileFormats = undefined,
  maxFileSize = 15,
  availableStorage,
  usedStorage,
  invalidFileFormatMessage = 'Invalid file format. Please upload a PDF, JPG, JPEG or PNG file only',
  invalidSizeMessage,
  isForScanFiles = false,
}: {
  files: any
  filesAlreadySelected?: any
  fileCount?: number
  toastMessage?: string
  chatFileFormats?: string[] | undefined
  maxFileSize?: number
  availableStorage?: number
  usedStorage?: number
  invalidFileFormatMessage?: string
  invalidSizeMessage?: string
  isForScanFiles?: boolean
}) => {
  const photoList = []
  let totalUploadedFileSize = 0
  if (filesAlreadySelected) {
    for (const preSelectedFile of filesAlreadySelected) {
      totalUploadedFileSize += preSelectedFile.file.size
    }
  }
  if (files.length + (filesAlreadySelected?.length || 0) < fileCount) {
    for (const photo of files) {
      totalUploadedFileSize += photo.size
      if (availableStorage && usedStorage) {
        const availableStorageInBytes = availableStorage * 1024 * 1024 * 1024 // Convert GB to bytes
        const usedStorageInBytes = usedStorage * 1024 * 1024 // Convert MB to bytes

        if (photo.size + usedStorageInBytes >= availableStorageInBytes) {
          eventEmitter.emit('greet')
          return []
        }
      }
      if (isForScanFiles && !isAllowedFileExtension(photo.name, ['stl', 'ply', 'obj'])) {
        ErrorToast('Invalid file format. Please upload a STL OBJ PLY file only')
        return []
      } else {
        if (chatFileFormats && !isAllowedFileExtension(photo.name, chatFileFormats)) {
          ErrorToast(invalidFileFormatMessage)
          return []
        }
      }

      if (isFileSizeValid(photo, maxFileSize, availableStorage, usedStorage)) {
        photoList.push(photo)
      } else {
        if (photo?.type === 'video/mp4') {
          ErrorToast(`Please upload video with a maximum size of ${maxFileSize} MB`)
        } else if (photo?.name?.slice(-3) === 'pdf') {
          ErrorToast(`Please upload PDFs with a maximum size of ${maxFileSize} MB`)
        } else {
          ErrorToast(
            invalidSizeMessage
              ? invalidSizeMessage
              : `Please upload photos with a maximum size of ${maxFileSize} MB`
          )
        }
        return []
      }
    }
    if (availableStorage && usedStorage) {
      const availableStorageInBytes = availableStorage * 1024 * 1024 * 1024
      const usedStorageInBytes = usedStorage * 1024 * 1024

      if (totalUploadedFileSize + usedStorageInBytes >= availableStorageInBytes) {
        ErrorToast(`You can only upload files upto ${availableStorage} GB`)
        return []
      }
    }
  } else {
    ErrorToast(toastMessage)
  }
  return photoList
}

export default validateAndProcessPhotos
