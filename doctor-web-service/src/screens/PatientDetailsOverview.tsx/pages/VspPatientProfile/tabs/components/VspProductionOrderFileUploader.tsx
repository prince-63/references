import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {CloudUpload, FileText, Film, Trash2} from 'lucide-react'
import {Upload} from 'antd'
import type {UploadFile} from 'antd'
import {RcFile} from 'antd/es/upload'
import {UploadChangeParam} from 'antd/lib/upload'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import HttpStatusCode from '@constants/httpStatusCodes.constants'
import {openDocument, safeParseInt} from 'utils/ConstFunctions'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import useDispatchAction from '@hooks/useDispatchAction'
import {deleteFiles, uploadFiles} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {getSubscriptionDetails} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import StorageExceedModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/StorageExceedModal'
import When from 'components/when/When'


const isUploadServerError = (error?: any) =>
  error?.response?.status === HttpStatusCode.INTERNAL_SERVER_ERROR

interface VspProductionOrderFileUploaderProps {
  title: string
  subTitle: string
  patientId?: number
  parentPath: string
  uploadedFiles: UploadFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  onUploadingChange?: (isUploading: boolean) => void
  accept?: string
  maxFileSize?: number
  maxFileCount?: number
}

const VspProductionOrderFileUploader = ({
  title,
  subTitle,
  patientId,
  parentPath,
  uploadedFiles,
  setUploadedFiles,
  onUploadingChange,
  accept = '.stl, .obj, .ply',
  maxFileSize = 100,
  maxFileCount = 10,
}: VspProductionOrderFileUploaderProps) => {
  const {userId} = useContext(AuthContext)
  const {subscriptionData} = useSubscriptionDetails()
  const {dispatchAction} = useDispatchAction()
  const lastUploadingStateRef = useRef<boolean>(false)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: UploadFile}>({})
  const [failedUploadFiles, setFailedUploadFiles] = useState<{[key: string]: UploadFile}>({})
  const [isStorageLimitModalVisible, setStorageLimitModalVisible] = useState(false)
  const viewVideoOrPdf = (fileUrl: string, fileName?: string) => {
    if (fileName?.toLowerCase().endsWith('.pdf') || fileUrl.toLowerCase().includes('.pdf')) {
      openDocument(fileUrl, fileName)
      return
    }

    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }
  const acceptedExtensions = useMemo(
    () =>
      accept
        .split(',')
        .map((item) => item.trim().toLowerCase().replace('.', ''))
        .filter(Boolean),
    [accept]
  )

  const beforeUpload = (file: File, list: RcFile[]) => {
    const pendingFailedFiles = Object.values(failedUploadFiles)
    const isValidCount = uploadedFiles.length + pendingFailedFiles.length + list.length <= maxFileCount
    const isDuplicate = [...uploadedFiles, ...pendingFailedFiles].some(
      (item) => item.name === file.name
    )

    if (isDuplicate) {
      AntdMessage({text: 'You cannot upload similar files.', type: 'error'})
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

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (acceptedExtensions.length > 0 && extension && !acceptedExtensions.includes(extension)) {
      AntdMessage({
        text: `Invalid file format. Allowed: ${acceptedExtensions.join(', ')}`,
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
      return
    }

    if (info.file.status === 'done') {
      const uploaded = info.file.response?.uploaded_file
      if (uploaded) {
        setUploadedFiles((prev) => {
          const exists = prev.some(
            (item) => safeParseInt(item.uid) === safeParseInt(uploaded.file_id)
          )
          if (exists) return prev
          return [
            ...prev,
            {
              uid: uploaded.file_id,
              name: uploaded.name,
              url: uploaded.url,
            },
          ]
        })
      }

      setUploadingFiles((prev) => {
        const next = {...prev}
        delete next[info.file.uid]
        return next
      })
      setFailedUploadFiles((prev) => {
        const next = {...prev}
        delete next[info.file.uid]
        return next
      })
      setUploadProgress((prev) => {
        const next = {...prev}
        delete next[info.file.uid]
        return next
      })

      AntdMessage({text: `${info.file.name} file uploaded successfully`, maxCount: 3})
      dispatchAction(getSubscriptionDetails({doctor_id: safeParseInt(userId)}))
      return
    }

    if (info.file.status === 'error') {
      setUploadingFiles((prev) => {
        const next = {...prev}
        delete next[info.file.uid]
        return next
      })
      setUploadProgress((prev) => {
        const next = {...prev}
        delete next[info.file.uid]
        return next
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
          const next = {...prev}
          delete next[info.file.uid]
          return next
        })
        AntdMessage({text: `${info.file.name} file upload failed.`, type: 'error'})
      }
    }
  }

  const customRequest = async ({file, onSuccess, onError, onProgress}: any) => {
    setUploading(true)

    const payload = {
      uploader: {user_id: safeParseInt(userId), user_type: userTypes.DOCTOR},
      owners: [
        {user_id: safeParseInt(userId), user_type: userTypes.DOCTOR},
        {user_id: safeParseInt(patientId), user_type: userTypes.PATIENT},
      ],
      parent_path: parentPath,
      files: [file],
    }

    let progress = 0
    const tick = () => {
      progress = Math.min(progress + 8, 90)
      onProgress?.({percent: progress}, file)
    }
    const timer = setInterval(tick, 200)
    tick()

    try {
      const result: any = await dispatchAction(uploadFiles(payload)).unwrap()
      clearInterval(timer)
      onProgress?.({percent: 100}, file)
      onSuccess?.({status: 'done', uploaded_file: result?.upload_files?.at(0)})
    } catch (error) {
      clearInterval(timer)
      onError?.(error)
    } finally {
      setUploading(false)
    }
  }

  const handleRetryUpload = (file: UploadFile) => {
    const fileToRetry = file.originFileObj as File | undefined
    if (!fileToRetry) {
      AntdMessage({text: 'Unable to retry this file. Please select it again.', type: 'error'})
      return
    }

    setFailedUploadFiles((prev) => {
      const next = {...prev}
      delete next[file.uid]
      return next
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

    customRequest({
      file: fileToRetry,
      onProgress: (event: {percent: number}) => {
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
      onSuccess: (response: any) => {
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
      onError: (error: any) => {
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
  }

  const handleRemoveFile = (file: UploadFile) => {
    const fileId = safeParseInt(file.uid)
    if (failedUploadFiles[file.uid]) {
      setFailedUploadFiles((prev) => {
        const next = {...prev}
        delete next[file.uid]
        return next
      })
      return
    }
    if (!fileId) return

    const payload = {
      deleter: {user_id: safeParseInt(userId), user_type: userTypes.DOCTOR},
      owner: {user_id: safeParseInt(patientId), user_type: userTypes.PATIENT},
      files_to_delete_by_id: [fileId],
    }

    dispatchAction(deleteFiles(payload))
    setUploadedFiles((prev) => prev.filter((item) => safeParseInt(item.uid) !== fileId))
  }

  useEffect(() => {
    if (!onUploadingChange) return
    const hasInFlightUploads = uploading || Object.keys(uploadingFiles).length > 0
    if (lastUploadingStateRef.current !== hasInFlightUploads) {
      lastUploadingStateRef.current = hasInFlightUploads
      onUploadingChange(hasInFlightUploads)
    }
  }, [uploading, uploadingFiles, onUploadingChange])

  useEffect(() => {
    return () => {
      if (onUploadingChange) {
        lastUploadingStateRef.current = false
        onUploadingChange(false)
      }
    }
  }, [onUploadingChange])

  return (
    <div className='w-full [&_.ant-upload-wrapper]:!w-full [&_.ant-upload]:!block [&_.ant-upload]:!w-full'>
      <Upload
        className='block w-full'
        style={{width: '100%'}}
        customRequest={customRequest}
        listType='text'
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleUploadChange}
        onRemove={handleRemoveFile}
        accept={accept}
        disabled={uploading}
        multiple
      >
        <div className='w-full rounded-xl border-2 border-dashed border-gray-200 bg-white px-4 py-8 transition-colors hover:border-gray-300'>
          <div className='flex flex-col items-center justify-center gap-1 py-2'>
            <CloudUpload className='h-6 w-6 text-gray-400' />
            <p className='text-sm font-semibold text-[#4A62E8]'>{title}</p>
            <p className='text-xs text-gray-400'>{subTitle}</p>
          </div>
        </div>
      </Upload>

      <When isTrue={isStorageLimitModalVisible}>
        <StorageExceedModal setStorageLimitModalVisible={setStorageLimitModalVisible} />
      </When>

      {(uploadedFiles.length > 0 ||
        Object.keys(uploadingFiles).length > 0 ||
        Object.keys(failedUploadFiles).length > 0) && (
        <div className='mt-3 space-y-2'>
          {[...uploadedFiles, ...Object.values(uploadingFiles), ...Object.values(failedUploadFiles)].map((file) => {
            const isInProgress = Boolean(uploadingFiles[file.uid])
            const isFailedUpload = Boolean(failedUploadFiles[file.uid])
            const progress = uploadProgress[file.uid] ?? 0
            const displayedProgress = isInProgress ? Math.min(progress, 99) : progress

            return (
              <div
                key={file.uid}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  isFailedUpload
                    ? 'border-red-100 bg-red-50'
                    : 'cursor-pointer border-gray-200 bg-[#F8FAFC]'
                }`}
                onClick={() => {
                  if (!isFailedUpload && file.url) {
                    viewVideoOrPdf(file.url, file.name)
                  }
                }}
              >
                <div className='flex min-w-0 items-center gap-2'>
                  {!file.name.toLowerCase().endsWith('.pdf') ? (
                    <Film className='h-4 w-4 flex-shrink-0 text-primaryColor' />
                  ) : (
                    <FileText className='h-4 w-4 flex-shrink-0 text-primaryColor' />
                  )}
                  <div className='min-w-0'>
                    <p className='truncate text-sm text-gray-700'>{file.name}</p>
                    {isInProgress && (
                      <p className='text-xs text-gray-400'>
                        Uploading... {Math.round(displayedProgress)}%
                      </p>
                    )}
                    {isFailedUpload && <p className='text-xs text-red-500'>Upload failed</p>}
                  </div>
                </div>

                {isFailedUpload ? (
                  <div className='ml-2 flex flex-shrink-0 items-center gap-2'>
                    <button
                      type='button'
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        handleRetryUpload(file)
                      }}
                      className='rounded bg-primaryColor px-3 py-1 text-xs font-semibold text-white'
                    >
                      Re-upload
                    </button>
                    <button
                      type='button'
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        handleRemoveFile(file)
                      }}
                      className='inline-flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:bg-red-100'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                ) : !isInProgress ? (
                  <button
                    type='button'
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      handleRemoveFile(file)
                    }}
                    className='ml-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default VspProductionOrderFileUploader
