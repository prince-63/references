// NotificationsMobileView.tsx

import eventType from '@constants/eventType'
import rolesConstants from '@constants/roles.constants'
import PATIENT_TYPE from '@constants/patientType.constants'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'

import {AxiosError} from 'axios'
import moment from 'moment'
import {ReactNode, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  Send,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Flag,
  ChevronRight,
  User,
  UserPlus,
  Layers,
  MessageCircle,
  Calendar,
  Package,
  Bell,
} from 'lucide-react'

import Page from 'components/page/Page'
import When from 'components/when/When'
import Spinner from 'components/spinner/Spinner'
import {AuthContext} from 'context/AuthContext'

import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'

import {RootState} from 'redux/store'
import {postApiDataNewChatAdd} from 'redux/Slices/AppSlice/Chat/NewChatAddSlice'
import {
  ApiPostNotificationData,
  postApiDataDashboardUpdates,
} from 'redux/Slices/AppSlice/Dashboard/DashboardUpdatesSlice'
import {TimelineDeactivateEventsList} from 'redux/Slices/AppSlice/Dashboard/TimelineDeactivateEventsListSlice'
import {postApiDataTimelineDeactivate} from 'redux/Slices/AppSlice/Dashboard/TimelineDeactivateSlice'
import {setEventId} from 'redux/Slices/AppSlice/PatientProfile/Timeline/AllTimelineSlice'
import {
  ApiGetData,
  safeParseInt,
  identifyUser,
  validateList,
  capitalizeFirstLetter,
  getProperFilteredEvents,
  formatPluralizedStringOnly,
  removeSign,
  formatDateTime,
} from 'utils/ConstFunctions'
import calendarEventsHeaderTitle from '@staticData/calendarEventsHeaderTitle'
import getPatientProfileTrackingUrl from '@utils/getPatientProfileTrackingUrl'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {
  getDashboardCounts,
  getDashboardNewDetails,
} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import {setSelectedUpdate} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import {IMAGE_EMPTY_STATE_NOTIFICATION} from 'utils/ImageConst'
import {NotificationFilterOptionsRecord} from './types/notificationList.types'
import useActiveProfile from '@hooks/useActiveProfile'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {getDisplayRole} from '@hooks/useDashboard'
type NotifKind = 'success' | 'error' | 'info' | 'warning'

