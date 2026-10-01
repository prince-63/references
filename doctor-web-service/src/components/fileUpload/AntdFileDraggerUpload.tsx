import {useState, useContext, useEffect, useRef} from 'react'
import {Image, Upload, Progress} from 'antd'
import {PlusOutlined} from '@ant-design/icons'
import {AuthContext} from 'context/AuthContext'
import apiHelper from '@utils/apiHelper'
import {URL_UPLOAD_FILES} from 'redux/Endpoints/apiEndpoints'
import userTypes from '@constants/userTypes'
import HttpStatusCode from '@constants/httpStatusCodes.constants'
import {openDocument, safeParseInt} from 'utils/ConstFunctions'
import _ from 'lodash'
import HttpMethod from '@constants/httpMethods.constants'
import {RcFile} from 'antd/es/upload'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import type {UploadFile} from 'antd'
import {UploadChangeParam} from 'antd/lib/upload'
import When from 'components/when/When'
import useDispatchAction from '@hooks/useDispatchAction'

import {
  deleteFiles,
  setIsStlFilePreviewVisible,
  setStlPreviewUrl,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {FileType, getBase64} from '@utils/getBase64'
import {getSubscriptionDetails} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import StorageExceedModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/StorageExceedModal'
import Dragger from 'antd/es/upload/Dragger'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_CLOUD_UP_ARROW} from 'utils/SvgConstants'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {getStorageType} from 'utils/storage'


type QueuedUploadRequest = {
  file: File
  onSuccess?: (response: any) => void
  onError?: (error: any) => void
  onProgress?: (event: {percent: number}, file: File) => void
}

const isUploadServerError = (error?: any) =>
  error?.response?.status === HttpStatusCode.INTERNAL_SERVER_ERROR

