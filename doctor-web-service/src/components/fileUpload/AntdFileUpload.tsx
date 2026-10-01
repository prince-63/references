import {useState, useContext, useEffect, useRef, useMemo, lazy} from 'react'
import {Image, Upload} from 'antd'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import HttpStatusCode from '@constants/httpStatusCodes.constants'
import {
  DRIVE_IMAGE_PREFIX,
  getImageUrl,
  openDocument,
  openDriveUrls,
  safeParseInt,
} from 'utils/ConstFunctions'
import {RcFile} from 'antd/es/upload'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import type {UploadFile} from 'antd'
import {UploadChangeParam} from 'antd/lib/upload'
import When from 'components/when/When'
import useDispatchAction from '@hooks/useDispatchAction'
import {FileOutlined} from '@ant-design/icons'
import {deleteFiles, uploadFiles} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {FileType, getBase64} from '@utils/getBase64'
import {getSubscriptionDetails} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import StorageExceedModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/StorageExceedModal'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_CLOUD} from 'utils/SvgConstants'
import InfoMessage from 'screens/Orders/components/InfoMessage'
import CloseIcon from 'assets/icons/CloseIcon'
import {MeshItem} from 'components/three/ExoViewer'
const ExoViewer = lazy(() => import('components/three/ExoViewer'))
import {classifyMeshName, sortRoles} from 'components/three/utils/classifyMesh'
import ModalLayout from 'components/modal/ModalLayout'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'

const {Dragger} = Upload

type QueuedUploadRequest = {
  file: File
  onSuccess?: (response: any) => void
  onError?: (error: any) => void
  onProgress?: (event: {percent: number}, file: File) => void
}

const isUploadServerError = (error?: any) =>
  error?.response?.status === HttpStatusCode.INTERNAL_SERVER_ERROR

