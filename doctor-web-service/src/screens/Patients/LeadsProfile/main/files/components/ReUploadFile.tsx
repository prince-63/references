import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {useFormik} from 'formik'
import {AuthContext} from 'context/AuthContext'
import debounce from 'lodash.debounce'
import {useLocation, useParams} from 'react-router-dom'
import userTypes from '@constants/userTypes'
import {
  downloadFile,
  getFiles,
  setOpenUploadFilesModal,
  uploadFiles,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import AntdButton from 'components/atom/Buttons/AntdButton'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import pdfPng from 'assets/images/Pdf.png'
import mp4Png from 'assets/images/mp4.png'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import StlIcon from 'assets/icons/StlIcon'
import PlyIcon from 'assets/icons/PlyIcon'
import ObjIcon from 'assets/icons/ObjIcon'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {allFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import HttpStatusCode from '@constants/httpStatusCodes.constants'

interface FormValues {
  files: FileItem[]
}

interface FileItem {
  file_id: number
  name: string
  url: string | null
  full_path: string
  type: string | null
  extension: string | null
  size: number
  created_at: string
  created_by: number
  created_by_user_type: string
  folder: boolean
  children_files?: Item[]
}

type Item = FileItem

const ReUploadFile = () => {
  const {userId} = useContext(AuthContext)
  const params = useParams()
  const {dispatchAction} = useDispatchAction()
  const {subscriptionData} = useSubscriptionDetails()
  const location = useLocation()

  const pathSegments = location.pathname.split('/')
  const lastSegment = decodeURIComponent(pathSegments[pathSegments.length - 1])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showReuploadAction, setShowReuploadAction] = useState(false)
  const [failedFileIds, setFailedFileIds] = useState<number[]>([])

  const allFiles = useSelector((state: RootState) => state.leadFiles)

  const toggleSelect = (fileId: any) => {
    const updatedIds = selectedIds.includes(fileId)
      ? selectedIds.filter((id) => id !== fileId)
      : [...selectedIds, fileId]

    setSelectedIds(updatedIds)
    setFailedFileIds((prev) => {
      const next = prev.filter((id) => updatedIds.includes(id))
      if (next.length === 0) {
        setShowReuploadAction(false)
      }
      return next
    })

    const selectedFiles = files.filter((file) => updatedIds.includes(file.file_id))
    formik.setFieldValue('files', selectedFiles)
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userId || !params.patientId) return console.error(' User Id not found')
    dispatchAction(
      allFile({
        doctor_id: userId,
        patient_id: params.patientId,
        path: '/',
      })
    )
  }, [userId])
  const isScanFiles = lastSegment.toLowerCase() === 'scan files'.toLowerCase()

  const formik = useFormik<FormValues>({
    initialValues: {
      files: [],
    },

    onSubmit: async (values) => {
      const path = params['*']

      const isRetryingFailedFiles = showReuploadAction && failedFileIds.length > 0
      const selectedFiles = isRetryingFailedFiles
        ? (values.files as FileItem[]).filter((file) => failedFileIds.includes(file.file_id))
        : (values.files as FileItem[])
      if (!selectedFiles.length || !userId || !params.patientId) return

      try {
        const downloadedFiles: File[] = []

        for (const file of selectedFiles) {
          try {
            const response = await dispatchAction(
              downloadFile({
                requester_user_id: parseInt(userId),
                requester_user_type: userTypes.DOCTOR,
                file_id: safeParseInt(file.file_id),
              })
            ).unwrap()

            // Convert Blob into File for re-upload
            const blob = new Blob([response], {
              type: file?.type || 'application/octet-stream',
            })

            const newFile = new File([blob], file.name, {
              type: file?.type || 'application/octet-stream',
              lastModified: new Date(file.created_at).getTime() || Date.now(),
            })

            downloadedFiles.push(newFile)
          } catch (err) {
            console.error(`Error downloading file_id ${file?.file_id}`, err)
          }
        }

        if (!downloadedFiles.length) {
          AntdMessage({type: 'error', text: 'No files were downloaded to upload.'})
          return
        }

        const validatedFiles = validateAndProcessPhotos({
          files: downloadedFiles,
          fileCount: 51,
          filesAlreadySelected: [], // Or previously selected if applicable
          chatFileFormats: ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'mov', 'stl', 'ply', 'obj'],
          maxFileSize: 50,
          availableStorage: subscriptionData?.total_storage_gb,
          usedStorage: subscriptionData?.used_storage_gb,
          isForScanFiles: isScanFiles,
          toastMessage: 'You can upload a maximum of 50 files at a time',
        })

        if (!validatedFiles.length) {
          return // Errors already shown inside validateAndProcessPhotos
        }
        const payloadForUploadFiles = {
          uploader: {
            user_id: parseInt(userId),
            user_type: userTypes.DOCTOR,
          },
          owners: [
            {
              user_id: parseInt(userId),
              user_type: userTypes.DOCTOR,
            },
            {
              user_id: parseInt(params.patientId),
              user_type: userTypes.PATIENT,
            },
          ],
          parent_path: `/${path}`,
          files: validatedFiles,
        }
        setShowReuploadAction(false)
        await dispatchAction(uploadFiles(payloadForUploadFiles)).unwrap()
        await dispatchAction(
          getFiles({
            doctor_id: userId,
            patient_id: params.patientId,
            path: `/${path}`,
          })
        )
        await dispatchAction(getApiDataDoctorProfile({doctor_id: safeParseInt(userId)}))
        dispatchAction(setOpenUploadFilesModal(false))
        setFailedFileIds((prev) =>
          prev.filter((id) => !selectedFiles.some((file) => file.file_id === id))
        )
        await dispatchAction(
          getLeadsProfileDetails({
            patient_id: safeParseInt(params.patientId),
            doctor_id: safeParseInt(userId),
          })
        )
      } catch (err) {
        if ((err as any)?.response?.status === HttpStatusCode.INTERNAL_SERVER_ERROR) {
          setShowReuploadAction(true)
          setFailedFileIds(selectedFiles.map((file) => file.file_id))
        } else {
          AntdMessage({type: 'error', text: 'Error downloading and uploading files'})
        }
      } finally {
      }
    },
  })
  const [fileUrls, setFileUrls] = useState<
    Array<{
      url: string
      type: string
      name: string
      file: {
        size: number
      }
    }>
  >([])
  const handleFileChange = useCallback(
    debounce((files: File[]) => {
      if (files.length > 0) {
        const validatedFileList = validateAndProcessPhotos({
          files,
          fileCount: 51,
          filesAlreadySelected: selectedIds,
          toastMessage: 'You can upload a maximum of 50 files at a time',
          chatFileFormats: ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'mov', 'stl', 'ply', 'obj'],
          maxFileSize: 50,
          availableStorage: subscriptionData?.total_storage_gb,
          usedStorage: subscriptionData?.used_storage_gb,
          invalidFileFormatMessage:
            'Invalid file format. Please upload a PDF, JPG, JPEG, PNG, MP4 or STL file only',
          isForScanFiles: isScanFiles,
        })
        const newFiles = Array.from(validatedFileList).map((file) => {
          const timestamp = Date.now()
          const newFile = new File([file], `${timestamp}-${file.name}`, {
            type: file.type,
          })
          return newFile
        })
        const currentFiles = formik.values.files
        const updatedFiles = [...currentFiles, ...newFiles]
        formik.setFieldValue('files', updatedFiles)

        const urls = newFiles.map((file) => ({
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name,
          file: {
            size: file.size,
          },
        }))
        setFileUrls((prevUrls) => [...prevUrls, ...urls])
      }
    }, 300),
    [fileUrls, formik, subscriptionData]
  )

  const flattenFilesDetailed = (items: Item[]): FileItem[] => {
    const allFiles: FileItem[] = []

    const traverseAndCollect = (items: Item[]) => {
      items.forEach((item) => {
        if (item.folder) {
          // It's a folder, traverse its children
          if (item.children_files && item.children_files.length > 0) {
            traverseAndCollect(item.children_files)
          }
        } else {
          if (item.url && item.url.trim() !== '') {
            allFiles.push({
              file_id: item.file_id,
              name: item.name,
              url: item.url,
              full_path: item.full_path,
              type: item.type,
              extension: item.extension,
              size: item.size,
              created_at: item.created_at,
              created_by: item.created_by,
              created_by_user_type: item.created_by_user_type,
              folder: item.folder,
            })
          }
        }
      })
    }

    traverseAndCollect(items)
    return allFiles
  }

  const files = flattenFilesDetailed(allFiles.Files as any)

  return (
    <div className='relative min-h-[80vh]'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <When isTrue={selectedIds.length > 0}>
            <p className='font-medium text-base text-textColor'>
              {selectedIds.length === 1
                ? '1 file selected'
                : `${selectedIds.length} file${selectedIds.length !== 1 ? 's' : ''} selected`}
            </p>
          </When>
          <When isTrue={selectedIds.length > 0}>
            <button
              type='button'
              className='text-textColor text-base font-semibold text-right'
              onClick={() => {
                formik.setFieldValue('files', [])
                setSelectedIds([])
                setShowReuploadAction(false)
                setFailedFileIds([])
              }}
            >
              Clear all
            </button>
          </When>
        </div>
        <form className='flex flex-col gap-4 '>
          <input
            type='file'
            multiple
            accept='.jpg,.jpeg,.png,.pdf,.mp4,.mov,.stl,.ply,.obj'
            onChange={(e) => {
              if (e.target.files) {
                handleFileChange(Array.from(e.target.files))
              }
            }}
            className='hidden'
            ref={fileInputRef}
          />
          <When isTrue={hasValue(files)}>
            <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
              {files.map((file) => {
                const isSelected = selectedIds.includes(file.file_id)
                const extension = file?.extension?.toLowerCase() || ''

                let previewContent

                if (file.type === 'IMAGES') {
                  previewContent = file.url ? (
                    <img src={file.url} alt={file.name} className='object-cover w-full h-32' />
                  ) : (
                    <div className='flex items-center justify-center w-full h-32 bg-gray-200'>
                      <span>No preview</span>
                    </div>
                  )
                } else if (file.type === 'video/mp4') {
                  previewContent = (
                    <img src={mp4Png} alt='Video thumbnail' className='object-cover w-full h-32' />
                  )
                } else if (extension === 'pdf') {
                  previewContent = (
                    <div className='flex items-center justify-center w-full h-32 '>
                      <img src={pdfPng} alt='PDF' className='w-20 h-20' />
                    </div>
                  )
                } else if (file.name.endsWith('.stl')) {
                  previewContent = (
                    <div className='flex items-center justify-center w-full h-32 '>
                      <StlIcon />
                    </div>
                  )
                } else if (file.name.endsWith('.obj')) {
                  previewContent = (
                    <div className='flex items-center justify-center w-full h-32 '>
                      <ObjIcon />
                    </div>
                  )
                } else if (file.name.endsWith('.ply')) {
                  previewContent = (
                    <div className='flex items-center justify-center w-full h-32 '>
                      <PlyIcon />
                    </div>
                  )
                }

                return (
                  <div
                    key={file.file_id}
                    className='relative border rounded overflow-hidden group cursor-pointer'
                    onClick={() => toggleSelect(file.file_id)}
                  >
                    {previewContent}
                    <div className='absolute top-1 left-1 rounded-sm p-1'>
                      <input type='checkbox' checked={isSelected} readOnly />
                    </div>

                    {isSelected && <div className='absolute inset-0' />}
                    {failedFileIds.includes(file.file_id) && (
                      <span className='absolute bottom-1 left-1 rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600'>
                        Failed
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </When>
          <div className='absolute bottom-6 right-0'>
            <AntdButton
              className='bg-primaryColor text-white h-12 font-semibold text-base'
              isLoading={formik.isSubmitting}
              text={showReuploadAction ? 'Re-upload' : 'Upload files'}
              onClick={() => {
                identifyUser()
                formik.handleSubmit()
              }}
              disabled={formik.isSubmitting || formik.getFieldProps('files').value.length < 1}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReUploadFile
