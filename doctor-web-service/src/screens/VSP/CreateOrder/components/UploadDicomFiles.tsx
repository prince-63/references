import {lazy, useState} from 'react'
import {UploadFile} from 'antd'
import {useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import FileUploaderWithAntdUpload from 'components/fileUpload/AntdFileUpload'
import {MeshItem} from 'components/three/ExoViewer'
import {Eye, EyeClosed, ScanLine} from 'lucide-react'
const ExoViewer = lazy(() => import('components/three/ExoViewer'))

import ModalLayout from 'components/modal/ModalLayout'
import {CloseIcon} from 'yet-another-react-lightbox'
import {Modal} from 'antd'

import {DIACOM_IMAGE} from 'utils/ImageConst'

interface UploadDicomFilesProps {
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  parentPath?: string
  patient_id?: number
  viewMode?: boolean
  onUploadingChange?: (isUploading: boolean) => void
  useInlineViewer?: boolean
  onOpenInlineViewer?: (payload: {meshes: MeshItem[]; tempUrls: string[]}) => void
}

export const UploadDicomFiles = ({
  uploadedFiles,
  setUploadedFiles,
  parentPath = `3D Files/Scan files`,
  patient_id,
  viewMode = false,
  onUploadingChange,
  useInlineViewer = false,
  onOpenInlineViewer,
}: UploadDicomFilesProps) => {
  const [showExamples, setShowExamples] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [tempUrls, setTempUrls] = useState<string[]>([])
  const {patientId} = useParams()
  const noFilesUploaded = uploadedFiles.length === 0

  const closeViewer = () => {
    setViewerOpen(false)
    tempUrls.forEach((u) => URL.revokeObjectURL(u))
    setTempUrls([])
  }

  return (
    <>
      <div className='rounded-xl border border-gray-200 bg-white overflow-hidden'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 px-5 pt-5 pb-3'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50'>
              <ScanLine className='h-[18px] w-[18px] text-blue-600' />
            </div>
            <div>
              <p className='text-[15px] font-semibold text-gray-900'>5. DICOM</p>
              {!viewMode && (
                <p className='text-sm text-gray-500 mt-0.5'>
                  Upload DICOM archive&nbsp;
                  <span className='text-gray-400'>·</span>&nbsp;
                  <span className='italic text-gray-400'>ZIP</span>
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
              {showExamples ? (
                // eslint-disable-next-line react/jsx-no-undef
                <EyeClosed className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          )}
        </div>

        {/* Requirements */}
        {!viewMode && (
          <div className='px-5 py-3 border-t border-gray-100 bg-gray-50'>
            <ul className='text-sm text-gray-700 space-y-2 list-disc list-inside'>
              <li>Upload CT in DICOM format (zip)</li>
              <li>Area of coverage: Not less than 23 x 17 cm</li>
              <li>CT scan of the patient should be carried out without any jaw separation</li>
              <li>
                Information needs to be captured and provided in all 3 axes (coronal, sagittal,
                axial)
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
            maxFileSize={2000}
            maxFileCount={10}
            accept='.zip,application/zip,application/x-zip-compressed'
            parentPath={parentPath}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            patientId={patient_id ?? safeParseInt(patientId)}
            viewMode={viewMode}
            onUploadingChange={onUploadingChange}
            useInlineViewer={useInlineViewer}
            onOpenInlineViewer={onOpenInlineViewer}
          />
        </div>
      </div>

      <Modal
        open={!viewMode && showExamples}
        onCancel={() => setShowExamples(false)}
        footer={null}
        title='DICOM image example'
        width={720}
        destroyOnClose
      >
        <div className='space-y-3'>
          <img
            src={DIACOM_IMAGE}
            alt='DICOM example'
            className='w-full max-h-[520px] object-contain rounded-md border border-gray-200'
          />
        </div>
      </Modal>

      {viewerOpen && (
        <ModalLayout className='md:w-[60%] w-full !bg-[#453B6A] p-0'>
          <div className='flex justify-end '>
            <button className='bg-[#FFFFFF26] p-1 rounded-full' type='button' onClick={closeViewer}>
              <CloseIcon color='white' />
            </button>
          </div>
          <div className='w-full' style={{height: '60vh', backgroundColor: '#453B6A'}}>
            <ExoViewer
              height={'100%'}
              backgroundColor={'#453B6A'}
              initialMeshes={[]}
              onClose={closeViewer}
            />
          </div>
        </ModalLayout>
      )}
    </>
  )
}
