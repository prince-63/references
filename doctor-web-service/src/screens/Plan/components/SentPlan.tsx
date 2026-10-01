import {Divider} from 'antd'
import ViewInformationSection from 'components/section/ViewInformationSection'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ShowDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ShowDetails'
import UploadedTreatmentPlanSection from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/UploadedTreatmentPlanSection'
import pdfPng from 'assets/images/Pdf.png'
import {formatPluralizedString, getImageUrl} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import {Image} from 'assets/images/Images/Image'
import cn from '@utils/cn'
import TextWithTooltip from 'components/section/TextWithTooltip'
import ReviewPlanWrapper from './ReviewPlanWrapper'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useNavigate, useParams} from 'react-router-dom'
import Tag from 'components/tags/Tag'
import getTreatmentPlanStatusTagClassName from '@utils/getTreatmentPlanStatusTagClassName'
import dayjs from 'dayjs'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import mappedTreatmentPlanStatusConstants from '@constants/mappedTreatmentPlanStatus.constants'
import {getTreatmentPlanStatus} from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/helpers/getTreatmentPlanStatus'
import AlignerDetails from './AlignerDetails'
import InfoIcon from 'assets/icons/InfoIcon'
import moment from 'moment'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {useState} from 'react'
import StlFilesSectionSentOrders from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/StlFilesSectionSentOrders'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'

const SentPlan = () => {
  const {sentToPracticeTreatmentPlan: treatmentPlan} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {patientId} = useParams()
  const navigate = useNavigate()
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const treatmentStatus = getTreatmentPlanStatus({
    treatmentPlan,
  }) as keyof typeof treatmentPlanStatusConstants
  const status = mappedTreatmentPlanStatusConstants[treatmentStatus]
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const isCustomerPatient = data?.patient_details?.assigned_practice?.is_customer_patient

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
  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {!pdfViewer.isOpen && (
        <ReviewPlanWrapper isSent>
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
          <When isTrue={!hasValue(treatmentPlan)}>
            <div className='flex flex-col gap-2 items-center justify-center text-textColor h-full text-base '>
              <div className='p-3 rounded-full w-fit h-fit bg-lightGray'>
                <ClipBoardIcon width='32' height='32' />
              </div>
              <p className='text-center'>Not sent yet</p>
            </div>
          </When>
          <When isTrue={hasValue(treatmentPlan)}>
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
                      titleClassName='text-black text-sm font-medium'
                      infoIconColor='#735bf2'
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
                  <AlignerDetails />
                </div>
              </ViewInformationSection>
              <Divider className='my-1' />
              <div className='flex gap-6'>
                <ShowDetails
                  label='Brand name'
                  value={treatmentPlan?.production_lab_details?.brand_name}
                />
                <ShowDetails
                  label='Recommended days to wear each aligner'
                  value={formatPluralizedString(treatmentPlan!.days_to_wear_each_aligner, 'day')}
                />
                <ShowDetails
                  label='Recommended daily wear hours'
                  value={formatPluralizedString(
                    treatmentPlan!.recommended_hours_to_wear_aligners,
                    'hour'
                  )}
                />
              </div>
              <Divider className='my-1' />
              <ShowDetails label='Remarks' value={treatmentPlan?.remarks} className='w-full' />
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
              </div>
              <Divider className='my-1' />
              <When isTrue={treatmentStatus === 'APPROVED' && isCustomerPatient}>
                <div className='mb-2'>
                  <StlFilesSectionSentOrders treatmentPlan={treatmentPlan} />
                </div>
              </When>
              <When isTrue={status === 'Draft'}>
                <Divider className='my-1' />
                <div className='flex flex-col-reverse md:flex-row justify-end gap-3'>
                  <AntdButton
                    onClick={() => {
                      const queryParams = new URLSearchParams()
                      if (hasValue(treatmentPlan?.order_id))
                        queryParams.append('order_id', String(treatmentPlan?.order_id))
                      const queryString = queryParams.toString()

                      navigate(
                        `/plan/${patientId}/setup-treatment-plan/${treatmentPlan?.treatment_plan_id}${
                          queryString ? `?${queryString}` : ''
                        }`,
                        {
                          state: {
                            toBeCloned: false,
                          },
                        }
                      )
                    }}
                    className='md:w-fit w-full border bg-[#735bf2] text-white h-12 font-semibold text-base'
                    text='Send for approval'
                  />
                </div>
              </When>
            </div>
          </When>
        </ReviewPlanWrapper>
      )}
    </>
  )
}

export default SentPlan