const NotificationsMobileView = () => {
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {isStarterPlanUser, isEnterprisePlanUser} = useAllUserPlan()
  const {activeProfile} = useActiveProfile()
  const profileBasePath = useProfileBasePath()
  const today = moment().format('YYYY-MM-DD')
  const [pageSize, setPageSize] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [tableData, setTableData] = useState<NotificationFilterOptionsRecord[]>([])
  const {loading: loadingCount} = useSelector((state: RootState) => state.apiDashboardUpdates)
  const {loadingDashboard, countsData} = useSelector((state: RootState) => state.DoctorDashboard)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {subscriptionData} = useSelector((state: RootState) => state.subscription)
  const loading = loadingDashboard || loadingCount

  const loadMoreData = () => {
    setPageSize((prev) => prev + 1)
    getDashboardUpdatesNotifications(pageSize + 1)
  }

  useEffect(() => {
    setPageSize(0)
    setHasMore(true)
    getDashboardUpdatesNotifications(0)
  }, [])

  const getDashboardUpdatesNotifications = (page: number) => {
    const postData: ApiPostNotificationData = {
      doctor_id: safeParseInt(userId),
      active: true,
      page,
      size: 10,
      allowed_event_types: [],
    }

    dispatchAction(postApiDataDashboardUpdates(postData))
      .unwrap()
      .then((res: {updates: NotificationFilterOptionsRecord[]}) => {
        const rawUpdates = res.updates || []
        const updates = getProperFilteredEvents(rawUpdates) || []

        if (rawUpdates.length < 10) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }

        if (page === 0) {
          setTableData(updates)
        } else {
          setTableData((prev) => [...prev, ...updates])
        }
      })
      .catch((error: AxiosError) => {
        console.error('Error fetching dashboard updates:', error)
      })
  }

  const refreshCountData = () => {
    if (!userId || !subscriptionData?.plan_metadata) return
    const role = (activeProfile?.roles ?? []).map((r) => r.name)
    const userRole = getDisplayRole(role, activeProfile ?? {profile_type: ''})
    const planName = subscriptionData?.plan_metadata?.plan_name ?? ''
    const computedPlanName = (() => {
      if (userRole === 'INTERNAL_USER') return userRole
      if (userRole === 'UNKNOWN') return planName
      if (userRole === 'LAB_STAFF' && planName === 'ENTERPRISE') return 'ENTERPRISE_LAB_STAFF'
      return userRole
    })()

    dispatchAction(
      getDashboardNewDetails({
        doctor_id: safeParseInt(userId),
        roles: role,
        plan_name: computedPlanName,
      })
    )
  }
  // -------------------------
  // Actions
  // -------------------------
  const dismissAction = (eventId: number) => {
    const postData: ApiGetData = {data: {event_id: safeParseInt(eventId)}}
    dispatchAction(postApiDataTimelineDeactivate(postData) as any)
      .unwrap()
      .then(() => {
        setTableData([])
        setPageSize(0)
        setHasMore(true)
        getDashboardUpdatesNotifications(0)
        refreshCountData()
      })
      .catch((error: AxiosError) => console.error(error))
  }

  const openChatPatient = (patient: any) => {
    const patientUserId = patient.patient_id
    const postData: ApiGetData = {
      data: {patient_id: [parseInt(patientUserId)], doctor_id: safeParseInt(userId)},
    }
    dispatchAction(postApiDataNewChatAdd(postData) as any)
      .unwrap()
      .then(() => {
        if (serviceConfig.PLANNING) {
          navigate(`${profileBasePath}/${patientUserId}`)
        } else {
          navigate(`${profileBasePath}/${patientUserId}/chat`)
        }
        identifyUser()
      })
      .catch((error: any) => console.error('Error : ', error))
  }

  const openLabChat = (patient: any) => {
    const patientUserId = patient?.patient_id
    const postData: ApiGetData = {
      data: {patient_id: [parseInt(patientUserId)], doctor_id: safeParseInt(userId)},
    }
    dispatchAction(postApiDataNewChatAdd(postData) as any)
      .unwrap()
      .then(() => {
        navigate(`/lab-chat`)
        identifyUser()
      })
      .catch((error: any) => console.error('Error : ', error))
  }

  const getPatientProfileBasePath = (patientId?: string | number | null) => {
    if (patientId === null || patientId === undefined) return null
    return `${profileBasePath}/${String(patientId)}`
  }

  const buildTreatmentPlanNavigationPath = (
    patientId?: string | number | null,
    treatmentPlanId?: string | number | null,
    orderId?: string | number | null
  ) => {
    if (patientId === null || patientId === undefined) return null
    const normalizedPatientId = String(patientId)
    if (serviceConfig.PLANNING) {
      return `${profileBasePath}/${normalizedPatientId}/plans`
    }

    if (!isStarterPlanUser && profileBasePath.includes('vsp'))
      return `${profileBasePath}/${normalizedPatientId}/plans`

    if (!isStarterPlanUser) return `${profileBasePath}/${normalizedPatientId}/plans-list`
    if (treatmentPlanId === null || treatmentPlanId === undefined) return null

    const basePath = `${profileBasePath}/${normalizedPatientId}/plans-list`
    if (orderId === null || orderId === undefined) return basePath

    const searchParams = new URLSearchParams()
    searchParams.set('order_id', String(orderId))
    return `${basePath}?${searchParams.toString()}`
  }

  const openProfile = (data: any) => {
    if (serviceConfig.PLANNING) {
      return navigate(`${profileBasePath}/${data.patient_id}/plans?order_id=${data.order_id}`)
    }
    dispatchAction(setEventId(data.event_id))
    const targetPath = getPatientProfileBasePath(data?.patient_id ?? data?.patientId)
    if (targetPath) navigate(targetPath)
  }

  const openTrackingPage = (data: any) => {
    navigate(getPatientProfileTrackingUrl(data.patient_id, isStarterPlanUser))
  }

  const openActionPage = (data: any) => {
    dispatchAction(setSelectedUpdate(data?.aligner_action_id))

    let patientTimelineFilter: string | undefined
    switch (data.event_type) {
      case eventType.ALIGNER_CHANGE:
      case eventType.MANUAL_ALIGNER_CHANGE:
        patientTimelineFilter = patientOverviewAlignerActionFilterConstantsConstants.ALIGNER_CHANGES
        break
      case eventType.ALIGNER_CHECK_IN_FOR_DOCTOR:
      case eventType.ALIGNER_CHANGE_FEEDBACK_ADDED:
        patientTimelineFilter =
          patientOverviewAlignerActionFilterConstantsConstants.ALIGNER_CHECKINS
        break
      case eventType.ISSUE_REPORTED:
        patientTimelineFilter = patientOverviewAlignerActionFilterConstantsConstants.ISSUES_REPORTED
        break
      default:
        break
    }

    navigate(
      getPatientProfileTrackingUrl(data.patient_id, isStarterPlanUser, {
        patient_timeline_filter: patientTimelineFilter,
      })
    )
  }

  const viewOrder = (data: any) => {
    navigate('/production', {state: {patientName: data.patient_name}})
  }

  const openBracesPatientAppointment = (data: any) => {
    const basePath = getPatientProfileBasePath(data?.patient_id ?? data?.patientId)
    if (!basePath) return

    if (isStarterPlanUser) {
      navigate(`${basePath}/appointments`)
      return
    }
    navigate(basePath)
  }

  const markAllAsReadNotifications = () => {
    dispatchAction(TimelineDeactivateEventsList({doctorId: safeParseInt(userId)}) as any)
      .unwrap()
      .then(() => {
        dispatchAction(getDashboardCounts({doctor_id: safeParseInt(userId)}) as any)
        setTableData([])
        setPageSize(0)
        setHasMore(true)
        getDashboardUpdatesNotifications(0)
      })
      .catch((error: any) => console.error(error))
  }

  // -------------------------
  // Helpers: Title/Sub-title from OLD code (your request)
  // -------------------------
  const getPatientName = (update: any) => {
    const name = typeof update?.patient_name === 'string' ? update.patient_name.trim() : ''
    return name || 'the patient'
  }

  const getCaseDisplayName = (update: any) => {
    const name = typeof update?.patient_name === 'string' ? update.patient_name.trim() : ''
    return name ? `${name}` : 'The case'
  }

  const buildNotificationTitle = (update: any, fallback: string) => {
    const candidate =
      (typeof update?.description === 'string' && update.description.trim()) ||
      (typeof update?.message === 'string' && update.message.trim())
    return candidate || fallback
  }

  // -------------------------
  // Badge + Icon helpers
  // -------------------------
  const getNotificationBadgeColor = (et: string): NotifKind => {
    const errorTypes = [
      'ISSUE_REPORTED',
      'ORDER_CANCELLED',
      'INVITATION_REJECTED',
      'DOCTOR_INVITATION_REJECTED',
      'NEED_MORE_INFO_REQUESTED',
      'PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED',
      'VSP_MORE_INFORMATION_REQUIRED',
      'VSP_REVISION_REQUESTED',
    ]
    const warningTypes = [
      'ALIGNER_CHANGE',
      'MISSED_ALIGNER_CHANGED_DATE',
      'RESUME_TREATMENT_REMINDER',
      'MANUAL_ALIGNER_CHANGE',
      'CREATE_REFINEMENT_REMINDER',
      'PAYMENT_REMINDER',
      'ORDER_ON_HOLD',
      'THIRD_PARTY_CUSTOMER_REQUEST_RE_PLAN',
      'CASE_MOVED_TO_PRODUCTION',
      'PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION',
      'PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL',
    ]
    const successTypes = [
      'TREATMENT_STARTING_TOMORROW',
      'TREATMENT_STARTING',
      'TREATMENT_COMPLETED',
      'PATIENT_CONNECTED_WITH_DOCTOR',
      'PRACTICE_CONNECTED_ORG',
      'PATIENT_ASSIGNED_TO_PRACTICE',
      'PATIENT_ADDED_BY_PRACTICE',
      'THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN',
      'LAB_ADMIN_SEND_STL_FILES',
      'MANUFACTURING_DELIVERED',
      'MANUFACTURING_COMPLETED',
      'CASE_READY_TO_BEGIN_TREATMENT',
      'PLANNING_CASE_COMPLETED',
      'TREATMENT_PLAN_ADDED',
      'PRESCRIPTION_ADDED',
      'UPDATED_FROM_NEED_MORE_INFO_TO_ORDERED',
      'PLANNING_CUSTOMER_PATIENT_ONBOARDED',
      'PLANNING_CUSTOMER_CASE_COMPLETED',
      'PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED',
      'PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES',
      'NEW_MESSAGE',
      'VSP_CASE_ASSIGNED',
      'VSP_CASE_SUBMITTED',
      'VSP_FILES_UPLOADED',
      'VSP_PLAN_READY_FOR_REVIEW',
      'VSP_PLAN_APPROVED',
      'VSP_PLANNING_COMPLETED',
      'VSP_PRODUCTION_ORDER_CREATED',
      'VSP_ORDER_SHIPPED',
      'VSP_ORDER_DELIVERED',
    ]

    if (errorTypes.includes(et)) return 'error'
    if (warningTypes.includes(et)) return 'warning'
    if (successTypes.includes(et)) return 'success'
    return 'info'
  }

  const getNotificationType = (update: any): NotifKind =>
    getNotificationBadgeColor(update.event_type)

  const getNotificationIcon = (et: string) => {
    switch (et) {
      case 'ALIGNER_CHANGE':
      case 'MANUAL_ALIGNER_CHANGE':
        return <RotateCcw size={18} />
      case 'TREATMENT_COMPLETED':
      case 'PLANNING_CASE_COMPLETED':
      case 'CASE_READY_TO_BEGIN_TREATMENT':
      case 'MANUFACTURING_COMPLETED':
      case 'TREATMENT_PLAN_ADDED':
      case 'PLANNING_CUSTOMER_CASE_COMPLETED':
      case 'PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED':
      case 'VSP_CASE_ASSIGNED':
      case 'VSP_PLAN_APPROVED':
      case 'VSP_PLANNING_COMPLETED':
      case 'VSP_PRODUCTION_ORDER_CREATED':
      case 'VSP_ORDER_DELIVERED':
        return <CheckCircle2 size={18} />
      case 'ISSUE_REPORTED':
      case 'NEED_MORE_INFO_REQUESTED':
      case 'MORE_INFORMATION_REQUIRED':
      case 'PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED':
      case 'VSP_MORE_INFORMATION_REQUIRED':
      case 'VSP_REVISION_REQUESTED':
        return <AlertCircle size={18} />
      case 'PATIENT_ADDED_BY_PRACTICE':
      case 'PATIENT_ASSIGNED_TO_PRACTICE':
      case 'PATIENT_CONNECTED_WITH_DOCTOR':
      case 'PLANNING_CUSTOMER_PATIENT_ONBOARDED':
      case 'VSP_CASE_SUBMITTED':
        return <UserPlus size={18} />
      case 'MESSAGE_SENT_TO_DOCTOR':
      case 'NEW_MESSAGE':
      case 'VSP_NEW_MESSAGE_LAB_TO_CUSTOMER':
      case 'VSP_NEW_MESSAGE_CUSTOMER_TO_LAB':
        return <MessageCircle size={18} />
      case 'LAB_ADMIN_SEND_STL_FILES':
      case 'THIRD_PARTY_CUSTOMER_REQUEST_STL_FILES':
      case 'PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES':
      case 'VSP_FILES_UPLOADED':
        return <Layers size={18} />
      case 'CASE_MOVED_TO_PLANNING':
      case 'CASE_MOVED_TO_PRODUCTION':
      case 'CASE_ASSIGNED_TO_YOU':
      case 'NEW_ORDER_ADDED':
      case 'ORG_SEND_TREATMENT_PLAN_FOR_APPROVAL':
      case 'PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION':
      case 'PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL':
      case 'VSP_PLAN_READY_FOR_REVIEW':
      case 'VSP_ORDER_SHIPPED':
        return <Package size={18} />
      case 'APPOINTMENT_REMINDER':
      case 'CALENDAR_REMINDER':
      case 'PAYMENT_REMINDER':
        return <Calendar size={18} />
      case 'MANUFACTURING_DELIVERED':
      case 'MANUFACTURING_IN_TRANSIT':
        return <Flag size={18} />
      case 'LAB_ADMIN_SEND_TREATMENT_PLAN':
      case 'THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN':
        return <Send size={18} className='rotate-[-45deg]' />
      default:
        return <Layers size={18} />
    }
  }

  const getIconBgColor = (t: NotifKind) => {
    switch (t) {
      case 'success':
        return 'bg-[#e6f7f3]'
      case 'error':
        return 'bg-[#fef4f3]'
      case 'info':
        return 'bg-[#e6f4ff]'
      case 'warning':
        return 'bg-[#fef9e6]'
      default:
        return 'bg-[#f5f4fe]'
    }
  }

  const getIconColor = (t: NotifKind) => {
    switch (t) {
      case 'success':
        return 'text-[#00b383]'
      case 'error':
        return 'text-[#f45045]'
      case 'info':
        return 'text-[#0095ff]'
      case 'warning':
        return 'text-[#ffa500]'
      default:
        return 'text-[#735bf2]'
    }
  }

  const isUnreadEvent = (update: any) => {
    return update?.read === false
  }

  // -------------------------
  // ✅ TITLE + SUBTITLE mapping (this is what you asked to fix)
  // - Keeps your sample event wording as-is for the “sample” set.
  // - For the rest: uses the same strings from your old code blocks.
  // -------------------------
  const getNotificationMetadata = (update: any) => {
    const base = {
      title: 'Notification',
      content: 'New notification',
      ctaButton: 'View',
      onCTAClick: () => openProfile(update),
      userName:
        update?.doctor_name ||
        update?.patient_name ||
        update?.practice_name ||
        update?.org_name ||
        update?.lab_admin_display_name ||
        update?.customer_display_name ||
        '',
    }

    const patientName = update?.patient_name || 'Patient'
    const planName = update?.treatment_plan_name || 'the treatment plan'
    const versionName = update?.treatment_plan_version_name || 'V1'
    const labName = activeProfile?.owner_organization_name ?? update.practice_name
    const orgName = update?.org_name
    const Customer = activeProfile?.profile_type === 'INVITED'

    switch (update.event_type) {
      // -------------------------
      // SAMPLE SET (keep as-is)
      // -------------------------
      case eventType.LAB_ADMIN_SEND_STL_FILES:
        return {
          ...base,
          title: 'STL Files Uploaded',
          content: 'New STL files have been uploaded by the lab.',
          ctaButton: 'View Files',
          userName: update?.lab_admin_display_name || 'Lab',
          onCTAClick: () =>
            navigate(
              `${profileBasePath}/${update.patient_id}/view-plan/${update.treatment_plan_id}`
            ),
        }

      case eventType.PATIENT_ADDED_BY_PRACTICE:
        return {
          ...base,
          title: 'Patient Added',
          content: 'The patient record has been created. Please submit a case to start planning.',
          ctaButton: 'Submit Case',
          userName: update.practice_name || 'Practice',
          onCTAClick: () => openProfile(update),
        }

      case eventType.PLANNING_CASE_COMPLETED:
        return {
          ...base,
          title: 'Case Completed',
          content: 'Planning has been completed for this case.',
          ctaButton: 'View Case',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            if (update?.patient_id)
              return navigate(getPatientProfileTrackingUrl(update.patient_id, isStarterPlanUser))
            return openProfile(update)
          },
        }

      case eventType.TREATMENT_PLAN_ADDED:
        return {
          ...base,
          title: 'Plan Approved',
          content: '“Expert Plan – V2” has been approved.',
          ctaButton: 'View Case',
          userName: update?.patient_name,
          onCTAClick: () => navigate(`/aligner-orders`),
        }

      case eventType.RE_PLAN_TREATMENT:
        return {
          ...base,
          title: 'Revision Request Sent',
          content: 'Your revision request for “Expert Plan – V2” has been sent to the lab.',
          ctaButton: 'View Case',
          userName: update.practice_name || 'Practice',
          onCTAClick: () => {
            const targetPath = buildTreatmentPlanNavigationPath(
              update?.patient_id,
              update?.treatment_plan_id,
              update?.order_id
            )
            if (targetPath) return navigate(targetPath)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.LAB_ADMIN_SEND_TREATMENT_PLAN:
        return {
          ...base,
          title: 'Plan Ready for Review',
          content: '“Expert Plan – V1” is ready for your review.',
          ctaButton: 'Review Plan',
          userName: update?.lab_admin_display_name || 'Lab',
          onCTAClick: () => {
            const targetPath = buildTreatmentPlanNavigationPath(
              update?.patient_id,
              update?.treatment_plan_id,
              update?.order_id
            )
            if (targetPath) return navigate(targetPath)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.NEED_MORE_INFO_REQUESTED:
        return {
          ...base,
          title: 'More Information Required',
          content: 'The lab has requested additional information for this case.',
          ctaButton: 'View Case',
          userName: 'Lab',
          onCTAClick: () => navigate(`/orders/${update.order_id}`),
        }

      // -------------------------
      // REST (pulled from your OLD code strings)
      // -------------------------
      case eventType.ALIGNER_CHANGE:
        return {
          ...base,
          title: 'Aligner Changed',
          content: `${patientName} has changed their aligner from ${capitalizeFirstLetter(
            update.previous_aligner_jaw_type
          )} ${update.previous_aligner_no} to ${capitalizeFirstLetter(
            update.new_aligner_jaw_type
          )} ${update.new_aligner_no}.${
            update?.changeOffset !== undefined && update?.changeOffset !== null
              ? ` ${
                  update.changeOffset === 0
                    ? 'On time.'
                    : update.changeOffset > 0
                      ? `Delayed by ${removeSign(update.changeOffset)} ${formatPluralizedStringOnly(
                          Number(removeSign(update.changeOffset)),
                          'day'
                        )}.`
                      : `Early by ${removeSign(update.changeOffset)} ${formatPluralizedStringOnly(
                          Number(removeSign(update.changeOffset)),
                          'day'
                        )}.`
                }`
              : ''
          }`,
          ctaButton: 'View',
          onCTAClick: () => openActionPage(update),
        }

      case eventType.MISSED_ALIGNER_CHANGED_DATE:
        return {
          ...base,
          title: 'Aligner Change Missed',
          content: `Missed changing to Aligner ${update.next_aligner_no}.`,
          ctaButton: 'Send a message',
          onCTAClick: () => openChatPatient(update),
        }

      case eventType.MESSAGE_SENT_TO_DOCTOR:
        return {
          ...base,
          title: 'New Message',
          content: `${patientName} has sent you a message.`,
          ctaButton: 'Reply',
          onCTAClick: () => openChatPatient(update),
          userName: patientName,
        }

      case eventType.NEW_MESSAGE:
        return {
          ...base,
          title: 'New Message',
          content: `${labName} has sent you a message.`,
          ctaButton: 'Reply',
          onCTAClick: () => openLabChat(update),
          userName: patientName,
        }

      case eventType.TREATMENT_STARTING_TOMORROW:
        return {
          ...base,
          title: 'Treatment Starting Tomorrow',
          content: `${patientName} is starting their treatment tomorrow.`,
          ctaButton: 'View',
          onCTAClick: () => openProfile(update),
        }

      case eventType.TREATMENT_STARTING:
        return {
          ...base,
          title: 'Treatment Starting',
          content:
            update?.aligner_journey_details?.first_aligner_start_date === today
              ? `${patientName} is starting their treatment today.`
              : `${patientName} is starting their treatment.`,
          ctaButton: 'View',
          onCTAClick: () => openProfile(update),
        }

      case eventType.TREATMENT_COMPLETED:
        return {
          ...base,
          title: 'Treatment Completed',
          content: `Treatment for ${patientName} has been successfully completed by ${
            update?.treatment_completed?.practice_name || 'the practice'
          }.`,
          ctaButton: 'View Profile',
          onCTAClick: () => openProfile(update),
        }

      case eventType.ALIGNER_CHANGE_FEEDBACK_ADDED:
        return {
          ...base,
          title: 'Aligner Check-in Comment',
          content: `${patientName} has added comments on Aligner check-in.`,
          ctaButton: 'View Comment',
          onCTAClick: () => openActionPage(update),
        }

      case eventType.ALIGNER_PRODUCTION_ORDER_REMINDER:
        return {
          ...base,
          title: 'Aligner Review Pending',
          content: `${patientName}’s aligner status is pending for review.`,
          ctaButton: 'View Orders',
          onCTAClick: () => viewOrder(update),
        }

      case eventType.PATIENT_CONNECTED_WITH_DOCTOR:
        return {
          ...base,
          title: 'Patient Connected',
          content: `${patientName} is now connected with you.`,
          ctaButton: 'View profile',
          onCTAClick: () => openProfile(update),
          userName: patientName,
        }

      case eventType.UPGRADE_PATIENT_TO_MOBILE_APP:
        return {
          ...base,
          title: 'Select Tracking Method',
          content: `${patientName} is now connected with you. Please select a treatment tracking method to continue.`,
          ctaButton: 'Select tracking',
          onCTAClick: () => openTrackingPage(update),
        }

      case eventType.RESUME_TREATMENT_REMINDER:
        return {
          ...base,
          title: 'Resume Treatment Reminder',
          content: `You had set a reminder to resume treatment of ${patientName}.`,
          ctaButton: 'View',
          onCTAClick: () => openProfile(update),
        }

      case eventType.MANUAL_ALIGNER_CHANGE:
        return {
          ...base,
          title: 'Aligner Updated Automatically',
          content: `${patientName} has been automatically moved from ${capitalizeFirstLetter(
            update.previous_aligner_jaw_type
          )} ${update.previous_aligner_no} to ${capitalizeFirstLetter(
            update.new_aligner_jaw_type
          )} ${update.new_aligner_no} as scheduled. Tap here to update any necessary changes.`,
          ctaButton: 'View',
          onCTAClick: () => openTrackingPage(update),
        }

      case eventType.CREATE_REFINEMENT_REMINDER:
        return {
          ...base,
          title: 'Create New Plan Reminder',
          content: `It's been 10 days since deactivating ${patientName}'s last plan. Please set up a new plan.`,
          ctaButton: 'View',
          onCTAClick: () => openProfile(update),
        }

      case eventType.ALIGNER_CHECK_IN_FOR_DOCTOR:
        return {
          ...base,
          title: 'Aligner Check-in Submitted',
          content: `${patientName} has submitted an aligner check-in form.`,
          ctaButton: 'View',
          onCTAClick: () => openActionPage(update),
        }

      case eventType.ISSUE_REPORTED:
        return {
          ...base,
          title: 'Issue Reported',
          content: `${patientName} has reported an issue. Tap to review.`,
          ctaButton: 'View Details',
          onCTAClick: () => openActionPage(update),
          userName: patientName,
        }

      case eventType.APPOINTMENT_REMINDER:
        return {
          ...base,
          title: 'Appointment Reminder',
          content: `You had set a reminder to collect ${patientName}'s payment.`,
          ctaButton: 'View',
          onCTAClick: () => navigate(`/summary/${update?.patient_id}`),
        }

      case eventType.PAYMENT_REMINDER:
        return {
          ...base,
          title: 'Payment Reminder',
          content: `You had set a reminder to collect ${patientName}'s payment.`,
          ctaButton: 'View',
          onCTAClick: () => openBracesPatientAppointment(update),
        }

      case eventType.CALENDAR_REMINDER:
        return {
          ...base,
          title: 'Calendar Reminder',
          content: `${
            update?.reminder_type === 'UNPROCESSED_ALIGNER_REMINDER' ? '' : patientName
          } ${calendarEventsHeaderTitle.find((i) => i.value === update?.reminder_type)?.label || ''} ${
            update?.reminder_type === 'UNPROCESSED_ALIGNER_REMINDER' ? patientName : ''
          }`,
          ctaButton:
            update?.reminder_type === 'UNPROCESSED_ALIGNER_REMINDER' ||
            update?.reminder_type === 'TREATMENT_START_REMINDER'
              ? 'View'
              : 'View reminder',
          onCTAClick: () => {
            const {reminder_id, reminder_date} = update
            if (reminder_id && reminder_date) {
              if (
                update?.reminder_type === 'UNPROCESSED_ALIGNER_REMINDER' ||
                update?.reminder_type === 'TREATMENT_START_REMINDER'
              ) {
                openProfile(update)
              } else {
                navigate('/calendar', {state: {reminderId: reminder_id, eventDate: reminder_date}})
              }
            }
          },
        }

      case eventType.PRACTICE_CONNECTED_ORG:
        return {
          ...base,
          title: 'Invitation Accepted',
          content: `${update.doctor_name} has accepted your invitation. You are now connected.`,
          ctaButton: 'View',
          onCTAClick: () => {
            switch (update.doctor_role) {
              case rolesConstants.CUSTOMER:
              case rolesConstants.CONSULTING_ORTHODONTIST:
              case rolesConstants.GROWTH_CUSTOMER:
                navigate('/access-control/users?tab=external')
                break
              case 'ENTERPRISE_CUSTOMER':
                if (isEnterprisePlanUser) navigate('/access-control/users?tab=external')
                else navigate('/access-control/labs?tab=connected')
                break
              case rolesConstants.INTERNAL_USER:
                navigate('/access-control/users')
                break
              default:
                navigate('/access-control/labs?tab=connected')
                break
            }
          },
        }

      case eventType.PATIENT_ASSIGNED_TO_PRACTICE:
        return {
          ...base,
          title: 'Patient Assigned',
          content: `${update.org_name} has added a new patient.`,
          ctaButton: 'View Patient',
          onCTAClick: () => openProfile(update),
        }

      case eventType.PATIENT_ADDED_BY_PRACTICE:
        // already handled in sample set, but keep safe fallback
        return {
          ...base,
          title: 'Patient Added',
          content: `${update.practice_name} has added a new patient.`,
          ctaButton: 'View Patient',
          onCTAClick: () => openProfile(update),
        }

      case eventType.NEW_ORDER_ADDED:
        return {
          ...base,
          title: 'New Case',
          content: `${update.practice_name} has sent you a new case for ${patientName}.`,
          ctaButton: 'View Case',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(
                `${profileBasePath}/${update.patient_id}/plans?order_id=${update.order_id}`
              )
            }
            navigate(`${profileBasePath}/${update.patient_id}`)
          },
        }

      case eventType.ORG_SEND_TREATMENT_PLAN_FOR_APPROVAL:
        return {
          ...base,
          title: 'Plan Sent for Approval',
          content: `${update.practice_name} has sent a treatment plan for ${patientName}.`,
          ctaButton: 'Review Plan',
          onCTAClick: () => {
            const targetPath = buildTreatmentPlanNavigationPath(
              update?.patient_id,
              update?.treatment_plan_id,
              update?.order_id
            )
            if (targetPath) return navigate(targetPath)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.ORDER_ON_HOLD:
        return {
          ...base,
          title: 'Order On Hold',
          content: `${patientName} Order has been put on hold by the lab.`,
          ctaButton: 'View Order',
          onCTAClick: () => navigate(`/orders/${update.order_id}`),
        }

      case eventType.ORDER_CANCELLED:
        return {
          ...base,
          title: 'Order Cancelled',
          content: `${update.org_name} has cancelled the order for ${patientName}.`,
          ctaButton: 'View Order',
          onCTAClick: () => navigate(`/orders/${update.order_id}`),
        }

      case eventType.LAB_ADMIN_ASSIGN_ORDER:
        return {
          ...base,
          title: 'Case Assigned',
          content: `${update?.lab_admin_display_name} has assigned a case to you — ${patientName}.`,
          ctaButton: 'View Case',
          onCTAClick: () => navigate(`/orders/${update.order_id}`),
        }

      case eventType.THIRD_PARTY_CUSTOMER_REQUEST_STL_FILES:
        return {
          ...base,
          title: 'STL Files Requested',
          content: `${update?.customer_display_name} has requested STL files for ${patientName}.`,
          ctaButton: 'Upload STL',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(
                `${profileBasePath}/${update.patient_id}/plans?order_id=${update.order_id}`
              )
            }
            navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.THIRD_PARTY_CUSTOMER_REQUEST_RE_PLAN:
        return {
          ...base,
          title: 'Re-plan Requested',
          content: `${update?.customer_display_name} has requested a re-plan for order ${update?.order_id}. Review their comments and create a new plan.`,
          ctaButton: 'View Order',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(
                `${profileBasePath}/${update.patient_id}/plans?order_id=${update.order_id}`
              )
            }
            navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.THIRD_PARTY_CUSTOMER_SEND_CASE:
        return {
          ...base,
          title: 'Case Received',
          content: `${update?.customer_display_name} has sent a case. Review details and assign it to yourself or a lab user.`,
          ctaButton: 'Review details',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(
                `${profileBasePath}/${update.patient_id}/plans?order_id=${update.order_id}`
              )
            }
            navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN:
        return {
          ...base,
          title: 'Plan Approved',
          content: `${update?.customer_display_name} has approved your treatment plan for ${patientName}.`,
          ctaButton: 'View Case',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(
                `${profileBasePath}/${update.patient_id}/plans?order_id=${update.order_id}`
              )
            }
            navigate(
              `${profileBasePath}/${update.patient_id}/view-plan/${update.treatment_plan_id}/`
            )
          },
        }

      case eventType.DOCTOR_INVITATION_RECEIVED:
        return {
          ...base,
          title: 'Invitation Received',
          content: `${update?.org_name} has sent you an invitation to connect.`,
          ctaButton: 'View Invitation',
          onCTAClick: () => {
            if (
              update.doctor_role === rolesConstants.COMMERCIAL_ALIGNER_LAB ||
              update.doctor_role === rolesConstants.VENDOR
            ) {
              navigate(`/customers?invitation=true`)
            } else {
              navigate(`/labs?invitation=true`)
            }
          },
        }

      case eventType.INVITATION_REJECTED:
      case eventType.DOCTOR_INVITATION_REJECTED:
        return {
          ...base,
          title: 'Invitation Declined',
          content: `${update?.org_name} has declined your invitation.`,
          ctaButton: 'View',
          onCTAClick: () => {},
        }

      case eventType.COMMENT_ADDED_ON_ORDER:
        return {
          ...base,
          title: 'New Comment',
          content: `${update?.practice_name} has added comments to ${patientName}'s case.`,
          ctaButton: 'View Comments',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(
                `${profileBasePath}/${update.patient_id}/plans?order_id=${update.order_id}`
              )
            }
            navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.MANUFACTURING_IN_TRANSIT:
        return {
          ...base,
          title: 'In Transit',
          content: `Aligners for ${patientName} in transit!`,
          ctaButton: 'View Order',
          onCTAClick: () => openProfile(update),
        }

      case eventType.MANUFACTURING_DELIVERED:
        return {
          ...base,
          title: 'Delivered',
          content: `Aligners for ${patientName} delivered.`,
          ctaButton: 'View Order',
          onCTAClick: () => openProfile(update),
        }

      case eventType.CASE_MOVED_TO_PLANNING:
        return {
          ...base,
          title: 'Moved to Planning',
          content: buildNotificationTitle(
            update,
            `${getCaseDisplayName(update)} has been moved to Planning.`
          ),
          ctaButton: 'View Case',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(
                `${profileBasePath}/${update.patient_id}/plans?order_id=${update.order_id}`
              )
            }
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            if (update?.patient_id)
              return navigate(`${profileBasePath}/${update.patient_id}/plans-list`)
          },
        }

      case eventType.CASE_MOVED_TO_PRODUCTION:
        return {
          ...base,
          title: 'Moved to Production',
          content: buildNotificationTitle(
            update,
            `${getCaseDisplayName(update)} has been moved to Production.`
          ),
          ctaButton: 'View Case',
          onCTAClick: () => {
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            if (update?.patient_id)
              return navigate(`${profileBasePath}/${update.patient_id}/production`)
          },
        }

      case eventType.MANUFACTURING_COMPLETED:
        return {
          ...base,
          title: 'Manufacturing Completed',
          content: buildNotificationTitle(
            update,
            `Manufacturing completed for ${getCaseDisplayName(update)}.`
          ),
          ctaButton: 'View Case',
          onCTAClick: () => {
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            if (update?.patient_id)
              return navigate(getPatientProfileTrackingUrl(update.patient_id, isStarterPlanUser))
          },
        }

      case eventType.CASE_READY_TO_BEGIN_TREATMENT:
        return {
          ...base,
          title: 'Ready to Begin Treatment',
          content: buildNotificationTitle(
            update,
            `${getCaseDisplayName(update)} is ready to begin treatment.`
          ),
          ctaButton: 'View Tracking',
          onCTAClick: () => {
            if (update?.patient_id)
              return navigate(getPatientProfileTrackingUrl(update.patient_id, isStarterPlanUser))
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.STATUS_UPDATED:
        return {
          ...base,
          title: 'Status Updated',
          content: buildNotificationTitle(
            update,
            `${getCaseDisplayName(update)} status has been updated.`
          ),
          ctaButton: 'View Case',
          onCTAClick: () => {
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            if (update?.patient_id) return navigate(`${profileBasePath}/${update.patient_id}/`)
          },
        }

      case eventType.RECORDS_ADDED:
        return {
          ...base,
          title: 'New Records Added',
          content: buildNotificationTitle(
            update,
            `New case records have been added for ${getPatientName(update)}.`
          ),
          ctaButton: 'View Records',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(
                `${profileBasePath}/${update.patient_id}/records?order_id=${update.order_id}`
              )
            }
            if (update?.patient_id)
              return navigate(`${profileBasePath}/${update.patient_id}/details/case-files`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.PRESCRIPTION_ADDED:
        return {
          ...base,
          title: 'Prescription Added',
          content: buildNotificationTitle(
            update,
            `A prescription has been added for ${getPatientName(update)}.`
          ),
          ctaButton: 'View Prescription',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(`${profileBasePath}/${update.patient_id}/prescriptions-list`)
            }
            if (update?.patient_id)
              return navigate(`${profileBasePath}/${update.patient_id}/details/prescriptions`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.CASE_ASSIGNED_TO_YOU:
        return {
          ...base,
          title: 'Case Assigned to You',
          content: buildNotificationTitle(
            update,
            `${getCaseDisplayName(update)} has been assigned to you.`
          ),
          ctaButton: 'View Case',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              openProfile(update)
              return
            }
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            openProfile(update)
          },
        }

      case eventType.NEW_COMMENT_ADDED:
        return {
          ...base,
          title: 'New Comment Added',
          content: buildNotificationTitle(
            update,
            `New comment added on ${getCaseDisplayName(update)}'s case.`
          ),
          ctaButton: 'View Comment',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(`${profileBasePath}/${update.patient_id}/prescriptions-list`)
            }
            if (update?.patient_id)
              return navigate(`${profileBasePath}/${update?.patient_id}/activity-logs/comments`)
          },
        }

      case eventType.UPDATED_FROM_NEED_MORE_INFO_TO_ORDERED:
        return {
          ...base,
          title: 'Order Updated',
          content: `Order updated for ${patientName}'s case.`,
          ctaButton: 'View Order',
          onCTAClick: () => {
            if (serviceConfig.PLANNING) {
              return navigate(`${profileBasePath}/${update.patient_id}/prescriptions-list`)
            }
            navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.PLANNING_CUSTOMER_PATIENT_ONBOARDED:
        return {
          ...base,
          title: 'Patient Added',
          content: `The patient record has been created. Please submit a case to start planning.`,
          ctaButton: 'Submit Case',
          onCTAClick: () => openProfile(update),
        }

      case eventType.PLANNING_CUSTOMER_CASE_COMPLETED:
        return {
          ...base,
          title: 'Case Completed',
          content: `The case has been completed. Please review the details.`,
          ctaButton: 'View Case',
          onCTAClick: () => openProfile(update),
        }

      case eventType.PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED:
        return {
          ...base,
          title: 'Plan Approved',
          content: `${planName} - ${versionName} has been approved.`,
          ctaButton: 'View case',
          onCTAClick: () => openProfile(update),
        }

      case eventType.PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION:
        return {
          ...base,
          title: 'Revision Request Sent',
          content: `Your revision request for “${planName} - ${versionName}” has been sent to the lab.`,
          ctaButton: 'View case',
          onCTAClick: () => openProfile(update),
        }

      case eventType.PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL:
        return {
          ...base,
          title: 'Plan Ready for Review',
          content: `"${planName} - ${versionName}" is ready for your review.`,
          ctaButton: 'Review Plan',
          onCTAClick: () => openProfile(update),
        }

      case eventType.PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED:
        return {
          ...base,
          title: 'More Information Required',
          content: `The lab has requested additional information for this case.`,
          ctaButton: 'View case',
          onCTAClick: () => openProfile(update),
        }

      case eventType.PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES:
        return {
          ...base,
          title: 'STL Files Uploaded',
          content: `New STL files have been uploaded by the lab.`,
          ctaButton: 'View case',
          onCTAClick: () => openProfile(update),
        }

      case eventType.VSP_CASE_ASSIGNED:
        return {
          ...base,
          title: 'Case Assigned',
          content: `${patientName} case has been assigned to you.`,
          ctaButton: 'View Case',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id)
              return navigate(`/vsp-profile/${update.patient_id}/case-details`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            openProfile(update)
          },
        }

      case eventType.VSP_CASE_SUBMITTED:
        return {
          ...base,
          title: 'Case Submitted',
          content: `${patientName}'s case has been submitted for planning.`,
          ctaButton: 'View Case',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id)
              return navigate(`/vsp-profile/${update.patient_id}/plans?order_id=${update.order_id}`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            openProfile(update)
          },
        }

      case eventType.VSP_FILES_UPLOADED:
        return {
          ...base,
          title: 'Files Uploaded',
          content: `Case files have been uploaded for ${patientName}.`,
          ctaButton: 'View Files',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id)
              return navigate(
                `/vsp-profile/${update.patient_id}/records?order_id=${update.order_id}`
              )
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.VSP_PLAN_READY_FOR_REVIEW:
        return {
          ...base,
          title: 'Plan Ready for Review',
          content: `${planName} - ${versionName} is ready for your review for ${patientName}.`,
          ctaButton: 'Review Plan',
          userName: update?.patient_name || 'Lab',
          onCTAClick: () => {
            const targetPath = buildTreatmentPlanNavigationPath(update?.patient_id)
            if (targetPath) return navigate(targetPath)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.VSP_PLAN_APPROVED:
        return {
          ...base,
          title: 'Plan Approved',
          content: `${planName} - ${versionName} has been approved for ${patientName}.`,
          ctaButton: 'View Case',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id)
              return navigate(`/vsp-profile/${update.patient_id}/plans?order_id=${update.order_id}`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            openProfile(update)
          },
        }

      case eventType.VSP_REVISION_REQUESTED:
        return {
          ...base,
          title: 'Revision Requested',
          content: `A revision has been requested for ${planName} - ${versionName} for ${patientName}.`,
          ctaButton: 'Review Request',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id && update?.treatment_plan_id)
              return navigate(
                `/vsp-profile/${update.patient_id}/plans/view-plan/${update.treatment_plan_id}`
              )
            if (update?.patient_id)
              return navigate(`/vsp-profile/${update.patient_id}/plans?order_id=${update.order_id}`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.VSP_MORE_INFORMATION_REQUIRED:
        return {
          ...base,
          title: 'More Information Required',
          content: `Additional information is required for ${patientName}'s case.`,
          ctaButton: 'View Details',
          userName: update?.patient_name || 'Lab',
          onCTAClick: () => {
            if (update?.patient_id) return navigate(`/vsp-profile/${update.patient_id}/records`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.VSP_PLANNING_COMPLETED:
        return {
          ...base,
          title: 'Planning Completed',
          content: `Planning has been completed for ${patientName}.`,
          ctaButton: 'View Case',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id) return navigate(`/vsp-profile/${update.patient_id}/plans`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.VSP_PRODUCTION_ORDER_CREATED:
        return {
          ...base,
          title: 'Production Order Created',
          content: `Production order has been created for ${patientName}.`,
          ctaButton: 'View Order',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id) return navigate(`/vsp-profile/${update.patient_id}/production`)
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
          },
        }

      case eventType.VSP_ORDER_SHIPPED:
        return {
          ...base,
          title: 'Order Shipped',
          content: `${patientName}'s order has been shipped.`,
          ctaButton: 'Track Order',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id) {
              if (Customer) {
                return navigate(
                  `/vsp-profile/${update.patient_id}/plans?order_id=${update.order_id}`
                )
              } else {
                return navigate(
                  `/vsp-profile/${update.patient_id}/production??order_id=${update.order_id}`
                )
              }
            }
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            openProfile(update)
          },
        }

      case eventType.VSP_ORDER_DELIVERED:
        return {
          ...base,
          title: 'Order Delivered',
          content: `${patientName}'s order has been delivered.`,
          ctaButton: 'View Tracking',
          userName: update?.patient_name,
          onCTAClick: () => {
            if (update?.patient_id) {
              if (Customer) {
                return navigate(
                  `/vsp-profile/${update.patient_id}/plans?order_id=${update.order_id}`
                )
              } else {
                return navigate(
                  `/vsp-profile/${update.patient_id}/production??order_id=${update.order_id}`
                )
              }
            }
            if (update?.order_id) return navigate(`/orders/${update.order_id}`)
            openProfile(update)
          },
        }

      case eventType.VSP_NEW_MESSAGE_LAB_TO_CUSTOMER:
        return {
          ...base,
          title: 'New Message from Lab',
          content: `${orgName || 'Lab'} has sent you a message.`,
          ctaButton: 'View Message',
          userName: `${update?.patient_name || 'Lab'}` || 'Lab',
          onCTAClick: () => openLabChat(update),
        }

      case eventType.VSP_NEW_MESSAGE_CUSTOMER_TO_LAB:
        return {
          ...base,
          title: 'New Message',
          content: `${labName} has sent you a message.`,
          ctaButton: 'Reply',
          userName: patientName,
          onCTAClick: () => openLabChat(update),
        }

      default:
        return {
          ...base,
          title: update?.title || base.title,
          content:
            update?.description ||
            update?.message ||
            update?.content ||
            buildNotificationTitle(update, base.content),
        }
    }
  }

  // CTA row (new UI)
  const ActionRow = ({
    update,
    ctaButton,
    onCTAClick,
    iconColorClass,
  }: {
    update: any
    ctaButton: string
    onCTAClick: () => void
    iconColorClass: string
  }) => {
    return (
      <div className='mt-4 flex items-center gap-2'>
        <When isTrue={update?.patient_type !== PATIENT_TYPE?.EXISTING_PATIENT}>
          <button
            onClick={onCTAClick}
            className={`flex items-center gap-1 text-[13px] font-bold ${iconColorClass} hover:gap-2 transition-all`}
          >
            {ctaButton}
            <ChevronRight size={14} />
          </button>
        </When>

        <button
          className='text-gray-400 text-[13px] font-bold hover:text-gray-600'
          onClick={() => dismissAction(update.event_id)}
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <Page backNavigationRoute='/' showBackButton={true} containerClassName=' pb-[70px] md:pb-0'>
      <InfiniteScroll
        dataLength={tableData.length}
        next={loadMoreData}
        hasMore={hasMore}
        loader={
          <div>
            <Spinner loading={loading} />
          </div>
        }
        height={'100vh'}
        refreshFunction={() => {
          setTableData([])
          setPageSize(0)
          setHasMore(true)
          getDashboardUpdatesNotifications(0)
        }}
        pullDownToRefresh
        pullDownToRefreshThreshold={20}
        pullDownToRefreshContent={
          <h3 style={{textAlign: 'center'}}>&#8595; Pull down to refresh</h3>
        }
        releaseToRefreshContent={<h3 style={{textAlign: 'center'}}>&#8593; Release to refresh</h3>}
      >
        <div className='w-full bg-white min-h-screen'>
          <div className='w-full md:px-6 px-2 md:py-12 py-4'>
            {/* Header */}
            <div className='flex items-center justify-between mb-10'>
              <div className='flex items-center gap-3'>
                <Bell size={24} className='text-[#735bf2]' />
                <h1 className='text-2xl font-bold text-[#0f172a]'>Notifications</h1>
              </div>

              <button
                className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${
                  countsData.unread_notification_count > 0
                    ? 'text-[#735bf2] hover:text-[#5a47b5]'
                    : 'text-gray-400'
                }`}
                onClick={markAllAsReadNotifications}
                disabled={countsData.unread_notification_count <= 0}
              >
                Mark all read
              </button>
            </div>

            <When isTrue={tableData.length === 0 && !loading}>
              <EmptyStateForNotification />
            </When>

            {/* Feed */}
            <div className='space-y-3'>
              {validateList(tableData) &&
                tableData.map((update: any, index: number) => {
                  const notifType = getNotificationType(update)

                  const meta = getNotificationMetadata(update)

                  const iconBg = getIconBgColor(notifType)
                  const iconColor = getIconColor(notifType)

                  const unread = isUnreadEvent(update)

                  // left border color for unread
                  const leftBorder =
                    notifType === 'success'
                      ? 'border-l-[#16A085]'
                      : notifType === 'info'
                        ? 'border-l-[#5B6EFF]'
                        : notifType === 'warning'
                          ? 'border-l-[#FFA500]'
                          : 'border-l-[#E74C3C]'

                  return (
                    <div
                      key={index}
                      className={`group relative bg-white border ${
                        unread ? `border-l-4 ${leftBorder}` : 'border-gray-100'
                      } rounded-2xl p-4 flex gap-4 transition-all hover:shadow-lg`}
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border ${iconBg} ${iconColor} border-gray-100`}
                      >
                        {getNotificationIcon(update.event_type)}
                      </div>

                      {/* Content */}
                      <div className='flex-grow min-w-0'>
                        <div className='flex justify-between items-start mb-1'>
                          <When isTrue={meta.userName != '' || meta.userName != null}>
                            <div className='flex items-center gap-2 flex-wrap'>
                              <span className='text-[11px] font-bold text-[#735bf2] bg-[#f5f4fe] px-2 py-0.5 rounded-full flex items-center gap-1'>
                                <User size={10} />
                                {meta.userName}
                              </span>
                            </div>
                          </When>

                          <When isTrue={meta.userName == '' || meta.userName == null}>
                            <div className='flex items-center gap-2 flex-wrap' />
                          </When>
                          <div className='text-[11px] text-gray-400 font-medium whitespace-nowrap'>
                            {update.event_at ? formatDateTime(update.event_at) : ''}
                          </div>
                        </div>

                        <h3 className='font-bold text-[16px] text-[#0f172a] mb-1'>{meta.title}</h3>

                        <p className='text-[#4b5563] text-sm leading-snug'>{meta.content}</p>

                        <ActionRow
                          update={update}
                          ctaButton={meta.ctaButton}
                          onCTAClick={meta.onCTAClick}
                          iconColorClass={iconColor}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Footer */}
            <When isTrue={!hasMore && tableData.length > 0}>
              <div className='md:mt-12 mt-4 md:py-8 text-center border-t border-gray-100'>
                <div className='inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                  End of updates
                </div>
              </div>
            </When>
          </div>
        </div>
      </InfiniteScroll>
    </Page>
  )
}