const FileUploaderWithAntdUpload = ({
  maxFileSize = 500,
  maxFileCount = 5,
  accept,
  patientId,
  parentPath,
  uploadedFiles,
  setUploadedFiles,
  isEditingMode,
  viewMode = false, // <-- NEW PROP
  onUploadingChange,
  // Inline 3D viewer support (used by Add Prescription right panel only)
  useInlineViewer = false,
  onOpenInlineViewer,
}: {
  maxFileSize?: number
  maxFileCount?: number
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  accept?: string
  patientId?: number
  parentPath: string
  isEditingMode?: boolean
  viewMode?: boolean // <-- NEW PROP TYPE
  onUploadingChange?: (isUploading: boolean) => void
  useInlineViewer?: boolean
  onOpenInlineViewer?: (payload: {meshes: MeshItem[]; tempUrls: string[]}) => void
}) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: UploadFile}>({})
  const [failedUploadFiles, setFailedUploadFiles] = useState<{[key: string]: UploadFile}>({})
  const [selectedStlIds, setSelectedStlIds] = useState<string[]>([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerMeshes, setViewerMeshes] = useState<MeshItem[]>([])
  const [tempUrls, setTempUrls] = useState<string[]>([])
  const {subscriptionData} = useSubscriptionDetails()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [isStorageLimitModalVisible, setStorageLimitModalVisible] = useState(false)
  const isEditDisabled = viewMode || isEditingMode === false
  const uploadQueueRef = useRef<QueuedUploadRequest[]>([])
  const isProcessingQueueRef = useRef(false)
  const queueCompletionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // PDF viewer state
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  const handleOpenPDF = (file: UploadFile, fileName?: string) => {
    const url = file?.document_url ?? ''
    if (!url) return
    if (url.startsWith(DRIVE_IMAGE_PREFIX)) {
      openDriveUrls(url)
      return
    }
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  const handleClosePDF = () => {
    setPdfViewer({isOpen: false, url: '', fileName: ''})
  }

  // File-type helpers
  const getFileType = (file: UploadFile) => {
    const fileName = file.name || ''
    const extension = fileName.split('.').pop()?.toLowerCase()

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) return 'image'
    if (['pdf'].includes(extension || '')) return 'pdf'
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) return 'video'
    if (['stl', 'obj', 'ply'].includes(extension || '')) return '3d'
    if (['zip', 'rar', '7z'].includes(extension || '')) return 'archive'
    return 'file'
  }

  const getThumbnail = (file: UploadFile) => {
    const fileType = getFileType(file)
    switch (fileType) {
      case 'image':
        return file.url || file.preview || '/placeholder-image.png'
      case 'pdf':
        return '/pdf-icon.png'
      case 'video':
        return '/video-icon.png'
      case '3d':
        return '/file-icon.png'
      case 'archive':
        return '/zip-icon.png'
      default:
        return '/file-icon.png'
    }
  }

  const beforeUpload = (file: File, list: RcFile[]) => {
    const pendingFailedFiles = Object.values(failedUploadFiles)
    const isValidCount = uploadedFiles.length + pendingFailedFiles.length + list.length <= maxFileCount
    const isSimilarFile = [...uploadedFiles, ...pendingFailedFiles].some(
      (item) => item.name === file.name
    )

    if (isEditDisabled) return Upload.LIST_IGNORE

    if (isSimilarFile) {
      AntdMessage({text: `You cannot upload similar files.`, type: 'error'})
      return Upload.LIST_IGNORE
    }
    if (!isValidCount) {
      AntdMessage({text: `You can upload a maximum of ${maxFileCount} files.`, type: 'error'})
      return Upload.LIST_IGNORE
    }

    const isValidSize = file.size <= maxFileSize * 1024 * 1024
    if (!isValidSize) {
      AntdMessage({text: `Each file must be less than ${maxFileSize}MB.`, type: 'error'})
      return Upload.LIST_IGNORE
    }

    const totalFileSizeGB = list.reduce((acc, curr) => acc + curr.size / (1024 * 1024 * 1024), 0)
    const usedStorageMB = subscriptionData?.used_storage_gb || 0
    const totalStorageGB = subscriptionData?.total_storage_gb || 0
    const usedStorageGB = usedStorageMB / 1024
    const remainingStorageGB = totalStorageGB - usedStorageGB

    if (totalFileSizeGB > remainingStorageGB) {
      setStorageLimitModalVisible(true)
      return Upload.LIST_IGNORE
    }

    if (accept === '.stl, .obj, .ply') {
      const extension = file.name.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['stl', 'obj', 'ply']
      if (!extension || !allowedExtensions.includes(extension)) {
        AntdMessage({
          text: 'Invalid file format. Please upload a STL, OBJ, or PLY file only.',
          type: 'error',
        })
        return Upload.LIST_IGNORE
      }
    }
    if (accept === '.zip') {
      AntdMessage({
        text: 'Invalid file format. Please upload a ZIP file only.',
        type: 'error',
      })
      return Upload.LIST_IGNORE
    }
    return true
  }

  const handleUploadChange = async (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'uploading') {
      setUploadingFiles((prev) => ({
        ...prev,
        [info.file.uid]: {
          uid: info.file.uid,
          name: info.file.name,
          status: 'uploading',
          percent: info.file.percent || 0,
        },
      }))
      setUploadProgress((prev) => ({
        ...prev,
        [info.file.uid]: info.file.percent || 0,
      }))
    } else if (info.file.status === 'done') {
      const file = info.file.response?.uploaded_file
      if (file) {
        setUploadedFiles((prev) => {
          const alreadyExists = prev.some(
            (item) => safeParseInt(item.uid) === safeParseInt(file.file_id)
          )
          if (alreadyExists) return prev
          return [
            ...prev,
            {
              uid: file.file_id,
              name: file.name,
              url: getImageUrl(file),
            },
          ]
        })
      }

      setUploadingFiles((prev) => {
        const newUploading = {...prev}
        delete newUploading[info.file.uid]
        return newUploading
      })
      setUploadProgress((prev) => {
        const newProgress = {...prev}
        delete newProgress[info.file.uid]
        return newProgress
      })
      setFailedUploadFiles((prev) => {
        const newFailedUploads = {...prev}
        delete newFailedUploads[info.file.uid]
        return newFailedUploads
      })

      AntdMessage({text: `${info.file.name} file uploaded successfully`, maxCount: 3})
      dispatchAction(getSubscriptionDetails({doctor_id: safeParseInt(userId)}))
    } else if (info.file.status === 'error') {
      setUploadingFiles((prev) => {
        const newUploading = {...prev}
        delete newUploading[info.file.uid]
        return newUploading
      })
      setUploadProgress((prev) => {
        const newProgress = {...prev}
        delete newProgress[info.file.uid]
        return newProgress
      })
      if (isUploadServerError((info.file as any).error)) {
        setFailedUploadFiles((prev) => ({
          ...prev,
          [info.file.uid]: {
            ...info.file,
            status: 'error',
            percent: 0,
          },
        }))
      } else {
        setFailedUploadFiles((prev) => {
          const newFailedUploads = {...prev}
          delete newFailedUploads[info.file.uid]
          return newFailedUploads
        })
        AntdMessage({
          text: `${info.file.name} file upload failed. Please try again.`,
          type: 'error',
        })
      }
    }
  }

  const uploadSingleFile = async ({file, onSuccess, onError, onProgress}: QueuedUploadRequest) => {
    setUploading(true)
    if (isEditDisabled) return

    const payloadForUploadFiles = {
      uploader: {user_id: safeParseInt(userId), user_type: userTypes.DOCTOR},
      owners: [
        {user_id: safeParseInt(userId), user_type: userTypes.DOCTOR},
        {user_id: safeParseInt(patientId), user_type: userTypes.PATIENT},
      ],
      parent_path: parentPath,
      files: [file],
    }

    let p = 0
    const tick = () => {
      p = Math.min(p + 8, 90)
      onProgress?.({percent: p}, file)
    }
    const interval = setInterval(tick, 200)
    tick()

    try {
      const res: any = await dispatchAction(uploadFiles(payloadForUploadFiles)).unwrap()
      onProgress?.({percent: 100}, file)
      onSuccess?.({status: 'done', uploaded_file: res?.upload_files?.at(0)})
    } catch (err) {
      onError?.(err)
    } finally {
      clearInterval(interval)
    }
  }

  const finishUploadQueue = () => {
    if (queueCompletionTimeoutRef.current) {
      clearTimeout(queueCompletionTimeoutRef.current)
    }

    queueCompletionTimeoutRef.current = setTimeout(() => {
      if (isProcessingQueueRef.current || uploadQueueRef.current.length > 0) return
      setUploading(false)
    }, 250)
  }

  const processUploadQueue = async () => {
    if (isProcessingQueueRef.current) return

    isProcessingQueueRef.current = true
    setUploading(true)

    while (uploadQueueRef.current.length > 0) {
      const uploadRequest = uploadQueueRef.current.shift()
      if (uploadRequest) {
        await uploadSingleFile(uploadRequest)
      }
    }

    isProcessingQueueRef.current = false
    finishUploadQueue()
  }

  const customRequest = ({file, onSuccess, onError, onProgress}: any) => {
    uploadQueueRef.current.push({file, onSuccess, onError, onProgress})
    processUploadQueue()
  }

  const handleRetryUpload = (file: UploadFile) => {
    const fileToRetry = file.originFileObj as File | undefined
    if (!fileToRetry) {
      AntdMessage({text: 'Unable to retry this file. Please select it again.', type: 'error'})
      return
    }

    setFailedUploadFiles((prev) => {
      const newFailedUploads = {...prev}
      delete newFailedUploads[file.uid]
      return newFailedUploads
    })
    setUploadingFiles((prev) => ({
      ...prev,
      [file.uid]: {
        ...file,
        status: 'uploading',
        percent: 0,
      },
    }))
    setUploadProgress((prev) => ({
      ...prev,
      [file.uid]: 0,
    }))

    uploadQueueRef.current.push({
      file: fileToRetry,
      onProgress: (event) => {
        setUploadingFiles((prev) => ({
          ...prev,
          [file.uid]: {
            ...file,
            status: 'uploading',
            percent: event.percent,
          },
        }))
        setUploadProgress((prev) => ({
          ...prev,
          [file.uid]: event.percent,
        }))
      },
      onSuccess: (response) => {
        void handleUploadChange({
          file: {
            ...file,
            status: 'done',
            percent: 100,
            response,
          },
          fileList: [],
        } as UploadChangeParam<UploadFile<any>>)
      },
      onError: (error) => {
        void handleUploadChange({
          file: {
            ...file,
            status: 'error',
            error,
          },
          fileList: [],
        } as UploadChangeParam<UploadFile<any>>)
      },
    })
    processUploadQueue()
  }

  const uploadButton = (
    <div
      className={`
        flex flex-col items-center justify-center gap-2 
        w-full h-full py-8
        ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <CommonSVG svg={SVG_CLOUD} width='32' height='26' />
      <p className='text-lg font-semibold text-primaryColor'>Click to upload</p>
      <InfoMessage tipMessage={`Max ${maxFileCount} files`} />
    </div>
  )

  const handlePreview = async (file: UploadFile) => {
    const fileType = getFileType(file)

    if (fileType === '3d') {
      let url = (file as any)?.response?.uploaded_file?.url || file.url || ''
      let isTemp = false
      const fileObj = (file as any)?.originFileObj as File | undefined
      if (!url && fileObj && fileObj instanceof File) {
        url = URL.createObjectURL(fileObj)
        isTemp = true
      }

      const role = classifyMeshName(file.name || url)
      const label = role !== 'unknown' ? role : file.name || 'mesh'
      const extension = (file.name || '').split('.').pop()?.toLowerCase()
      let meshType: 'stl' | 'ply' | 'glb' | 'gltf' = 'stl'
      if (extension === 'ply') meshType = 'ply'
      if (extension === 'glb' || extension === 'gltf') meshType = 'glb'

      const mesh: MeshItem = {
        id: `${file.uid}`,
        name: label,
        visible: true,
        color: '#F1E5AC',
        url,
        type: meshType,
        opacity: 1,
      }

      const meshes = [mesh]
      const newTempUrls = isTemp ? [url] : []

      if (useInlineViewer && onOpenInlineViewer) {
        onOpenInlineViewer({meshes, tempUrls: newTempUrls})
        return
      }

      setTempUrls(newTempUrls)
      setViewerMeshes(meshes)
      setViewerOpen(true)
      return
    }

    if (fileType === 'pdf') {
      handleOpenPDF(file || '', file.name)
      return
    }

    if (fileType === 'video') {
      openDocument(file.url || '')
      return
    }

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  const handleRemoveFile = (file: UploadFile) => {
    const uploadedFile = file.response?.uploaded_file
    let fileId = file.uid
    if (uploadedFile) fileId = uploadedFile.file_id

    if (isEditDisabled) return

    if (failedUploadFiles[file.uid]) {
      setFailedUploadFiles((prev) => {
        const newFailedUploads = {...prev}
        delete newFailedUploads[file.uid]
        return newFailedUploads
      })
      return
    }

    if (uploadingFiles[file.uid]) {
      setUploadingFiles((prev) => {
        const newUploading = {...prev}
        delete newUploading[file.uid]
        return newUploading
      })
      setUploadProgress((prev) => {
        const newProgress = {...prev}
        delete newProgress[file.uid]
        return newProgress
      })
      return
    }

    const payloadForDeleteFiles = {
      deleter: {user_id: safeParseInt(userId), user_type: userTypes.DOCTOR},
      owner: {user_id: safeParseInt(patientId), user_type: userTypes.PATIENT},
      files_to_delete_by_id: [safeParseInt(fileId)],
    }
    dispatchAction(deleteFiles(payloadForDeleteFiles))
    setUploadedFiles((prev) => prev.filter((item) => item.uid !== fileId))
  }

  const lastUploadingStateRef = useRef<boolean>(false)
  const onUploadingChangeRef = useRef<typeof onUploadingChange>(onUploadingChange)

  useEffect(() => {
    onUploadingChangeRef.current = onUploadingChange
  }, [onUploadingChange])

  useEffect(() => {
    const callback = onUploadingChangeRef.current
    if (!callback) return
    const hasInFlightUploads =
      uploading ||
      Object.keys(uploadingFiles).length > 0 ||
      Object.values(uploadProgress).some((v) => (v ?? 0) > 0 && (v ?? 0) < 100)
    if (lastUploadingStateRef.current !== hasInFlightUploads) {
      lastUploadingStateRef.current = hasInFlightUploads
      callback(hasInFlightUploads)
    }
  }, [uploading, uploadingFiles, uploadProgress])

  useEffect(() => {
    return () => {
      uploadQueueRef.current = []
      isProcessingQueueRef.current = false
      if (queueCompletionTimeoutRef.current) {
        clearTimeout(queueCompletionTimeoutRef.current)
      }
      const callback = onUploadingChangeRef.current
      if (callback) {
        lastUploadingStateRef.current = false
        callback(false)
      }
    }
  }, [])

  const handleThumbnailClick = (file: UploadFile) => {
    handlePreview(file)
  }

  const isStlFile = (file: UploadFile) => {
    const name = (file.name || '').toLowerCase()
    const url = ((file as any)?.response?.uploaded_file?.url || file.url || '').toLowerCase()
    return name.endsWith('.stl') || /\.stl(\?|#|$)/i.test(url)
  }

  const toggleStlSelect = (uid: string) => {
    setSelectedStlIds((prev) => {
      if (prev.includes(uid)) return prev.filter((x) => x !== uid)
      if (prev.length >= 2) return prev
      return [...prev, uid]
    })
  }

  const openStlViewer = () => {
    const created: string[] = []
    const sourceList = [...uploadedFiles]
    const meshes: MeshItem[] = sourceList
      .filter((f) => selectedStlIds.includes(f.uid) && isStlFile(f))
      .map((f, idx) => {
        let url = (f as any)?.response?.uploaded_file?.url || f.url || ''
        let isTemp = false
        const fileObj = (f as any)?.originFileObj as File | undefined
        if (!url && fileObj && fileObj instanceof File) {
          url = URL.createObjectURL(fileObj)
          isTemp = true
        }
        if (isTemp) created.push(url)
        const role = classifyMeshName(f.name || url)
        const label = role !== 'unknown' ? role : f.name || `mesh-${idx + 1}`
        return {
          id: `${f.uid}`,
          name: label,
          visible: true,
          color: '#F1E5AC',
          url,
          type: 'stl',
          opacity: 1,
        } as MeshItem
      })
      .sort((a, b) => sortRoles(classifyMeshName(a.name), classifyMeshName(b.name)))

    if (useInlineViewer && onOpenInlineViewer) {
      onOpenInlineViewer({meshes, tempUrls: created})
      return
    }
    setTempUrls(created)
    setViewerMeshes(meshes)
    setViewerOpen(true)
  }

  const closeStlViewer = () => {
    setViewerOpen(false)
    tempUrls.forEach((u) => URL.revokeObjectURL(u))
    setTempUrls([])
  }

  const imagePreviewList = useMemo(
    () =>
      uploadedFiles
        .filter((file) => getFileType(file) === 'image')
        .map((file) => {
          const uploaded = (file as any)?.response?.uploaded_file?.url
          const src = uploaded || file.url || (file.preview as string) || ''
          return {
            uid: file.uid,
            src,
            alt: file.name,
          }
        })
        .filter((f) => Boolean(f.src)),
    [uploadedFiles]
  )

  const openImageSlider = (uid: string) => {
    const idx = imagePreviewList.findIndex((img) => img.uid === uid)
    if (idx === -1) return false
    setLightboxIndex(idx)
    setLightboxOpen(true)
    return true
  }

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {!pdfViewer.isOpen && (
        <div className='flex flex-col gap-2'>
          {!viewMode && (
            <Dragger
              className='rounded-lg text-textColor text-sm font-semibold bg-supportColor w-full'
              customRequest={customRequest}
              listType='text'
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleUploadChange}
              defaultFileList={uploadedFiles}
              accept={accept}
              onPreview={handlePreview}
              onRemove={handleRemoveFile}
              disabled={uploading || isEditDisabled}
              multiple
              height={160} // ensure a tall clickable area
            >
              {uploadButton}
              <When isTrue={isStorageLimitModalVisible}>
                <StorageExceedModal {...{setStorageLimitModalVisible}} />
              </When>
            </Dragger>
          )}

          {previewImage && (
            <Image
              wrapperStyle={{display: 'none', marginTop: '2px'}}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
          {imagePreviewList.length > 0 && lightboxOpen && (
            <ImageViewer
              setIsShowPhotos={setLightboxOpen}
              selectedImagesList={imagePreviewList.map((img) => ({
                src: img.src,
                alt: img.alt,
                title: img.alt,
              }))}
              selectedIndex={lightboxIndex}
            />
          )}

          {(uploadedFiles.length > 0 ||
            Object.keys(uploadingFiles).length > 0 ||
            Object.keys(failedUploadFiles).length > 0) && (
            <>
              <div className='grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-1'>
                {[...uploadedFiles, ...Object.values(uploadingFiles), ...Object.values(failedUploadFiles)].map((file) => {
                  const progress = uploadProgress[file.uid]
                  const isUploading = !!uploadingFiles[file.uid]
                  const isFailedUpload = !!failedUploadFiles[file.uid]

                  return (
                    <div
                      key={file.uid}
                      className='relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200'
                      onClick={() => {
                        if (isUploading || isFailedUpload) return
                        const f = file as UploadFile
                        if (getFileType(f) === 'image') {
                          const opened = openImageSlider(f.uid)
                          if (opened) return
                        }
                        handleThumbnailClick(f)
                      }}
                    >
                      <div className='aspect-square bg-gray-100 flex flex-col items-center justify-center'>
                        {isFailedUpload ? (
                          <div className='flex h-full w-full flex-col items-center justify-center gap-2 bg-red-50 px-2 text-center'>
                            <FileOutlined className='text-3xl text-red-500' />
                            <p className='line-clamp-2 text-[11px] font-medium text-red-600'>
                              Upload failed
                            </p>
                          </div>
                        ) : isUploading ? (
                          <>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                              <div
                                className='bg-primaryColor h-2 rounded-full transition-all duration-300'
                                style={{width: `${progress || 0}%`}}
                              />
                            </div>
                          </>
                        ) : getFileType(file as UploadFile) === 'image' ? (
                          <img
                            src={getThumbnail(file as UploadFile)}
                            alt={file.name}
                            className='w-full h-full object-cover'
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = '/placeholder-image.png'
                            }}
                          />
                        ) : (
                          <div className='flex flex-col items-center justify-center h-full'>
                            <FileOutlined className='text-4xl text-primaryColor' />
                          </div>
                        )}
                      </div>

                      {isStlFile(file as UploadFile) && (
                        <div className='px-2 py-1'>
                          <label
                            className='flex items-center gap-2 text-[11px] cursor-pointer'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type='checkbox'
                              checked={selectedStlIds.includes(file.uid)}
                              onChange={(e) => {
                                e.stopPropagation()
                                toggleStlSelect(file.uid)
                              }}
                              disabled={
                                !selectedStlIds.includes(file.uid) && selectedStlIds.length >= 2
                              }
                            />
                            <span className='truncate' title={file.name}>
                              {file.name}
                            </span>
                          </label>
                        </div>
                      )}

                      {!viewMode && !isUploading && (
                        <button
                          className='absolute top-1 right-1 z-20 bg-textColor rounded-full w-5 h-5 flex items-center justify-center shadow-md'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(file as UploadFile)
                          }}
                        >
                          <CloseIcon color='white' />
                        </button>
                      )}

                      {isFailedUpload && !viewMode && (
                        <button
                          type='button'
                          className='absolute inset-x-2 bottom-2 z-20 rounded bg-primaryColor px-2 py-1 text-[11px] font-semibold text-white shadow-sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRetryUpload(file as UploadFile)
                          }}
                        >
                          Re-upload
                        </button>
                      )}

                      {!isFailedUpload && (
                        <div className='absolute inset-0 pointer-events-none bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center'>
                          <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                            <div className='bg-white bg-opacity-90 rounded-full p-1'>
                              <svg
                                className='w-3 h-3 text-gray-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                />
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {uploadedFiles.some((f) => isStlFile(f)) && (
                <div className='mt-3 flex items-center gap-3'>
                  <button
                    type='button'
                    className='px-3 py-1.5 rounded bg-primaryColor text-white border border-primaryColor font-semibold disabled:opacity-50'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openStlViewer()
                    }}
                    disabled={selectedStlIds.length === 0}
                  >
                    Open in 3D viewer
                  </button>
                  <span className='text-xs text-textColor'>Select up to two STL files</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {viewerOpen && (
        <ModalLayout className='md:w-[60%] w-full !bg-[#444240]'>
          <div className='flex justify-end '>
            <button
              className='bg-[#FFFFFF26] p-1 rounded-full'
              type='button'
              onClick={closeStlViewer}
            >
              <CloseIcon color='white' />
            </button>
          </div>
          <div className='w-full' style={{height: '60vh'}}>
            <ExoViewer
              height={'100%'}
              backgroundColor={'#453B6A'}
              initialMeshes={viewerMeshes}
              onClose={closeStlViewer}
            />
          </div>
        </ModalLayout>
      )}
    </>
  )
}

export default FileUploaderWithAntdUpload
