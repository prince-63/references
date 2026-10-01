import {Modal} from 'antd'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import FormikInput from 'components/atom/Inputs/FormikInput'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {Formik} from 'formik'
import {useContext, useEffect, useMemo, useState} from 'react'
import {getImageUrl, openDocument, safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import {SVG_CLOUD, SVG_CROSS} from 'utils/SvgConstants'
import * as Yup from 'yup'
import {Image} from 'assets/images/Images/Image'
import pdfPng from 'assets/images/Pdf.png'
import mp4Png from 'assets/images/mp4.png'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import fileFormatType from '@staticData/fileFormatType'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {
  postShippingDetails,
  setOpenShippingDetailsModal,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import moment from 'moment'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {useParams} from 'react-router-dom'
import dayjs from 'dayjs'
import Spinner from 'components/spinner/Spinner'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useManufacturingDetails} from '../hooks/useManufacturingDetails'
import {ManufacturingDetailsCard} from './ManufacturingDetailsCard'
import {ManufacturingItem} from '../types/GettingStarted.types'
import PDFWebview from '../../files/components/PDFWebview'
import {PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {deleteFiles} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import userTypes from '@constants/userTypes'
import {AuthContext} from 'context/AuthContext'

/* -------------------- VALIDATION -------------------- */
const schema = Yup.object().shape({
  shipping_date: Yup.string().nullable(),
  tentative_date: Yup.string().required('Tentative date is required'),
  tracking_link: Yup.string().nullable(),
  tracking_number: Yup.string().nullable(),
})

/* ===========================================================
   MAIN COMPONENT
   =========================================================== */
const AddShippingModal = ({
  openModal,
  refreshData,
  shippingDetail,
}: {
  openModal: boolean
  refreshData: () => void
  shippingDetail?: ManufacturingItem | null
}) => {
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const {userId} = useContext(AuthContext)

  const {subscriptionData} = useSubscriptionDetails()
  const {dispatchAction} = useDispatchAction()
  const {patientId: id} = useParams()
  const {order} = useSelector((state: RootState) => state.orders)
  const patientId = order?.patient_details?.id ?? id

  const {latest_manufacturing_data: defaultShippingDetails, loading} = useManufacturingDetails({})
  const {manufacturingListData} = useSelector((state: RootState) => state.GettingStartedOverview)

  const {getAllTask} = useSelector((state: RootState) => state.workFlow)

  const normalizedAllTaskList = useMemo<PatientTaskDetails[]>(() => {
    if (!getAllTask) return []
    return getAllTask
  }, [getAllTask])

  const packagedSubTasks = useMemo(() => {
    if (!normalizedAllTaskList.length) return []
    return normalizedAllTaskList.filter(
      (task) =>
        task.parent_task_id &&
        task.manufacturing_batch_response?.latest_batch_manufacturing_status === 'COMPLETED'
    )
  }, [normalizedAllTaskList])

  const manufacturingId = useMemo<number | null>(() => {
    if (!packagedSubTasks.length) return null
    const subTask = packagedSubTasks.find((task) =>
      hasValue(task.manufacturing_sub_task_response?.manufacturing_id)
    )
    return subTask?.manufacturing_sub_task_response?.manufacturing_id ?? null
  }, [packagedSubTasks])

  /* -------------------- PDF VIEWER -------------------- */
  const [pdfViewer, setPdfViewer] = useState({
    isOpen: false,
    url: '',
    fileName: '',
  })

  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName: fileName ?? '',
    })
  }

  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }

  /* -------------------- SHIPPING DETAILS -------------------- */
  const shipping_details =
    shippingDetail ??
    manufacturingListData?.processed_manufacturing?.slice(-1)[0] ??
    defaultShippingDetails

  /* ===========================================================
      FILE HANDLING STATE
     =========================================================== */

  // backend existing files → "file_id" expected
  const existingFiles: any[] =
    shipping_details?.documents?.map((file) => ({
      ...file,
      url: file.url,
      file_id: file.file_id,
      isNew: false,
      extension: file.extension,
      type: file.type,
      name: file.name,
    })) ?? []

  const [files, setFiles] = useState<any[]>(existingFiles)

  // list of backend file_ids to delete ON SUBMIT
  const [filesMarkedForDeletion, setFilesMarkedForDeletion] = useState<number[]>([])

  useEffect(() => {
    setFiles(existingFiles)
  }, [shipping_details])

  /* -------------------- FILE UPLOAD HANDLER -------------------- */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, formik: any) => {
    if (!event.currentTarget.files?.length) return

    const existing = formik.values.files || []
    const incoming = Array.from(event.currentTarget.files)

    const timestampFiles = incoming.map((file) => {
      const timestamp = Date.now()
      const renamed = new File([file], `${timestamp}-${file.name}`, {
        type: file.type,
      })
      return renamed
    })

    const combinedFiles = [...existing, ...timestampFiles]

    const validatedFileList = validateAndProcessPhotos({
      files: combinedFiles,
      fileCount: 6,
      toastMessage: 'You can upload a maximum of 5 files at a time',
      chatFileFormats: fileFormatType.CHAT_FILE_EXTENSIONS,
      maxFileSize: 50,
      availableStorage: subscriptionData?.total_storage_gb,
      usedStorage: subscriptionData?.used_storage_gb,
    })

    // update formik
    const newFiles = Array.from(validatedFileList)
    formik.setFieldValue('files', newFiles)

    const urls = newFiles.map((file) => {
      const existingFile = files.find((f) => f.name === file.name)
      if (existingFile) return existingFile // backend

      return {
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        extension: file.name.split('.').pop(),
        isNew: true,
        raw: file,
      }
    })

    setFiles(urls)
  }

  /* -------------------- REMOVE FILE -------------------- */
  const handleRemoveFile = (index: number, formik: any) => {
    const file = files[index]

    // Existing backend file → mark for deletion
    if (!file.isNew && file.file_id) {
      setFilesMarkedForDeletion((prev) => [...prev, file.file_id])
    }

    // Remove visually
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)

    // Remove from formik.files
    const updatedFormikFiles = formik.values.files.filter((_: any, i: number) => i !== index)
    formik.setFieldValue('files', updatedFormikFiles)
  }

  /* -------------------- CLEAR ALL -------------------- */
  const handleClearAll = (formik: any) => {
    const backendFileIds = files.filter((f) => !f.isNew && f.file_id).map((f) => f.file_id)

    setFilesMarkedForDeletion((prev) => [...prev, ...backendFileIds])

    setFiles([])
    formik.setFieldValue('files', [])
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{
        shipping_date: shipping_details?.shipped_on ?? '',
        tentative_date: shipping_details?.tentative_delivery_date ?? '',
        tracking_link: shipping_details?.tracking_link ?? '',
        tracking_number: shipping_details?.tracking_number ?? '',
        files: existingFiles.map((f) => f.raw ?? new File([], f.name)),
      }}
      validationSchema={schema}
      onSubmit={async (values, {resetForm}) => {
        const resolvedManufacturingId =
          manufacturingId ?? safeParseInt(shipping_details?.manufacturing_batch_id)

        /* -------- DELETE BACKEND FILES ONLY ON SUBMIT -------- */
        if (filesMarkedForDeletion.length > 0) {
          const deletePayload = {
            deleter: {
              user_id: safeParseInt(userId),
              user_type: userTypes.DOCTOR,
            },
            owner: {
              user_id: safeParseInt(patientId),
              user_type: userTypes.PATIENT,
            },
            delete_context: 'SHIPPING',
            context_id: resolvedManufacturingId,
            files_to_delete_by_id: filesMarkedForDeletion,
          }

          await dispatchAction(deleteFiles(deletePayload))
        }

        /* -------- SUBMIT SHIPPING DETAILS -------- */
        const payload = {
          details: {
            status: 'SHIPPED',
            shipping_date: values?.shipping_date
              ? moment(values.shipping_date).format('YYYY-MM-DD')
              : null,
            manufacturing_id: resolvedManufacturingId,
            tentative_delivery_date: moment(values.tentative_date).format('YYYY-MM-DD'),
            tracking_number: values.tracking_number || '',
            tracking_link: values.tracking_link,
            patient_id: safeParseInt(patientId),
            shipping_added_on: hasValue(shipping_details?.tentative_delivery_date)
              ? null
              : moment().format('YYYY-MM-DD'),
          },

          files: values.files.filter((f) => f instanceof File),
        }

        await dispatchAction(postShippingDetails(payload))

        dispatchAction(setOpenShippingDetailsModal(false))
        setFiles([])
        setFilesMarkedForDeletion([])
        resetForm()
        refreshData()
      }}
    >
      {(formik) => (
        <>
          {pdfViewer.isOpen && (
            <PDFWebview
              pdfUrl={pdfViewer.url}
              onBack={handleClosePDF}
              fileName={pdfViewer.fileName}
            />
          )}

          {!pdfViewer.isOpen && (
            <Modal
              closable={false}
              destroyOnClose
              centered
              open={openModal}
              className='md:w-[566px] w-full'
              maskClosable={false}
              width={566}
              footer={
                <div className='flex gap-2 px-5 pb-5'>
                  <button
                    className='w-full text-textColor border border-mediumGray py-3 px-6 rounded-lg font-semibold'
                    type='button'
                    onClick={() => {
                      formik.resetForm()
                      setFiles([])
                      setFilesMarkedForDeletion([])
                      dispatchAction(setOpenShippingDetailsModal(false))
                    }}
                  >
                    Cancel
                  </button>

                  <AntdButton
                    className='w-full text-white !bg-primaryColor h-12 rounded-lg'
                    isLoading={formik.isSubmitting}
                    disabled={formik.isSubmitting}
                    text='Submit'
                    htmlType='submit'
                    onClick={() => formik.handleSubmit()}
                  />
                </div>
              }
            >
              {loading && (
                <div className='flex flex-col justify-center items-center gap-5 w-full absolute'>
                  <Spinner loading color='white' />
                </div>
              )}

              {/* IMAGE VIEWER */}
              <When isTrue={isShowPhotos}>
                <ImageViewer
                  setIsShowPhotos={setIsShowPhotos}
                  selectedImagesList={files?.map((file, index) => ({
                    id: index,
                    src: getImageUrl(file),
                    width: '100%',
                    height: '100%',
                  }))}
                  selectedIndex={selectedIndex}
                />
              </When>

              <div className='flex flex-col gap-4 p-5'>
                <div className='flex flex-col gap-4'>
                  <div className='md:text-2xl text-xl font-semibold'>Shipping details</div>
                </div>

                {hasValue(shipping_details) && (
                  <ManufacturingDetailsCard
                    totalAligners={shipping_details?.total_aligners}
                    upperJaw={{
                      start: shipping_details?.upper_aligner_start,
                      end: shipping_details?.upper_aligner_end,
                    }}
                    lowerJaw={{
                      start: shipping_details?.lower_aligner_start,
                      end: shipping_details?.lower_aligner_end,
                    }}
                    borderBottomOnly
                  />
                )}

                <div className='flex flex-col gap-3'>
                  <FormikDatePicker
                    name='shipping_date'
                    label='Shipping date'
                    placeholder='DD-MM-YYYY'
                    format='DD-MM-YYYY'
                    minDate={dayjs()}
                  />

                  <FormikDatePicker
                    name='tentative_date'
                    label='Tentative date'
                    placeholder='DD-MM-YYYY'
                    required
                    format='DD-MM-YYYY'
                    minDate={dayjs()}
                  />

                  <FormikInput
                    name='tracking_link'
                    label='Tracking link'
                    placeholder='Paste link'
                  />

                  <FormikInput
                    name='tracking_number'
                    label='Tracking number'
                    placeholder='Tracking number'
                  />

                  {/* FILE UPLOAD BLOCK */}
                  <div>
                    <div className='flex justify-between mb-2 items-center'>
                      <p className='text-base font-medium text-textColor'>
                        Upload documents (if any)
                      </p>

                      <When isTrue={files.length > 0}>
                        <button
                          type='button'
                          className='text-secondaryColor text-sm font-medium text-right'
                          onClick={() => handleClearAll(formik)}
                        >
                          Clear all
                        </button>
                      </When>
                    </div>
                  </div>
                  {hasValue(shipping_details) && (
                    <ManufacturingDetailsCard
                      totalAligners={shipping_details?.total_aligners}
                      upperJaw={{
                        start: shipping_details?.upper_aligner_start,
                        end: shipping_details?.upper_aligner_end,
                      }}
                      lowerJaw={{
                        start: shipping_details?.lower_aligner_start,
                        end: shipping_details?.lower_aligner_end,
                      }}
                      borderBottomOnly={true}
                    />
                  )}
                  <div className='flex flex-col gap-3'>
                    <FormikDatePicker
                      name='shipping_date'
                      label='Shipping date'
                      placeholder='DD-MM-YYYY'
                      format='DD-MM-YYYY'
                      minDate={dayjs()}
                    />
                    <FormikDatePicker
                      name='tentative_date'
                      label='Tentative date'
                      placeholder='DD-MM-YYYY'
                      required
                      format='DD-MM-YYYY'
                    />

                    {/* If no files uploaded yet */}
                    <When isTrue={!hasValue(files)}>
                      <div className='flex justify-center items-center cursor-pointer relative border border-mediumGray rounded-lg p-4'>
                        <input
                          name='files'
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            opacity: 0,
                          }}
                          type='file'
                          multiple
                          accept='.jpg, .jpeg, .png, .pdf, .mp4, .mov'
                          onChange={(e) => handleFileChange(e, formik)}
                        />
                        <label className='p-3 cursor-pointer flex-col justify-center items-center'>
                          <div className='flex flex-col justify-center items-center gap-2'>
                            <CommonSVG svg={SVG_CLOUD} width='24' height='19' />
                            <p className='text-base font-medium text-textColor'>Click to upload</p>
                          </div>
                        </label>
                      </div>
                    </When>

                    {/* Files Preview */}
                    <When isTrue={hasValue(files)}>
                      <div className='flex flex-col md:flex-row md:flex-wrap w-full gap-4 md:gap-10 justify-start'>
                        {files.map((file, index) => (
                          <div key={index} className='relative gap-2'>
                            <div
                              className='flex items-center justify-center absolute bg-mediumGray rounded-full w-4 h-4 cursor-pointer left-8'
                              onClick={() => handleRemoveFile(index, formik)}
                            >
                              <CommonSVG svg={SVG_CROSS} width='20' height='20' />
                            </div>

                            <div
                              className='flex items-center justify-between gap-4 cursor-pointer'
                              onClick={() => {
                                if (file.extension === 'mp4' || file.type === 'video/mp4') {
                                  openDocument(file.url)
                                } else if (
                                  file.extension === 'pdf' ||
                                  file.type === 'application/pdf'
                                ) {
                                  handleOpenPDF(file.url)
                                } else {
                                  setIsShowPhotos(true)
                                  setSelectedIndex(index)
                                }
                              }}
                            >
                              {/* IMAGE */}
                              <When isTrue={file.extension !== 'mp4' && file.extension !== 'pdf'}>
                                <Image
                                  src={getImageUrl(file)}
                                  alt='Uploaded file'
                                  className='w-12 h-12 rounded-[4px] border border-mediumGray object-cover cursor-pointer'
                                  size={20}
                                  showLoading
                                />
                              </When>

                              {/* MP4 */}
                              <When isTrue={file.extension === 'mp4' || file.type === 'video/mp4'}>
                                <Image
                                  className='w-12 h-12 rounded-[4px] object-cover cursor-pointer border border-mediumGray'
                                  src={mp4Png}
                                  size={20}
                                />
                              </When>

                              {/* PDF */}
                              <When
                                isTrue={file.extension === 'pdf' || file.type === 'application/pdf'}
                              >
                                <Image
                                  className='w-12 h-12 rounded-[4px] object-cover cursor-pointer border border-mediumGray'
                                  src={pdfPng}
                                  size={20}
                                />
                              </When>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Upload More */}
                      <When isTrue={formik.values.files.length < 5}>
                        <div className='w-[139px] h-10 border border-primaryColor rounded-lg flex justify-center items-center cursor-pointer relative mt-3'>
                          <input
                            style={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              opacity: 0,
                            }}
                            type='file'
                            multiple
                            accept='.jpg, .jpeg, .png, .pdf, .mp4, .mov'
                            onChange={(e) => handleFileChange(e, formik)}
                          />
                          <label className='p-3 cursor-pointer flex-col justify-center items-center'>
                            <div className='flex flex-row gap-2 justify-center items-center'>
                              <CommonSVG svg={SVG_CLOUD} width='22' height='18' />
                              <p className='text-sm font-semibold text-primaryColor'>Upload file</p>
                            </div>
                          </label>
                        </div>
                      </When>
                    </When>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </Formik>
  )
}

export default AddShippingModal