export default NotificationsMobileView

export const EmptyStateForNotification = () => {
  return (
    <CommonEmptyState
      boxStyle='w-full justify-center items-center mt-36'
      image={IMAGE_EMPTY_STATE_NOTIFICATION}
      imageStyle='w-[156px] h-[149px] '
      title='You are all caught up'
      titleStyle=' text-textColor font-semibold text-[16px] mt-4 text-center'
      subTitle='Looks like there are no notifications pending. We will notify you once something comes up'
      subTitleStyle='w-[325px] text-textColor font-medium text-[14px]  text-center'
    />
  )
}

export const TimelineWrap = ({
  children,
  notificationType,
  isUnread,
}: {
  children: ReactNode
  notificationType?: string
  isUnread?: boolean
}) => {
  const getBorderColor = () => {
    if (!isUnread) return 'border-gray-100'
    switch (notificationType) {
      case 'success':
        return 'border-l-[#16A085]'
      case 'info':
        return 'border-l-[#5B6EFF]'
      case 'warning':
        return 'border-l-[#FFA500]'
      case 'error':
        return 'border-l-[#E74C3C]'
      default:
        return 'border-l-[#8B5CF6]'
    }
  }

  return (
    <div
      className={`w-full mb-3 rounded-2xl ${isUnread ? `border-l-4 ${getBorderColor()}` : 'border'} border-gray-100 bg-white p-4 flex gap-4 transition-all hover:shadow-lg`}
    >
      <div>{children}</div>
    </div>
  )
}

export const DateTime = ({event_at}: {event_at: string | null | undefined}) => {
  return (
    <div className='text-[11px] text-gray-400 font-medium whitespace-nowrap'>
      {event_at != null && event_at != undefined && event_at != '' && formatDateTime(event_at)}
    </div>
  )
}

export const TitleAndTime = ({
  title,
  event_at,
  userName,
}: {
  title: ReactNode
  event_at: string | null | undefined
  userName?: string
  isUnread?: boolean
}) => {
  return (
    <div className='w-full flex-grow min-w-0'>
      <div className='flex justify-between items-start mb-1'>
        <div className='flex items-center gap-2 flex-wrap'>
          {userName && (
            <span className='text-[11px] font-bold text-[#735bf2] bg-[#f5f4fe] px-2 py-0.5 rounded-full flex items-center gap-1'>
              <User size={10} />
              {userName}
            </span>
          )}
        </div>
        <DateTime event_at={event_at} />
      </div>
      <h3 className='font-bold text-[16px] text-[#0f172a] mb-1'>{title}</h3>
    </div>
  )
}
