import {UploadFile} from 'antd'
import {Files} from 'screens/Patients/LeadsProfile/main/files/types/files.types'
import {getImageUrl} from 'utils/ConstFunctions'

export default (files?: Files[]): UploadFile[] => {
  return (
    files?.map((file: Files) => {
      return {
        uid: file.file_id.toString(),
        name: file.name,
        url: getImageUrl(file),
        document_url: file?.url,
        size: file.size,
        type: file.type,
        lastModifiedDate: new Date(file.created_at),
      }
    }) || []
  )
}
