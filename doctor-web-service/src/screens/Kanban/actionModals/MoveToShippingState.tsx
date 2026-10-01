import {Modal} from 'antd'
import clsx from 'clsx'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import FormikInput from 'components/atom/Inputs/FormikInput'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {Formik} from 'formik'
import {useContext, useState} from 'react'
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
  getManufacturingListDetails,
  postShippingDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import moment from 'moment'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import Spinner from 'components/spinner/Spinner'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useManufacturingDetails} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import {IVideoFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {ManufacturingDetailsCard} from 'screens/Patients/LeadsProfile/main/overview/components/ManufacturingDetailsCard'
import {
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  setIsOpenShippingOrderModal,
  setIsVspKanbanMovement,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {AuthContext} from 'context/AuthContext'
import {getTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {postVspProductionShipping} from '@utils/vspProductionShipping'
import {getVspProductionId, updateVspProductionStatus} from './helpers/vspKanbanMovement'

const schema = Yup.object().shape({
  shipping_date: Yup.string().nullable(), // Optional
  tentative_date: Yup.string().required('Tentative date is required'),
  tracking_link: Yup.string().nullable(), // Optional
  tracking_number: Yup.string().nullable(), // Optional
})

type MoveToShippingStateProps = {
  onSuccess?: () => void
}
const MoveToShippingState = ({onSuccess}: MoveToShippingStateProps) => {
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const {subscriptionData} = useSubscriptionDetails()
  const {dispatchAction} = useDispatchAction()
  const {latest_manufacturing_data: shipping_details, loading} = useManufacturingDetails({})
  const {isOpenShippingOrderModal, cardDetails, dynamicWorkflowStatusId, isVspKanbanMovement} =
    useSelector((state: RootState) => state.kanban)
  const {userId} = useContext(AuthContext)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false

  const refreshTaskBoard = () => {
    if (!cardDetails?.workflow_name) return Promise.resolve()
    return dispatchAction(
      getPatientTaskTrackerFiltered({
        doctor_id: safeParseInt(userId),
        order_type: 'ALIGNER',
        workflow_name: cardDetails.workflow_name,
        page_number: 0,
        page_size: 10,
         sort:'UPDATED_ON',
         "order": "DESC"
      })
    ).unwrap()
  }

  const moveCardToShipState = () => {
    if (
      !dynamicWorkflowStatusId ||
      !cardDetails?.id ||
      !cardDetails?.patient_id ||
      !cardDetails?.workflow_id
    ) {
      return refreshTaskBoard()
    }

    return dispatchAction(
      moveTaskCard({
        task_id: safeParseInt(cardDetails.id),
        doctor_id: safeParseInt(userId),
        workflow_status_id: dynamicWorkflowStatusId,
        patient_id: safeParseInt(cardDetails.patient_id),
        workflow_id: safeParseInt(cardDetails.workflow_id),
        is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
      })
    )
      .unwrap()
      .then(() => refreshTaskBoard())
  }

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

  const filesToSave: File[] =
    shipping_details && Array.isArray(shipping_details?.documents)
      ? shipping_details.documents.map((file) => new File([], file.name ?? ''))
      : []

  const [files, setFiles] = useState<Partial<IVideoFile>[]>(shipping_details?.documents ?? [])

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        shipping_date: shipping_details?.shipped_on ?? '',
        tentative_date: shipping_details?.tentative_delivery_date ?? '',
        tracking_link: shipping_details?.tracking_link ?? '',
        tracking_number: shipping_details?.tracking_number ?? '',
        files: filesToSave,
      }}
      validationSchema={schema}
      onSubmit={async (values) => {
        dispatchAction(setIsOpenShippingOrderModal(false))
        const formattedShippingDate = values?.shipping_date
          ? moment(values?.shipping_date).format('YYYY-MM-DD')
          : null
        const formattedTentativeDate = moment(values?.tentative_date).format('YYYY-MM-DD')
        const trimmedTrackingNumber = String(values?.tracking_number ?? '').trim()
        const trimmedTrackingLink = values.tracking_link?.trim() ?? ''

        const payload = {
          details: {
            status: 'SHIPPED',
            shipping_date: formattedShippingDate,
            manufacturing_id: safeParseInt(cardDetails?.manufacturing_batch_id),
            tentative_delivery_date: formattedTentativeDate,
            tracking_number: trimmedTrackingNumber,
            tracking_link: trimmedTrackingLink,
            patient_id: safeParseInt(cardDetails?.patient_id),
            shipping_added_on: hasValue(shipping_details?.tentative_delivery_date)
              ? null
              : moment().format('YYYY-MM-DD'),
          },
          files: values.files,
        }

        try {
          // VSP movement
          if (serviceConfig?.VSP_PLANNING && isVspKanbanMovement) {
            const productionId = await getVspProductionId({
              orderId: cardDetails?.order_id,
              patientId: cardDetails?.patient_id,
              doctorId: userId,
            })

            if (!productionId) {
              ErrorToast('Unable to find shipping details for this case.')
              return
            }

            await postVspProductionShipping({
              production_id: productionId,
              tracking_number: trimmedTrackingNumber,
              tentative_date: formattedTentativeDate,
              tracking_link: trimmedTrackingLink,
              shipping_date: formattedShippingDate,
            })
            await updateVspProductionStatus(productionId, 'SHIPPED')
            await refreshTaskBoard()
            onSuccess?.()
            return
          }

          await dispatchAction(postShippingDetails(payload)).unwrap()
          await dispatchAction(
            getTreatmentPlanList({
              doctor_id: userId ?? '',
              patient_id: String(cardDetails?.id ?? ''),
              treatment_subtype: subTreatmentTypeConstants.ALIGNERS,
            })
          ).unwrap()
          await dispatchAction(
            getManufacturingListDetails({
              patient_id: safeParseInt(cardDetails?.patient_id),
              treatment_plan_id: safeParseInt(
                cardDetails?.manufacturing_batch_response?.treatment_plan_id
              ),
            })
          ).unwrap()
          await moveCardToShipState()
        } finally {
          dispatchAction(setIsVspKanbanMovement(false))
          onSuccess?.()
        }
      }}
    >
      {(formik) => {
        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          if (event.currentTarget.files && event.currentTarget.files.length > 0) {
            const existingFiles = formik.values.files || []
            const timestampAppendedFiles = Array.from(event.currentTarget.files).map((file) => {
              const timestamp = Date.now()
              const newFile = new File([file], `${timestamp}-${file.name}`, {
                type: file.type,
              })
              return newFile
            })
            const combinedFiles = [...existingFiles, ...timestampAppendedFiles]
            const validatedFileList = validateAndProcessPhotos({
              files: combinedFiles,
              fileCount: 6,
              toastMessage: 'You can upload a maximum of 5 files at a time',
              chatFileFormats: fileFormatType.CHAT_FILE_EXTENSIONS,
              maxFileSize: 50,
              availableStorage: subscriptionData?.total_storage_gb,
              usedStorage: subscriptionData?.used_storage_gb,
            })

            const newFiles = Array.from(validatedFileList)
            formik.setFieldValue('files', newFiles)

            const urls = newFiles.map((file) => {
              const existingFileUrl = files?.find((f) => f.name === file.name)
              if (existingFileUrl?.url) {
                return existingFileUrl
              }
              return {
                url: URL.createObjectURL(file),
                type: file.type,
                name: file.name,
                extension: file.name.split('.').pop(),
              }
            })
            setFiles(urls)
          }
        }

        const handleRemoveFile = (index: number) => {
          const newFiles = [...formik.values.files]
          newFiles.splice(index, 1)
          formik.setFieldValue('files', newFiles)

          const newFileUrls = [...files]
          newFileUrls.splice(index, 1)
          setFiles(newFileUrls)
        }

        return (
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
                destroyOnClose={true}
                centered={true}
                open={isOpenShippingOrderModal}
                className={clsx('md:w-[566px] w-full')}
                maskClosable={false}
                width={566}
                footer={
                  <div className={clsx('flex gap-2 px-5 pb-5')}>
                    <button
                      className={clsx(
                        'w-full text-textColor border border-mediumGray py-3 px-6 rounded-lg font-semibold'
                      )}
                      type='button'
                      onClick={() => {
                        dispatchAction(setIsOpenShippingOrderModal(false))
                        if (serviceConfig?.VSP_PLANNING && isVspKanbanMovement) {
                          dispatchAction(setIsVspKanbanMovement(false))
                          refreshTaskBoard().then(() => {
                            setFiles([])
                            formik?.resetForm()
                          })
                          return
                        }
                        dispatchAction(setIsVspKanbanMovement(false))
                        dispatchAction(
                          moveTaskCard({
                            task_id: safeParseInt(cardDetails?.id),
                            doctor_id: safeParseInt(userId),
                            workflow_status_id: safeParseInt(
                              cardDetails?.current_workflow_status_id
                            ),
                            patient_id: safeParseInt(cardDetails?.patient_id),
                            workflow_id: safeParseInt(cardDetails?.workflow_id),
                            is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
                          })
                        )
                          .unwrap()
                          .then(() => {
                            // Refresh board
                            dispatchAction(
                              getPatientTaskTrackerFiltered({
                                doctor_id: safeParseInt(userId),
                                order_type: 'ALIGNER',
                                workflow_name: cardDetails.workflow_name,
                                page_number: 0,
                                page_size: 10,
                                 sort:'UPDATED_ON',
                                 "order": "DESC"
                              })
                            )
                              .unwrap()
                              .then(() => {
                                setFiles([])
                                formik?.resetForm()
                              })
                          })
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
                {' '}
                {loading && (
                  <div className='flex flex-col justify-center items-center gap-5 w-full absolute'>
                    <Spinner loading color='white' />
                  </div>
                )}
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
                    <div className={clsx('md:text-2xl text-xl font-semibold')}>
                      Shipping details
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
                    />
                    <FormikDatePicker
                      name='tentative_date'
                      label='Tentative date'
                      placeholder='DD-MM-YYYY'
                      required
                      format='DD-MM-YYYY'
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

                    {!isVspPlanning && (
                      <div className=''>
                        <div className='flex justify-between mb-2 items-center'>
                          <p className='text-base font-medium text-textColor'>
                            Upload documents (if any)
                          </p>
                          <When isTrue={files?.length > 0}>
                            <button
                              type='button'
                              className='text-secondaryColor text-sm font-medium text-right'
                              onClick={() => {
                                formik.setFieldValue('files', [])
                                setFiles([])
                              }}
                            >
                              Clear all
                            </button>
                          </When>
                        </div>

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
                              id='image'
                              multiple
                              accept='.jpg, .jpeg, .png, .pdf, .mp4, .mov'
                              onChange={handleFileChange}
                              className='cursor-pointer'
                            />
                            <label
                              htmlFor='image'
                              className='p-3 cursor-pointer flex-col justify-center items-center'
                            >
                              <div className='flex flex-col justify-center items-center gap-2'>
                                <CommonSVG svg={SVG_CLOUD} width='24' height='19' />
                                <p className='text-base font-medium text-textColor'>
                                  Click to upload
                                </p>
                              </div>
                            </label>
                          </div>
                        </When>
                        <When isTrue={hasValue(files)}>
                          <div className='flex flex-col md:flex-row md:flex-wrap w-full gap-4 md:gap-10 justify-between '>
                            {files?.map((file, index) => (
                              <div key={index} className='relative gap-2 '>
                                <div
                                  className='flex items-center justify-center absolute bg-mediumGray rounded-full w-4 h-4 cursor-pointer left-8'
                                  onClick={() => {
                                    handleRemoveFile(index)
                                  }}
                                >
                                  <CommonSVG svg={SVG_CROSS} width='20' height='20' />
                                </div>
                                <div
                                  className='flex items-center justify-between gap-4 cursor-pointer'
                                  onClick={() => {
                                    if (file.extension === 'mp4' || file.extension === 'pdf') {
                                      handleOpenPDF(file.url ?? '')
                                    } else {
                                      setIsShowPhotos(true)
                                      setSelectedIndex(index)
                                    }
                                  }}
                                >
                                  <When
                                    isTrue={
                                      file.type !== 'application/pdf' &&
                                      file.type !== 'video/mp4' &&
                                      file.extension !== 'mp4' &&
                                      file.extension !== 'pdf'
                                    }
                                  >
                                    <Image
                                      src={getImageUrl(file)}
                                      alt='Uploaded file '
                                      className='w-12 h-12 rounded-[4px] border border-mediumGray object-cover cursor-pointer'
                                      onClick={() => {
                                        setIsShowPhotos(true)
                                        setSelectedIndex(index)
                                      }}
                                      size={20}
                                      showFileName={true}
                                      showLoading={true}
                                    />
                                  </When>
                                  <When
                                    isTrue={file.type === 'video/mp4' || file.extension === 'mp4'}
                                  >
                                    <Image
                                      className='w-12 h-12 rounded-[4px] object-cover cursor-pointer border border-mediumGray'
                                      onClick={() => openDocument(file?.url ?? '')}
                                      size={20}
                                      src={mp4Png}
                                    />
                                  </When>
                                  <When
                                    isTrue={
                                      file.type === 'application/pdf' || file.extension === 'pdf'
                                    }
                                  >
                                    <Image
                                      className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer border border-mediumGray'
                                      onClick={() => handleOpenPDF(file.url ?? '')}
                                      size={20}
                                      src={pdfPng}
                                    />
                                  </When>
                                </div>
                              </div>
                            ))}
                          </div>
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
                                id='image'
                                multiple
                                accept='.jpg, .jpeg, .png, .pdf, .mp4, .mov'
                                onChange={handleFileChange}
                              />
                              <label
                                htmlFor='image'
                                className='p-3 cursor-pointer flex-col justify-center items-center'
                              >
                                <div className='flex flex-row gap-2 justify-center items-center '>
                                  <CommonSVG svg={SVG_CLOUD} width='22' height='18' />
                                  <p className='text-sm font-semibold text-primaryColor'>
                                    Upload file
                                  </p>
                                </div>
                              </label>
                            </div>
                          </When>
                        </When>
                      </div>
                    )}
                  </div>
                </div>
              </Modal>
            )}
          </>
        )
      }}
    </Formik>
  )
}

export default MoveToShippingState
