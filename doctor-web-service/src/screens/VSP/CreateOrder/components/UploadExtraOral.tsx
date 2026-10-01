import {Modal, UploadFile} from 'antd'
import {useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import {useState} from 'react'
import FileUploaderWithAntdUpload from 'components/fileUpload/AntdFileUpload'
import {Camera, Eye, EyeClosed} from 'lucide-react'
import {
  EXTRAORAL_LEFT_WITHOUT_SMILE,
  EXTRAORAL_RIGHT_WITHOUT_SMILE,
  EXTRAORAL_STRAIGHT_SMILING,
  EXTRAORAL_STRAIGHT_WITHOUT_SMILE,
} from 'utils/ImageConst'

interface UploadExtraOralPhotosProps {
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  parentPath?: string
  patient_id?: number
  viewMode?: boolean
  onUploadingChange?: (isUploading: boolean) => void
}

export const UploadExtraOralPhotos = ({
  uploadedFiles,
  setUploadedFiles,
  parentPath = '/Images/Pre treatment photos',
  patient_id,
  viewMode = false,
  onUploadingChange,
}: UploadExtraOralPhotosProps) => {
  const extraOralExamplePhotos = [
    {src: EXTRAORAL_LEFT_WITHOUT_SMILE, label: 'Left without smile'},
    {src: EXTRAORAL_RIGHT_WITHOUT_SMILE, label: 'Right without smile'},
    {src: EXTRAORAL_STRAIGHT_SMILING, label: 'Straight smiling'},
    {src: EXTRAORAL_STRAIGHT_WITHOUT_SMILE, label: 'Straight without smile'},
  ]

  const [showExamples, setShowExamples] = useState(false)
  const {patientId} = useParams()
  const noFilesUploaded = uploadedFiles.length === 0

  return (
    <>
      <div className='rounded-xl border border-gray-200 bg-white overflow-hidden'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 px-5 pt-5 pb-3'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50'>
              <Camera className='h-[18px] w-[18px] text-primaryColor' />
            </div>
            <div>
              <p className='text-[15px] font-semibold text-gray-900'>1. Extra Oral Photographs</p>
              {!viewMode && (
                <p className='text-sm text-gray-500 mt-0.5'>
                  Intraoral and extraoral images&nbsp;
                  <span className='text-gray-400'>·</span>&nbsp;
                  <span className='italic text-gray-400'>JPG, PNG</span>
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

        {/* Requirements */}
        {!viewMode && (
          <div className='px-5 py-3 border-t border-gray-100 bg-gray-50'>
            <ul className='text-sm text-gray-700 space-y-2 list-disc list-inside'>
              <li>Extra-oral photographs with 1cm stickers on the temple & forehead</li>
              <li>
                Extraoral photograph to be taken exactly as per the CT with reference to lip
                position
              </li>
              <li>
                Photos should be taken without the beard (else soft tissue prediction is not
                possible)
              </li>
              <li className='font-medium'>
                Mandatory: Straight (without smile), Right (without smile), Left (without smile),
                Straight smiling (most important - natural smile)
              </li>
            </ul>
          </div>
        )}

        {/* Uploader */}
        <div className='px-5 pb-5'>
          {viewMode && noFilesUploaded && (
            <p className='text-gray-400 text-sm py-2'>No files added</p>
          )}
          <FileUploaderWithAntdUpload
            maxFileCount={15}
            accept='.jpg, .jpeg, .png'
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
        title='Photograph examples'
        width={720}
        destroyOnClose
      >
        <div className='space-y-4'>
          <p className='text-sm font-medium text-gray-600'>
            Extra oral photos <span className='text-gray-400'>(Recommended)</span>
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {extraOralExamplePhotos.map((photo) => (
              <div key={photo.label} className='rounded-lg border border-gray-200 p-2 bg-gray-50'>
                <img
                  src={photo.src}
                  alt={photo.label}
                  className='w-full h-44 object-cover rounded-md bg-white'
                />
                <p className='text-xs text-gray-600 mt-2'>{photo.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  )
}
