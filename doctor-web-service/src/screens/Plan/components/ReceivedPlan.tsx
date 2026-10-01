import {Divider} from 'antd'
import ViewInformationSection from 'components/section/ViewInformationSection'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ShowDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ShowDetails'
import UploadedTreatmentPlanSection from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/UploadedTreatmentPlanSection'
import pdfPng from 'assets/images/Pdf.png'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import {Image} from 'assets/images/Images/Image'
import cn from '@utils/cn'
import TextWithTooltip from 'components/section/TextWithTooltip'
import ReviewPlanWrapper from './ReviewPlanWrapper'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import AntdButton from 'components/atom/Buttons/AntdButton'
import AlignerDetails from './AlignerDetails'
import {getTreatmentPlanStatus} from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/helpers/getTreatmentPlanStatus'
import StlFilesSection from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/StlFilesSection'
import dayjs from 'dayjs'
import ReplanTreatmentModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/ReplanTreatmentModal'
import Tag from 'components/tags/Tag'
import getTreatmentPlanStatusTagClassName from '@utils/getTreatmentPlanStatusTagClassName'
import mappedTreatmentPlanStatusConstants from '@constants/mappedTreatmentPlanStatus.constants'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import InfoIcon from 'assets/icons/InfoIcon'
import moment from 'moment'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {useState} from 'react'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {getImageUrl} from 'utils/ConstFunctions'

