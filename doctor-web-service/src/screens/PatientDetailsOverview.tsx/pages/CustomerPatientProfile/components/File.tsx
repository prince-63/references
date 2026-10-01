import userTypes from '@constants/userTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import {bytesToMB} from '@utils/bytesToMB'
import {Image} from 'antd'
import ModalLayout from 'components/modal/ModalLayout'
import ExoViewer, {MeshItem} from 'components/three/ExoViewer'
import {classifyMeshName} from 'components/three/utils/classifyMesh'
import {AuthContext} from 'context/AuthContext'
import {Download} from 'lucide-react'
import {ReactNode, useContext, useState} from 'react'
import {CaseRecordFile} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {downloadFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {getFileType, getImageUrl, openDocument, safeParseInt} from 'utils/ConstFunctions'
import {CloseIcon} from 'yet-another-react-lightbox'
import getColorPalette from 'utils/getColorPalette'
import {isAppView} from 'utils/isAppView'

declare const window: Window &
  typeof globalThis & {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }

const FileCard = ({
  record,
  icon,
  hideDownloadIcon = false,
}: {
  record: CaseRecordFile
  icon: ReactNode
  hideDownloadIcon?: boolean
}) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerMeshes, setViewerMeshes] = useState<MeshItem[]>([])
  const [tempUrls, setTempUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  const getPreviewUrl = (file: CaseRecordFile, fileType: string) => {
    if (fileType === 'image') {
      return getImageUrl(file) || file.url || ''
    }

    return file.url || getImageUrl(file) || ''
  }

  const getDownloadUrl = (file: CaseRecordFile) => {
    return (file as {download_url?: string}).download_url || file.url || getImageUrl(file) || ''
  }

  const handlePreview = async (file: CaseRecordFile) => {
    const fileType = getFileType(file)
    const resolvedUrl = getPreviewUrl(file, fileType)

    if (fileType === '3d') {
      setLoading(true)

      let url = (file as any)?.response?.uploaded_file?.url || ''
      let isTemp = false
      const fileObj = (file as any)?.originFileObj as File | undefined

      if (!url && fileObj && fileObj instanceof File) {
        url = URL.createObjectURL(fileObj)
        isTemp = true
      }

      if (!url && file.is_gdrive_platform && file.file_id && userId) {
        try {
          const response = await dispatchAction(
            downloadFile({
              requester_user_id: safeParseInt(userId),
              requester_user_type: userTypes.DOCTOR,
              file_id: safeParseInt(file.file_id),
            })
          ).unwrap()

          const blob = new Blob([response], {type: file?.type || 'application/octet-stream'})
          url = URL.createObjectURL(blob)
          isTemp = true
        } catch (err) {
          console.error('Error downloading 3D file from drive', err)
          setLoading(false)
          return
        }
      }

      if (!url) {
        url = file.url || resolvedUrl
      }

      const role = classifyMeshName(file.name || url)
      const label = role !== 'unknown' ? role : file.name || 'mesh'
      const extension = (file.name || '').split('.').pop()?.toLowerCase()

      let meshType: 'stl' | 'ply' | 'glb' | 'gltf' = 'stl'
      if (extension === 'ply') meshType = 'ply'
      if (extension === 'glb' || extension === 'gltf') meshType = 'glb'

      const mesh: MeshItem = {
        id: `${file.file_id}`,
        name: label,
        visible: true,
        color: '#F1E5AC',
        url,
        type: meshType,
        opacity: 1,
      }

      const meshes = [mesh]
      const newTempUrls = isTemp ? [url] : []

      setTempUrls(newTempUrls)
      setViewerMeshes(meshes)
      setViewerOpen(true)
      setLoading(false)
      return
    }

    if (fileType === 'pdf') {
      handleOpenPDF(file, file.name)
      return
    }

    if (fileType === 'video') {
      openDocument(resolvedUrl)
      return
    }

    setPreviewImage(resolvedUrl)
    setPreviewOpen(true)
  }

  const handleOpenPDF = (file: CaseRecordFile, fileName?: string) => {
    const url = getPreviewUrl(file, 'pdf')
    if (!url) return

    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  const closeStlViewer = () => {
    setViewerOpen(false)
    tempUrls.forEach((u) => URL.revokeObjectURL(u))
    setTempUrls([])
  }

  const handleClosePDF = () => {
    setPdfViewer({isOpen: false, url: '', fileName: ''})
  }

  const handleNativeDownload = () => {
    const downloadUrl = getDownloadUrl(record)
    if (!downloadUrl) return false

    if (isAppView() && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          file_details: [
            {
              file_id: record.file_id,
              name: record?.name || 'document',
              url: downloadUrl,
              download_url: downloadUrl,
              type: record?.type || 'application/octet-stream',
              extension: record?.extension,
            },
          ],
        })
      )
      return true
    }

    return false
  }

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {previewImage && (
        <Image
          wrapperStyle={{display: 'none'}}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}

      {viewerOpen && (
        <ModalLayout className='w-full md:w-[60%] !bg-[#444240]'>
          <div className='flex justify-end'>
            <button
              className='rounded-full bg-[#FFFFFF26] p-1'
              type='button'
              onClick={closeStlViewer}
            >
              <CloseIcon color='white' />
            </button>
          </div>

          <div className='w-full' style={{height: '60vh'}}>
            <ExoViewer
              height='100%'
              backgroundColor='#453B6A'
              initialMeshes={viewerMeshes}
              onClose={closeStlViewer}
            />
          </div>
        </ModalLayout>
      )}

      <div
        className='flex w-[280px] max-w-[280px] min-w-[280px] shrink-0 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 cursor-pointer'
        onClick={() => !loading && handlePreview(record)}
      >
        <div className='shrink-0'>
          {loading ? (
            <div className='flex h-10 w-10 items-center justify-center'>
              <svg
                className='h-5 w-5 animate-spin text-primaryColor'
                viewBox='0 0 24 24'
                fill='none'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                />
              </svg>
            </div>
          ) : (
            icon
          )}
        </div>

        <div className='min-w-0 flex-1 overflow-hidden'>
          <div className='truncate text-[15px] font-semibold text-slate-900'>{record?.name}</div>
          <div className='mt-1 truncate text-sm text-slate-400'>
            {loading ? 'Loading...' : `${bytesToMB(record?.size)} MB`}
          </div>
        </div>

        {!hideDownloadIcon && (
          <button
            type='button'
            className='shrink-0'
            onClick={(e) => {
              e.stopPropagation()

              if (handleNativeDownload()) {
                return
              }

              const link = document.createElement('a')
              link.href = getDownloadUrl(record)
              link.download = record?.name || 'document.pdf'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
          >
            <Download size={18} color={getColorPalette().primaryColor} />
          </button>
        )}
      </div>
    </>
  )
}

export default FileCard
