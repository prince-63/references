import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ShowDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ShowDetails'
import hasValue from 'utils/hasValue'
import CopyIcon from 'assets/icons/CopyIcon'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import copy from 'copy-to-clipboard'
import pdfPng from 'assets/images/Pdf.png'
import clsx from 'clsx'
import TextWithTooltip from 'components/section/TextWithTooltip'
import {Image} from 'assets/images/Images/Image'
import {useEffect, useMemo, useState} from 'react'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import moment from 'moment'
import {
  setOpenConfirmMarkAsDeliveredModal,
  setOpenShippingDetailsModal,
  getManufacturingDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import Spinner from 'components/spinner/Spinner'
import {IManufacturing} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import {ManufacturingDetailsCard} from 'screens/Patients/LeadsProfile/main/overview/components/ManufacturingDetailsCard'
import manufacturingConstants from '@constants/manufacturing.constants'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getImageUrl} from 'utils/ConstFunctions'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {URL_VSP_PRODUCTION} from 'redux/Endpoints/apiEndpoints'

type ShippingDetailsContainerTaskProps = {
  onClose?: () => void
  manufacturingId?: string | number | null
}

type ShippingDetailsView = Partial<IManufacturing> & {
  status?: string | null
  tracking_link?: string | null
  tracking_number?: string | null
  shipping_date?: string | null
  tentative_delivery_date?: string | null
  documents?: Array<{
    url?: string | null
    name?: string | null
    extension?: string | null
    type?: string | null
  }>
}

