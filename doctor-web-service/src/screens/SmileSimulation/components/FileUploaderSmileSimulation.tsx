import {useCallback, useContext, useState} from 'react'
import {Image, Progress} from 'antd'
import ClaudUploadIcon from 'assets/icons/ClaudUploadIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ArrowCounterClockwiseIcon from 'assets/icons/ArrowCounterClockwiseIcon'
import getColorPalette from 'utils/getColorPalette'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import {AuthContext} from 'context/AuthContext'
import apiHelper from '@utils/apiHelper'
import {URL_POST_SMILE_SIMULATION} from 'redux/Endpoints/apiEndpoints'
import HttpMethod from '@constants/httpMethods.constants'
import {debounce} from 'lodash'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import fileFormatType from '@staticData/fileFormatType'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {useFormik} from 'formik'
import {IFile} from '../SmileSimulation'
import CrossIcon from 'assets/icons/CrossIcon'
const environment = process.env.REACT_APP_BASE_ENVIRONMENT

interface FormValues {
  files: File[]
}

const FileUploaderSmileSimulation = ({
  fileUrls,
  setFileUrls,
  setSmileSimulatedResponse,
}: {
  fileUrls: IFile | null
  accept: string
  setFileUrls: (files: IFile | null) => void
  setSmileSimulatedResponse: (smileSimulatedResponse: string | null) => void
}) => {
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const {subscriptionData} = useSubscriptionDetails()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const formik = useFormik<FormValues>({
    initialValues: {files: []},
    onSubmit: async (values) => {
      setUploading(true)
      setUploadProgress(0)
      const file = values.files[0]
      const currentDateTimestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const updatedFile = new File([file], `${environment}_${currentDateTimestamp}_${file.name}`, {
        type: file.type,
        lastModified: file.lastModified,
      })

      const formData = new FormData()
      formData.append('input_image', updatedFile)

      try {
        const response = await apiHelper(
          URL_POST_SMILE_SIMULATION +
            `?doctor_id=${userId}&profile_id=${profileId}&organization_id=${organizationId}`,
          HttpMethod.POST,
          formData,

          true,

          {
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
                : 0
              setUploadProgress(progress)
            },
          },
          'arraybuffer'
        )

        const imageBlob = new Blob([response.data], {type: 'image/jpeg'})
        const imageUrl = URL.createObjectURL(imageBlob)
        setSmileSimulatedResponse(imageUrl)
        setUploading(false)
      } catch (error) {
        AntdMessage({text: `${values.files[0].name} file upload failed.`, type: 'error'})
        setUploading(false)
        setUploadProgress(null)
      }
    },
  })

  const handleFileChange = useCallback(
    debounce((files: File[]) => {
      if (files) {
        const validatedFileList = validateAndProcessPhotos({
          files,
          fileCount: 50,
          filesAlreadySelected: fileUrls,
          toastMessage: 'You can upload a maximum of 50 files at a time',
          chatFileFormats: fileFormatType.GALLERY_FILE_EXTENSIONS,
          maxFileSize: 50,
          availableStorage: subscriptionData?.total_storage_gb,
          usedStorage: subscriptionData?.used_storage_gb,
          invalidFileFormatMessage:
            'Invalid file format. Please upload a PDF, JPG, JPEG, PNG, MP4, or STL file only',
        })
        const currentDateTimestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const newFile = {
          url: URL.createObjectURL(validatedFileList[0]),
          type: validatedFileList[0].type,
          name: `${environment}_${currentDateTimestamp}_${validatedFileList[0].name}`,
          file: {size: validatedFileList[0].size},
        }

        formik.setFieldValue('files', validatedFileList)
        setFileUrls(newFile)
      }
    }, 300),
    [fileUrls, formik, subscriptionData]
  )

  const handleRemoveFile = () => {
    const fileInput = document.getElementById('image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
    formik.resetForm()
    setFileUrls(null)
    setSmileSimulatedResponse(null)
    setUploading(false)
    setUploadProgress(null)
  }

  return (
    <form className='flex flex-col gap-4'>
      <input
        style={{position: 'absolute', opacity: 0}}
        type='file'
        id='image'
        multiple
        accept='.jpg, .jpeg, .png'
        onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
        className='cursor-pointer'
      />
      <div className='w-full flex flex-wrap gap-3 justify-between items-center'>
        <label
          className='w-full flex items-center bg-primarySupport border p-4 rounded-lg border-primaryColor gap-2 cursor-pointer'
          htmlFor='image'
        >
          <ClaudUploadIcon width='24' height='24' color={getColorPalette().primaryColor} />
          <div className='w-full flex flex-col'>
            <div className='font-semibold text-base'>Upload image and generate simulation</div>
            <div className='font-normal text-textColor text-sm'>
              Max file size = 200 MB • JPG, JPEG, PNG.
            </div>
          </div>
        </label>
        <div className='w-full flex justify-end gap-4'>
          <AntdButton
            disabled={uploadProgress === 100 || fileUrls === null}
            onClick={() => formik.handleSubmit()}
            text='Generate'
            className='w-20 bg-primaryColor hover:!bg-primaryColor'
          />
          <AntdButton
            disabled={fileUrls === null}
            icon={<ArrowCounterClockwiseIcon />}
            onClick={() => handleRemoveFile()}
            text='Reset'
            className='w-20 bg-white hover:!bg-white text-textColor hover:!text-textColor border border-mediumGray'
          />
        </div>
      </div>

      {fileUrls?.url && (
        <div className='w-full flex items-start justify-between gap-4 border border-mediumGray rounded-lg p-2'>
          <div className='w-full flex gap-4 items-center '>
            <Image
              src={fileUrls.url}
              alt={fileUrls.name}
              width={48}
              height={48}
              className='rounded-lg border border-mediumGray object-cover min-w-12 min-h-12'
            />
            <div className='w-full'>
              <div className='md:w-full w-64  text-base font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap'>
                {fileUrls?.name}
              </div>

              {uploadProgress !== null ? (
                <Progress
                  percent={uploadProgress}
                  status={uploading ? 'active' : 'success'}
                  className='w-full'
                />
              ) : (
                <div className='w-full text-sm font-normal text-textColor'>
                  {Math.round(fileUrls?.file?.size / 1024)} KB
                </div>
              )}
            </div>
          </div>
          <button
            className='float-end'
            type='button'
            onClick={() => {
              handleRemoveFile()
            }}
          >
            <CrossIcon />
          </button>
        </div>
      )}
    </form>
  )
}

export default FileUploaderSmileSimulation
