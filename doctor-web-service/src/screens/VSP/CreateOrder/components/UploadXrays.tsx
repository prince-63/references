import {useState} from 'react'
import StlPhotos from 'screens/Orders/components/StlPhotos'
import {Modal, UploadFile} from 'antd'
import {useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import FileUploaderWithAntdUpload from 'components/fileUpload/AntdFileUpload'
import {Eye, EyeClosed, FileImage} from 'lucide-react'

interface UploadXraysFilesProps {
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  parentPath?: string
  patient_id?: number
  viewMode?: boolean
  onUploadingChange?: (isUploading: boolean) => void
}

export const UploadXrays = ({
  uploadedFiles,
  setUploadedFiles,
  parentPath = `/Documents`,
  patient_id,
  viewMode = false,
  onUploadingChange,
}: UploadXraysFilesProps) => {
  const [showExamples, setShowExamples] = useState(false)
  const {patientId} = useParams()
  const noFilesUploaded = uploadedFiles.length === 0

  return (
    <>
      <div className='rounded-xl border border-gray-200 bg-white overflow-hidden'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 px-5 pt-5 pb-3'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50'>
              <FileImage className='h-[18px] w-[18px] text-amber-600' />
            </div>
            <div>
              <p className='text-[15px] font-semibold text-gray-900'>6. Radiographs</p>
              {!viewMode && (
                <p className='text-sm text-gray-500 mt-0.5'>
                  X-rays, OPG, and Lateral Cephalogram images&nbsp;
                  <span className='text-gray-400'>·</span>&nbsp;
                  <span className='italic text-gray-400'>JPG, PNG, PDF</span>
                </p>
              )}
            </div>
          </div>

          {/* Toggle */}
          {!viewMode && (
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowExamples((prev) => !prev)
              }}
              className='flex items-center gap-1 text-sm font-medium text-primaryColor hover:text-primaryColor/80 transition-colors whitespace-nowrap mt-1'
            >
              <span>{showExamples ? 'Hide' : 'View'} examples</span>
              {showExamples ? <EyeClosed className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          )}
        </div>

        {/* Uploader */}
        <div className='px-5 pb-5'>
          {viewMode && noFilesUploaded && (
            <p className='text-gray-400 text-sm py-2'>No files added</p>
          )}
          <FileUploaderWithAntdUpload
            maxFileCount={10}
            accept='.pdf, .jpg, .jpeg, .png'
            parentPath={parentPath}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            patientId={patient_id ?? safeParseInt(patientId)}
            viewMode={viewMode}
            onUploadingChange={onUploadingChange}
          />
        </div>
      </div>

      <Modal
        open={!viewMode && showExamples}
        onCancel={() => setShowExamples(false)}
        footer={null}
        title='Radiograph examples'
        width={720}
        destroyOnClose
      >
        <StlPhotos isExtraOral={true} />
      </Modal>
    </>
  )
}
