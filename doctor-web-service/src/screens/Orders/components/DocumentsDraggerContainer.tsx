import {UploadFile} from 'antd'
import userOrderDetails from '../hooks/userOrderDetails'
import AntdFileDraggerUpload from 'components/fileUpload/AntdFileDraggerUpload'

const DocumentsDraggerContainer = ({
  maxFileSize = 50,
  maxFileCount = 5,
  accept,
  parentPath,
  uploadedFiles,
  setUploadedFiles,
  patientId,
  onUploadingChange,
}: {
  maxFileSize?: number
  maxFileCount?: number
  accept?: string
  parentPath: string
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  patientId?: number
  onUploadingChange?: (isUploading: boolean) => void
}) => {
  const {order} = userOrderDetails()
  const patientDetails = order?.patient_details
  return (
    <div className='border border-mediumGray rounded-lg text-sm font-semibold gap-2 flex-1 p-2'>
      <AntdFileDraggerUpload
        {...{
          maxFileSize,
          maxFileCount,
          accept,
          parentPath,
          patientId: patientId ?? patientDetails?.id,
          uploadedFiles,
          setUploadedFiles,
          onUploadingChange,
        }}
      />
    </div>
  )
}

export default DocumentsDraggerContainer
