import useDispatchAction from '@hooks/useDispatchAction'
import {Avatar, Button, Spin, Tag} from 'antd'
import LabelValuePairVertical from 'components/atom/Labels/LabelValuePairVertical'
import Spinner from 'components/spinner/Spinner'
import ConditionalDetail from 'components/when/ConditionalDetail'
import When from 'components/when/When'
import CustomStlViewer from 'CustomStlViewer'
import {useContext, useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {getSingleCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {downloadFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {RootState} from 'redux/store'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import {
  SELECT_SPECIFIC_TOOTH,
  SPECIFY_MIDLINE_INSTRUCTIONS,
} from 'screens/Orders/Steps/helpers/prescriptionFormOptions'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {getFirstLetterCapitalOfWord, safeParseInt} from 'utils/ConstFunctions'
import getBrandConfig from 'utils/getBrandConfig'
import {getEnvVariable, sanitizeBaseUrl} from 'utils/envUtils'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'
import moment from 'moment'
import CollapsibleCard from './components/CollapsibleCard'
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import ExpandIcon from 'assets/icons/ExpandIcon'
import {flatten} from 'ramda'
import {AuthContext} from 'context/AuthContext'
import JSZip from 'jszip'
import userTypes from '@constants/userTypes'
import {downloadBlob} from 'utils/download'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import DownloadIcon from 'assets/icons/DownloadIcon'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import {cleanAddress} from 'screens/Orders/Steps/helpers/removeCityStatePincode'
import OrdersIcon from 'assets/icons/ThreeDotIcons'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {updateCurrentStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {FileSections, getIcon} from './CustomerPatientProfile/tabs/Records'
import {CaseRecordFile} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'

const PRESCRIPTION_ITEM_LABEL_CLASS_NAME = 'text-black text-base font-semibold'
const brandConfig = getBrandConfig()
const FORM_ID = brandConfig.formId
const brand = brandConfig.brand.toLowerCase().replace(/\s+/g, '')
const form_env_type = process.env.REACT_APP_FORM_ENV_TYPE
const FORM_BUILDER_URL = sanitizeBaseUrl(getEnvVariable('REACT_APP_FORM_BUILDER_URL'))
const EMBED_URL = FORM_BUILDER_URL
  ? `${FORM_BUILDER_URL}/embed/${FORM_ID}/${form_env_type}/${brand}?mode=view`
  : ''
const targetOrigin = FORM_BUILDER_URL ? new URL(FORM_BUILDER_URL).origin : ''
const IFRAME_LOAD_DELAY_MS = 800

type ReactNativeWebViewWindow = Window &
  typeof globalThis & {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }

export const getOrderZipFileName = (orderId?: string | null) => `Order_${orderId ?? 'files'}_files.zip`

const blobToBase64 = async (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = String(reader.result || '')
      resolve(result.includes(',') ? result.split(',')[1] : result)
    }
    reader.onerror = () => reject(new Error('Unable to prepare ZIP for download'))
    reader.readAsDataURL(blob)
  })

export const sendOrderZipToNativeApp = async (zipBlob: Blob, orderId?: string | null) => {
  if (typeof window === 'undefined') return false

  const reactNativeWebView = (window as ReactNativeWebViewWindow).ReactNativeWebView
  if (!reactNativeWebView) return false

  const fileName = getOrderZipFileName(orderId)
  const base64Zip = await blobToBase64(zipBlob)

  reactNativeWebView.postMessage(
    JSON.stringify({
      file_name: fileName,
      file_type: 'application/zip',
      file_base64: base64Zip,
    })
  )

  return true
}

const PatientOrderView = ({order_id = null}: {order_id?: string | null}) => {
  const {userId} = useContext(AuthContext)
  const {patientId, orderId: orderIdFromParams} = useParams<{
    patientId?: string
    orderId?: string
  }>()
  const {dispatchAction} = useDispatchAction()
  const {order, loadingOrder} = userOrderDetails(true)
  const {isStlPreviewVisible} = useSelector((state: RootState) => state.leadsProfileFiles)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const patientDetails = order?.patient_details
  const orderDetails = order?.order_details
  const shippingDetails = order?.shipping_details
  const prescriptionDetails = order?.prescription_details
  const {caseRecordData, loadingGetSingle} = useSelector((state: RootState) => state.caseRecord)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [fetchedCaseRecordId, setFetchedCaseRecordId] = useState<number | null>(null)
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false)
  const [hasIframeLoaded, setHasIframeLoaded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchParams] = useSearchParams()
  const isShowBackButton = searchParams.has('view-order')
  const statePatientId = (location.state as {patientId?: number | string} | null)?.patientId
  const [pdfViewer, setPdfViewer] = useState<{isOpen: boolean; url: string; fileName?: string}>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  const handleClosePDF = () => {
    setPdfViewer({isOpen: false, url: '', fileName: ''})
  }

  useEffect(() => {
    if (!serviceConfig?.VSP_PLANNING) return

    const resolvedOrderId = order_id ?? orderIdFromParams ?? order?.order_id
    const resolvedPatientId =
      safeParseInt(statePatientId) ||
      safeParseInt(patientId) ||
      safeParseInt(order?.patient_id) ||
      safeParseInt((order?.patient_details as {id?: number | string} | undefined)?.id)

    if (!resolvedOrderId || !resolvedPatientId) return

    navigate(`/vsp-profile/${resolvedPatientId}/case-details?order_id=${resolvedOrderId}`, {
      replace: true,
    })
  }, [
    navigate,
    order?.order_id,
    order?.patient_details,
    order?.patient_id,
    orderIdFromParams,
    order_id,
    patientId,
    serviceConfig?.VSP_PLANNING,
    statePatientId,
  ])

  useEffect(() => {
    if (!order?.case_record_id) return
    if (order.case_record_id === fetchedCaseRecordId) return

    dispatchAction(getSingleCaseRecord(order.case_record_id))
    setFetchedCaseRecordId(order.case_record_id)
  }, [order?.case_record_id, fetchedCaseRecordId])

  const caseRecordForOrder =
    caseRecordData && caseRecordData.case_record_id === order?.case_record_id
      ? caseRecordData
      : null

  const photographsFiles: CaseRecordFile[] = caseRecordForOrder?.pre_treatment_files ?? []
  const scanFiles: CaseRecordFile[] = caseRecordForOrder?.scan_files ?? []
  const radiographFiles: CaseRecordFile[] = caseRecordForOrder?.xray_files ?? []
  const hasSummaryData = hasValue(prescriptionDetails?.data)

  useEffect(() => {
    if (!hasSummaryData) {
      setShouldLoadIframe(false)
      return
    }
    const timer = window.setTimeout(() => {
      setShouldLoadIframe(true)
    }, IFRAME_LOAD_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [hasSummaryData])

  const postViewData = () => {
    if (!hasValue(order?.prescription_details?.data)) return
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'SummaryFormData',
        mode: 'view',
        data: order?.prescription_details?.data,
      },
      targetOrigin
    )
  }

  useEffect(() => {
    if (hasIframeLoaded) {
      postViewData()
    }
  }, [order?.prescription_details?.data, hasIframeLoaded])

  const createNewOrder = () => {
    return (
      <Button
        className='!bg-primaryColor font-semibold !text-white px-3 py-2 rounded-lg'
        onClick={() => {
          const postData = {
            patient_id: safeParseInt(patientId),
            doctor_id: safeParseInt(userId),
          }
          dispatchAction(getLeadsProfileDetails(postData) as any)

          dispatchAction(updateCurrentStep(1))
          navigate(`/customer/create-order/${order_id}`, {
            state: {
              patientId: patientId,
              fromProfile: true,
            },
          })
        }}
        icon={
          <div className=''>
            <OrdersIcon color='#fff' />
          </div>
        }
      >
        {'Complete Order'}
      </Button>
    )
  }

  const handleDownloadAllFiles = async () => {
    try {
      if (!userId) return

      const files = flatten([photographsFiles || [], scanFiles || [], radiographFiles || []])

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

          zip.file(file?.name || `file-${file?.file_id}.dat`, blob)
        } catch (err) {
          console.error(`Error downloading file_id ${file?.file_id}`, err)
        }
      }

      const zipBlob = await zip.generateAsync({type: 'blob'})
      if (await sendOrderZipToNativeApp(zipBlob, order?.order_id)) return

      downloadBlob(zipBlob, getOrderZipFileName(order?.order_id))
    } catch (err) {
      AntdMessage({type: 'error', text: 'Error downloading files'})
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {!pdfViewer.isOpen && (
        <Spin indicator={<Spinner loading />} spinning={loadingOrder || loadingGetSingle}>
          <div className='flex flex-col h-full'>
            {isShowBackButton && (
              <Button
                type='default'
                onClick={() => navigate(-1)}
                className='w-fit px-5 py-2.5 text-textColor border-none hover:!bg-transparent  hover:!text-textColor'
              >
                <ExpandIcon isActive={false} className='rotate-180' />
                Back
              </Button>
            )}

            <div className='sticky top-0 z-20 bg-white px-6 pt-4 pb-3 border-b shadow-sm flex gap-3 justify-between'>
              <div>
                <div className='text-xl font-semibold uppercase'>{`Order ID: ${order?.order_id ?? ''}`}</div>
                <div className='text-sml font-medium'>
                  {order?.order_details?.order_type === 'PLANNING_ORDER'
                    ? 'Planning Order'
                    : 'Aligner Order'}
                </div>
                {order_id && createNewOrder()}
              </div>
              <div className={cn('text-textColor font-medium text-sm')}>{`Created on: ${
                order?.order_details?.created_at
                  ? moment(order?.order_details?.created_at).format('DD-MMM-YYYY')
                  : ''
              }`}</div>
            </div>

            <div className='flex-1 overflow-y-auto flex flex-col gap-3 min-w-3/5 p-4 pb-28 md:pb-4'>
              {/* Patient details */}
              <CollapsibleCard title='Patient details'>
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
              </CollapsibleCard>

              {/* Order details */}
              <CollapsibleCard title='Order details'>
                <div className='flex flex-col gap-4 '>
                  <LabelValuePairVertical
                    label='Lab '
                    value={
                      order?.service_products?.org_brand_name ??
                      order?.service_products?.added_by_user_name
                    }
                  />
                  <LabelValuePairVertical
                    label='Order ID'
                    value={<div className='uppercase'>{`#${order?.order_id}`}</div>}
                  />
                  <LabelValuePairVertical
                    label='Service'
                    value={getFirstLetterCapitalOfWord(
                      order?.service_products?.product_category_name ?? ''
                    )}
                  />
                  <LabelValuePairVertical
                    label='Order type'
                    value={
                      order?.order_details?.order_type === 'ALIGNER_ORDER'
                        ? 'Aligner Order'
                        : 'Planning Order'
                    }
                  />
                  <ProductCard
                    product={order?.service_products}
                    product_name={order?.product_name}
                    product_image={order?.product_image}
                    product_description={order?.product_description}
                  />
                </div>
              </CollapsibleCard>

              {/* Case records */}
              <CollapsibleCard
                title={
                  <div className='flex justify-between items-center w-full'>
                    <div>Case Records</div>
                    <When
                      isTrue={hasValue(
                        flatten([photographsFiles || [], scanFiles || [], radiographFiles || []])
                      )}
                    >
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation()
                          void handleDownloadAllFiles()
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
                }
              >
                <div className='w-full flex flex-col gap-6 mt-4'>
                  <FileSections
                    title='Photographs'
                    icon={getIcon('Photographs')}
                    files={photographsFiles}
                    mode='thumbnail'
                    userId={userId}
                    dispatchAction={dispatchAction}
                  />
                  <FileSections
                    title='Scan files'
                    icon={getIcon('Scan files')}
                    files={scanFiles}
                    mode='list'
                    userId={userId}
                    dispatchAction={dispatchAction}
                  />
                  <FileSections
                    title='Radiographs'
                    icon={getIcon('Radiographs')}
                    files={radiographFiles}
                    mode='thumbnail'
                    userId={userId}
                    dispatchAction={dispatchAction}
                  />
                </div>
              </CollapsibleCard>

              {/* Prescription Form */}
              <CollapsibleCard title='Prescription'>
                <When isTrue={shouldLoadIframe}>
                  <When isTrue={!!EMBED_URL}>
                    <iframe
                      src={EMBED_URL}
                      width='100%'
                      height='600'
                      ref={iframeRef}
                      onLoad={() => {
                        setHasIframeLoaded(true)
                        postViewData()
                      }}
                      title='Embedded Form'
                      style={{border: '0', width: '100%'}}
                    ></iframe>
                  </When>
                  <When isTrue={!EMBED_URL}>
                    <div className='flex items-center justify-center py-8 text-red-500'>
                      Configuration Error: Prescription form builder URL is missing.
                    </div>
                  </When>
                </When>

                <When isTrue={hasSummaryData && !shouldLoadIframe}>
                  <div className='flex justify-center py-8'>
                    <Spinner loading size={24} />
                  </div>
                </When>

                <When isTrue={!hasSummaryData}>
                  {/* Summary View (unchanged) */}
                  <div className='flex flex-col gap-4 '>
                    <LabelValuePairVertical
                      label='Chief complaint'
                      value={prescriptionDetails?.chief_complaint}
                      labelClassName={PRESCRIPTION_ITEM_LABEL_CLASS_NAME}
                    />
                    <LabelValuePairVertical
                      labelClassName={PRESCRIPTION_ITEM_LABEL_CLASS_NAME}
                      label='Treatment plan instructions (optional)'
                      value={
                        hasValue(prescriptionDetails?.notes) ? (
                          <div>{prescriptionDetails?.notes}</div>
                        ) : (
                          <div className='text-textColor'>Not added</div>
                        )
                      }
                    />
                    <LabelValuePairVertical
                      labelClassName={PRESCRIPTION_ITEM_LABEL_CLASS_NAME}
                      label='Treatment Needed'
                      value={
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
                      }
                    />
                    <LabelValuePairVertical
                      labelClassName={PRESCRIPTION_ITEM_LABEL_CLASS_NAME}
                      label="Don't move the following tooth"
                      value={
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
                        )
                      }
                    />
                    <LabelValuePairVertical
                      labelClassName={PRESCRIPTION_ITEM_LABEL_CLASS_NAME}
                      label='Midline'
                      value={
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
                      }
                    />
                    <LabelValuePairVertical
                      labelClassName={PRESCRIPTION_ITEM_LABEL_CLASS_NAME}
                      label='Attachments'
                      value={
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
                        )
                      }
                    />
                    <LabelValuePairVertical
                      labelClassName={PRESCRIPTION_ITEM_LABEL_CLASS_NAME}
                      label='Interproximal Reduction (IPR)'
                      value={prescriptionDetails?.inter_proximal_reduction}
                    />
                    <LabelValuePairVertical
                      labelClassName={PRESCRIPTION_ITEM_LABEL_CLASS_NAME}
                      label='Extraction'
                      value={
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
                        )
                      }
                    />
                  </div>
                </When>
              </CollapsibleCard>

              {/* Shipping Details */}
              {orderDetails?.order_type === 'ALIGNER_ORDER' && (
                <CollapsibleCard title='Shipping'>
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
                </CollapsibleCard>
              )}
            </div>
          </div>

          <When isTrue={isStlPreviewVisible}>
            <CustomStlViewer />
          </When>
        </Spin>
      )}
    </>
  )
}

