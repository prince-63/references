import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import useProfileBasePath from '@hooks/useProfileBasePath'
import reasonsForDeactivating from '@staticData/reasonsForDeactivating'
import {Divider, Tag} from 'antd'
import clsx from 'clsx'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import Page from 'components/page/Page'
import TextWithTooltip from 'components/section/TextWithTooltip'
import ViewInformationSection from 'components/section/ViewInformationSection'
import When from 'components/when/When'
import {AuthContext} from 'context/AuthContext'
import {Download, InfoIcon} from 'lucide-react'
import moment from 'moment'
import {useEffect, useState, useContext, useCallback} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useSearchParams, useParams} from 'react-router-dom'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {
  getTreatmentPlanList,
  getAllTreatmentPlanList,
  setOpenTreatmentStartingModal,
  setOpenConfirmFinalizeModal,
  setOpenExistingActiveTreatmentPlanModal,
  setOpenDraftModal,
  createTreatmentPlan,
  getTreatmentPlan,
  setSelectedTreatmentPlanId,
  setOpenApprovePendingActionModal,
  setOpenDeactivateTreatmentPlanModal,
  setOpenDeleteDraftPlanModal,
  setTreatmentId,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import DraftConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/DraftConfirmationModal'
import ReplanTreatmentModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/ReplanTreatmentModal'
import SuccessModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/SuccessModal'
import ArchiveConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ArchiveConfirmationModal'
import SendForApprovalModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/SendForApprovalModal'
import Show3dPlanningFullView from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/Show3dPlanningFullView'
import Show3dPlanningLink from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/Show3dPlanningLink'
import ShowDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ShowDetails'
import ConfirmDeactivateTreatmentPlan from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/ConfirmDeactivateTreatmentPlan'
import DeactivateSuccessInfo from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/DeactivateSuccessInfo'
import DeactivateTreatmentPlan from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/DeactivateTreatmentPlan'
import formatAligners from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/helpers/formatAligners'
import OpenExistingActiveTreatmentPlanModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/OpenExistingActiveTreatmentPlanModal'
import TreatmentStartingDetailsModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/TreatmentStartingDetailsModal'
import UploadedTreatmentPlanSection from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/UploadedTreatmentPlanSection'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {
  safeParseInt,
  identifyUser,
  ApiGetData,
  capitalizeFirstLetter,
  DateFormat,
  formatPluralizedString,
  getImageUrl,
} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import dayjs from 'dayjs'
import JSZip from 'jszip'
import {downloadBlob} from 'utils/download'
import {Image} from 'assets/images/Images/Image'
import pdfPng from 'assets/images/Pdf.png'
import TreatmentPlanActions from './TreatmentPlanActions'
import {getPlanStatus} from '@utils/getPlanStatus'
import ConfirmApprovalModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ConfirmApprovalModal'
import OpenApprovePendingActionModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/OpenApprovePendingActionModal'
import DeleteDraftConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/DeleteDraftConfirmationModal'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import PlanStatusTag from '../helpers/PlanStatusTag'
import STLFiles from 'screens/Kanban/screens/ProductionSetup/components/STLFiles'
import {allFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'
import ViewPlanInfoCards from './ViewPlanInfoCards'

interface IFile {
  name: string
  url: string
  download_url?: string
  type: string
  extension: string
  file_id?: number
  drive_file_id?: string
  is_gdrive_platform: boolean
  thumbnail_url: string
}

type ReactNativeWebViewWindow = Window &
  typeof globalThis & {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }

const getSectionZipFileName = (zipName: string) => `${zipName.replace(/\s+/g, '_')}.zip`

const getTreatmentPlanFileUrl = (file: IFile) => {
  const driveUrl = file?.is_gdrive_platform && file?.drive_file_id ? getImageUrl(file) : ''

  return driveUrl || file?.download_url || file?.url || getImageUrl(file)
}

const getTreatmentPlanFileName = (file: IFile, index: number) => {
  const fallbackName = `file-${index + 1}`
  const fileName = file?.name?.trim() || fallbackName
  const extension = file?.extension?.replace(/^\./, '')

  if (!extension || fileName.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
    return fileName
  }

  if (/\.[a-z0-9]{2,5}$/i.test(fileName)) {
    return fileName
  }

  return `${fileName}.${extension}`
}

const sendTreatmentPlanFilesToNativeApp = (files: IFile[], zipName: string) => {
  if (typeof window === 'undefined') return false

  const reactNativeWebView = (window as ReactNativeWebViewWindow).ReactNativeWebView
  if (!reactNativeWebView) return false

  const fileDetails = files
    .map((file, index) => {
      const url = getTreatmentPlanFileUrl(file)

      return {
        file_id: file?.file_id,
        name: getTreatmentPlanFileName(file, index),
        url,
        download_url: url,
        type: file?.type || 'application/octet-stream',
        extension: file?.extension,
      }
    })
    .filter((file) => Boolean(file.url))

  if (!fileDetails.length) return false

  reactNativeWebView.postMessage(
    JSON.stringify({
      zip_name: getSectionZipFileName(zipName),
      file_details: fileDetails,
    })
  )

  return true
}

const ViewTreatmentPlan = () => {
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {treatmentPlanList, getTreatmentPlanListLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {isStarterPlanUser} = useAllUserPlan()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const [searchParams] = useSearchParams()
  useEffect(() => {
    if (!userId || !patientId) return
    dispatchAction(
      getTreatmentPlanList({
        doctor_id: userId,
        patient_id: patientId,
        treatment_subtype: subTreatmentTypeConstants.ALIGNERS,
      })
    )
    dispatchAction(
      getAllTreatmentPlanList({
        doctor_id: userId,
        patient_id: patientId,
        organization_id: safeParseInt(organizationId),
      })
    )
  }, [])
  const {dispatchAction} = useDispatchAction()
  const {patientId, treatmentId} = useParams()
  const [reasonForDeactivating, setReasonForDeactivating] = useState(
    reasonsForDeactivating[0].value
  )
  const [otherRemarks, setOtherRemarks] = useState('')
  const [openDeactivateSuccessModal, setOpenDeactivateSuccessModal] = useState(false)
  const [openSuccessTreatmentPlan, setOpenSuccessTreatmentPlan] = useState(false)
  const {
    treatmentPlan,
    openTreatmentStartingModal,
    getTreatmentPlanLoading,
    openDraftModal,
    openDeactivateTreatmentPlanModal,
    openConfirmDeactivateTreatmentPlanModal,
    openExistingActiveTreatmentPlanModal,
    openApprovePendingActionModal,
    openDeleteDraftPlanModal,
  } = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [isShowOtherPhotos, setIsShowOtherPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showSendForApprovalModal, setShowSendForApprovalModal] = useState(false)
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false)
  const [showReplanModal, setShowReplanModal] = useState(false)
  const [showFullView, setShowFullView] = useState(false)
  const {userId, organizationId} = useContext(AuthContext)
  const isNew = searchParams.get('isNew') === 'true'
  const isDraft = searchParams.get('draft') === 'true'
  const {isDesignLabUser, isCustomer, isVendor} = useAllUserPlan()
  const latestDeactivatedTreatmentDate =
    treatmentPlanList[0] && treatmentPlanList[0]?.latest_deactivated_date
  const orderId = searchParams.get('order_id') ?? dataLeadsOverview?.getting_started_order_id
  const [showConfirmApprovalModal, setShowConfirmApprovalModal] = useState(false)
  const isPurchaseOrder = searchParams.get('isPurchaseOrder') === 'true'
  const [downloadingSection, setDownloadingSection] = useState<string | null>(null)
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
    if (!url) return
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

  const handleDownloadFilesAsZip = useCallback(async (files: IFile[], zipName: string) => {
    if (!files || files.length === 0) return

    if (sendTreatmentPlanFilesToNativeApp(files, zipName)) return

    setDownloadingSection(zipName)
    try {
      const zip = new JSZip()
      let count = 0
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        try {
          const fileUrl = getTreatmentPlanFileUrl(file)
          if (!fileUrl) continue
          const response = await fetch(fileUrl)
          const blob = await response.blob()
          zip.file(getTreatmentPlanFileName(file, index), blob)
          count++
        } catch (err) {
          console.error(`Error downloading file ${file.name}`, err)
        }
      }
      if (count > 0) {
        const zipBlob = await zip.generateAsync({type: 'blob'})
        downloadBlob(zipBlob, getSectionZipFileName(zipName))
      }
    } finally {
      setDownloadingSection(null)
    }
  }, [])

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
    const isTrackingEnabled = dataLeadsOverview?.tracking?.enabled

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

  const treatmentStatus = getPlanStatus({
    treatmentPlan,
    isNew,
    isDraft,
  }) as keyof typeof treatmentPlanStatusConstants

  function getHighestEndsWith(data: {
    upper_jaw?: {ends_with?: number}
    lower_jaw?: {ends_with?: number}
  }): number | null {
    const upper = data?.upper_jaw?.ends_with ?? 0
    const lower = data?.lower_jaw?.ends_with ?? 0
    if (!upper && !lower) return null
    return Math.max(upper, lower)
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

  const basePageTitle = treatmentId
    ? `${capitalizeFirstLetter(
        treatmentPlan?.treatment_plan_tag_name ?? treatmentPlan?.treatment_plan_name
      )}`
    : 'Review treatment plan'
  const shouldShowReplanTag = treatmentStatus === treatmentPlanStatusConstants.RE_PLAN
  const headerExtra = (
    <div className='flex items-center gap-3 flex-wrap justify-end'>
      {treatmentId && shouldShowReplanTag && (
        <PlanStatusTag treatmentStatus={treatmentStatus} mapReplan />
      )}
      <TreatmentPlanActions
        isPurchasedPlanReceived={isPurchaseOrder}
        treatmentStatus={treatmentStatus}
        handleOnClick={handleOnClick}
        handleDeleteDraft={() => handleDeleteDraft({planId: safeParseInt(treatmentId)})}
        handleEditClick={handleEditClick}
      />
    </div>
  )

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <Page
          title={basePageTitle}
          loading={
            !hasValue(treatmentPlan) || getTreatmentPlanLoading || getTreatmentPlanListLoading
          }
          extraHeader={headerExtra}
          showBorder
          showBackButton
          exitConfirmPredicate={false}
          backNavigationRoute={
            serviceConfig?.PLANNING
              ? `${profileBasePath}/${patientId}/plans?order_id=${treatmentPlan?.order_id}`
              : `${profileBasePath}/${patientId}/plans-list`
          }
        >
          {/* IMAGE VIEW */}
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

          {/* ACTION & CONFIRM MODALS */}
          <When isTrue={openApprovePendingActionModal}>
            <OpenApprovePendingActionModal />
          </When>

          <When isTrue={showReplanModal}>
            <ReplanTreatmentModal
              {...{
                setShowReplanModal,
              }}
            />
          </When>

          <When isTrue={openDeleteDraftPlanModal}>
            <DeleteDraftConfirmationModal />
          </When>
          <When isTrue={openDraftModal}>
            <DraftConfirmationModal />
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
          <When isTrue={openDeactivateTreatmentPlanModal}>
            <DeactivateTreatmentPlan
              setReasonForDeactivating={setReasonForDeactivating}
              setOtherRemarks={setOtherRemarks}
              otherRemarks={otherRemarks}
              reasonForDeactivating={reasonForDeactivating}
            />
          </When>
          <When isTrue={showConfirmApprovalModal}>
            <ConfirmApprovalModal
              {...{
                setShowConfirmApprovalModal,
              }}
            />
          </When>
          <When isTrue={openExistingActiveTreatmentPlanModal}>
            <OpenExistingActiveTreatmentPlanModal />
          </When>
          <When isTrue={openConfirmDeactivateTreatmentPlanModal}>
            <ConfirmDeactivateTreatmentPlan
              {...{
                setOpenDeactivateSuccessModal,
                setReasonForDeactivating,
                reasonForDeactivating,
                otherRemarks,
              }}
            />
          </When>
          <When isTrue={openDeactivateSuccessModal}>
            <SuccessModal
              {...{
                title: `Clear aligners treatment ${capitalizeFirstLetter(
                  treatmentPlan.treatment_plan_tag_name ?? treatmentPlan.treatment_plan_name
                )} deactivated`,
                isResponsive: true,
                info: <DeactivateSuccessInfo />,
                okButtonText: 'Add new treatment plan',
                imageWidth: 'w-[147px]',
                cancelButtonText: 'View profile ',
                closable: true,
                onClose: async () => {
                  setOpenDeactivateSuccessModal(true)
                  await dispatchAction(
                    getTreatmentPlan({
                      aligner_treatment_id: treatmentPlan.treatment_plan_id?.toString() ?? '',
                    })
                  )
                  dispatchAction(
                    getLeadsProfileDetails({
                      patient_id: safeParseInt(patientId),
                      doctor_id: safeParseInt(userId),
                    })
                  )
                  if (!userId || !patientId) return
                  await dispatchAction(
                    getTreatmentPlanList({
                      doctor_id: userId,
                      patient_id: patientId,
                      treatment_subtype: subTreatmentTypeConstants.ALIGNERS,
                    })
                  )
                  setOpenDeactivateSuccessModal(false)
                },
                onClickOk: () => {
                  setOpenDeactivateSuccessModal(true)
                  dispatchAction(
                    getLeadsProfileDetails({
                      patient_id: safeParseInt(patientId),
                      doctor_id: safeParseInt(userId),
                    })
                  )
                  // navigate(`/leads-profile/${patientId}/treatment`)
                  navigate(`${profileBasePath}/${patientId}/plans-list`)
                },
                onClickCancel: () => {
                  setOpenDeactivateSuccessModal(true)
                  dispatchAction(
                    getLeadsProfileDetails({
                      patient_id: safeParseInt(patientId),
                      doctor_id: safeParseInt(userId),
                    })
                  )
                  // navigate(`/leads-profile/${patientId}`)
                  navigate(`${profileBasePath}/${patientId}`)
                },
              }}
            />
          </When>
          <When isTrue={openTreatmentStartingModal}>
            <TreatmentStartingDetailsModal
              setOpenFinalizeSuccessModal={setOpenSuccessTreatmentPlan}
              minStartDate={
                hasValue(treatmentPlanList)
                  ? moment(latestDeactivatedTreatmentDate).format('YYYY-MM-DD')
                  : ''
              }
            />
          </When>

          {/* SUCCESS MODALS */}
          <When isTrue={openSuccessTreatmentPlan}>
            <SuccessModal
              {...{
                title: 'Treatment plan set up successfully!',
                showCancel: false,
                okButtonText: 'View Treatment plan',

                onClickOk: () => {
                  setOpenSuccessTreatmentPlan(false)
                  dispatchAction(
                    getApiLeadsOverview({
                      data: {
                        patient_id: safeParseInt(patientId),
                        doctor_id: safeParseInt(userId),
                      },
                    })
                  )
                  dispatchAction(
                    getLeadsProfileDetails({
                      patient_id: safeParseInt(patientId),
                      doctor_id: safeParseInt(userId),
                    })
                  )
                  navigate(`${profileBasePath}/${patientId}/plans-list`)
                  // navigate(`/leads-profile/${patientId}/treatment`)
                },
              }}
            />
          </When>

          {/* HEADER INFO CARDS */}
          {treatmentId && (
            <div className='my-3'>
              <ViewPlanInfoCards treatmentPlan={treatmentPlan} />
            </div>
          )}

          {/* BODY */}
          {!getTreatmentPlanLoading && treatmentPlan && (
            <div className='flex flex-col gap-3 mb-3'>
              <When isTrue={hasValue(treatmentPlan.approved_by_patient_at)}>
                <div
                  className={clsx(
                    'border flex gap-2 p-4 rounded-lg',
                    treatmentPlan.is_approved_by_patient
                      ? 'border-tertiaryColor bg-tertiarySupport'
                      : 'border-mediumGray'
                  )}
                >
                  <InfoIcon
                    color={treatmentPlan.is_approved_by_patient ? '#00b383' : '#666666'}
                    height='20'
                    width='20'
                  />
                  <div className='text-sm font-medium'>
                    {treatmentPlan.is_approved_by_patient
                      ? 'This treatment plan was approved by patient on '
                      : 'This treatment plan was sent for patient approval on '}
                    {DateFormat(treatmentPlan.approved_by_patient_at)}
                  </div>
                </div>
              </When>

              <BorderedCard>
                <div className='flex flex-col gap-5'>
                  <ViewInformationSection
                    showBorder={false}
                    title={
                      <div className='flex flex-col gap-2 md:flex-row md:justify-between md:items-center'>
                        <div className='flex flex-col md:flex-row gap-4 md:items-center'>
                          <div className='flex gap-2 items-baseline'>
                            <p>{treatmentPlan?.treatment_plan_tag_name}</p>
                            {treatmentPlan?.version && (
                              <Tag className='bg-secondarySupport text-secondaryColor text-xs '>
                                {treatmentPlan?.version}
                              </Tag>
                            )}
                          </div>
                          <When isTrue={treatmentStatus !== treatmentPlanStatusConstants.RE_PLAN}>
                            {treatmentId && <PlanStatusTag treatmentStatus={treatmentStatus} />}
                          </When>
                        </div>

                        <When isTrue={hasValue(treatmentPlan?.created_at)}>
                          <p className='text-textColor text-sm'>
                            Created on {dayjs(treatmentPlan?.created_at).format('DD-MMM-YYYY')}
                          </p>
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
                              treatmentPlan,
                            }}
                          />
                        }
                      />
                      <div className='flex flex-col md:flex-row gap-4 md:gap-6 mt-4'>
                        <ShowDetails
                          label='Total Aligners'
                          value={
                            hasValue(treatmentPlan) ? (
                              <div>
                                {(treatmentPlan as ITreatmentPlan)?.total_aligners
                                  ? (treatmentPlan as ITreatmentPlan)?.total_aligners
                                  : hasValue(
                                        (treatmentPlan as ITreatmentPlan)?.aligner_details_meta_data
                                          ?.lower_jaw?.range
                                      ) ||
                                      hasValue(
                                        (treatmentPlan as ITreatmentPlan)?.aligner_details_meta_data
                                          ?.upper_jaw?.range
                                      )
                                    ? ((treatmentPlan as ITreatmentPlan)?.aligner_details_meta_data
                                        ?.lower_jaw?.range?.length ?? 0) +
                                      ((treatmentPlan as ITreatmentPlan)?.aligner_details_meta_data
                                        ?.upper_jaw?.range?.length ?? 0)
                                    : '-'}
                              </div>
                            ) : null
                          }
                        />
                        <ShowDetails
                          label='Stages'
                          value={
                            <div>
                              {treatmentId
                                ? treatmentPlan?.stages
                                : getHighestEndsWith(treatmentPlan?.aligner_details_meta_data)}
                            </div>
                          }
                        />
                        <ShowDetails
                          label='Upper Aligner Series'
                          value={
                            hasValue(treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range) ? (
                              <div>
                                {formatAligners(
                                  treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range ?? []
                                ).map((range, index) => (
                                  <p key={index}>{range}</p>
                                ))}
                              </div>
                            ) : null
                          }
                        />
                        <ShowDetails
                          label='Lower Aligner Series'
                          value={
                            hasValue(treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range) ? (
                              <div>
                                {formatAligners(
                                  treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range ?? []
                                ).map((range, index) => (
                                  <p key={index}>{range}</p>
                                ))}
                              </div>
                            ) : null
                          }
                        />
                      </div>
                    </div>
                  </ViewInformationSection>
                  <Divider className='my-1' />
                  <When isTrue={!isCustomer && !isDesignLabUser && !isVendor}>
                    <div className='flex flex-col md:flex-row gap-4 md:gap-6'>
                      <ShowDetails
                        label='Brand name'
                        value={treatmentPlan?.production_lab_details?.brand_name}
                      />
                      <ShowDetails
                        label='Recommended days to wear each aligner 11'
                        value={formatPluralizedString(
                          treatmentPlan!.days_to_wear_each_aligner,
                          'day'
                        )}
                      />
                      <ShowDetails
                        label='Recommended daily wear hours'
                        value={formatPluralizedString(
                          treatmentPlan!.recommended_hours_to_wear_aligners,
                          'hour'
                        )}
                      />
                    </div>
                  </When>
                  <div className='flex flex-col gap-3'>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-sm text-textColor'>Files</span>
                        {hasValue(treatmentPlan?.files) && (
                          <button
                            type='button'
                            disabled={downloadingSection === 'Files'}
                            onClick={() => handleDownloadFilesAsZip(treatmentPlan.files, 'Files')}
                            className='flex items-center gap-1 text-xs font-semibold text-primaryColor hover:opacity-80 disabled:opacity-50'
                          >
                            <Download size={14} />
                            {downloadingSection === 'Files' ? 'Downloading...' : 'Download'}
                          </button>
                        )}
                      </div>
                      {treatmentPlan?.files ? (
                        <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between'>
                          {treatmentPlan?.files &&
                            treatmentPlan?.files.map((file: IFile, index: number) => (
                              <div
                                key={index}
                                className={clsx(
                                  'flex items-center md:min-w-[42.5%] gap-2 flex-shrink '
                                )}
                                onClick={() => {
                                  if (file.extension === 'mp4' || file.extension === 'pdf') {
                                    handleOpenPDF(file.url ?? '', file.name)
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
                      ) : (
                        <span className='font-medium text-textColor'>Not Added</span>
                      )}
                    </div>
                    <ShowDetails
                      label='Remarks'
                      value={treatmentPlan?.remarks}
                      className='w-full'
                    />

                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-sm text-textColor'>Other Files</span>
                        {hasValue(treatmentPlan?.other_files) && (
                          <button
                            type='button'
                            disabled={downloadingSection === 'Other_Files'}
                            onClick={() =>
                              handleDownloadFilesAsZip(treatmentPlan.other_files, 'Other_Files')
                            }
                            className='flex items-center gap-1 text-xs font-semibold text-primaryColor hover:opacity-80 disabled:opacity-50'
                          >
                            <Download size={14} />
                            {downloadingSection === 'Other_Files' ? 'Downloading...' : 'Download'}
                          </button>
                        )}
                      </div>
                      {treatmentPlan?.other_files ? (
                        <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between'>
                          {treatmentPlan?.other_files &&
                            treatmentPlan?.other_files.map((file: IFile, index: number) => (
                              <div
                                key={index}
                                className={clsx(
                                  'flex items-center md:min-w-[42.5%] gap-2 flex-shrink '
                                )}
                                onClick={() => {
                                  if (file.extension === 'mp4' || file.extension === 'pdf') {
                                    handleOpenPDF(file.url, file.name)
                                  } else {
                                    setIsShowOtherPhotos(true)
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
                      ) : (
                        <span className='font-medium text-textColor'>Not Added</span>
                      )}
                    </div>

                    {hasValue((treatmentPlan as ITreatmentPlan)?.pdf_files) && (
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium text-sm text-textColor'>PDF Files</span>
                          <button
                            type='button'
                            disabled={downloadingSection === 'PDF_Files'}
                            onClick={() =>
                              handleDownloadFilesAsZip(
                                (treatmentPlan as ITreatmentPlan).pdf_files ?? [],
                                'PDF_Files'
                              )
                            }
                            className='flex items-center gap-1 text-xs font-semibold text-primaryColor hover:opacity-80 disabled:opacity-50'
                          >
                            <Download size={14} />
                            {downloadingSection === 'PDF_Files' ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                        <div className='flex flex-col md:flex-row md:flex-wrap w-full md:gap-10 gap-3 justify-between'>
                          {((treatmentPlan as ITreatmentPlan)?.pdf_files ?? []).map(
                            (file: IFile, index: number) => (
                              <div
                                key={index}
                                className='flex items-center md:min-w-[42.5%] gap-2 flex-shrink cursor-pointer'
                                onClick={() => handleOpenPDF(file.url ?? '', file.name)}
                              >
                                <Image
                                  className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                                  size={20}
                                  src={pdfPng}
                                />
                                <TextWithTooltip className='cursor-pointer'>
                                  {file.name}
                                </TextWithTooltip>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </BorderedCard>

              <When isTrue={hasValue(treatmentPlan?.treatment_planning_link)}>
                <BorderedCard cardClassName='mt-3'>
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
          {treatmentId && !isStarterPlanUser && <STLFiles refreshData={getStlFiles} />}

          {showFullView && (
            <Show3dPlanningFullView
              setShowFullView={setShowFullView}
              link={treatmentPlan?.treatment_planning_link ?? ''}
            />
          )}
        </Page>
      )}
    </>
  )
}

export default ViewTreatmentPlan