const AntdFileDraggerUpload = ({
  maxFileSize = 50,
  maxFileCount = 5,
  accept,
  patientId,
  parentPath,
  uploadedFiles,
  setUploadedFiles,
  onUploadingChange,
}: {
  maxFileSize?: number
  maxFileCount?: number
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  accept?: string
  patientId?: number
  parentPath: string
  onUploadingChange?: (isUploading: boolean) => void
}) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFileName, setUploadingFileName] = useState('')
  const [showCompletedProgress, setShowCompletedProgress] = useState(false)
  const [failedUploadFiles, setFailedUploadFiles] = useState<{[key: string]: UploadFile}>({})
  const {subscriptionData} = useSubscriptionDetails()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  const [isStorageLimitModalVisible, setStorageLimitModalVisible] = useState(false)
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const uploadQueueRef = useRef<QueuedUploadRequest[]>([])
  const isProcessingQueueRef = useRef(false)

  // Notify parent component about uploading state changes
  const lastUploadingStateRef = useRef<boolean>(false)
  const onUploadingChangeRef = useRef<typeof onUploadingChange>(onUploadingChange)

  useEffect(() => {
    onUploadingChangeRef.current = onUploadingChange
  }, [onUploadingChange])

  useEffect(() => {
    const callback = onUploadingChangeRef.current
    if (!callback) return
    if (lastUploadingStateRef.current !== uploading) {
      lastUploadingStateRef.current = uploading
      callback(uploading)
    }
  }, [uploading])

  useEffect(() => {
    return () => {
      uploadQueueRef.current = []
      isProcessingQueueRef.current = false
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
      }
      const callback = onUploadingChangeRef.current
      if (callback) {
        lastUploadingStateRef.current = false
        callback(false)
      }
    }
  }, [])

  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({isOpen: true, url, fileName})
  }

  const handleClosePDF = () => {
    setPdfViewer({isOpen: false, url: '', fileName: ''})
  }

  const beforeUpload = (file: File, list: RcFile[]) => {
    const pendingFailedFiles = Object.values(failedUploadFiles)
    const isValidCount = uploadedFiles.length + pendingFailedFiles.length + list.length <= maxFileCount
    const isSimilarFile = [...uploadedFiles, ...pendingFailedFiles].some(
      (item) => item.name === file.name
    )

    if (isSimilarFile) {
      AntdMessage({text: `You cannot upload similar files.`, type: 'error'})
      return Upload.LIST_IGNORE
    }

    if (!isValidCount) {
      AntdMessage({text: `You can only upload a maximum of ${maxFileCount} files.`, type: 'error'})
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

    // accept-specific validation
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
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension !== 'zip') {
        AntdMessage({
          text: 'Invalid file format. Please upload a ZIP file only.',
          type: 'error',
        })
        return Upload.LIST_IGNORE
      }
    }
    return true
  }

  const handleUploadChange = async (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'done') {
      const file = info.file.response?.uploaded_file
      setUploadedFiles((prev) => [
        ...prev,
        {uid: file?.file_id, name: file?.name, url: file?.url ?? '#'},
      ])
      setFailedUploadFiles((prev) => {
        const newFailedUploads = {...prev}
        delete newFailedUploads[info.file.uid]
        return newFailedUploads
      })
      setUploadProgress(100)
      setShowCompletedProgress(true)
      AntdMessage({text: `${info.file.name} file uploaded successfully`, maxCount: 3})
      dispatchAction(getSubscriptionDetails({doctor_id: safeParseInt(userId)}))
    } else if (info.file.status === 'error') {
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
    setShowCompletedProgress(false)
    setUploadProgress(0)
    setUploadingFileName(file.name)

    const payloadForUploadFiles = {
      uploader: {user_id: safeParseInt(userId), user_type: userTypes.DOCTOR},
      owners: [
        {user_id: safeParseInt(userId), user_type: userTypes.DOCTOR},
        {user_id: safeParseInt(patientId), user_type: userTypes.PATIENT},
      ],
      parent_path: parentPath,
      files: [file],
    }
    const profileId = getStorageType().getItem('profileId') ?? ''
    const formData = new FormData()
    payloadForUploadFiles?.files?.forEach((f) => {
      formData.append('files', f)
    })
    const payloadWithoutFiles = _.omit(payloadForUploadFiles, ['files'])
    formData.append('request', JSON.stringify(payloadWithoutFiles))
    formData.append('profileId', profileId)
    try {
      const res = await apiHelper(URL_UPLOAD_FILES, HttpMethod.POST, formData, true, {
        skipServerErrorRedirect: true,
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0
          setUploadProgress(progress)
          onProgress({percent: progress}, file)
        },
      })

      setUploadProgress(100)
      setShowCompletedProgress(true)
      onSuccess?.({
        status: 'done',
        uploaded_file: res.data?.upload_files?.at(0),
      })
    } catch (error) {
      onError?.(error)
    }
  }

  const finishUploadQueue = () => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current)
    }

    completionTimeoutRef.current = setTimeout(() => {
      if (isProcessingQueueRef.current || uploadQueueRef.current.length > 0) return
      setUploading(false)
      setShowCompletedProgress(false)
      setUploadProgress(0)
      setUploadingFileName('')
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

    uploadQueueRef.current.push({
      file: fileToRetry,
      onProgress: (event) => {
        setUploadProgress(event.percent)
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
    <button
      className={`border-0 bg-none ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      type='button'
      disabled={uploading}
    >
      <PlusOutlined />
      <div className='mt-2'>Upload</div>
    </button>
  )

  const handlePreview = async (file: UploadFile) => {
    if (file.url?.endsWith('.stl') || file.url?.endsWith('.obj') || file.url?.endsWith('.ply')) {
      dispatchAction(setStlPreviewUrl(file?.url))
      dispatchAction(setIsStlFilePreviewVisible(true))
      return
    }

    if (file.url?.endsWith('.pdf')) {
      handleOpenPDF(file.url, file.name)
      return
    }

    if (file.url?.endsWith('.mp4')) {
      openDocument(file.url)
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
    if (uploadedFile) {
      fileId = uploadedFile.file_id
    }

    if (failedUploadFiles[file.uid]) {
      setFailedUploadFiles((prev) => {
        const newFailedUploads = {...prev}
        delete newFailedUploads[file.uid]
        return newFailedUploads
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

  const displayedUploadProgress = uploading
    ? showCompletedProgress
      ? 100
      : Math.min(uploadProgress, 99)
    : uploadProgress

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {!pdfViewer.isOpen && (
        <>
          <When isTrue={isStorageLimitModalVisible}>
            <StorageExceedModal {...{setStorageLimitModalVisible}} />
          </When>

          {/* Full-width, fully clickable drop zone (always shown) */}
          <Dragger
            className='w-full bg-supportColor'
            customRequest={customRequest}
            beforeUpload={beforeUpload}
            onChange={handleUploadChange}
            accept={accept}
            multiple
            showUploadList={false}
            height={160}
            disabled={uploading}
          >
            <div className='w-full h-full flex flex-col justify-center items-center gap-2 py-6'>
              {uploading ? (
                <div className='flex flex-col items-center gap-3 w-[80%]'>
                  <p className='text-sm font-medium text-textColor truncate max-w-full'>
                    Uploading {uploadingFileName}...
                  </p>
                  <Progress
                    percent={displayedUploadProgress}
                    status='active'
                    strokeColor='#6B4EFF'
                    className='w-full'
                  />
                </div>
              ) : (
                <>
                  <CommonSVG svg={SVG_CLOUD_UP_ARROW} width='24' height='24' />
                  <div className='text-sm font-medium text-textColor flex flex-col items-center justify-center'>
                    <p>Click to upload</p>
                    {accept === '.zip' ? (
                      <p>(Only .zip files are accepted. Max size: 5GB.)</p>
                    ) : (
                      <p>(Max {maxFileCount} files)</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </Dragger>

          {Object.keys(failedUploadFiles).length > 0 && (
            <div className='mt-3 space-y-2'>
              {Object.values(failedUploadFiles).map((file) => (
                <div
                  key={file.uid}
                  className='flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2'
                >
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-red-700'>{file.name}</p>
                    <p className='text-xs text-red-500'>Upload failed</p>
                  </div>
                  <div className='flex flex-shrink-0 items-center gap-2'>
                    <button
                      type='button'
                      className='rounded bg-primaryColor px-3 py-1 text-xs font-semibold text-white'
                      onClick={() => handleRetryUpload(file)}
                    >
                      Re-upload
                    </button>
                    <button
                      type='button'
                      className='rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100'
                      onClick={() => handleRemoveFile(file)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className='mt-3'>
              <Upload
                customRequest={customRequest}
                listType='picture-card'
                showUploadList={{showRemoveIcon: true, showPreviewIcon: true}}
                beforeUpload={beforeUpload}
                onChange={handleUploadChange}
                defaultFileList={uploadedFiles}
                accept={accept}
                onPreview={handlePreview}
                onRemove={handleRemoveFile}
                disabled={uploading}
                isImageUrl={() => false}
                multiple
              >
                {uploadedFiles.length < maxFileCount && uploadButton}
              </Upload>
            </div>
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
        </>
      )}
    </>
  )
}

export default AntdFileDraggerUpload
