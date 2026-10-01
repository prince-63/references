import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ShowDetails from '../../treatment/viewTreatmentPlan/components/ShowDetails'
import hasValue from 'utils/hasValue'
import CopyIcon from 'assets/icons/CopyIcon'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import copy from 'copy-to-clipboard'
import pdfPng from 'assets/images/Pdf.png'
import clsx from 'clsx'
import TextWithTooltip from 'components/section/TextWithTooltip'
import {Image} from 'assets/images/Images/Image'
import {useState} from 'react'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import moment from 'moment'
import {
  setOpenConfirmMarkAsDeliveredModal,
  setOpenShippingDetailsModal,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import Spinner from 'components/spinner/Spinner'
import {ManufacturingItem} from '../types/GettingStarted.types'
import {ManufacturingDetailsCard} from './ManufacturingDetailsCard'
import manufacturingConstants from '@constants/manufacturing.constants'
import PDFWebview from '../../files/components/PDFWebview'
import useAllUserPlan from '@hooks/useAllUserPlan'

const ShippingDetailsContainer = ({
  shipping_detail,
}: {
  shipping_detail?: ManufacturingItem
  setIsShippingDetailsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const {dispatchAction} = useDispatchAction()
  const {
    manufacturingListData,
    loadingManufacturingList,
    gettingStartedStepData,
    loadingGettingStartedStep,
  } = useSelector((state: RootState) => state.GettingStartedOverview)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const manufacturingList = manufacturingListData?.processed_manufacturing
  const isDelivered =
    gettingStartedStepData?.in_transit?.manufacturing_status === manufacturingConstants?.DELIVERED
  const isShipped =
    gettingStartedStepData?.in_transit?.manufacturing_status === manufacturingConstants?.SHIPPED
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false

  const shipping_details =
    shipping_detail ?? (manufacturingList && manufacturingList[manufacturingList?.length - 1])

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
              selectedImagesList={shipping_details?.documents?.map((file, index) => ({
                id: index,
                src: file?.url,
                width: '100%',
                height: '100%',
              }))}
              selectedIndex={selectedIndex}
            />
          </When>

          <When
            isTrue={
              !isVspPlanning &&
              !loadingGettingStartedStep &&
              !loadingManufacturingList &&
              (!isDelivered || !isShipped)
            }
          >
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
                containerClassName='border-b border-mediumGray mb-3'
              />
            )}
          </When>

          {loadingManufacturingList && (
            <div className='flex flex-col justify-center items-center gap-5 w-full absolute'>
              <Spinner loading color='white' />
            </div>
          )}
          <div className='flex flex-col gap-4'>
            <div>
              <div className='text-sm font-medium text-textColor'>Tracking link</div>
              {hasValue(shipping_details?.tracking_link) ? (
                <a
                  href={
                    shipping_details?.tracking_link?.startsWith('http')
                      ? shipping_details.tracking_link
                      : `https://${shipping_details?.tracking_link}`
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
                  {hasValue(shipping_details?.tracking_number)
                    ? shipping_details?.tracking_number
                    : '-'}
                </div>
                {shipping_details?.tracking_number && (
                  <button
                    onClick={() => {
                      SuccessToast('Link copied!')
                      copy(shipping_details?.tracking_number)
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
                    {shipping_details?.shipped_on
                      ? moment(shipping_details?.shipped_on).format('DD-MMM-YYYY')
                      : '-'}
                  </div>
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-textColor'>Tentative date</div>
                <div className='flex gap-2 items-center'>
                  <div>
                    {shipping_details?.tentative_delivery_date
                      ? moment(shipping_details?.tentative_delivery_date).format('DD-MMM-YYYY')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

            <ShowDetails
              label='Files'
              className='w-full'
              valueClassName={clsx(
                !hasValue(shipping_details?.documents) && 'md:w-1/2',
                'text-text-color font-normal  md:text-end'
              )}
              value={
                shipping_details?.documents ? (
                  <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between '>
                    {shipping_details?.documents &&
                      shipping_details?.documents.map((file: any, index: number) => (
                        <div
                          key={index}
                          className={clsx('flex items-center md:min-w-[42.5%] gap-2 flex-shrink ')}
                          onClick={() => {
                            if (file.extension === 'mp4' || file.extension === 'pdf') {
                              handleOpenPDF(file.url ?? '')
                            } else {
                              setIsShowPhotos(true)
                              setSelectedIndex(index)
                            }
                          }}
                        >
                          <When isTrue={file.extension !== 'mp4' && file.extension !== 'pdf'}>
                            <Image
                              src={file.url}
                              alt='Uploaded file '
                              className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                              size={20}
                              fileName={file.name}
                              showFileName={true}
                              showLoading={true}
                            />
                          </When>

                          <When isTrue={file.extension === 'pdf'}>
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
                      ))}
                  </div>
                ) : null
              }
            />
          </div>
          <When isTrue={!isVspPlanning && shipping_details?.status === 'SHIPPED'}>
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

export default ShippingDetailsContainer