const ReceivedPlan = ({
  showReplanModal,
  setShowReplanModal,
}: {
  showReplanModal: boolean
  setShowReplanModal: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const {treatmentPlan, allTreatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {sentToPracticeTreatmentPlan} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const [searchParams] = useSearchParams()

  const orderId = searchParams.get('order_id')
  const navigate = useNavigate()
  const {patientId, treatmentId} = useParams()
  const {order} = userOrderDetails()
  const isPurchaseOrder = order?.is_purchase_order
  const {permissionChecks} = useFeatureAccess()
  const stlPermissions = permissionChecks?.treatmentPlanManagement?.uploadSTLFilesLink
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  // Function to open PDF viewer
  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  // Function to close PDF viewer
  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }

  const treatmentStatus = getTreatmentPlanStatus({
    treatmentPlan,
    isReceivedPlan: true,
  }) as keyof typeof treatmentPlanStatusConstants
  const status = mappedTreatmentPlanStatusConstants[treatmentStatus]

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {!pdfViewer.isOpen && (
        <ReviewPlanWrapper>
          <When isTrue={isShowPhotos}>
            <ImageViewer
              setIsShowPhotos={setIsShowPhotos}
              selectedImagesList={treatmentPlan?.files?.map((file, index) => ({
                id: index,
                src: getImageUrl(file),
                width: '100%',
                height: '100%',
              }))}
              selectedIndex={selectedIndex}
            />
          </When>
          <div className='flex flex-col gap-5 md:px-4 px-2 py-4'>
            <ViewInformationSection
              showBorder={false}
              title={
                <div className='flex justify-between items-center'>
                  <div className='flex gap-2 items-baseline'>
                    <p>{treatmentPlan?.treatment_plan_tag_name}</p>
                    <p className='text-sm text-textColor font-medium'>
                      {hasValue(treatmentPlan?.treatment_plan_name)
                        ? treatmentPlan?.treatment_plan_name
                        : null}
                    </p>
                  </div>
                  <div className='flex gap-3 items-center'>
                    <When isTrue={hasValue(treatmentPlan?.created_at)}>
                      <p className='text-textColor text-sm'>
                        Created on {dayjs(treatmentPlan?.created_at).format('DD-MMM-YYYY')}
                      </p>
                    </When>
                    <Divider type='vertical' className='mx-0' />
                    <div className='flex gap-2 text-textColor text-sm items-center font-medium'>
                      Status:{' '}
                      <Tag
                        value={status}
                        className={`${getTreatmentPlanStatusTagClassName(
                          status
                        )} w-fit text-sm font-semibold `}
                      />
                    </div>
                  </div>
                </div>
              }
            >
              <When
                isTrue={treatmentPlan.initiator_status === treatmentPlanStatusConstants.RE_PLAN}
              >
                <div className='w-full border border-red mb-3 rounded-lg'>
                  <div className='w-full flex items-center gap-1 border-b border-red bg-redSupport font-medium text-sm p-3 rounded-t-lg'>
                    <InfoIcon width='20' height='20' color='red' />
                    <p>
                      {' '}
                      This treatment plan was requested for Re-Plan on{' '}
                      {moment(treatmentPlan?.order_status_changed_at).format('DD-MMM-YYYY')}
                    </p>
                  </div>
                  <div className='w-full  text-textColor font-medium text-sm break-words p-3'>
                    <div>Comment:</div>
                    {treatmentPlan?.treatment_plan_metadata?.replan_reason ?? '-'}
                  </div>
                </div>
              </When>
              <When
                isTrue={
                  treatmentPlan.status === treatmentPlanStatusConstants.DRAFT &&
                  treatmentPlan?.initiator_status === treatmentPlanStatusConstants.APPROVED
                }
              >
                <div className='mb-3'>
                  <InfoCard
                    className='border border-[#735bf2] bg-[#F5F4FE] text-sm font-normal'
                    infoIconColor='#735bf2'
                    titleClassName='text-black text-sm font-medium'
                    title={`This treatment plan was approved on ${moment(
                      treatmentPlan?.order_status_changed_at
                    ).format('DD-MMM-YYYY')}`}
                    showButton={false}
                  />
                </div>
              </When>
              <div className='flex gap-6'>
                <ShowDetails
                  label='Treatment plan'
                  value={
                    <UploadedTreatmentPlanSection
                      {...{
                        treatmentPlan,
                      }}
                    />
                  }
                />
                <AlignerDetails isReceivedPlan />
              </div>
            </ViewInformationSection>
            <Divider className='my-1' />
            <div className='flex flex-col gap-3'>
              <ShowDetails
                label='Files'
                className='w-full'
                valueClassName={cn(
                  !hasValue(treatmentPlan?.files) && 'md:w-1/2',
                  'text-text-color font-normal  md:text-end'
                )}
                value={
                  treatmentPlan?.files ? (
                    <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between '>
                      {treatmentPlan?.files &&
                        treatmentPlan?.files.map((file: any, index: number) => (
                          <div
                            key={index}
                            className={cn(
                              'flex items-center md:min-w-[42.5%] gap-2 flex-shrink cursor-pointer'
                            )}
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
                                src={getImageUrl(file)}
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
            <Divider className='my-1' />
            <div className='flex flex-col gap-3'>
              <ShowDetails
                label='Other files'
                className='w-full'
                valueClassName={cn(
                  !hasValue(treatmentPlan?.other_files) && 'md:w-1/2',
                  'text-text-color font-normal  md:text-end'
                )}
                value={
                  treatmentPlan?.other_files ? (
                    <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between '>
                      {treatmentPlan?.other_files &&
                        treatmentPlan?.other_files.map((file: any, index: number) => (
                          <div
                            key={index}
                            className={cn(
                              'flex items-center md:min-w-[42.5%] gap-2 flex-shrink cursor-pointer'
                            )}
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
                                src={getImageUrl(file)}
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
            </div>{' '}
            <Divider className='my-1' />
            <When isTrue={treatmentStatus === 'APPROVED' && stlPermissions?.isViewable}>
              <div className='mb-2'>
                <StlFilesSection
                  {...{
                    treatmentPlanList: allTreatmentPlanList,
                    isClone: true,
                  }}
                />
              </div>
            </When>
            <When isTrue={isPurchaseOrder}>
              <div className='flex flex-col-reverse md:flex-row justify-end gap-3'>
                <When isTrue={treatmentStatus === 'PENDING_APPROVAL'}>
                  <AntdButton
                    onClick={() => {
                      setShowReplanModal(true)
                    }}
                    className='bg-redSupport text-red hover:!bg-redSupport hover:!text-red border border-red h-12 font-semibold text-base'
                    text='Request for replan'
                  />
                </When>
                <When isTrue={!hasValue(sentToPracticeTreatmentPlan)}>
                  <AntdButton
                    onClick={() => {
                      const queryParams = new URLSearchParams()
                      if (hasValue(orderId)) queryParams.append('order_id', String(orderId))
                      const queryString = queryParams.toString()

                      navigate(
                        `/plan/${patientId}/setup-treatment-plan/${treatmentId}${
                          queryString ? `?${queryString}` : ''
                        }`
                      )
                    }}
                    className='md:w-fit w-full border bg-primaryColor hover:!bg-primaryColor text-white hover:!text-white h-12 font-semibold text-base'
                    text='Send for approval'
                  />
                </When>
              </div>
            </When>
            <When isTrue={showReplanModal}>
              <ReplanTreatmentModal
                {...{
                  setShowReplanModal,
                  isClone: hasValue(
                    sentToPracticeTreatmentPlan?.treatment_plan_metadata?.replan_reason
                  )
                    ? true
                    : false,
                  initialComment:
                    sentToPracticeTreatmentPlan?.treatment_plan_metadata?.replan_reason,
                }}
              />
            </When>
          </div>
        </ReviewPlanWrapper>
      )}
    </>
  )
}

export default ReceivedPlan
