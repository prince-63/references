/* eslint-disable @typescript-eslint/no-unused-vars */
import {useNavigate, useParams} from 'react-router-dom'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import {useContext, useEffect, useState} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {useSearchParams} from 'react-router-dom'
import ViewInformationSection from 'components/section/ViewInformationSection'
import {
  ApiGetData,
  capitalizeFirstLetter,
  DateFormat,
  formatPluralizedString,
  getImageUrl,
  identifyUser,
  safeParseInt,
} from 'utils/ConstFunctions'
import formatAligners from './helpers/formatAligners'
import {Image} from 'assets/images/Images/Image'
import pdfPng from 'assets/images/Pdf.png'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import SuccessModal from '../setUpTreatmentPlan/components/SuccessModal'
import Page from 'components/page/Page'
import {
  createTreatmentPlan,
  getAllTreatmentPlanList,
  getTreatmentPlan,
  getTreatmentPlanList,
  setOpenConfirmFinalizeModal,
  setOpenDraftModal,
  setOpenExistingActiveTreatmentPlanModal,
  setOpenTreatmentStartingModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {
  getTrackingDetails,
  handlePostTrackingDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {AuthContext} from 'context/AuthContext'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import trackingMethodTagTypes from '@constants/trackingMethodTagTypes'
import InfoCard from '../../alignersTracking/components/InfoCard'
import DeactivateTreatmentPlan from './DeactivateTreatmentPlan'
import ConfirmDeactivateTreatmentPlan from './ConfirmDeactivateTreatmentPlan'
import DeactivateSuccessInfo from './DeactivateSuccessInfo'
import TreatmentStartingDetailsModal from './TreatmentStartingDetailsModal'
import reasonsForDeactivating from '@staticData/reasonsForDeactivating'
import OpenExistingActiveTreatmentPlanModal from './OpenExistingActiveTreatmentPlanModal'
import moment from 'moment'
import dayjs from 'dayjs'
import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'
import DraftConfirmationModal from '../setUpTreatmentPlan/components/DraftConfirmationModal'
import TextWithTooltip from 'components/section/TextWithTooltip'
import InfoIcon from 'assets/icons/InfoIcon'
import clsx from 'clsx'
import getColorPalette from 'utils/getColorPalette'
import ShowDetails from './components/ShowDetails'
import ConfirmFinalizeTreatmentModal from '../setUpTreatmentPlan/components/ConfirmFinalizeTreatmentModal'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import SendForApprovalModal from './components/SendForApprovalModal'
import TreatmentPlanActions from './components/TreatmentPlanActions'
import ArchiveConfirmationModal from './components/ArchiveConfirmationModal'
import ReplanTreatmentModal from '../setUpTreatmentPlan/components/ReplanTreatmentModal'
import useActiveProfile from '@hooks/useActiveProfile'
import StlFilesSection from './StlFilesSection'
import Show3dPlanningLink from './components/Show3dPlanningLink'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ApproveModal from './components/ApproveModal'
import UploadedTreatmentPlanSection from './UploadedTreatmentPlanSection'
import {Divider} from 'antd'
import {getTreatmentPlanStatus} from './helpers/getTreatmentPlanStatus'
import SendToPatientConfirmModal from '../setUpTreatmentPlan/components/SendToPatientConfirmModal'
import Show3dPlanningFullView from './components/Show3dPlanningFullView'
import PDFWebview from '../../files/components/PDFWebview'
import OpenApprovePendingActionModal from './OpenApprovePendingActionModal'
import {setShowSendToPatientModal} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
interface IFile {
  name: string
  url: string
  type: string
  extension: string
  is_gdrive_platform?: boolean
  thumbnail_url?: string
}

const ViewTreatmentPlan = () => {
  const navigate = useNavigate()
  const {treatmentPlanList, getTreatmentPlanListLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {allTreatmentPlanList, getAllTreatmentPlanListLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
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
    openConfirmFinalizeModal,
    openDeactivateTreatmentPlanModal,
    openConfirmDeactivateTreatmentPlanModal,
    openExistingActiveTreatmentPlanModal,
    openApprovePendingActionModal,
    showSendToPatientModal,
  } = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [isShowOtherPhotos, setIsShowOtherPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showSendForApprovalModal, setShowSendForApprovalModal] = useState(false)
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false)
  const [showApprovedModal, setShowApprovedModal] = useState(false)
  const [showReplanModal, setShowReplanModal] = useState(false)

  const [showFullView, setShowFullView] = useState(false)
  const {userId, userDetail, profileId, organizationId} = useContext(AuthContext)
  const userData: any = userDetail
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const isNew = searchParams.get('new') === 'true'
  const isDraft = searchParams.get('draft') === 'true'
  const {
    isCustomer,
    isVendor,
    isStarterPlanUser,
    isPractice,
    isAlignerCompanyOrg,
    isGrowthPlanUser,
  } = useAllUserPlan()
  const isShowSendToPatientModal = isStarterPlanUser || isPractice || isGrowthPlanUser
  const latestDeactivatedTreatmentDate =
    treatmentPlanList[0] && treatmentPlanList[0]?.latest_deactivated_date
  const orderId = searchParams.get('order_id')

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

  const handleOnClick = async (
    treatmentPlanStatus: keyof typeof treatmentPlanStatusConstants = treatmentPlanStatusConstants.ACTIVE
  ) => {
    identifyUser()
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
          item.status === treatmentPlanStatusConstants.PAUSED ||
          item.status === treatmentPlanStatusConstants.COMPLETE
      )
    const hasDeactivatedPlan =
      treatmentPlanList &&
      treatmentPlanList.some((item) => item.status === treatmentPlanStatusConstants.DEACTIVATED)
    const isTrackingEnabled = dataLeadsOverview?.tracking?.enabled
    const isTrackingEnabledForLatestTreatmentPlan =
      dataLeadsOverview?.tracking_added_for_latest_treatment_plan

    const {
      files,
      aligner_details_meta_data,
      filesToSave,
      otherFilesToSave,
      video_files_to_save,
      status,
      ...rest
    } = treatmentPlan

    if (isActive) {
      if (
        !isAlignerCompanyOrg &&
        !isPractice &&
        !hasActivePlan &&
        hasDeactivatedPlan &&
        isTrackingEnabled
      ) {
        if (treatmentPlan.is_approved_by_patient) {
          dispatchAction(setOpenTreatmentStartingModal(true))
          return
        } else {
          dispatchAction(setOpenConfirmFinalizeModal(true))
        }
      }

      if (
        !hasActivePlan &&
        hasDeactivatedPlan &&
        isTrackingEnabled &&
        isTrackingEnabledForLatestTreatmentPlan
      ) {
        dispatchAction(setOpenConfirmFinalizeModal(true))
        return
      }

      if (hasActivePlan && treatmentPlan.is_approved_by_patient) {
        dispatchAction(setOpenExistingActiveTreatmentPlanModal(true))
        return
      } else {
        if (!treatmentPlan.is_approved_by_patient) {
          return dispatchAction(setOpenConfirmFinalizeModal(true))
        }
      }
    }

    if (treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT) {
      return dispatchAction(setOpenDraftModal(true))
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
          status: treatmentPlanStatus === 'APPROVED' ? 'DRAFT' : treatmentPlanStatus,
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
          navigate(`/leads-profile/${patientId}/treatment`, {replace: true})
        } else if (treatmentPlanStatus === treatmentPlanStatusConstants.APPROVED) {
          if (!isCustomer) {
            setShowApprovedModal(true)
            return
          }
          SuccessToast('Treatment plan approved successfully')
          navigate(`/leads-profile/${patientId}/treatment`, {replace: true})
        }
      })
      .catch(() => {})
  }

  const sendToPatient = () => {
    setShowApprovedModal(false)
    if (isShowSendToPatientModal) {
      dispatchAction(setShowSendToPatientModal(true))
      return
    } else {
      const {
        files,
        aligner_details_meta_data,
        filesToSave,
        otherFilesToSave,
        video_files_to_save,
        status,
        ...rest
      } = treatmentPlan

      const hasActivePlan =
        treatmentPlanList &&
        treatmentPlanList.some(
          (item) =>
            item.status === treatmentPlanStatusConstants.ACTIVE ||
            item.status === treatmentPlanStatusConstants.PAUSED ||
            item.status === treatmentPlanStatusConstants.COMPLETE
        )
      if (hasActivePlan) {
        return dispatchAction(setOpenExistingActiveTreatmentPlanModal(true))
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
            status: treatmentPlanStatusConstants.DRAFT,
            video_display_to_patient: treatmentPlan.is_video_display_patient,
            link_display_patient: treatmentPlan.is_link_display_patient,
            approved_by_patient_at: moment().format('YYYY-MM-DD'),
            treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
            order_status_changed_at: treatmentPlan?.order_status_changed_at,
            treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
          },
          files: filesToSave,
          video_files: video_files_to_save,
          other_files: otherFilesToSave,
          pdf_file: treatmentPlan.pdf_file_to_save,
        })
      )
        .unwrap()
        .then(() => {
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
          navigate(`/leads-profile/${patientId}/treatment`, {replace: true})
        })
        .catch(() => {})
    }
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
      navigate(`/leads-profile/${patientId}/treatment`)
      return
    }
    callGetTreatmentPlan()
  }, [])

  const treatmentStatus = getTreatmentPlanStatus({
    treatmentPlan,
    isNew,
    isDraft,
  }) as keyof typeof treatmentPlanStatusConstants

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <Page
          title={
            isNew || isDraft
              ? 'Review treatment plan'
              : `${capitalizeFirstLetter(treatmentPlan.treatment_plan_name)} details`
          }
          loading={
            !hasValue(treatmentPlan) || getTreatmentPlanLoading || getTreatmentPlanListLoading
          }
          showBorder
          showBackButton
          exitConfirmPredicate={false}
          backNavigationRoute={
            isNew || isDraft
              ? hasValue(treatmentPlan.treatment_plan_id)
                ? `/leads-profile/${patientId}/treatment/${
                    treatmentPlan.treatment_plan_id
                  }/setupTreatmentPlan?${hasValue(orderId) ? `order_id=${orderId}` : ''}`
                : `/leads-profile/${patientId}/treatment/new/setupTreatmentPlan?${
                    hasValue(orderId) ? `order_id=${orderId}` : ''
                  }`
              : `/leads-profile/${patientId}/treatment`
          }
          extraHeader={
            <When
              isTrue={
                !isNew &&
                !isDraft &&
                treatmentStatus === trackingMethodTagTypes.ACTIVE &&
                !getTreatmentPlanLoading &&
                !isPractice &&
                !isAlignerCompanyOrg
              }
            >
              {dataLeadsOverview?.tracking?.status === trackingMethodTagTypes.ACTIVE ? (
                <button
                  onClick={() => {
                    dispatchAction(
                      getTrackingDetails({
                        patient_id: String(patientId),
                        doctor_id: safeParseInt(userId),
                        treatment_subtype: treatmentTypeMain.ALIGNERS,
                      })
                    )
                    navigate(`/leads-profile/${patientId}/treatment/view-tracking`)
                  }}
                  className='rounded-lg px-3 py-2 w-full md:w-fit min-w-36  border text-[14px] border-secondaryColor bg-secondarySupport text-secondaryColor font-semibold'
                >
                  View tracking
                </button>
              ) : (
                <When
                  isTrue={
                    patientAssignedTo === 'ASSIGNED_TO_ME' && !isPractice && !isAlignerCompanyOrg
                  }
                >
                  <button
                    onClick={() => {
                      dispatchAction(handlePostTrackingDetails(null))

                      navigate(`/leads-profile/${patientId}/treatment/tracking-method`)
                    }}
                    className='w-full md:w-fit px-3 py-2  bg-primaryColor text-white  font-semibold min-w-36 rounded-lg '
                  >
                    Add tracking
                  </button>
                </When>
              )}
            </When>
          }
        >
          <When isTrue={showSendToPatientModal}>
            <SendToPatientConfirmModal
              setShowSendToPatientModal={(value) =>
                dispatchAction(setShowSendToPatientModal(value))
              }
            />
          </When>
          <When isTrue={showReplanModal}>
            <ReplanTreatmentModal
              {...{
                setShowReplanModal,
              }}
            />
          </When>
          <When isTrue={openConfirmFinalizeModal}>
            <ConfirmFinalizeTreatmentModal />
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
          <When isTrue={showApprovedModal}>
            <ApproveModal
              {...{
                setShowApprovedModal,
                sendToPatient,
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
          <When isTrue={isShowPhotos}>
            <ImageViewer
              setIsShowPhotos={setIsShowPhotos}
              selectedImagesList={treatmentPlan?.files?.map((file, index) => ({
                id: index,
                src: file?.url,
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
                src: file?.url,
                width: '100%',
                height: '100%',
              }))}
              selectedIndex={selectedIndex}
            />
          </When>

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
                  navigate(`/leads-profile/${patientId}/treatment`)
                },
              }}
            />
          </When>
          <When isTrue={treatmentPlan.initiator_status === treatmentPlanStatusConstants.RE_PLAN}>
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
          <When isTrue={treatmentPlan.status === treatmentPlanStatusConstants.PAUSED}>
            <div className='mb-3'>
              <InfoCard
                {...{
                  buttonText: 'Take me there',
                  iconColor: getColorPalette().primaryColor,
                  buttonClassName: 'hidden md:flex ml-6',
                  title: 'Treatment paused!',
                  content:
                    'If you want to resume the treatment you can by going to the aligner tracking page',
                  onClick: () => {
                    navigate(
                      `/leads-profile/${patientId}/${treatmentPlan.aligner_journey_id}/alignersTracking`
                    )
                  },
                }}
              />
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
                className='border border-[#735bf2] bg-[#f5f4fe] text-sm font-normal'
                titleClassName='text-black text-sm font-medium'
                title={`This treatment plan was approved on ${moment(
                  treatmentPlan?.updated_at ?? treatmentPlan?.order_status_changed_at
                ).format('DD-MMM-YYYY')}`}
                showButton={false}
              />
            </div>
          </When>
          <When isTrue={treatmentStatus === treatmentPlanStatusConstants.SENT_FOR_APPROVAL}>
            <div className='mb-3'>
              <InfoCard
                className='border border-orange bg-orangeSupport text-sm font-normal'
                infoIconColor='#BE8901'
                titleClassName='text-black text-sm font-medium'
                title={`This treatment plan was sent for approval on ${moment(
                  treatmentPlan?.updated_at
                ).format('DD-MMM-YYYY')}`}
                showButton={false}
              />
            </div>
          </When>
          <When isTrue={treatmentPlan.status === treatmentPlanStatusConstants.ARCHIVED}>
            <div className='mb-3'>
              <InfoCard
                className='border border-orange bg-orangeSupport text-sm font-normal'
                titleClassName='text-black text-sm font-medium'
                infoIconColor='#BE8901'
                title={`This treatment plan was archived on ${moment(
                  treatmentPlan?.updated_at
                ).format('DD-MMM-YYYY')}`}
                showButton={false}
              />
            </div>
          </When>
          <When isTrue={treatmentPlan.status === treatmentPlanStatusConstants.DEACTIVATED}>
            <div className='mb-3'>
              <InfoCard
                {...{
                  content: (
                    <p>
                      This treatment was deactivated on{' '}
                      <span className='font-bold'>
                        {moment(treatmentPlan?.deactivated_at).format('DD-MMM-YYYY')}
                      </span>
                      . Reason: {treatmentPlan?.reason_for_deactivation}
                      {treatmentPlan?.deactivatedRemarks && (
                        <div>Remarks : {treatmentPlan?.deactivatedRemarks}</div>
                      )}
                    </p>
                  ),
                  title: 'Treatment deactivated!',
                  className: 'bg-redSupport ',
                  titleClassName: 'text-red font-semibold',
                  showButton: false,
                  infoIconColor: '#F45045',
                }}
              />
            </div>
          </When>

          <When isTrue={openExistingActiveTreatmentPlanModal}>
            <OpenExistingActiveTreatmentPlanModal />
          </When>
          <When isTrue={openApprovePendingActionModal}>
            <OpenApprovePendingActionModal />
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
                  navigate(`/leads-profile/${patientId}/treatment`)
                },
                onClickCancel: () => {
                  setOpenDeactivateSuccessModal(true)
                  dispatchAction(
                    getLeadsProfileDetails({
                      patient_id: safeParseInt(patientId),
                      doctor_id: safeParseInt(userId),
                    })
                  )
                  navigate(`/leads-profile/${patientId}`)
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
          {showFullView && (
            <Show3dPlanningFullView
              setShowFullView={setShowFullView}
              link={treatmentPlan?.treatment_planning_link ?? ''}
            />
          )}
          {!getTreatmentPlanLoading && treatmentPlan && (
            <div className=''>
              <When isTrue={hasValue(treatmentPlan.approved_by_patient_at)}>
                <div
                  className={clsx(
                    'border flex gap-2 p-4 rounded-lg mb-4',
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
              <When
                isTrue={
                  (isCustomer || isVendor) &&
                  treatmentStatus === 'APPROVED' &&
                  hasValue(treatmentPlan?.stl_file_metadata)
                }
              >
                <div className='mb-2'>
                  <StlFilesSection
                    {...{
                      treatmentPlanList: allTreatmentPlanList,
                    }}
                  />
                </div>
              </When>
              <When isTrue={hasValue(treatmentPlan?.treatment_planning_link)}>
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
                      <div className='flex gap-6 mt-4'>
                        <ShowDetails
                          label='Total aligners'
                          value={
                            hasValue(treatmentPlan) ? (
                              <div>
                                {isNew || isDraft
                                  ? treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range
                                      .length +
                                    treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range
                                      .length
                                  : treatmentPlan.total_aligners}
                              </div>
                            ) : null
                          }
                        />
                        <ShowDetails
                          label='Upper jaw range'
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
                          label='Lower jaw range'
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
                  <When isTrue={!isCustomer && !isVendor}>
                    <div className='flex gap-6'>
                      <ShowDetails
                        label='Brand name'
                        value={treatmentPlan?.production_lab_details?.brand_name}
                      />
                      <ShowDetails
                        label='Recommended days to wear each aligner'
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
                                  <When
                                    isTrue={file.extension !== 'mp4' && file.extension !== 'pdf'}
                                  >
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
                    <ShowDetails
                      label='Remarks'
                      value={treatmentPlan?.remarks}
                      className='w-full'
                    />

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
                                  <When
                                    isTrue={file.extension !== 'mp4' && file.extension !== 'pdf'}
                                  >
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
                </div>
              </BorderedCard>
              <TreatmentPlanActions
                {...{
                  treatmentStatus,
                  handleOnClick,
                  sendToPatient,
                }}
              />
            </div>
          )}
        </Page>
      )}
    </>
  )
}

export default ViewTreatmentPlan
