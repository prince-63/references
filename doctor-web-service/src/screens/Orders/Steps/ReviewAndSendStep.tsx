import Page from 'components/page/Page'
import FooterRedesigned from '../components/FooterRedesigned'
import useDispatchAction from '@hooks/useDispatchAction'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import ConditionalDetail from 'components/when/ConditionalDetail'
import LabelValuePairVertical from 'components/atom/Labels/LabelValuePairVertical'
import restructureFileList from './helpers/restructureFileList'
import StlIcon from 'assets/icons/StlIcon'
import {downloadFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import When from 'components/when/When'
import CustomStlViewer from 'CustomStlViewer'
import {Key, Key, useCallback, useContext, useEffect, useRef, useState} from 'react'
import {Image, Modal} from 'antd'
import {
  getFirstLetterCapitalOfWord,
  getImageUrl,
  openDocument,
  safeParseInt,
} from 'utils/ConstFunctions'
import pdfPng from 'assets/images/Pdf.png'
import hasValue from 'utils/hasValue'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {
  SELECT_SPECIFIC_TOOTH,
  SPECIFY_MIDLINE_INSTRUCTIONS,
} from './helpers/prescriptionFormOptions'
import userOrderDetails from '../hooks/userOrderDetails'
import {needMoreInfo} from 'redux/Slices/AppSlice/orders/orders.slice'
import orderStatusConstants from '@constants/orderStatus.constants'
import {AuthContext} from 'context/AuthContext'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {useNavigate, useSearchParams} from 'react-router-dom'
import mp4Png from 'assets/images/mp4.png'
import Tag from 'components/tags/Tag'
import DownloadIcon from 'assets/icons/DownloadIcon'
import userTypes from '@constants/userTypes'
import Spinner from 'components/spinner/Spinner'
import {flatten} from 'ramda'
import {downloadBlob} from 'utils/download'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import JSZip from 'jszip'
import ObjIcon from 'assets/icons/ObjIcon'
import PlyIcon from 'assets/icons/PlyIcon'
import InfoToast from 'components/modal/Alert/InfoToast'
import getBrandConfig from 'utils/getBrandConfig'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useCreateOrder from '@hooks/useCreateOrder'
import SubmitToLabModal from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/components/SubmitToLabModal'
import CaseSubmittedSuccessModal from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/components/CaseSubmittedSuccessModal'
import {
  changeWorkFlow,
  getKanbanCountsByProfile,
  getNewTreatmentList,
  setIsOpenMoveToPlanningStateModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import caseTypes from '@constants/caseTypes'
import {getSingleCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {getIndividualTask} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {cleanAddress} from './helpers/removeCityStatePincode'
import {Send, User, ClipboardList, FolderOpen, FileText, Truck} from 'lucide-react'
import {ProductCard} from 'screens/PatientDetailsOverview.tsx/pages/PatientOrderView'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {getEnvVariable, sanitizeBaseUrl} from 'utils/envUtils'

const CARD_CLASS_NAME =
  'py-4 !px-5 gap-2 rounded-2xl border-mediumGray/60 shadow-sm hover:shadow-md transition-shadow'
const PRESCRIPTION_ITEM_LABEL_CLASS_NAME = 'text-black text-base font-semibold'
const brandConfig = getBrandConfig()
const FORM_ID = brandConfig.formId
const brand = brandConfig.brand.toLowerCase().replace(/\s+/g, '')
const form_env_type = process.env.REACT_APP_FORM_ENV_TYPE
const FORM_BUILDER_URL = sanitizeBaseUrl(getEnvVariable('REACT_APP_FORM_BUILDER_URL'))
const EMBED_URL = FORM_BUILDER_URL
  ? `${FORM_BUILDER_URL}/embed/${FORM_ID}/${form_env_type}/${brand}`
  : ''
const targetOrigin = FORM_BUILDER_URL ? new URL(FORM_BUILDER_URL).origin : ''
const IFRAME_LOAD_DELAY_MS = 800

const ReviewAndSendStep = ({isViewOrderPage}: {isViewOrderPage?: boolean}) => {
  const {dispatchAction} = useDispatchAction()
  const {order, loadingOrder} = userOrderDetails(!isViewOrderPage)
  const {isStlPreviewVisible} = useSelector((state: RootState) => state.leadsProfileFiles)
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)
  const patientDetails = order?.patient_details
  const orderDetails = order?.order_details
  const targetUserDetails = orderDetails?.target_user_details
  const orderFiles = order?.file_details
  const prescriptionDetails = order?.prescription_details
  const shippingDetails = order?.shipping_details
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const [isDownloading, setIsDownloading] = useState(false)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {isAlignerCompanyOrg, isPractice} = useAllUserPlan()
  const {handleCreateOrder, creatingOrder} = useCreateOrder()
  const labProfileId = order?.order_details?.target_user_details?.profile_id
  const {getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)
  const {productSelected: productSelectedFromState} = useSelector(
    (state: RootState) => state.productionSetup
  )
  const productSelected = productSelectedFromState ?? order?.service_products ?? null
  const {caseRecordData, loadingGetSingle} = useSelector((state: RootState) => state.caseRecord)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [fetchedCaseRecordId, setFetchedCaseRecordId] = useState<number | null>(null)
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false)
  const [hasIframeLoaded, setHasIframeLoaded] = useState(false)
  const patientId = order?.patient_details?.id
  const [searchParams] = useSearchParams()
  const isAlignerOrderFromParam = searchParams.get('is_aligner_order') === 'true'
  const isRefinement = searchParams.get('refinement') === 'true'
  const isVspCreateOrderPath = window.location.pathname.includes('vsp/create-order')
  const isCustomerCreateOrderPath = window.location.pathname.includes('customer/create-order')
  const isCreateOrderPath = isCustomerCreateOrderPath || isVspCreateOrderPath
  const createOrderBaseRoute = isVspCreateOrderPath ? '/vsp/create-order' : '/customer/create-order'
  const [isSubmitToLabModalVisible, setIsSubmitToLabModalVisible] = useState(false)
  const [isCaseSubmittedSuccessVisible, setIsCaseSubmittedSuccessVisible] = useState(false)
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null)
  useEffect(() => {
    if (!patientId) return
    dispatchAction(
      getIndividualTask({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        organization_id: safeParseInt(organizationId),
      })
    )
  }, [patientId])

  // PDF viewer state - Add this
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

  useEffect(() => {
    if (!order?.case_record_id) return
    if (order.case_record_id === fetchedCaseRecordId) return

    dispatchAction(getSingleCaseRecord(order.case_record_id))
    setFetchedCaseRecordId(order.case_record_id)
  }, [dispatchAction, order?.case_record_id, fetchedCaseRecordId])

  const caseRecordForOrder =
    caseRecordData && caseRecordData.case_record_id === order?.case_record_id
      ? caseRecordData
      : null

  const photographsFiles = caseRecordForOrder?.pre_treatment_files ?? orderFiles?.images ?? []
  const scanFiles = caseRecordForOrder?.scan_files ?? orderFiles?.scan_files ?? []
  const radiographFiles = caseRecordForOrder?.xray_files ?? orderFiles?.documents ?? []
  const hasSummaryData = hasValue(prescriptionDetails?.data)
  const TITLE_KEY_PREFIX = 'textfield_'

  useEffect(() => {
    if (!hasSummaryData) {
      setShouldLoadIframe(false)
      return
    }

    const timer = window.setTimeout(() => {
      setShouldLoadIframe(true)
    }, IFRAME_LOAD_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [hasSummaryData])

  const ensureSummaryTitle = useCallback((data?: Record<string, any> | null) => {
    if (!data || typeof data !== 'object') return data
    const textfieldKey = Object.keys(data).find((key) => key.startsWith(TITLE_KEY_PREFIX))
    if (!textfieldKey) return
    if (data?.[textfieldKey] === '') return 'Prescription'

    return data?.[textfieldKey]
  }, [])

  const postSummaryData = useCallback(() => {
    if (!hasValue(order?.prescription_details?.data)) return
    const iframeWindow = iframeRef.current?.contentWindow
    if (!iframeWindow) return
    iframeWindow.postMessage(
      {
        type: 'SummaryFormData',
        data: order?.prescription_details?.data,
      },
      targetOrigin
    )
  }, [order?.prescription_details?.data])

  useEffect(() => {
    if (!shouldLoadIframe) {
      setHasIframeLoaded(false)
      return
    }
    if (hasIframeLoaded) {
      postSummaryData()
    }
  }, [shouldLoadIframe, hasIframeLoaded, postSummaryData])

  return (
    <>
      {/* PDF Webview Modal - Add this */}
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {/* Wrap the rest of the content to hide when PDF is open */}
      {!pdfViewer.isOpen && (
        <Page
          title={!isViewOrderPage && ''}
          loading={loadingOrder || loadingGetSingle}
          containerClassName='min-h-full'
        >
          <div className='flex flex-col gap-4 min-w-3/5'>
            {/* Header */}
            {!isViewOrderPage && (
              <div className='flex items-center gap-3 mb-2'>
                <div className='w-10 h-10 rounded-xl bg-primarySupport text-primaryColor flex items-center justify-center shrink-0'>
                  <Send className='w-5 h-5' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-black'>Review & Send</h2>
                  <p className='text-sm text-textColor'>
                    Verify all details before submitting your order
                  </p>
                </div>
              </div>
            )}

            <BorderedCard
              header={{
                title: (
                  <div className='flex items-center gap-2'>
                    <User className='w-4 h-4 text-primaryColor' /> Patient details
                  </div>
                ),
              }}
              cardClassName='py-4 !px-5 gap-2 rounded-2xl border-mediumGray/60 shadow-sm hover:shadow-md transition-shadow'
              hide={isViewOrderPage}
            >
              <div className='flex flex-col'>
                <ConditionalDetail>{patientDetails?.full_name}</ConditionalDetail>
                <ConditionalDetail>
                  {getFirstLetterCapitalOfWord(patientDetails?.gender ?? '')}
                </ConditionalDetail>
                <ConditionalDetail>
                  {patientDetails?.age && `${patientDetails?.age} years`}
                </ConditionalDetail>
                <ConditionalDetail>
                  {patientDetails?.customer_mapped_id &&
                    `ID: ${patientDetails?.customer_mapped_id}`}
                </ConditionalDetail>
              </div>
            </BorderedCard>

            <BorderedCard
              header={{
                title: (
                  <div className='flex items-center gap-2'>
                    <ClipboardList className='w-4 h-4 text-primaryColor' /> Order details
                  </div>
                ),
              }}
              cardClassName='py-4 !px-5 gap-2 rounded-2xl border-mediumGray/60 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex flex-col gap-4 '>
                <LabelValuePairVertical
                  {...{
                    label: 'Order ID',
                    value: `#${order?.order_id}`,
                  }}
                />
                <LabelValuePairVertical
                  {...{
                    label: 'Lab name',
                    value: orderDetails?.target_user_details?.lab_name,
                  }}
                />

                <LabelValuePairVertical
                  {...{
                    label: 'Order type',
                    value:
                      orderDetails?.order_type === 'PLANNING_ORDER'
                        ? 'Planning Order'
                        : 'Aligner Order',
                  }}
                />

                <ProductCard
                  product={order?.service_products}
                  product_name={order?.product_name}
                  product_image={order?.product_image}
                  product_description={order?.product_description}
                />
              </div>
            </BorderedCard>

            <BorderedCard
              header={{
                title: (
                  <div className='flex justify-between'>
                    <p className='flex items-center gap-2'>
                      <FolderOpen className='w-4 h-4 text-primaryColor' /> Files
                    </p>
                    <When
                      isTrue={
                        isViewOrderPage &&
                        hasValue(
                          flatten([photographsFiles || [], scanFiles || [], radiographFiles || []])
                        )
                      }
                    >
                      <button
                        type='button'
                        onClick={async () => {
                          try {
                            if (!userId) return

                            const files = flatten([
                              photographsFiles || [],
                              scanFiles || [],
                              radiographFiles || [],
                            ])

                            if (files.length === 0) return

                            setIsDownloading(true)

                            const zip = new JSZip()

                            for (const file of files) {
                              try {
                                const response = await dispatchAction(
                                  downloadFile({
                                    requester_user_id: parseInt(userId),
                                    requester_user_type: userTypes.DOCTOR,
                                    file_id: safeParseInt(file?.file_id),
                                  })
                                ).unwrap()

                                const blob = new Blob([response], {
                                  type: file?.type || 'application/octet-stream',
                                })

                                // Use original file name or fallback
                                zip.file(file?.name || `file-${file?.file_id}.dat`, blob)
                              } catch (err) {
                                console.error(`Error downloading file_id ${file?.file_id}`, err)
                              }
                            }

                            const zipBlob = await zip.generateAsync({type: 'blob'})
                            downloadBlob(zipBlob, `Order_${order?.order_id}_files.zip`)
                          } catch (err) {
                            AntdMessage({type: 'error', text: 'Error downloading files'})
                          } finally {
                            setIsDownloading(false)
                          }
                        }}
                        className='flex gap-1 items-center text-base text-primaryColor flex-nowrap'
                      >
                        <When isTrue={!isDownloading}>
                          <DownloadIcon color='#735BF2' width={'22px'} height={'22px'} />
                        </When>
                        <When isTrue={isDownloading}>
                          <Spinner loading size={20} />
                        </When>
                        <p>Download all</p>
                      </button>
                    </When>
                  </div>
                ),
              }}
              cardClassName={CARD_CLASS_NAME}
            >
              <div className='flex flex-col gap-4'>
                <LabelValuePairVertical
                  {...{
                    label: 'Photographs',
                    value: (
                      <div className='flex flex-wrap gap-2'>
                        {hasValue(photographsFiles) ? (
                          restructureFileList(photographsFiles)?.map((file) => (
                            <Image
                              key={file.uid}
                              src={getImageUrl(file)}
                              style={{borderRadius: '8px'}}
                              height={64}
                              width={64}
                              alt={file.name}
                              placeholder={true}
                            />
                          ))
                        ) : (
                          <div className='text-textColor'>Not added</div>
                        )}
                      </div>
                    ),
                  }}
                />
                <LabelValuePairVertical
                  {...{
                    label: 'Scan files',
                    value: (
                      <div className='flex gap-2'>
                        {hasValue(scanFiles) ? (
                          scanFiles?.map((file: { file_id: Key | null | undefined; extension: string }) => (
                            <div
                              key={file.file_id}
                              onClick={(e) => {
                                e.stopPropagation()

                                InfoToast('No preview available. Please download to view file')
                              }}
                              className='cursor-pointer'
                            >
                              {file.extension === 'stl' && <StlIcon />}
                              {file.extension === 'obj' && <ObjIcon />}
                              {file.extension === 'ply' && <PlyIcon />}
                            </div>
                          ))
                        ) : (
                          <div className='text-textColor'>Not added</div>
                        )}
                      </div>
                    ),
                  }}
                />
                <LabelValuePairVertical
                  {...{
                    label: 'Radiographs',
                    value: (
                      <div className='flex gap-3 flex-wrap justify-start items-center'>
                        {hasValue(radiographFiles) ? (
                          radiographFiles?.map((file: { file_id: Key | null | undefined; url: string; full_path: string; name: string | undefined; is_gdrive_platform: any }) => (
                            <div
                              key={file.file_id}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (file.url) {
                                  // Modified PDF handling - Use webview instead of openDocument
                                  if (
                                    file.url.endsWith('.pdf') ||
                                    file.full_path.endsWith('.pdf')
                                  ) {
                                    handleOpenPDF(file.url, file.name)
                                    return
                                  }
                                  if (
                                    file.url.endsWith('.mp4') ||
                                    file.full_path.endsWith('.mp4')
                                  ) {
                                    openDocument(file.url)
                                    return
                                  }

                                  if (
                                    file.url.endsWith('.stl') ||
                                    file.url.endsWith('.obj') ||
                                    file.url.endsWith('.ply') ||
                                    file.full_path.endsWith('.stl') ||
                                    file.full_path.endsWith('.obj') ||
                                    file.full_path.endsWith('.ply')
                                  ) {
                                    InfoToast('No preview available. Please download to view file')
                                  }
                                }
                              }}
                              className='cursor-pointer'
                            >
                              <div className='flex gap-1 items-center text-textColor font-semibold text-sm '>
                                <When
                                  isTrue={
                                    file?.is_gdrive_platform
                                      ? file.full_path?.endsWith('.stl')
                                      : file.url?.endsWith('.stl')
                                  }
                                >
                                  <StlIcon />
                                </When>
                                <When
                                  isTrue={
                                    file?.is_gdrive_platform
                                      ? file.full_path?.endsWith('.obj')
                                      : file.url?.endsWith('.obj')
                                  }
                                >
                                  <ObjIcon />
                                </When>
                                <When
                                  isTrue={
                                    file?.is_gdrive_platform
                                      ? file.full_path?.endsWith('.ply')
                                      : file.url?.endsWith('.ply')
                                  }
                                >
                                  <PlyIcon />
                                </When>
                                <When
                                  isTrue={
                                    file?.is_gdrive_platform
                                      ? file.full_path?.endsWith('pdf')
                                      : file.url?.endsWith('.pdf')
                                  }
                                >
                                  <Image
                                    src={pdfPng}
                                    height={50}
                                    width={50}
                                    preview={false}
                                    alt={file.name}
                                  />
                                </When>
                                <When isTrue={file.url?.endsWith('.mp4')}>
                                  <Image
                                    src={mp4Png}
                                    height={50}
                                    width={50}
                                    preview={false}
                                    alt={file.name}
                                  />
                                </When>
                                <When
                                  isTrue={
                                    (file?.is_gdrive_platform &&
                                      !file.full_path?.endsWith('.pdf') &&
                                      !file.full_path?.endsWith('.stl') &&
                                      !file.full_path?.endsWith('.mp4')) ||
                                    (!file?.is_gdrive_platform &&
                                      !file.url?.endsWith('.pdf') &&
                                      !file.url?.endsWith('.stl') &&
                                      !file.url?.endsWith('.mp4'))
                                  }
                                >
                                  <Image
                                    key={file.file_id}
                                    src={getImageUrl(file)}
                                    style={{borderRadius: '8px'}}
                                    height={64}
                                    width={64}
                                    alt={file.name}
                                    placeholder={true}
                                  />
                                </When>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className='text-textColor'>Not added</div>
                        )}
                      </div>
                    ),
                  }}
                />
              </div>
            </BorderedCard>
            <BorderedCard
              header={{
                title: (
                  <div className='flex items-center gap-2'>
                    <FileText className='w-4 h-4 text-primaryColor' />{' '}
                    {ensureSummaryTitle(order?.prescription_details?.data) || 'Prescription'}
                  </div>
                ),
              }}
              cardClassName={CARD_CLASS_NAME}
            >
              <When isTrue={shouldLoadIframe && !!EMBED_URL}>
                <iframe
                  src={EMBED_URL}
                  width='100%'
                  height='600'
                  ref={iframeRef}
                  onLoad={() => {
                    setHasIframeLoaded(true)
                    postSummaryData()
                  }}
                  title='Embedded Form'
                ></iframe>
              </When>

              <When isTrue={shouldLoadIframe && !EMBED_URL}>
                <div className='flex items-center justify-center py-8 text-red-500'>
                  Configuration Error: Prescription form builder URL is missing.
                </div>
              </When>

              <When isTrue={hasSummaryData && !shouldLoadIframe}>
                <div className='flex justify-center py-8'>
                  <Spinner loading size={24} />
                </div>
              </When>

              <When isTrue={!hasSummaryData}>
                <div className='flex flex-col gap-4 '>
                  <LabelValuePairVertical
                    {...{
                      label: 'Chief complaint',
                      value: prescriptionDetails?.chief_complaint,
                      labelClassName: PRESCRIPTION_ITEM_LABEL_CLASS_NAME,
                    }}
                  />
                  <LabelValuePairVertical
                    {...{
                      labelClassName: PRESCRIPTION_ITEM_LABEL_CLASS_NAME,
                      label: 'Treatment plan instructions (optional)',
                      value: hasValue(prescriptionDetails?.notes) ? (
                        <div> {prescriptionDetails?.notes}</div>
                      ) : (
                        <div className='text-textColor'>Not added</div>
                      ),
                    }}
                  />
                  <LabelValuePairVertical
                    {...{
                      labelClassName: PRESCRIPTION_ITEM_LABEL_CLASS_NAME,
                      label: 'Treatment Needed',
                      value: (
                        <div className='flex flex-col'>
                          <p className='text-textColor font-medium text-sm'>Treatment area</p>
                          <p>
                            {prescriptionDetails?.treatment_needed === SELECT_SPECIFIC_TOOTH ? (
                              <div className='flex flex-col gap-1'>
                                <p className='text-textColor font-medium text-sm'>
                                  Certain Tooth/Teeth
                                </p>
                                <div className='flex gap-2 flex-wrap'>
                                  {prescriptionDetails?.treatment_needed_for_tooth?.map((i) => (
                                    <Tag key={i} value={i} />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              prescriptionDetails?.treatment_needed
                            )}
                          </p>
                        </div>
                      ),
                    }}
                  />
                  <LabelValuePairVertical
                    {...{
                      labelClassName: PRESCRIPTION_ITEM_LABEL_CLASS_NAME,
                      label: "Don't move the following tooth",
                      value:
                        prescriptionDetails?.do_not_move_the_following_tooth ===
                        SELECT_SPECIFIC_TOOTH ? (
                          <div className='flex gap-2 flex-wrap'>
                            {prescriptionDetails?.do_not_move_the_following_selected_tooth?.map(
                              (i) => (
                                <Tag key={i} value={i} />
                              )
                            )}
                          </div>
                        ) : (
                          prescriptionDetails?.do_not_move_the_following_tooth
                        ),
                    }}
                  />
                  <LabelValuePairVertical
                    {...{
                      labelClassName: PRESCRIPTION_ITEM_LABEL_CLASS_NAME,
                      label: 'Midline',
                      value: (
                        <div className='flex flex-col'>
                          <p className='text-textColor font-medium text-sm'>
                            Midline adjustment options
                          </p>
                          <p>
                            {prescriptionDetails?.midline === SPECIFY_MIDLINE_INSTRUCTIONS
                              ? prescriptionDetails?.midline_instructions
                              : prescriptionDetails?.midline}
                          </p>
                        </div>
                      ),
                    }}
                  />
                  <LabelValuePairVertical
                    {...{
                      labelClassName: PRESCRIPTION_ITEM_LABEL_CLASS_NAME,
                      label: 'Attachments',
                      value:
                        prescriptionDetails?.attachments === SELECT_SPECIFIC_TOOTH ? (
                          <div className='flex flex-col gap-1'>
                            <p className='text-textColor font-medium text-sm'>
                              Do not place on the following teeth
                            </p>
                            <div className='flex gap-2 flex-wrap'>
                              {prescriptionDetails?.attachments_tooth_selected?.map((i) => (
                                <Tag key={i} value={i} />
                              ))}
                            </div>
                          </div>
                        ) : (
                          prescriptionDetails?.attachments
                        ),
                    }}
                  />
                  <LabelValuePairVertical
                    {...{
                      labelClassName: PRESCRIPTION_ITEM_LABEL_CLASS_NAME,
                      label: 'Interproximal Reduction (IPR)',
                      value: prescriptionDetails?.inter_proximal_reduction,
                    }}
                  />
                  <LabelValuePairVertical
                    {...{
                      labelClassName: PRESCRIPTION_ITEM_LABEL_CLASS_NAME,
                      label: 'Extraction',
                      value:
                        prescriptionDetails?.extraction === SELECT_SPECIFIC_TOOTH ? (
                          <div className='flex flex-col gap-1'>
                            <p className='text-textColor font-medium text-sm'>
                              Specific tooth/teeth
                            </p>
                            <div className='flex gap-2 flex-wrap'>
                              {prescriptionDetails?.extraction_tooth_selected?.map((i) => (
                                <Tag key={i} value={i} />
                              ))}
                            </div>
                          </div>
                        ) : (
                          prescriptionDetails?.extraction
                        ),
                    }}
                  />
                </div>
              </When>
            </BorderedCard>
            <When isTrue={isAlignerOrderFromParam}>
              <BorderedCard
                header={{
                  title: (
                    <div className='flex items-center gap-2'>
                      <Truck className='w-4 h-4 text-primaryColor' /> Shipping
                    </div>
                  ),
                }}
                cardClassName={CARD_CLASS_NAME}
              >
                <div className='flex flex-col'>
                  <ConditionalDetail>
                    {' '}
                    {shippingDetails?.pincode ||
                    shippingDetails?.address_line ||
                    shippingDetails?.city ||
                    shippingDetails?.state ? (
                      <>
                       <ConditionalDetail>{shippingDetails?.addressed_to}</ConditionalDetail>
                        <ConditionalDetail>{shippingDetails?.name}</ConditionalDetail>
                      </>
                    ) : null}
                  </ConditionalDetail>
                  <ConditionalDetail>{shippingDetails?.mobile_number}</ConditionalDetail>
                  <ConditionalDetail>
                    {cleanAddress(   
                      shippingDetails?.address_line,
                      shippingDetails?.city,
                      shippingDetails?.state,
                      shippingDetails?.country,
                      shippingDetails?.pincode
                    )}
                  </ConditionalDetail>
                  <ConditionalDetail>
                    {shippingDetails?.city && shippingDetails?.state
                      ? `${shippingDetails.city}, ${shippingDetails.state}`
                      : shippingDetails?.city || shippingDetails?.state || 'Not Provided'}
                  </ConditionalDetail>

                  <ConditionalDetail>{shippingDetails?.country}</ConditionalDetail>
                  <ConditionalDetail>{shippingDetails?.pincode}</ConditionalDetail>
                </div>
              </BorderedCard>
            </When>
          </div>

          <When isTrue={!isViewOrderPage}>
            <FooterRedesigned
              {...{
                onNext: () => {
                  if (isRefinement) {
                    setIsSubmitToLabModalVisible(true)
                  } else {
                    setIsConfirmModalVisible(true)
                  }
                },
                ...(isRefinement
                  ? {
                      nextButtonText: 'Send for Planning',
                    }
                  : {}),
              }}
            />

            {/* Submit to Lab Modal for refinement flow */}
            <SubmitToLabModal
              open={isSubmitToLabModalVisible}
              onClose={() => setIsSubmitToLabModalVisible(false)}
              onConfirm={async () => {
                const assignedPractice = order?.patient_details?.assigned_practice
                const resolvedPatientId = safeParseInt(order?.patient_details?.id)
                const responseOrder = await handleCreateOrder({
                  orderPayload: {
                    status: orderStatusConstants.ORDERED,
                    order_id: order?.order_id,
                    service_products: productSelected,
                    doctor_id: safeParseInt(userId),
                    profile_id: safeParseInt(profileId),
                    service_product_id: productSelected?.id,
                    patient_id: resolvedPatientId || undefined,
                    practice_doctor_id: safeParseInt(
                      assignedPractice?.practice_doctor_id ?? order?.doctor_id
                    ),
                    practice_profile_id: safeParseInt(
                      assignedPractice?.practice_profile_id ?? order?.profile_id
                    ),
                    practice_organization_id: safeParseInt(
                      assignedPractice?.practice_organization_id ?? order?.organization_id
                    ),
                    ...(order?.patient_details
                      ? {
                          patient_details: {
                            ...order.patient_details,
                            profile_id: safeParseInt(profileId),
                            organization_id: safeParseInt(organizationId),
                          },
                        }
                      : {}),
                  },
                  product:
                    targetUserDetails ??
                    (productSelected as
                      | {
                          doctor_id?: number | string | null
                          profile_id?: number | string | null
                          organization_id?: number | string | null
                        }
                      | undefined),
                  assignedCustomer: assignedPractice,
                })

                setIsSubmitToLabModalVisible(false)
                const nextOrderId = responseOrder?.order_id ?? order?.order_id
                const moveOutSourced = {
                  order_type: 'ALIGNER',
                  workflow_name: isAlignerCompanyOrg ? 'Planning In House' : 'Plan Outsourced',
                  workflow_status_name: 'TO DO',
                  patient_id: patientDetails?.id,
                  case_type: isAlignerCompanyOrg
                    ? caseTypes.IN_HOUSE_PLANNING_ORDER
                    : caseTypes.OUTSOURCED_PLANNING_ORDER,
                  doctor_id: userId,
                  task_id: getIndividualTaskList?.id,
                  profile_id: profileId,
                  organization_id: organizationId,
                  lab_profile_id: isAlignerCompanyOrg ? null : labProfileId,
                  lab_workflow_name: isAlignerCompanyOrg ? null : 'Planning In House',
                  lab_workflow_status_name: isAlignerCompanyOrg ? null : 'TO DO',
                  service_products: productSelected,
                  order_id: nextOrderId,
                  lab_order_type: isAlignerCompanyOrg ? null : 'ALIGNER',
                  serviceProductId: productSelected?.id,
                  service_product_id: productSelected?.id,
                }

                await dispatchAction(changeWorkFlow(moveOutSourced as any))
                await dispatchAction(
                  getKanbanCountsByProfile({profile_id: Number(profileId)})
                ).unwrap()
                dispatchAction(setIsOpenMoveToPlanningStateModal(false))

                SuccessToast('Refinement case submitted to lab for planning')
                const payload = {
                  patient_id: safeParseInt(patientDetails?.id),
                  doctor_id: safeParseInt(userId),
                  treatment_subtype: 'ALIGNERS',
                  order_id: nextOrderId ?? null,
                }
                dispatchAction(getNewTreatmentList(payload))
                if (isCreateOrderPath) {
                  setSubmittedOrderId(nextOrderId ?? null)
                  setIsCaseSubmittedSuccessVisible(true)
                  return
                }
                const patientId = order?.patient_details?.id
                if (patientId) {
                  navigate(`${profileBasePath}/${patientId}/plans?order_id=${order.order_id}`)
                } else {
                  navigate(-1)
                }
              }}
              loading={creatingOrder}
            />

            {/* Standard confirm modal for non-refinement flow */}
            <Modal
              open={isConfirmModalVisible}
              onCancel={() => setIsConfirmModalVisible(false)}
              destroyOnClose={true}
              style={{fontFamily: 'figtree', top: '25%'}}
              title={null}
              transitionName=''
              footer={null}
            >
              <div className='flex flex-col items-center gap-4 px-6 py-2 text-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primarySupport text-primaryColor'>
                  <Send className='h-6 w-6' />
                </div>

                <div className='space-y-2'>
                  <h2 className='text-lg font-semibold text-black'>Ready to submit?</h2>
                  <p className='text-sm text-textColor'>
                    Once submitted, your case will be sent to the lab for review and processing.
                    You’ll be notified of any updates.
                  </p>
                </div>

                <div className='flex w-full gap-3 pt-2'>
                  <button
                    className='flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50'
                    onClick={() => {
                      setIsConfirmModalVisible(false)
                    }}
                  >
                    Review again
                  </button>
                  <AntdButton
                    onClick={async () => {
                      if (order?.status === orderStatusConstants.NEED_MORE_INFO) {
                        const payload = {
                          order_id: order?.order_id ?? '',
                          order_status: orderStatusConstants.ORDERED,
                          is_need_more_info_updated: true,
                          need_more_info: null,
                          is_new_order: false,
                        }
                        dispatchAction(needMoreInfo(payload))
                          .unwrap()
                          .then(() => {
                            setIsConfirmModalVisible(false)
                            SuccessToast('Order Submitted Successfully')
                          })
                      } else {
                        const assignedPractice = order?.patient_details?.assigned_practice
                        const resolvedPatientId = safeParseInt(order?.patient_details?.id)
                        const responseOrder = await handleCreateOrder({
                          orderPayload: {
                            status: orderStatusConstants.ORDERED,
                            order_id: order?.order_id,
                            service_products: productSelected,
                            doctor_id: safeParseInt(userId),
                            profile_id: safeParseInt(profileId),
                            service_product_id: productSelected?.id,
                            patient_id: resolvedPatientId || undefined,
                            practice_doctor_id: safeParseInt(
                              assignedPractice?.practice_doctor_id ?? order?.doctor_id
                            ),
                            practice_profile_id: safeParseInt(
                              assignedPractice?.practice_profile_id ?? order?.profile_id
                            ),
                            practice_organization_id: safeParseInt(
                              assignedPractice?.practice_organization_id ?? order?.organization_id
                            ),
                            ...(order?.patient_details
                              ? {
                                  patient_details: {
                                    ...order.patient_details,
                                    profile_id: safeParseInt(profileId),
                                    organization_id: safeParseInt(organizationId),
                                  },
                                }
                              : {}),
                          },
                          product:
                            targetUserDetails ??
                            (productSelected as
                              | {
                                  doctor_id?: number | string | null
                                  profile_id?: number | string | null
                                  organization_id?: number | string | null
                                }
                              | undefined),
                          assignedCustomer: assignedPractice,
                        })

                        setIsConfirmModalVisible(false)
                        const nextOrderId = responseOrder?.order_id ?? order?.order_id
                        const moveOutSourced = {
                          order_type: 'ALIGNER',
                          workflow_name: isAlignerCompanyOrg
                            ? 'Planning In House'
                            : 'Plan Outsourced',
                          workflow_status_name: 'TO DO',
                          patient_id: patientDetails?.id,
                          case_type: isAlignerCompanyOrg
                            ? caseTypes.IN_HOUSE_PLANNING_ORDER
                            : caseTypes.OUTSOURCED_PLANNING_ORDER,
                          doctor_id: userId,
                          task_id: getIndividualTaskList?.id,
                          profile_id: profileId,
                          organization_id: organizationId,
                          lab_profile_id: isAlignerCompanyOrg ? null : labProfileId,
                          lab_workflow_name: isAlignerCompanyOrg ? null : 'Planning In House',
                          lab_workflow_status_name: isAlignerCompanyOrg ? null : 'TO DO',
                          service_products: productSelected,
                          order_id: nextOrderId,
                          lab_order_type: isAlignerCompanyOrg ? null : 'ALIGNER',
                          serviceProductId: productSelected?.id,
                          service_product_id: productSelected?.id,
                        }

                        await dispatchAction(changeWorkFlow(moveOutSourced as any))
                        await dispatchAction(
                          getKanbanCountsByProfile({profile_id: Number(profileId)})
                        ).unwrap()
                        dispatchAction(setIsOpenMoveToPlanningStateModal(false))

                        if (!isPractice && serviceConfig.PLANNING) {
                          SuccessToast('Ticket move to plan outsource board')
                        }
                        if (isCreateOrderPath) {
                          setSubmittedOrderId(nextOrderId ?? null)
                          setIsCaseSubmittedSuccessVisible(true)
                          return
                        } else if (isAlignerCompanyOrg) {
                          navigate('/aligner-orders?workFlow=planning-in-house')
                        } else if (isPractice) {
                          navigate(`/profile/${patientId}`)
                        } else {
                          navigate('/aligner-orders?workFlow=planning-outsource')
                        }
                      }
                    }}
                    className='flex-1 border border-primaryColor h-10 text-sm font-semibold bg-primaryColor'
                    isLoading={creatingOrder}
                    text='Submit Case'
                    disabled={creatingOrder}
                  />
                </div>
              </div>
            </Modal>
          </When>

          <When isTrue={isStlPreviewVisible}>
            <CustomStlViewer />
          </When>
        </Page>
      )}

      <CaseSubmittedSuccessModal
        open={isCaseSubmittedSuccessVisible}
        orderId={submittedOrderId ?? order?.order_id}
        patientName={patientDetails?.full_name ?? null}
        onViewDashboard={() => {
          const patientId = order?.patient_details?.id
          if (patientId) {
            setIsCaseSubmittedSuccessVisible(false)
            navigate(`${profileBasePath}/${patientId}`)
            return
          }
          setIsCaseSubmittedSuccessVisible(false)
          navigate(-1)
        }}
        onCreateAnother={() => {
          setIsCaseSubmittedSuccessVisible(false)
          navigate(createOrderBaseRoute)
        }}
      />
    </>
  )
}

export default ReviewAndSendStep