import React, {useCallback, useContext, useState} from 'react'
import {SVG_CROSS, SVG_UPLOAD_CLOUD_ICON} from 'utils/SvgConstants'
import {useFormik} from 'formik'
import {AuthContext} from 'context/AuthContext'
import debounce from 'lodash.debounce'
import {useLocation, useParams} from 'react-router-dom'
import userTypes from '@constants/userTypes'
import {
  getFiles,
  setOpenUploadFilesModal,
  uploadFiles,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import {identifyUser, openDocument, safeParseInt} from 'utils/ConstFunctions'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import AntdButton from 'components/atom/Buttons/AntdButton'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import pdfPng from 'assets/images/Pdf.png'
import mp4Png from 'assets/images/mp4.png'
import defaultImage from 'assets/images/defaultImage.png'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import TextWithTooltip from 'components/section/TextWithTooltip'
import StlIcon from 'assets/icons/StlIcon'
import InfoToast from 'components/modal/Alert/InfoToast'
import clsx from 'clsx'
import {Image} from 'assets/images/Images/Image'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import PlyIcon from 'assets/icons/PlyIcon'
import ObjIcon from 'assets/icons/ObjIcon'
import cn from '@utils/cn'
import getColorPalette from 'utils/getColorPalette'
import InfoIcon from 'assets/icons/InfoIcon'
import PDFWebview from './PDFWebview'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import HttpStatusCode from '@constants/httpStatusCodes.constants'

interface FormValues {
  files: File[]
}

const getUploadFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

const UploadFile = () => {
  const {userId} = useContext(AuthContext)
  const params = useParams()
  const {dispatchAction} = useDispatchAction()
  const {subscriptionData} = useSubscriptionDetails()
  const location = useLocation()
  const [showReuploadAction, setShowReuploadAction] = useState(false)
  const [failedFileKeys, setFailedFileKeys] = useState<string[]>([])

  const pathSegments = location.pathname.split('/')
  const lastSegment = decodeURIComponent(pathSegments[pathSegments.length - 1])

  const isScanFiles = lastSegment.toLowerCase() === 'scan files'.toLowerCase()

  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  // PDF handler functions - Add these
  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      files: [],
    },
    onSubmit: async (values) => {
      const path = params['*']

      const isRetryingFailedFiles = showReuploadAction && failedFileKeys.length > 0
      const files = isRetryingFailedFiles
        ? values.files.filter((file) => failedFileKeys.includes(getUploadFileKey(file)))
        : values.files
      if (!files.length || !userId || !params.patientId) return

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
        files: files,
      }
      try {
        setShowReuploadAction(false)
        // Dispatch the uploadFiles action
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
        dispatchAction(
          getLeadsProfileDetails({
            patient_id: safeParseInt(params.patientId),
            doctor_id: safeParseInt(userId),
          })
        )
        setFailedFileKeys((prev) =>
          prev.filter((key) => !files.some((file) => getUploadFileKey(file) === key))
        )
      } catch (error: any) {
        if (error?.response?.status === HttpStatusCode.INTERNAL_SERVER_ERROR) {
          setShowReuploadAction(true)
          setFailedFileKeys(files.map(getUploadFileKey))
        } else {
          AntdMessage({type: 'error', text: 'Failed to upload files. Please try again.'})
        }
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
          filesAlreadySelected: fileUrls,
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

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files
    if (files) {
      const filesArray = Array.from(files)
      handleFileChange(filesArray)
    }
    event.currentTarget.value = ''
  }
  const handleRemoveFile = (index: number) => {
    const newFiles = [...formik.values.files]
    const removedFile = newFiles[index]
    newFiles.splice(index, 1)
    formik.setFieldValue('files', newFiles)
    if (removedFile) {
      setFailedFileKeys((prev) => {
        const next = prev.filter((key) => key !== getUploadFileKey(removedFile))
        if (next.length === 0) {
          setShowReuploadAction(false)
        }
        return next
      })
    }

    const newFileUrls = [...fileUrls]
    newFileUrls.splice(index, 1)
    setFileUrls(newFileUrls)
    if (newFiles.length === 0) {
      setShowReuploadAction(false)
    }
  }

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <div className='relative min-h-[80vh]'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <When isTrue={fileUrls.length > 0}>
                <p className='font-medium text-base text-textColor'>
                  {fileUrls.length === 1
                    ? '1 file selected'
                    : `${fileUrls.length} file${fileUrls.length !== 1 ? 's' : ''} selected`}
                </p>
              </When>
              <When isTrue={fileUrls.length > 0}>
                <button
                  type='button'
                  className='text-textColor text-base font-semibold text-right'
                  onClick={() => {
                    formik.setFieldValue('files', [])
                    setFileUrls([])
                    setShowReuploadAction(false)
                    setFailedFileKeys([])
                  }}
                >
                  Clear all
                </button>
              </When>
            </div>
            <form className='flex flex-col gap-4 '>
              <div className='flex justify-start items-start'>
                <div className='min-w-7 '>
                  <CommonSVG
                    svg={InfoIcon}
                    color={getColorPalette().primaryColor}
                    height='20'
                    width='20'
                  />
                </div>
                <div>
                  <div className={cn('text-black text-[14px]')}>
                    {'Please avoid refreshing the page while files are uploading'}
                  </div>
                </div>
              </div>
              <When isTrue={fileUrls.length < 50}>
                <div
                  className={clsx(
                    'h-32 border border-mediumGray flex justify-center rounded-lg items-center cursor-pointer relative',
                    fileUrls.length > 0 && '!h-[100px]'
                  )}
                >
                  <input
                    style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0}}
                    type='file'
                    id='image'
                    multiple
                    accept={'.jpg, .jpeg, .png, .pdf, .mp4, .mov, .stl, .ply, .obj'}
                    onChange={onFileChange}
                    className='cursor-pointer'
                  />
                  <label
                    htmlFor='image'
                    className='p-3 cursor-pointer flex-col justify-center items-center'
                  >
                    <div className='flex flex-col justify-center items-center '>
                      <CommonSVG svg={SVG_UPLOAD_CLOUD_ICON} width='24' height='24' />
                      <div className='text-sm font-medium text-textColor flex flex-col items-center justify-center'>
                        <p>{fileUrls.length === 0 ? 'Tap to upload files' : 'Add more files'}</p>
                        <p>(Only 50 files can be uploaded at once)</p>
                      </div>
                    </div>
                  </label>
                </div>
              </When>
              <When isTrue={hasValue(fileUrls)}>
                <div className='flex flex-col w-full gap-4 max-h-[calc(80vh-21rem)] overflow-y-auto card-wrapper'>
                  {fileUrls.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between w-full border border-lightGray rounded-lg p-3'
                    >
                      <div className='flex items-center gap-4'>
                        <When
                          isTrue={
                            file.type !== 'application/pdf' &&
                            file.type !== 'video/mp4' &&
                            hasValue(file.type)
                          }
                        >
                          <Image
                            src={defaultImage}
                            alt='Uploaded file'
                            className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                            onClick={() => handleOpenPDF(file?.url ?? '')}
                            fileName={formik.values.files[index].name}
                            showFileName={true}
                          />
                        </When>

                        <When isTrue={file.type === 'video/mp4'}>
                          <Image
                            className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                            onClick={() => openDocument(file?.url ?? '')}
                            size={20}
                            src={mp4Png}
                          />
                          <TextWithTooltip>{formik.values.files[index]?.name}</TextWithTooltip>
                        </When>

                        <When isTrue={file.type === 'application/pdf'}>
                          <Image
                            className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                            onClick={() => handleOpenPDF(file.url ?? '')}
                            size={20}
                            src={pdfPng}
                          />
                          <TextWithTooltip>{formik.values.files[index]?.name}</TextWithTooltip>
                        </When>

                        <When
                          isTrue={
                            hasValue(file.name) &&
                            (file.name.endsWith('.stl') ||
                              file.name.endsWith('.obj') ||
                              file.name.endsWith('.ply'))
                          }
                        >
                          <div
                            onClick={() => {
                              InfoToast('No preview available. Please download to view file')
                            }}
                            className='cursor-pointer'
                          >
                            {file.name.endsWith('.stl') && <StlIcon />}
                            {file.name.endsWith('.obj') && <ObjIcon />}
                            {file.name.endsWith('.ply') && <PlyIcon />}
                          </div>
                          <TextWithTooltip>{formik.values.files[index]?.name}</TextWithTooltip>
                        </When>
                        <When
                          isTrue={
                            !!formik.values.files[index] &&
                            failedFileKeys.includes(getUploadFileKey(formik.values.files[index]))
                          }
                        >
                          <span className='rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600'>
                            Failed
                          </span>
                        </When>
                      </div>

                      <div
                        className='cursor-pointer'
                        onClick={() => {
                          handleRemoveFile(index)
                        }}
                      >
                        <CommonSVG svg={SVG_CROSS} width='40' height='40' />
                      </div>
                    </div>
                  ))}
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
      )}
    </>
  )
}

export default UploadFile
