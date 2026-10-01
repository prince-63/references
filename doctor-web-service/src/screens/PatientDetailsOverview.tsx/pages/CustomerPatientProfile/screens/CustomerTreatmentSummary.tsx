import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import Page from 'components/page/Page'
import When from 'components/when/When'
import dayjs from 'dayjs'
import {
  ClipboardList,
  Download,
  FileText,
  Info,
  Paperclip,
  Ruler,
  SlidersHorizontal,
} from 'lucide-react'
import {useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {
  createTreatmentPlan,
  getTreatmentPlan,
  setOpenApprovePendingActionModal,
  setOpenConfirmFinalizeModal,
  setOpenDeactivateTreatmentPlanModal,
  setOpenDeleteDraftPlanModal,
  setOpenDraftModal,
  setOpenExistingActiveTreatmentPlanModal,
  setOpenTreatmentStartingModal,
  setSelectedTreatmentPlanId,
  setTreatmentId,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import formatAligners from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/helpers/formatAligners'
import ReplanTreatmentModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/ReplanTreatmentModal'
import ConfirmApprovalModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ConfirmApprovalModal'
import Show3dPlanningFullView from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/Show3dPlanningFullView'
import Show3dPlanningLink from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/Show3dPlanningLink'
import {getPlanStatus} from '@utils/getPlanStatus'
import {
  ApiGetData,
  DRIVE_IMAGE_PREFIX,
  formatPluralizedString,
  getImageUrl,
  identifyUser,
  openDocument,
  openDriveUrls,
  safeParseInt,
} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'
import {Image} from 'assets/images/Images/Image'
import pdfPng from 'assets/images/Pdf.png'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import hasValue from 'utils/hasValue'
import videoUploadTypesConstants from '@constants/videoUploadTypes.constants'
import ReactPlayer from 'react-player'
import videoView from 'assets/images/videoView.png'
import {unReviewableExtension} from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/CommonVideoView'
import TreatmentPlanActions from 'screens/PatientDetailsOverview.tsx/components/TreatmentPlanActions'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import SendForApprovalModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/SendForApprovalModal'
import ArchiveConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ArchiveConfirmationModal'
import {AuthContext} from 'context/AuthContext'
import DeleteDraftConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/DeleteDraftConfirmationModal'
import {getNewTreatmentList} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import CustomerSTLFiles from './CustomerSTLFiles'
import {allFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {downloadFromUrl} from 'utils/download'

const CustomerTreatmentSummary = () => {
  const {userId} = useContext(AuthContext)
  const {patientId, treatmentId} = useParams()
  const {isStarterPlanUser} = useAllUserPlan()
  const [searchParams] = useSearchParams()
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const colorPalette = getColorPalette()
  const {
    treatmentPlan,
    getTreatmentPlanLoading,
    treatmentPlanList,
    getTreatmentPlanListLoading,
    openDeleteDraftPlanModal,
  } = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false)
  const [showReplanModal, setShowReplanModal] = useState(false)
  const [showConfirmApprovalModal, setShowConfirmApprovalModal] = useState(false)
  const [showFullView, setShowFullView] = useState(false)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeVideoUrl, setActiveVideoUrl] = useState('')
  const [activeVideoLabel, setActiveVideoLabel] = useState('')
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })
  const isPurchaseOrder = searchParams.get('isPurchaseOrder') === 'true'
  const [showSendForApprovalModal, setShowSendForApprovalModal] = useState(false)
  const isNew = searchParams.get('isNew') === 'true'
  const isDraft = searchParams.get('draft') === 'true'
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const isTrackingEnabled = dataLeadsOverview?.tracking?.enabled

  useEffect(() => {
    if (!treatmentId) return
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: treatmentId?.toString() ?? '',
      })
    )
  }, [dispatchAction, treatmentId])

  const treatmentStatus = treatmentPlan
    ? (getPlanStatus({treatmentPlan}) as keyof typeof treatmentPlanStatusConstants)
    : treatmentPlanStatusConstants.DRAFT

  const orderId = searchParams.get('order_id')
  const backRoute = `${profileBasePath}/${patientId}/plans${orderId ? `?order_id=${orderId}` : ''}`

  const upperRange = treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range ?? []
  const lowerRange = treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range ?? []
  const upperSeries = upperRange.length ? formatAligners(upperRange).join(' • ') : 'Not Added'
  const lowerSeries = lowerRange.length ? formatAligners(lowerRange).join(' • ') : 'Not Added'

  const totalAligners =
    treatmentPlan?.total_aligners ??
    (upperRange.length || lowerRange.length ? upperRange.length + lowerRange.length : null)
  const totalAlignersLabel = totalAligners ?? '-'
  const stagesLabel = treatmentPlan?.stages ?? '-'
  const wearDaysLabel =
    treatmentPlan?.days_to_wear_each_aligner != null
      ? `${formatPluralizedString(treatmentPlan.days_to_wear_each_aligner, 'day')} / aligner`
      : '-'
  const wearHoursLabel =
    treatmentPlan?.recommended_hours_to_wear_aligners != null
      ? formatPluralizedString(treatmentPlan.recommended_hours_to_wear_aligners, 'hour')
      : '-'

  const statusLabel =
    treatmentStatus === treatmentPlanStatusConstants.PENDING_APPROVAL ||
    treatmentStatus === treatmentPlanStatusConstants.SENT_FOR_APPROVAL
      ? 'Pending approval'
      : treatmentStatus === treatmentPlanStatusConstants.APPROVED
        ? 'Approved'
        : treatmentStatus === treatmentPlanStatusConstants.RE_PLAN
          ? 'In revision'
          : 'In progress'

  const statusStyles = (() => {
    if (treatmentStatus === treatmentPlanStatusConstants.APPROVED) {
      return {
        color: colorPalette.tertiaryColor,
        backgroundColor: colorPalette.tertiarySupport,
        borderColor: `${colorPalette.tertiaryColor}40`,
      }
    }
    if (
      treatmentStatus === treatmentPlanStatusConstants.PENDING_APPROVAL ||
      treatmentStatus === treatmentPlanStatusConstants.SENT_FOR_APPROVAL
    ) {
      return {
        color: colorPalette.orange,
        backgroundColor: colorPalette.orangeSupport2,
        borderColor: `${colorPalette.orange}40`,
      }
    }
    return {
      color: colorPalette.secondaryColor,
      backgroundColor: colorPalette.secondarySupport,
      borderColor: `${colorPalette.secondaryColor}40`,
    }
  })()

  const planningLink = treatmentPlan?.treatment_planning_link ?? ''
  const planningVideos = Array.isArray(treatmentPlan?.treatment_plan_videos)
    ? treatmentPlan?.treatment_plan_videos
    : []
  const hasPlanningLink = hasValue(planningLink)
  const isPlanningLinkPdf = hasPlanningLink
    ? String(planningLink).toLowerCase().split('?')[0].endsWith('.pdf')
    : false
  const hasPlanningVideos = planningVideos.length > 0

  const mapVideoKeyToLabel = (key: string): string => {
    switch (key) {
      case videoUploadTypesConstants.SINGLE_VIDEO:
        return 'Single'
      case 'FRONT_VIDEO':
        return 'Front'
      case 'TOP_VIDEO':
        return 'Top'
      case 'BOTTOM_VIDEO':
        return 'Bottom'
      case 'LEFT_VIDEO':
        return 'Left'
      case 'RIGHT_VIDEO':
        return 'Right'
      default:
        return key
    }
  }

  const otherFiles = useMemo(
    () =>
      Array.isArray((treatmentPlan as any)?.other_files) ? (treatmentPlan as any).other_files : [],
    [treatmentPlan]
  )
  const treatmentPlanFiles = useMemo(
    () => (Array.isArray(treatmentPlan?.files) ? treatmentPlan.files : []),
    [treatmentPlan?.files]
  )
  const allFiles = useMemo(
    () => [...treatmentPlanFiles, ...otherFiles],
    [otherFiles, treatmentPlanFiles]
  )

  const imageFiles = useMemo(() => {
    const files = allFiles ?? []
    return files.filter((file: any) => {
      const extension = String(file?.extension || '').toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(extension)
    })
  }, [allFiles])

  const imageSlides = useMemo(
    () =>
      imageFiles.map((file: any, index: number) => ({
        id: file?.file_id ?? `${file?.url ?? file?.name ?? index}`,
        src: getImageUrl(file),
        width: '100%',
        height: '100%',
      })),
    [imageFiles]
  )

  const renderFileActions = (files: any[]) => (
    <div className='flex flex-col gap-2'>
      {files.map((file: any, index: number) => {
        const extension = String(file.extension || '').toLowerCase()
        const isPdf = extension === 'pdf'
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(extension)
        return (
          <button
            type='button'
            key={`${file.url ?? file.name ?? index}`}
            className={`flex items-center gap-2 text-left ${
              isPdf || isImage ? 'cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => {
              if (isPdf) {
                handleOpenPDF(file)
              } else if (isImage) {
                handleOpenImagePreview(file)
              }
            }}
            disabled={!isPdf && !isImage}
          >
            {isPdf ? (
              <Image className='w-10 h-10 rounded-[4px]' size={20} src={pdfPng} />
            ) : isImage ? (
              <Image
                className='w-10 h-10 rounded-[4px] border border-lightGray object-cover'
                size={20}
                src={getImageUrl(file)}
                showLoading={true}
              />
            ) : (
              <div className='w-10 h-10 rounded-[4px] border border-lightGray bg-white flex items-center justify-center text-[10px] text-textColor'>
                {extension || 'FILE'}
              </div>
            )}
            <div className='text-xs text-textColor truncate max-w-[220px]'>
              {file.name ?? file.file_name ?? `File ${index + 1}`}
            </div>
          </button>
        )
      })}
    </div>
  )

  const callGetTreatmentPlan = async () => {
    if (isNew || isDraft) return
    await dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: treatmentId?.toString() ?? '',
      })
    )
  }
  useEffect(() => {
    if (isNew && !hasValue(treatmentPlan)) {
      // navigate(`/leads-profile/${patientId}/treatment`)
      navigate(`${profileBasePath}/${patientId}/plans-list`)
      return
    }
    callGetTreatmentPlan()
  }, [])

  const handleOpenImagePreview = (file: any) => {
    const fileKey = file?.file_id ?? file?.url ?? file?.name
    const imageIndex = imageFiles.findIndex(
      (imageFile: any) => (imageFile?.file_id ?? imageFile?.url ?? imageFile?.name) === fileKey
    )
    setSelectedIndex(Math.max(imageIndex, 0))
    setIsShowPhotos(true)
  }

  const handleOpenPDFUrl = (url: string, fileName?: string) => {
    if (!url) return
    if (url.startsWith(DRIVE_IMAGE_PREFIX)) {
      openDriveUrls(url)
      return
    }
    setPdfViewer({isOpen: true, url, fileName})
  }

  const handleOpenPDF = (file: any) => {
    const url = getImageUrl(file) || file?.url || ''
    handleOpenPDFUrl(url, file?.name ?? file?.file_name)
  }

  const getGoogleDriveFileId = (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return null
    const fileMatch = trimmed.match(/\/file\/d\/([^/]+)/)
    if (fileMatch?.[1]) return fileMatch[1]
    const idMatch = trimmed.match(/[?&]id=([^&]+)/)
    if (idMatch?.[1]) return idMatch[1]
    const ucMatch = trimmed.match(/\/uc\?export=download&id=([^&]+)/)
    if (ucMatch?.[1]) return ucMatch[1]
    return null
  }

  const getGoogleDriveDownloadUrl = (url: string) => {
    const fileId = getGoogleDriveFileId(url)
    return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : null
  }

  const getVideoDownloadUrl = (video: any, videoUrl: string) => {
    const downloadUrl = String(video?.download_url ?? '').trim()
    return downloadUrl || getGoogleDriveDownloadUrl(videoUrl) || videoUrl
  }

  const getVideoFileName = (video: any, label?: string) => {
    const fileName = String(video?.file_name ?? video?.name ?? '').trim()
    if (fileName) return fileName

    const videoUrl = String(video?.video_url ?? '')
    const urlFileName = decodeURIComponent(videoUrl.split('?')[0].split('/').pop() ?? '').trim()
    return urlFileName || `${label ? `${label}-` : ''}planning-video.mp4`
  }

  const handleDownloadVideo = (video: any, videoUrl: string, label?: string) => {
    const downloadUrl = getVideoDownloadUrl(video, videoUrl)
    if (!downloadUrl) return
    downloadFromUrl(downloadUrl, getVideoFileName(video, label))
  }

  const handleOpenVideo = (url: string, label?: string) => {
    if (!url) return
    const downloadUrl = getGoogleDriveDownloadUrl(url)
    if (downloadUrl) {
      openDocument(downloadUrl)
      return
    }
    setActiveVideoUrl(url)
    setActiveVideoLabel(label ?? '')
  }

  const handleCloseVideo = () => {
    setActiveVideoUrl('')
    setActiveVideoLabel('')
  }

  const handleClosePDF = () => {
    setPdfViewer({isOpen: false, url: '', fileName: ''})
  }

  const handleOnClick = async (
    treatmentPlanStatus: keyof typeof treatmentPlanStatusConstants = treatmentPlanStatusConstants.ACTIVE
  ) => {
    identifyUser()
    if (treatmentPlanStatus === treatmentPlanStatusConstants.DEACTIVATED) {
      dispatchAction(setSelectedTreatmentPlanId(treatmentPlan.treatment_plan_id))
      if (treatmentPlan?.aligner_journey_id && treatmentPlan?.pending_action_count > 0) {
        dispatchAction(setOpenApprovePendingActionModal(true))
        return
      }
      dispatchAction(setOpenDeactivateTreatmentPlanModal(true))
      return
    }

    if (treatmentPlanStatus === treatmentPlanStatusConstants.APPROVED) {
      setShowConfirmApprovalModal(true)
      return
    }
    if (treatmentPlanStatus === treatmentPlanStatusConstants.SENT_FOR_APPROVAL) {
      setShowSendForApprovalModal(true)
      return
    }
    if (treatmentPlanStatus === treatmentPlanStatusConstants.ARCHIVED) {
      setShowConfirmArchiveModal(true)
      return
    }
    if (treatmentPlanStatus === treatmentPlanStatusConstants.RE_PLAN) {
      setShowReplanModal(true)
      return
    }
    const isActive = treatmentPlanStatus === treatmentPlanStatusConstants.ACTIVE
    const hasActivePlan =
      treatmentPlanList &&
      treatmentPlanList.some(
        (item) =>
          item.status === treatmentPlanStatusConstants.ACTIVE ||
          item.status === treatmentPlanStatusConstants.PAUSED
      )
    const hasDeactivatedPlan =
      treatmentPlanList &&
      treatmentPlanList.some((item) => item.status === treatmentPlanStatusConstants.DEACTIVATED)

    const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
      treatmentPlan

    if (isActive) {
      if (!hasActivePlan && hasDeactivatedPlan && isTrackingEnabled) {
        if (treatmentPlan.is_approved_by_patient) {
          dispatchAction(setOpenTreatmentStartingModal(true))
          return
        } else {
          dispatchAction(setOpenConfirmFinalizeModal(true))
          return
        }
      }
      if (hasActivePlan && treatmentPlan.is_approved_by_patient) {
        dispatchAction(setOpenExistingActiveTreatmentPlanModal(true))
        return
      } else {
        if (!treatmentPlan.is_approved_by_patient) {
          dispatchAction(setOpenConfirmFinalizeModal(true))
          return
        }
      }
    }

    if (treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT) {
      dispatchAction(setOpenDraftModal(true))
      return
    }

    dispatchAction(
      createTreatmentPlan({
        details: {
          aligner_treatment_details: aligner_details_meta_data,
          treatment_plan_id: treatmentPlan?.treatment_plan_id,
          treatment_sub_type: treatmentTypeMain.ALIGNERS,
          production_lab_details: treatmentPlan.production_lab_details,
          days_to_wear_each_aligner: treatmentPlan.days_to_wear_each_aligner,
          recommended_hours_to_wear_aligners: treatmentPlan.recommended_hours_to_wear_aligners,
          treatment_planning_software: treatmentPlan.treatment_planning_software,
          treatment_planning_link: treatmentPlan.treatment_planning_link,
          remarks: treatmentPlan.remarks,
          doctor_id: treatmentPlan.doctor_id,
          patient_id: treatmentPlan.patient_id,
          status: treatmentPlanStatus,
          video_display_to_patient: treatmentPlan.is_video_display_patient,
          link_display_patient: treatmentPlan.is_link_display_patient,
          approved_by_patient_at: null,
          treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
          approver_status: treatmentPlanStatus,
          initiator_status: treatmentPlanStatus,
          file_ids_to_clone: treatmentPlan.file_ids_to_clone,
          ...(hasValue(orderId) && {order_id: orderId}),
          order_status_changed_at: new Date().toISOString(),
          treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
        },
        files: filesToSave,
        other_files: otherFilesToSave,
        video_files: video_files_to_save,
        pdf_file: treatmentPlan.pdf_file_to_save,
      })
    )
      .unwrap()
      .then(() => {
        if (treatmentPlanStatus === treatmentPlanStatusConstants.ACTIVE) {
          const postData: ApiGetData = {
            data: {
              patient_id: safeParseInt(patientId),
              doctor_id: safeParseInt(userId),
            },
          }
          dispatchAction(getApiLeadsOverview(postData))
          dispatchAction(
            getLeadsProfileDetails({
              patient_id: safeParseInt(patientId),
              doctor_id: safeParseInt(userId),
            })
          )
          callGetTreatmentPlan()
          // navigate(`/leads-profile/${patientId}/treatment`, {replace: true})
          navigate(`${profileBasePath}/${patientId}/plans-list`)
        }
      })
      .catch(() => {})
  }

  const handleDeleteDraft = ({planId}: {planId: number}) => {
    dispatchAction(setTreatmentId(planId))
    dispatchAction(setOpenDeleteDraftPlanModal(true))
  }

  const handleEditClick = () => {
    navigate(
      `/${patientId}/plans-list/edit/setupTreatmentPlan/${treatmentId}?order_id=${orderId}`,
      {
        state: {isEdit: true},
      }
    )
  }

  const getPlanList = () => {
    const payload = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
      treatment_subtype: 'ALIGNERS',
      order_id: orderId ?? null,
    }
    dispatchAction(getNewTreatmentList(payload))
  }

  const getStlFiles = () => {
    if (!treatmentPlan) return
    dispatchAction(
      allFile({
        doctor_id: String(userId),
        patient_id: String(patientId),
        path: `/Orders/STL ${treatmentPlan?.treatment_plan_name + treatmentPlan.treatment_plan_id}`,
      })
    )
  }
  return (
    <>
      {activeVideoUrl && (
        <div
          className='fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center'
          onClick={handleCloseVideo}
        >
          <div
            className='relative w-[90%] h-[90%] bg-black rounded-lg'
            onClick={(event) => event.stopPropagation()}
          >
            {activeVideoLabel ? (
              <div className='absolute top-3 left-3 z-10 rounded-md bg-black/70 px-3 py-1 text-xs font-semibold text-white'>
                {activeVideoLabel}
              </div>
            ) : null}
            <button
              type='button'
              className='absolute top-3 right-3 z-10 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white'
              onClick={handleCloseVideo}
            >
              Close
            </button>
            <ReactPlayer
              url={activeVideoUrl}
              playing={true}
              controls={true}
              width='100%'
              height='100%'
            />
          </div>
        </div>
      )}
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      <When isTrue={isShowPhotos && hasValue(imageSlides)}>
        <ImageViewer
          setIsShowPhotos={setIsShowPhotos}
          selectedImagesList={imageSlides}
          selectedIndex={selectedIndex}
        />
      </When>
      <When isTrue={showReplanModal}>
        <ReplanTreatmentModal setShowReplanModal={setShowReplanModal} successRedirect={backRoute} />
      </When>
      <When isTrue={showConfirmApprovalModal}>
        <ConfirmApprovalModal
          setShowConfirmApprovalModal={setShowConfirmApprovalModal}
          isCustomerPatientProfile={true}
          successRedirect={backRoute}
        />
      </When>
      <When isTrue={openDeleteDraftPlanModal}>
        <DeleteDraftConfirmationModal refreshData={getPlanList} />
      </When>
      <When isTrue={showSendForApprovalModal}>
        <SendForApprovalModal
          {...{
            setShowSendForApprovalModal,
          }}
        />
      </When>
      <When isTrue={showConfirmArchiveModal}>
        <ArchiveConfirmationModal
          {...{
            setShowConfirmArchiveModal,
          }}
        />
      </When>
      <Page
        showBackButton
        backNavigationRoute={backRoute}
        loading={!treatmentPlan || getTreatmentPlanLoading || getTreatmentPlanListLoading}
        containerClassName='pb-12'
        headerClassName='items-center'
        extraHeader={
          <div className='flex items-center gap-2 w-full'>
            <TreatmentPlanActions
              isPurchasedPlanReceived={isPurchaseOrder}
              treatmentStatus={treatmentStatus}
              handleOnClick={handleOnClick}
              handleDeleteDraft={() => handleDeleteDraft({planId: safeParseInt(treatmentId)})}
              handleEditClick={handleEditClick}
              styleVariant='customerPlanCard'
            />
          </div>
        }
      >
        <div className='w-full mx-auto pt-2'>
          <div className='rounded-2xl bg-white shadow-sm'>
            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div
                  className='h-12 w-12 rounded-2xl flex items-center justify-center'
                  style={{backgroundColor: colorPalette.secondarySupport}}
                >
                  <ClipboardList size={18} style={{color: colorPalette.secondaryColor}} />
                </div>
                <div>
                  <div className='flex items-center gap-3'>
                    <h2 className='text-lg font-semibold text-neutralBlack'>
                      {treatmentPlan?.treatment_plan_tag_name ?? treatmentPlan?.treatment_plan_name}
                    </h2>
                    <span
                      className='px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold rounded-full border'
                      style={statusStyles}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className='text-xs font-semibold uppercase tracking-[0.14em] text-textColor/60'>
                    {treatmentPlan?.version ?? 'V1'}
                  </div>
                </div>
              </div>

              <div className='text-xs text-textColor/70 text-right'>
                <div className='uppercase tracking-[0.12em] text-[10px] font-semibold'>
                  Plan Created
                </div>
                <div className='font-semibold text-textColor'>
                  {treatmentPlan?.created_at
                    ? dayjs(treatmentPlan.created_at).format('DD-MMM-YYYY, hh:mm A')
                    : '-'}
                </div>
              </div>
            </div>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='rounded-xl border border-lightGray p-4 bg-lightGray'>
                <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-textColor'>
                  <SlidersHorizontal size={14} />
                  Aligner Configuration
                </div>
                <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <div className='text-[10px] uppercase tracking-[0.12em] text-textColor'>
                      Total Aligners
                    </div>
                    <div className='font-semibold text-neutralBlack'>{totalAlignersLabel}</div>
                  </div>
                  <div>
                    <div className='text-[10px] uppercase tracking-[0.12em] text-textColor'>
                      Stages
                    </div>
                    <div className='font-semibold text-neutralBlack'>{stagesLabel}</div>
                  </div>
                  <div>
                    <div className='text-[10px] uppercase tracking-[0.12em] text-textColor'>
                      Upper Series
                    </div>
                    <div className='font-semibold text-neutralBlack'>{upperSeries}</div>
                  </div>
                  <div>
                    <div className='text-[10px] uppercase tracking-[0.12em] text-textColor'>
                      Lower Series
                    </div>
                    <div className='font-semibold text-neutralBlack'>{lowerSeries}</div>
                  </div>
                </div>
              </div>

              <div className='rounded-xl border border-lightGray p-4 bg-lightGray'>
                <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-textColor'>
                  <Ruler size={14} />
                  Wear Protocol
                </div>
                <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <div className='text-[10px] uppercase tracking-[0.12em] text-textColor'>
                      Wear Period
                    </div>
                    <div className='font-semibold text-neutralBlack'>{wearDaysLabel}</div>
                  </div>
                  <div>
                    <div className='text-[10px] uppercase tracking-[0.12em] text-textColor/60'>
                      Daily Hours
                    </div>
                    <div className='font-semibold text-neutralBlack'>{wearHoursLabel}</div>
                  </div>
                </div>
              </div>

              <InfoBlock
                icon={<Paperclip size={14} />}
                title='IPR / Attachment Chart'
                value={
                  treatmentPlanFiles.length
                    ? `${treatmentPlanFiles.length} file${
                        treatmentPlanFiles.length > 1 ? 's' : ''
                      } attached`
                    : 'No chart attached by lab.'
                }
                description={treatmentPlanFiles.length ? undefined : 'No chart attached by lab.'}
                actions={
                  treatmentPlanFiles.length ? renderFileActions(treatmentPlanFiles) : undefined
                }
              />
              <InfoBlock
                icon={<Info size={14} />}
                title='Remarks'
                value={treatmentPlan?.remarks || 'No additional remarks provided.'}
              />
              <InfoBlock
                icon={<FileText size={14} />}
                title='Files'
                value={
                  otherFiles.length
                    ? `${otherFiles.length} files shared`
                    : 'No additional files shared.'
                }
                description={otherFiles.length ? undefined : 'No additional files shared.'}
                actions={otherFiles.length ? renderFileActions(otherFiles) : undefined}
              />
            </div>

            {(hasPlanningLink || hasPlanningVideos) && (
              <div className='mt-6 border-t border-lightGray pt-6'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                  <div className='flex items-center gap-2 text-base font-semibold uppercase tracking-[0.12em] text-textColor/70'>
                    <FileText size={14} />
                    Treatment Plan Preview
                  </div>
                  {hasPlanningLink && (
                    <button
                      type='button'
                      className='h-8 px-3 rounded-md border text-[10px] font-semibold uppercase tracking-[0.12em]'
                      style={{
                        borderColor: colorPalette.secondaryColor,
                        color: colorPalette.secondaryColor,
                      }}
                      onClick={() => {
                        if (isPlanningLinkPdf) {
                          handleOpenPDFUrl(String(planningLink), 'Treatment plan PDF')
                          return
                        }
                        setShowFullView(true)
                      }}
                    >
                      {isPlanningLinkPdf ? 'Open PDF' : 'Fullscreen view'}
                    </button>
                  )}
                </div>

                {hasPlanningLink && !isPlanningLinkPdf && (
                  <div className='mt-4'>
                    <Show3dPlanningLink link={planningLink} />
                  </div>
                )}
                {hasPlanningLink && isPlanningLinkPdf && (
                  <div className='mt-4 rounded-xl border border-lightGray bg-slate-50 p-4 text-sm text-textColor'>
                    This treatment plan is a PDF. Click “Open PDF” to view it in a new tab.
                  </div>
                )}

                {hasPlanningVideos && (
                  <div className='mt-6'>
                    <div className='text-xs font-semibold uppercase tracking-[0.12em] text-textColor/70'>
                      Planning Videos
                    </div>
                    <div className='flex flex-wrap gap-4 mt-3'>
                      {planningVideos.map((video: any, index: number) => {
                        const videoUrl = String(video?.video_url ?? '')
                        if (!videoUrl) return null
                        const tag = String(video?.treatment_plan_video_tags ?? '')
                        const label =
                          tag && tag !== videoUploadTypesConstants.SINGLE_VIDEO
                            ? mapVideoKeyToLabel(tag)
                            : ''
                        const downloadUrl = getGoogleDriveDownloadUrl(videoUrl)
                        return (
                          <div key={`${videoUrl}-${index}`}>
                            <button
                              type='button'
                              className='text-left md:hidden'
                              aria-label={`Download ${label || 'planning'} video`}
                              onClick={() => handleDownloadVideo(video, videoUrl, label)}
                            >
                              {label ? (
                                <div className='text-textColor text-xs font-medium'>{label}</div>
                              ) : null}
                              <div className='relative h-[80px] w-[80px] rounded-2xl border border-mediumGray mt-1 overflow-hidden'>
                                <img
                                  src={videoView}
                                  alt='Download video'
                                  className='h-full w-full object-cover'
                                />
                                <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                                  <span className='flex flex-col items-center gap-1 text-white text-[10px] font-semibold uppercase tracking-[0.12em]'>
                                    <Download size={16} />
                                    Download
                                  </span>
                                </div>
                              </div>
                            </button>
                            <button
                              type='button'
                              className='hidden text-left md:block'
                              onClick={() => handleOpenVideo(videoUrl, label)}
                            >
                              {label ? (
                                <div className='text-textColor text-xs font-medium'>{label}</div>
                              ) : null}
                              {downloadUrl ? (
                                <div className='relative h-[80px] w-[80px] rounded-2xl border border-mediumGray mt-1 overflow-hidden'>
                                  <img
                                    src={videoView}
                                    alt='Download video'
                                    className='h-full w-full object-cover'
                                  />
                                  <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                                    <span className='text-white text-[10px] font-semibold uppercase tracking-[0.12em]'>
                                      Download
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <ReactPlayer
                                  url={videoUrl}
                                  className='h-[80px] w-[80px] rounded-2xl object-cover border border-mediumGray mt-1'
                                  playing={false}
                                  controls={false}
                                  width='80px'
                                  height='80px'
                                  light={
                                    unReviewableExtension.includes(
                                      videoUrl.split('.').pop() ?? ''
                                    ) && videoView
                                  }
                                />
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {treatmentId && !isStarterPlanUser && (
              <div className='mt-6'>
                <CustomerSTLFiles refreshData={getStlFiles} />
              </div>
            )}
          </div>
        </div>

        {showFullView && (
          <Show3dPlanningFullView setShowFullView={setShowFullView} link={planningLink ?? ''} />
        )}
      </Page>
    </>
  )
}

const InfoBlock = ({
  icon,
  title,
  value,
  description,
  actions,
  labelClassName,
}: {
  icon: React.ReactNode
  title: string
  value: string
  description?: string
  actions?: React.ReactNode
  labelClassName?: string
}) => {
  return (
    <div className='rounded-xl border border-lightGray p-4 bg-lightGray'>
      <div
        className={
          labelClassName ??
          'flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-neutral-700'
        }
      >
        {icon}
        {title}
      </div>
      <div className='mt-3 text-sm text-textColor'>{value}</div>
      {description && <div className='mt-1 text-xs text-textColor/70'>{description}</div>}
      {actions && <div className='mt-3'>{actions}</div>}
    </div>
  )
}

export default CustomerTreatmentSummary
