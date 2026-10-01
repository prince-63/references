import {UploadFile} from 'antd'
import FileUploaderWithAntdUpload from 'components/fileUpload/AntdFileUpload'
import userOrderDetails from '../hooks/userOrderDetails'

const DocumentsContainer = ({
  maxFileSize = 50,
  maxFileCount = 5,
  accept,
  parentPath,
  uploadedFiles,
  setUploadedFiles,
  patientId,
  isEditingMode,
}: {
  maxFileSize?: number
  maxFileCount?: number
  accept?: string
  parentPath: string
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  patientId?: number
  isEditingMode?: boolean
}) => {
  const {order} = userOrderDetails()
  const patientDetails = order?.patient_details
  return (
    <>
      <div className='border rounded-lg flex  text-textColor text-sm font-semibold gap-2  p-2 bg-supportColor border-primaryColor'>
        <FileUploaderWithAntdUpload
          {...{
            maxFileSize,
            maxFileCount,
            accept,
            parentPath,
            patientId: patientId ?? patientDetails?.id,
            uploadedFiles,
            setUploadedFiles,
            isEditingMode,
          }}
        />
      </div>
    </>
  )
}

export default DocumentsContainer