const ShippingDetailsContainerTask = ({
  onClose,
  manufacturingId,
}: ShippingDetailsContainerTaskProps) => {
  const {dispatchAction} = useDispatchAction()
  const {gettingStartedStepData, loadingGettingStartedStep, loadingManufacturing} = useSelector(
    (state: RootState) => state.GettingStartedOverview
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {manufacturingBatchId} = useSelector((state: RootState) => state.workFlow)
  const resolvedManufacturingId = manufacturingId ?? manufacturingBatchId
  const [shippingDetails, setShippingDetails] = useState<ShippingDetailsView | null>(null)
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false

  useEffect(() => {
    if (!resolvedManufacturingId) {
      setShippingDetails(null)
      return
    }

    if (isVspPlanning) {
      apiHelper(
        `${URL_VSP_PRODUCTION}/${resolvedManufacturingId}`,
        HttpMethod.GET,
        undefined,
        false
      )
        .then((response) => {
          const data = response?.data
          const files = Array.isArray(data?.stl_files) ? data.stl_files : []

          setShippingDetails({
            status: data?.status ?? null,
            tracking_link: data?.shipping?.tracking_link ?? null,
            tracking_number: data?.shipping?.tracking_number ?? null,
            shipping_date: data?.shipping?.shipping_date ?? null,
            tentative_delivery_date: data?.shipping?.tentative_date ?? null,
            documents: files.map((file: any) => ({
              url: file?.url ?? null,
              name: file?.file_name ?? null,
              extension: file?.file_name?.split('.')?.pop()?.toLowerCase?.() ?? null,
              type: null,
            })),
          })
        })
        .catch(() => setShippingDetails(null))

      return
    }

    dispatchAction(getManufacturingDetails({manufacturing_id: resolvedManufacturingId}))
      .unwrap()
      .then((details: IManufacturing) => setShippingDetails(details))
      .catch(() => setShippingDetails(null))
  }, [dispatchAction, isVspPlanning, resolvedManufacturingId])

  const shippingStatus = useMemo(
    () =>
      (shippingDetails?.status ?? gettingStartedStepData?.in_transit?.manufacturing_status ?? '')
        .toString()
        .toUpperCase(),
    [gettingStartedStepData?.in_transit?.manufacturing_status, shippingDetails?.status]
  )

  const isDelivered = shippingStatus === manufacturingConstants?.DELIVERED
  const isShipped = shippingStatus === manufacturingConstants?.SHIPPED

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const {isPractice} = useAllUserPlan()

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

  const callMarkAsDelivered = () => {
    dispatchAction(setOpenShippingDetailsModal(false))
    dispatchAction(setOpenConfirmMarkAsDeliveredModal(true))
  }

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <>
          <When isTrue={isShowPhotos}>
            <ImageViewer
              setIsShowPhotos={setIsShowPhotos}
              selectedImagesList={shippingDetails?.documents?.map((file, index) => {
                return {
                  id: index,
                  src: getImageUrl(file),
                  width: '100%',
                  height: '100%',
                }
              })}
              selectedIndex={selectedIndex}
            />
          </When>

          <When
            isTrue={
              !isVspPlanning &&
              !loadingGettingStartedStep &&
              !loadingManufacturing &&
              shippingDetails &&
              (!isDelivered || !isShipped)
            }
          >
            {hasValue(shippingDetails) && (
              <ManufacturingDetailsCard
                totalAligners={(shippingDetails as any)?.total_aligners}
                upperJaw={{
                  start: (shippingDetails as any)?.upper_aligner_start,
                  end: (shippingDetails as any)?.upper_aligner_end,
                }}
                lowerJaw={{
                  start: (shippingDetails as any)?.lower_aligner_start,
                  end: (shippingDetails as any)?.lower_aligner_end,
                }}
                containerClassName='border-b border-mediumGray mb-3'
              />
            )}
          </When>

          {loadingManufacturing && (
            <div className='flex flex-col justify-center items-center gap-5 w-full absolute'>
              <Spinner loading color='white' />
            </div>
          )}
          <div className='flex flex-col gap-4'>
            <div>
              <div className='text-sm font-medium text-textColor'>Tracking link</div>
              {hasValue(shippingDetails?.tracking_link) ? (
                <a
                  href={
                    shippingDetails?.tracking_link?.startsWith('http')
                      ? shippingDetails.tracking_link
                      : `https://${shippingDetails?.tracking_link}`
                  }
                  target='_blank'
                  rel='noreferrer'
                  className='!no-underline text-[#735BF2] text-base'
                >
                  <div className='flex items-center gap-1 font-semibold'>
                    <LinkSimpleIcon width='22' height='22' color='#735BF2' />
                    <p>View link</p>
                  </div>
                </a>
              ) : (
                '-'
              )}
            </div>

            <div>
              <div className='text-sm font-medium text-textColor'>Tracking number</div>
              <div className='flex gap-2 items-center'>
                <div>
                  {hasValue(shippingDetails?.tracking_number)
                    ? shippingDetails?.tracking_number
                    : '-'}
                </div>
                {shippingDetails?.tracking_number && (
                  <button
                    onClick={() => {
                      SuccessToast('Link copied!')
                      copy(shippingDetails?.tracking_number)
                    }}
                  >
                    <CopyIcon />
                  </button>
                )}
              </div>
            </div>

            <div className='flex gap-6'>
              <div>
                <div className='text-sm font-medium text-textColor'>Shipping date</div>
                <div className='flex gap-2 items-center'>
                  <div>
                    {shippingDetails?.shipping_date
                      ? moment(shippingDetails?.shipping_date).format('DD-MMM-YYYY')
                      : '-'}
                  </div>
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-textColor'>Tentative date</div>
                <div className='flex gap-2 items-center'>
                  <div>
                    {shippingDetails?.tentative_delivery_date
                      ? moment(shippingDetails?.tentative_delivery_date).format('DD-MMM-YYYY')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

            {!isVspPlanning && (
              <ShowDetails
                label='Files'
                className='w-full'
                valueClassName={clsx(
                  !hasValue(shippingDetails?.documents) && 'md:w-1/2',
                  'text-text-color font-normal  md:text-end'
                )}
                value={
                  shippingDetails?.documents ? (
                    <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between '>
                      {shippingDetails?.documents &&
                        shippingDetails?.documents.map((file: any, index: number) => {
                          const extension =
                            file?.extension?.toLowerCase?.() ?? (file?.type ?? '').split('/').pop()
                          const type = file?.type ?? ''
                          const isPdf = extension === 'pdf' || type === 'application/pdf'
                          const isVideo = extension === 'mp4' || type === 'video/mp4'
                          return (
                            <div
                              key={index}
                              className={clsx(
                                'flex items-center md:min-w-[42.5%] gap-2 flex-shrink '
                              )}
                              onClick={() => {
                                if (isVideo || isPdf) {
                                  handleOpenPDF(file.url ?? '')
                                } else {
                                  setIsShowPhotos(true)
                                  setSelectedIndex(index)
                                }
                              }}
                            >
                              <When isTrue={!isVideo && !isPdf}>
                                <Image
                                  src={getImageUrl(file)}
                                  alt='Uploaded file '
                                  className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                                  size={20}
                                  fileName={file.name}
                                  showFileName={true}
                                  showLoading={true}
                                />
                              </When>

                              <When isTrue={isPdf}>
                                <Image
                                  className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer'
                                  size={20}
                                  src={pdfPng}
                                />

                                <TextWithTooltip className='cursor-pointer'>
                                  {file.name}
                                </TextWithTooltip>
                              </When>
                            </div>
                          )
                        })}
                    </div>
                  ) : null
                }
              />
            )}
          </div>
          <When isTrue={!isVspPlanning && shippingStatus === manufacturingConstants?.SHIPPED}>
            {isPractice ? (
              <button
                className={clsx('w-fit text-white bg-primaryColor py-3 px-6 rounded-lg mt-4')}
                type='button'
                onClick={() => callMarkAsDelivered()}
              >
                Mark as received
              </button>
            ) : (
              <button
                className={clsx(
                  'w-fit text-primaryColor bg-primarySupport border border-primaryColor py-3 px-6 rounded-lg mt-4'
                )}
                type='button'
                onClick={() => {
                  dispatchAction(setOpenShippingDetailsModal(true))
                  onClose?.()
                }}
              >
                Edit details
              </button>
            )}
          </When>
        </>
      )}
    </>
  )
}

export default ShippingDetailsContainerTask
