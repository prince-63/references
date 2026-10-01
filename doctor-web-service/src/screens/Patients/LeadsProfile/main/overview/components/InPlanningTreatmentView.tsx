import {Divider} from 'antd'
import clsx from 'clsx'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import TextWithTooltip from 'components/section/TextWithTooltip'
import ViewInformationSection from 'components/section/ViewInformationSection'
import When from 'components/when/When'
import {useState} from 'react'
import {formatPluralizedString, getImageUrl} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import Show3dPlanningLink from '../../treatment/viewTreatmentPlan/components/Show3dPlanningLink'
import ShowDetails from '../../treatment/viewTreatmentPlan/components/ShowDetails'
import {Image} from 'assets/images/Images/Image'
import dayjs from 'dayjs'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import pdfPng from 'assets/images/Pdf.png'
import UploadedTreatmentPlanSection from '../../treatment/viewTreatmentPlan/UploadedTreatmentPlanSection'
import Show3dPlanningFullView from '../../treatment/viewTreatmentPlan/components/Show3dPlanningFullView'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import Tag from 'components/tags/Tag'
import {useLocation} from 'react-router-dom'
import PDFWebview from '../../files/components/PDFWebview'

interface IFile {
  name: string
  url: string
  type: string
  extension: string
  is_gdrive_platform?: boolean
  thumbnail_url?: string
}

const InPlanningTreatmentView = () => {
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [isShowOtherPhotos, setIsShowOtherPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showFullView, setShowFullView] = useState(false)
  const {treatmentPlan: treatmentData} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)

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

  const location = useLocation()
  const isExistingCase = location.pathname.includes('/add_patient/existing_case')

  const treatmentPlan = isExistingCase
    ? treatmentData
    : gettingStartedStepData?.in_planning?.active_treatment_plan

  // get correct jaw ranges
  const startUpperJaw = isExistingCase
    ? treatmentData?.aligner_details_meta_data?.upper_jaw?.starts_with === 0
      ? null
      : treatmentData?.aligner_details_meta_data?.upper_jaw?.starts_with
    : gettingStartedStepData?.in_planning?.active_treatment_plan?.start_upper_jaw

  const endUpperJaw = isExistingCase
    ? treatmentData?.aligner_details_meta_data?.upper_jaw?.ends_with === 0
      ? null
      : treatmentData?.aligner_details_meta_data?.upper_jaw?.ends_with
    : gettingStartedStepData?.in_planning?.active_treatment_plan?.end_upper_jaw

  const startLowerJaw = isExistingCase
    ? treatmentData?.aligner_details_meta_data?.lower_jaw?.starts_with === 0
      ? null
      : treatmentData?.aligner_details_meta_data?.lower_jaw?.starts_with
    : gettingStartedStepData?.in_planning?.active_treatment_plan?.start_lower_jaw

  const endLowerJaw = isExistingCase
    ? treatmentData?.aligner_details_meta_data?.lower_jaw?.ends_with === 0
      ? null
      : treatmentData?.aligner_details_meta_data?.lower_jaw?.ends_with
    : gettingStartedStepData?.in_planning?.active_treatment_plan?.end_lower_jaw

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <div>
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
          <When isTrue={isShowOtherPhotos}>
            <ImageViewer
              setIsShowPhotos={setIsShowOtherPhotos}
              selectedImagesList={treatmentPlan?.other_files?.map((file, index) => ({
                id: index,
                src: getImageUrl(file),
                width: '100%',
                height: '100%',
              }))}
              selectedIndex={selectedIndex}
            />
          </When>
          {showFullView && (
            <Show3dPlanningFullView
              setShowFullView={setShowFullView}
              link={treatmentPlan?.treatment_planning_link ?? ''}
            />
          )}
          <BorderedCard>
            <div className='flex flex-col gap-5'>
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
                    <When isTrue={hasValue(treatmentPlan?.created_at)}>
                      <div className='flex gap-2 items-center'>
                        <p className='text-textColor text-sm'>
                          Created on {dayjs(treatmentPlan?.created_at).format('DD-MMM-YYYY')}
                        </p>
                        {!isExistingCase && (
                          <Tag
                            value='Active'
                            className='bg-tertiarySupport text-tertiaryColor text-sm font-semibold'
                          />
                        )}
                      </div>
                    </When>
                  </div>
                }
              >
                <div className='flex flex-col gap-3'>
                  <ShowDetails
                    label='Treatment plan'
                    value={
                      <UploadedTreatmentPlanSection
                        {...{
                          treatmentPlan: treatmentData,
                        }}
                      />
                    }
                  />
                  <div className='flex gap-6 mt-4'>
                    <ShowDetails
                      label='Total aligners'
                      value={
                        hasValue(treatmentPlan) ? <div>{treatmentPlan.total_aligners}</div> : null
                      }
                    />
                    <ShowDetails
                      label='Upper jaw'
                      value={
                        !startUpperJaw && !endUpperJaw
                          ? null
                          : `Aligner ${startUpperJaw} - ${endUpperJaw}`
                      }
                    />
                    <ShowDetails
                      label='Lower jaw range'
                      value={
                        !startLowerJaw && !endLowerJaw
                          ? null
                          : `Aligner ${startLowerJaw} - ${endLowerJaw}`
                      }
                    />
                  </div>
                </div>
              </ViewInformationSection>
              <Divider className='my-1' />
              <div className='flex gap-6'>
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
              <div className='flex flex-col gap-3'>
                <ShowDetails
                  label='Files'
                  className='w-full'
                  valueClassName={clsx(
                    !hasValue(treatmentPlan?.files) && 'md:w-1/2',
                    'text-text-color font-normal  md:text-end'
                  )}
                  value={
                    treatmentPlan?.files ? (
                      <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between '>
                        {treatmentPlan?.files &&
                          treatmentPlan?.files.map((file: IFile, index: number) => (
                            <div
                              key={index}
                              className={clsx(
                                'flex items-center md:min-w-[42.5%] gap-2 flex-shrink '
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
                <ShowDetails label='Remarks' value={treatmentPlan?.remarks} className='w-full' />

                <ShowDetails
                  label='Other Files'
                  className='w-full'
                  valueClassName={clsx(
                    !hasValue(treatmentPlan?.other_files) && 'md:w-1/2',
                    'text-text-color font-normal  md:text-end'
                  )}
                  value={
                    treatmentPlan?.other_files ? (
                      <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between '>
                        {treatmentPlan?.other_files &&
                          treatmentPlan?.other_files.map((file: IFile, index: number) => (
                            <div
                              key={index}
                              className={clsx(
                                'flex items-center md:min-w-[42.5%] gap-2 flex-shrink '
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
            </div>
          </BorderedCard>
          <When isTrue={hasValue(treatmentPlan?.treatment_planning_link) && !isExistingCase}>
            <BorderedCard cardClassName='mb-3'>
              <div className='flex flex-col gap-3'>
                <div className='flex flex-col md:flex-row gap-3 justify-between'>
                  <p className='font-semibold text-xl'>{'Treatment plan 3D view'}</p>
                  <button
                    className='md:w-fit w-full float-end bg-primarySupport border border-primaryColor text-primaryColor font-semibold px-2 py-1 rounded-lg'
                    onClick={() => setShowFullView(true)}
                  >
                    Fullscreen view
                  </button>
                </div>

                <div className='w-full border border-lightGray mb-1 mx-1'></div>

                <Show3dPlanningLink link={treatmentPlan?.treatment_planning_link ?? ''} />
              </div>
            </BorderedCard>
          </When>
        </div>
      )}
    </>
  )
}

export default InPlanningTreatmentView