export default PatientOrderView

export const ProductCard = ({
  product_name,
  product_image,
  product_description,
  product,
}: {
  product_name?: string | null
  product_image?: string | null
  product_description?: string | null
  product?: Product
}) => {
  const name = product_name ?? product?.product_name ?? ''
  const image = product_image ?? product?.product_image ?? ''
  const description = product_description ?? product?.product_description ?? ''

  return (
    <div className={'w-full rounded-xl border border-gray-200 bg-white'}>
      <div className='flex items-center gap-4 p-3'>
        {image ? (
          <div className='h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100'>
            <img src={image} alt={name} className='h-full w-full object-cover' />{' '}
          </div>
        ) : (
          <Avatar
            style={{backgroundColor: 'gray-100', verticalAlign: 'middle'}}
            size='large'
            gap={4}
            shape='square'
          >
            {name?.charAt(0) || ''}
          </Avatar>
        )}

        <div className='min-w-0'>
          <div className='truncate text-base font-semibold text-gray-900'>{name}</div>
          {description && (
            <div className='mt-0.5 truncate text-sm text-gray-500'>{description}</div>
          )}
          <div className='mt-0.5 truncate text-sm text-gray-500'>
            Lab: {product?.org_brand_name ?? product?.added_by_user_name}
          </div>
        </div>
      </div>
    </div>
  )
}
