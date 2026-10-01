import {lazy, useState} from 'react'
import StlPhotos from 'screens/Orders/components/StlPhotos'
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

interface UploadDesiredOcclusionProps {
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  parentPath?: string
  patient_id?: number
  viewMode?: boolean
  onUploadingChange?: (isUploading: boolean) => void
  useInlineViewer?: boolean
  onOpenInlineViewer?: (payload: {meshes: MeshItem[]; tempUrls: string[]}) => void
}

export const UploadDesiredOcclusion = ({
  uploadedFiles,
  setUploadedFiles,
  parentPath = `3D Files/Scan files`,
  patient_id,
  viewMode = false,
  onUploadingChange,
  useInlineViewer = false,
  onOpenInlineViewer,
}: UploadDesiredOcclusionProps) => {
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
              <p className='text-[15px] font-semibold text-gray-900'>
                4. Desired Occlusion on Stone Cast
              </p>
              {!viewMode && (
                <p className='text-sm text-gray-500 mt-0.5'>
                  Upper jaw, lower jaw and bite scans&nbsp;
                  <span className='text-gray-400'>·</span>&nbsp;
                  <span className='italic text-gray-400'>STL, OBJ, PLY</span>
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

        {/* Info Card */}
        {!viewMode && (
          <div className='px-5 py-3 mx-2 my-3 border-l-4 border-yellow-400 bg-yellow-50 rounded'>
            <p className='text-sm font-medium text-yellow-900'>
              <span className='font-semibold'>Note:</span> In case you have a desired post surgical
              occlusion prepared using a stone model, the scan of the stone model should be sent
              additionally (upper + lower + occlusion).
            </p>
          </div>
        )}

        {/* Uploader */}
        <div className='px-5 pb-5'>
          {viewMode && noFilesUploaded && (
            <p className='text-gray-400 text-sm py-2'>No files added</p>
          )}
          <FileUploaderWithAntdUpload
            maxFileSize={500}
            maxFileCount={10}
            accept='.stl, .obj, .ply'
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
        title='Scan file examples'
        width={720}
        destroyOnClose
      >
        <StlPhotos isExtraOral={false} />
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
