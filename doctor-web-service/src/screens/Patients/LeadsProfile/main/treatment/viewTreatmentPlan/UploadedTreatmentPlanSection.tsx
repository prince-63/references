import {ITreatmentPlan, IVideoFile, VideoPositionKey} from '../types/treatmentPlan.types'
import When from 'components/when/When'
import uploadTreatmentPlanConstants from '@constants/uploadTreatmentPlan.constants'
import hasValue from 'utils/hasValue'
import ShowDetails from './components/ShowDetails'
import {CommonVideoView} from '../setUpTreatmentPlan/components/CommonVideoView'
import {BOTTOM_VIEW, FRONT_VIEW, LEFT_SIDE_VIEW, RIGHT_SIDE_VIEW, TOP_VIEW} from 'utils/ImageConst'
import PdfIconNew from 'assets/icons/PdfIconNew'
import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import {useState} from 'react'
import PDFWebview from '../../files/components/PDFWebview'
import ModalLayout from 'components/modal/ModalLayout'
import Show3dPlanningLink from './components/Show3dPlanningLink'
import {useMediaQuery} from 'react-responsive'
import {isPdfUrl} from 'utils/ConstFunctions'

const videoPositions: {key: VideoPositionKey; title: string; icon: React.ReactNode}[] = [
  {key: 'FRONT', title: 'Front', icon: FRONT_VIEW},
  {key: 'TOP', title: 'Top', icon: TOP_VIEW},
  {key: 'BOTTOM', title: 'Bottom', icon: BOTTOM_VIEW},
  {key: 'LEFT', title: 'Left', icon: LEFT_SIDE_VIEW},
  {key: 'RIGHT', title: 'Right', icon: RIGHT_SIDE_VIEW},
]

const UploadedTreatmentPlanSection = ({treatmentPlan}: {treatmentPlan: ITreatmentPlan}) => {
  const treatmentPlanUploadType = treatmentPlan?.treatment_plan_upload_type

  // PDF viewer state
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})

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

  const handleOpenLink = () => {
    const planningLink = treatmentPlan?.treatment_planning_link
    if (!hasValue(planningLink)) return

    if (isPdfUrl(planningLink ?? '')) {
      handleOpenPDF(planningLink ?? '', 'Treatment Plan PDF')
      return
    }

    if (isMobile) {
      setIsLinkModalOpen(true)
    } else {
      window.open(planningLink, '_blank', 'noopener,noreferrer')
    }
  }

  const handleCloseLinkModal = () => {
    setIsLinkModalOpen(false)
  }

  const videoFileUrls: Record<VideoPositionKey, IVideoFile | null> = treatmentPlan.video_files ?? {
    SINGLE_VIDEO: null,
    TOP: null,
    BOTTOM: null,
    RIGHT: null,
    LEFT: null,
    FRONT: null,
  }

  const renderVideoInput = (key: VideoPositionKey) => {
    return (
      hasValue(videoFileUrls[key]) && (
        <div className='mt-2'>
          <CommonVideoView videoKey={key} videoFileUrls={videoFileUrls} showCrossButton={false} />
        </div>
      )
    )
  }

  return (
    <div>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {isLinkModalOpen && hasValue(treatmentPlan?.treatment_planning_link) && (
        <ModalLayout
          className='w-[90%] max-w-5xl h-[90vh]'
          onClose={handleCloseLinkModal}
          title='Treatment plan link'
        >
          <div className='h-full'>
            <Show3dPlanningLink link={treatmentPlan?.treatment_planning_link ?? ''} />
          </div>
        </ModalLayout>
      )}

      {!pdfViewer.isOpen && (
        <>
          <When
            isTrue={
              treatmentPlanUploadType === uploadTreatmentPlanConstants.TREATMENT_PLANNING_LINK
            }
          >
            <ShowDetails
              label=''
              value={
                hasValue(treatmentPlan?.treatment_planning_link) ? (
                  <button
                    type='button'
                    onClick={handleOpenLink}
                    className='flex items-center gap-1 font-semibold text-[#735BF2] text-base cursor-pointer bg-transparent border-0 p-0'
                  >
                    <LinkSimpleIcon width='22' height='22' color='#735BF2' />
                    <p>View link</p>
                  </button>
                ) : null
              }
            />
          </When>
          <When
            isTrue={
              treatmentPlanUploadType === uploadTreatmentPlanConstants.UPLOAD_SINGLE_VIDEO ||
              treatmentPlanUploadType === uploadTreatmentPlanConstants.UPLOAD_MULTIPLE_VIDEOS
            }
          >
            <When isTrue={hasValue(treatmentPlan?.video_files)}>
              {hasValue(treatmentPlan?.video_files) && (
                <div className='flex justify-start flex-wrap md:gap-4 gap-2'>
                  {videoPositions.map(({key}) => (
                    <When key={key} isTrue={hasValue(videoFileUrls[key])}>
                      <div>{renderVideoInput(key as VideoPositionKey)} </div>
                    </When>
                  ))}
                </div>
              )}
              {hasValue(treatmentPlan?.video_files?.SINGLE_VIDEO) && (
                <CommonVideoView
                  videoKey={'SINGLE_VIDEO'}
                  videoFileUrls={videoFileUrls}
                  showCrossButton={false}
                />
              )}
            </When>
          </When>
          <When isTrue={treatmentPlanUploadType === uploadTreatmentPlanConstants.UPLOAD_PDF}>
            <div className='text-textColor flex flex-col gap-2'>
              <p className=''>PDF</p>
              <div
                className='border border-mediumGray h-20 w-20 rounded-lg flex justify-center items-center cursor-pointer'
                onClick={() => {
                  const pdfFile = treatmentPlan?.pdf_files?.[0]
                  if (pdfFile?.url) {
                    // Use handleOpenPDF instead of openDocument
                    handleOpenPDF(pdfFile.url, pdfFile.name || 'Treatment Plan PDF')
                  }
                }}
              >
                <PdfIconNew />
              </div>
            </div>
          </When>
          <When
            isTrue={
              treatmentPlanUploadType === uploadTreatmentPlanConstants.DO_NOT_UPLOAD ||
              !treatmentPlanUploadType
            }
          >
            <p className='text-base text-textColor font-medium'>Not added</p>
          </When>
        </>
      )}
    </div>
  )
}

export default UploadedTreatmentPlanSection
