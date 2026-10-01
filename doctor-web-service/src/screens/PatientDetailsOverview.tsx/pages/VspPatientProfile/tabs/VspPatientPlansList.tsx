import {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {useParams, useSearchParams} from 'react-router-dom'
import Page from 'components/page/Page'
import {Button, Modal, Radio, RadioChangeEvent} from 'antd'
import {Plus, FileText, Play, Check, CircleX, ArrowLeft, Download} from 'lucide-react'
import useAllUserPlan from '@hooks/useAllUserPlan'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {BASE_APP_PATIENT_URL} from 'redux/Endpoints/apiEndpoints'
import dayjs from 'dayjs'
import {safeParseInt} from 'utils/ConstFunctions'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import vspTreatmentPlanStatusConstants from '@constants/vspTreatmentPlanStatus.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {getVspPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {AuthContext} from 'context/AuthContext'
import cn from '@utils/cn'
import VspProductionOrderFileUploader from './components/VspProductionOrderFileUploader'
import {getIndividualTask} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {getStorageType} from 'utils/storage'

type VspTreatmentPlan = {
  id: number
  order_id: string
  plan_name: string
  plan_type: 'SINGLE_PLAN' | 'MULTIPLE_PLANS'
  plan_index: number
  sub_plans?: Array<{
    id?: number
    sub_plan_id?: number
    sub_plan_name: string
    sub_plan_index: number
    status?: string
  }>
  attachment_files: Array<{
    file_id: number
    name: string
    url: string
    download_url?: string
    thumbnail_url?: string
    is_gdrive_platform?: boolean
  }>
  lab_comments?: string
  doctor_comments?: string
  revision_comments?: string
  customer_comments?: string
  replan_requested_on?: string
  status: keyof typeof vspTreatmentPlanStatusConstants
  created_at?: string
  updated_at?: string
}

const statusLabelMap: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED_TO_DOCTOR: 'Approval Pending',
  DOCTOR_APPROVED: 'Approved',
  DOCTOR_REVISION_REQUESTED: 'In Revision',
}

const subPlanStatusLabelMap: Record<string, string> = {
  PENDING: 'Pending',
  SUBMITTED_TO_DOCTOR: 'Pending',
  PENDING_APPROVAL: 'Pending',
  DOCTOR_APPROVED: 'Approved',
  APPROVED: 'Approved',
  DOCTOR_REVISION_REQUESTED: 'Revision Requested',
  REVISION_REQUESTED: 'Revision Requested',
}

const getReviewStatusBadgeStyle = (status?: string) => {
  switch (status) {
    case 'DOCTOR_APPROVED':
    case 'APPROVED':
      return {
        backgroundColor: '#ECFDF3',
        color: '#047857',
      }
    case 'DOCTOR_REVISION_REQUESTED':
    case 'REVISION_REQUESTED':
      return {
        backgroundColor: '#FFF7ED',
        color: '#C2410C',
      }
    case 'SUBMITTED_TO_DOCTOR':
    case 'PENDING_APPROVAL':
    case 'PENDING':
      return {
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
      }
    default:
      return {
        backgroundColor: '#F3F4F6',
        color: '#4B5563',
      }
  }
}

type ReviewConfirmationAction = {
  plan: VspTreatmentPlan
  status: 'DOCTOR_APPROVED' | 'DOCTOR_REVISION_REQUESTED'
  subPlanArrayIndex?: number
  trigger: string
  title: string
  description: string
  primaryCta: string
}

type PersistedRevisionComment = {
  comment: string
  requestedOn: string
}

const getPersistedRevisionCommentKey = (orderId?: string) =>
  `vsp_revision_comments:${orderId ?? 'unknown'}`

const VspPatientPlansList = () => {
  const {profileId, organizationId, userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id') ?? undefined
  const {isEnterprisePlanUser, isPractice} = useAllUserPlan()
  const [plans, setPlans] = useState<VspTreatmentPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [planType, setPlanType] = useState<'SINGLE_PLAN' | 'MULTIPLE_PLANS'>('SINGLE_PLAN')
  const [subPlanNames, setSubPlanNames] = useState<string[]>([''])
  const [labComments, setLabComments] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeActionPlanId, setActiveActionPlanId] = useState<number | null>(null)
  const [activeSubPlanActionKey, setActiveSubPlanActionKey] = useState<string | null>(null)
  const [reviewConfirmation, setReviewConfirmation] = useState<ReviewConfirmationAction | null>(
    null
  )
  const [confirmingReviewAction, setConfirmingReviewAction] = useState(false)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewCommentError, setReviewCommentError] = useState('')
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerFileType, setViewerFileType] = useState<'pdf' | 'video' | null>(null)
  const [viewerFileName, setViewerFileName] = useState<string>('')
  const [viewerDownloadUrl, setViewerDownloadUrl] = useState<string | null>(null)
  const {dispatchAction} = useDispatchAction()
  const planFolderName = useMemo(() => `/`, [plans.length])
  const [planName, setPlanName] = useState(`Treatment Plan`)

  const getPersistedRevisionComments = useCallback(() => {
    try {
      const rawValue = getStorageType().getItem(getPersistedRevisionCommentKey(orderId))
      return rawValue ? (JSON.parse(rawValue) as Record<string, PersistedRevisionComment>) : {}
    } catch (error) {
      return {}
    }
  }, [orderId])

  const persistRevisionComment = useCallback(
    (planId: number, comment: string, requestedOn: string) => {
      try {
        const nextComments = {
          ...getPersistedRevisionComments(),
          [String(planId)]: {
            comment,
            requestedOn,
          },
        }
        getStorageType().setItem(
          getPersistedRevisionCommentKey(orderId),
          JSON.stringify(nextComments)
        )
      } catch (error) {}
    },
    [getPersistedRevisionComments, orderId]
  )

  const getSubPlanStatus = (status?: string) => {
    if (!status) return 'PENDING'
    return status
  }

  const isPendingSubPlanStatus = (status?: string) => {
    const normalizedStatus = getSubPlanStatus(status)
    return (
      normalizedStatus === 'PENDING' ||
      normalizedStatus === 'SUBMITTED_TO_DOCTOR' ||
      normalizedStatus === 'PENDING_APPROVAL'
    )
  }

  const getPlans = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const url = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/orders/${orderId}/treatment-plans`
      const response = await apiHelper(url, HttpMethod.GET, undefined, false)
      const persistedRevisionComments = getPersistedRevisionComments()
      const normalizedPlans = (Array.isArray(response?.data) ? response.data : []).map(
        (plan: VspTreatmentPlan) => {
          const persistedComment = persistedRevisionComments[String(plan.id)]
          if (!persistedComment) return plan

          return {
            ...plan,
            lab_comments: plan.lab_comments ?? persistedComment.comment,
            customer_comments: plan.customer_comments ?? persistedComment.comment,
            revision_comments: plan.revision_comments ?? persistedComment.comment,
            replan_requested_on: plan.replan_requested_on ?? persistedComment.requestedOn,
          }
        }
      )
      setPlans(normalizedPlans)
    } catch (error) {
      console.error('Failed to fetch VSP treatment plans', error)
    } finally {
      setLoading(false)
    }
  }, [getPersistedRevisionComments, orderId])

  useEffect(() => {
    getPlans()
  }, [getPlans])

  const resetCreateForm = () => {
    setPlanName('')
    setPlanType('SINGLE_PLAN')
    setSubPlanNames([''])
    setLabComments('')
    setUploadedFiles([])
  }

  const updateOrder = async (status: string) => {
    // Strict check (best practice)
    if (!orderId) return

    const updateOrderPayload = {
      status: status,
      order_id: orderId,
      profile_id: safeParseInt(profileId),
      organization_id: safeParseInt(organizationId),
    }

    const urlUpdateOrder = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/orders/${orderId}/status?status=${status}`

    try {
      await apiHelper(urlUpdateOrder, HttpMethod.PATCH, updateOrderPayload)

      dispatchAction(
        getVspPatientPlanningStepper({
          order_id: orderId,
        })
      )
    } catch (e) {
      console.error('Update order failed', e)
    }
  }

  const attachmentFileIds = useMemo(() => {
    return uploadedFiles
      .map((file) => safeParseInt(file.uid))
      .filter((id) => id !== null && id !== undefined)
  }, [uploadedFiles])

  const handleCreatePlan = async () => {
    if (!orderId) return
    if (!planName.trim()) {
      ErrorToast('Plan name is required.')
      return
    }

    if (
      planType === 'MULTIPLE_PLANS' &&
      subPlanNames.map((name) => name.trim()).filter(Boolean).length === 0
    ) {
      ErrorToast('Please add at least one alternative plan name.')
      return
    }
    if (isUploading) {
      ErrorToast('Please wait for the attachment upload to finish.')
      return
    }
    setSaving(true)
    try {
      const mappedPlanType = planType === 'SINGLE_PLAN' ? 'MULTIPLE_PLANS' : 'SINGLE_PLAN'
      const trimmedSubPlanNames = subPlanNames.map((name) => name.trim()).filter(Boolean)
      const subPlans =
        planType === 'MULTIPLE_PLANS'
          ? trimmedSubPlanNames.map((subPlanName, index) => ({
              sub_plan_name: subPlanName,
              sub_plan_index: index,
            }))
          : []

      const payload = {
        order_id: orderId,
        plan_name: planName,
        plan_type: mappedPlanType,
        plan_index: plans.length,
        sub_plans: subPlans,
        attachment_file_ids: attachmentFileIds,
        lab_comments: labComments,
        status: 'SUBMITTED_TO_DOCTOR',
      }
      const url = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/treatment-plans`
      await apiHelper(url, HttpMethod.POST, payload)
      await updateOrder('IN_REVIEW')
      await getPlans()
      dispatchAction(
        getIndividualTask({
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patientId),
        })
      )
      resetCreateForm()
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create plan', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePlanStatus = async (
    plan: VspTreatmentPlan,
    status: keyof typeof vspTreatmentPlanStatusConstants
  ) => {
    if (!orderId) return
    setActiveActionPlanId(plan.id)
    try {
      const payload = {
        plan_id: plan.id,
        order_id: orderId,
        plan_name: plan.plan_name,
        plan_type: plan.plan_type,
        plan_index: plan.plan_index,
        ...(plan.plan_type === 'MULTIPLE_PLANS' ? {sub_plans: plan.sub_plans ?? []} : {}),
        attachment_file_ids: plan.attachment_files?.map((f) => f.file_id) ?? [],
        lab_comments:
          status === vspTreatmentPlanStatusConstants.DOCTOR_REVISION_REQUESTED
            ? reviewComment.trim()
            : (plan.lab_comments ?? ''),
        doctor_comments: plan.doctor_comments ?? '',
        replan_requested_on:
          status === vspTreatmentPlanStatusConstants.DOCTOR_REVISION_REQUESTED
            ? new Date().toISOString()
            : (plan.replan_requested_on ?? null),
        status,
      }
      const url = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/treatment-plans`
      await apiHelper(url, HttpMethod.PUT, payload)
      if (status === vspTreatmentPlanStatusConstants.DOCTOR_APPROVED) {
        await updateOrder('APPROVED')
      } else if (status === vspTreatmentPlanStatusConstants.DOCTOR_REVISION_REQUESTED) {
        persistRevisionComment(plan.id, reviewComment.trim(), payload.replan_requested_on ?? '')
        await updateOrder('REQUEST_REVISION')
      }
      await getPlans()
      return true
    } catch (error) {
      console.error('Failed to update plan status', error)
      return false
    } finally {
      setActiveActionPlanId(null)
    }
  }

  const handleUpdateSubPlanStatus = async (
    plan: VspTreatmentPlan,
    subPlanArrayIndex: number,
    status: 'DOCTOR_APPROVED' | 'DOCTOR_REVISION_REQUESTED'
  ) => {
    if (!orderId || !Array.isArray(plan.sub_plans)) return
    const actionKey = `${plan.id}-${subPlanArrayIndex}-${status}`
    setActiveSubPlanActionKey(actionKey)
    try {
      const targetSubPlan = plan.sub_plans[subPlanArrayIndex]
      const targetSubPlanId = targetSubPlan?.sub_plan_id ?? targetSubPlan?.id
      if (!targetSubPlanId) return

      const normalizeSubPlanStatus = (value?: string) => {
        if (!value) return 'SUBMITTED_TO_DOCTOR'
        if (value === 'APPROVED') return 'DOCTOR_APPROVED'
        if (value === 'REVISION_REQUESTED') return 'DOCTOR_REVISION_REQUESTED'
        if (value === 'PENDING' || value === 'PENDING_APPROVAL') return 'SUBMITTED_TO_DOCTOR'
        return value
      }

      const subPlanStatusUpdates = plan.sub_plans
        .map((subPlan, index) => {
          const subPlanId = subPlan.sub_plan_id ?? subPlan.id
          if (!subPlanId) return null

          if (index === subPlanArrayIndex) {
            return {
              sub_plan_id: subPlanId,
              status,
            }
          }

          const existingStatus = normalizeSubPlanStatus(subPlan.status)

          // If another sub-plan already has the same terminal status, move it back to submitted.
          if (existingStatus === status) {
            return {
              sub_plan_id: subPlanId,
              status: 'SUBMITTED_TO_DOCTOR',
            }
          }

          return {
            sub_plan_id: subPlanId,
            status: existingStatus,
          }
        })
        .filter(Boolean)

      const payload = {
        plan_id: plan.id,
        plan_name: plan.plan_name,
        lab_comments:
          status === vspTreatmentPlanStatusConstants.DOCTOR_REVISION_REQUESTED
            ? reviewComment.trim()
            : (plan.lab_comments ?? ''),
        doctor_comments: plan.doctor_comments ?? '',
        replan_requested_on:
          status === vspTreatmentPlanStatusConstants.DOCTOR_REVISION_REQUESTED
            ? new Date().toISOString()
            : (plan.replan_requested_on ?? null),
        status: status,
        attachment_file_ids: plan.attachment_files?.map((f) => f.file_id) ?? [],
        remove_attachment_file_ids: [],
        sub_plan_status_updates: subPlanStatusUpdates,
      }

      const url = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/treatment-plans`
      await apiHelper(url, HttpMethod.PUT, payload)
      if (status === vspTreatmentPlanStatusConstants.DOCTOR_APPROVED) {
        await updateOrder('APPROVED')
      } else if (status === vspTreatmentPlanStatusConstants.DOCTOR_REVISION_REQUESTED) {
        persistRevisionComment(plan.id, reviewComment.trim(), payload.replan_requested_on ?? '')
        await updateOrder('REQUEST_REVISION')
      }
      await getPlans()
      return true
    } catch (error) {
      console.error('Failed to update sub plan status', error)
      return false
    } finally {
      setActiveSubPlanActionKey(null)
    }
  }

  const openReviewConfirmation = (
    plan: VspTreatmentPlan,
    status: 'DOCTOR_APPROVED' | 'DOCTOR_REVISION_REQUESTED',
    subPlanArrayIndex?: number
  ) => {
    const isApproveAction = status === 'DOCTOR_APPROVED'
    const subPlanName =
      subPlanArrayIndex !== undefined
        ? plan.sub_plans?.[subPlanArrayIndex]?.sub_plan_name ||
          `Alternative Plan ${subPlanArrayIndex + 1}`
        : null
    const planLabel = subPlanName || plan.plan_name || 'Treatment Plan'

    setReviewConfirmation({
      plan,
      status,
      subPlanArrayIndex,
      trigger: isApproveAction
        ? 'Customer clicks Approve Plan'
        : 'Customer clicks Request Revision',
      title: isApproveAction ? `Approve ${planLabel}?` : `Request Revision for ${planLabel}?`,
      description: isApproveAction
        ? 'This will move the case to Approved and notify the lab. This action cannot be undone.'
        : 'This will move the case to In Revision. The lab will provide an updated plan, and the current version will be archived.',
      primaryCta: isApproveAction ? 'Approve & Move Case' : 'Request Revision & Move Case',
    })
    setReviewComment('')
    setReviewCommentError('')
  }

  const closeReviewConfirmation = () => {
    if (confirmingReviewAction) return
    setReviewConfirmation(null)
    setReviewComment('')
    setReviewCommentError('')
  }

  const handleConfirmReviewAction = async () => {
    if (!reviewConfirmation) return
    if (reviewConfirmation.status === 'DOCTOR_REVISION_REQUESTED' && !reviewComment.trim()) {
      setReviewCommentError('Comment is required')
      return
    }

    setConfirmingReviewAction(true)
    try {
      const wasSuccessful =
        reviewConfirmation.subPlanArrayIndex !== undefined
          ? await handleUpdateSubPlanStatus(
              reviewConfirmation.plan,
              reviewConfirmation.subPlanArrayIndex,
              reviewConfirmation.status
            )
          : await handleUpdatePlanStatus(reviewConfirmation.plan, reviewConfirmation.status)

      if (wasSuccessful) {
        setReviewConfirmation(null)
        setReviewComment('')
        setReviewCommentError('')
      }
    } finally {
      setConfirmingReviewAction(false)
    }
  }
  const blobUrlRef = useRef<string>('')

  const getGoogleDriveFileId = (url: string) => {
    const patterns = [/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/, /id=([a-zA-Z0-9-_]+)/]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const isGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com') || url.includes('docs.google.com')
  }

  const getGoogleDrivePreviewUrl = (url: string) => {
    const fileId = getGoogleDriveFileId(url)
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url
  }

  const getGoogleDriveDownloadUrl = (url: string) => {
    const fileId = getGoogleDriveFileId(url)
    return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url
  }

  const viewVideoOrPdf = (
    fileUrl: string,
    fileTypeHint?: 'pdf' | 'video',
    fileName?: string,
    downloadUrl?: string
  ) => {
    try {
      let fileType: 'pdf' | 'video' = 'pdf'
      let urlToDisplay = fileUrl

      // Detect file type
      if (fileTypeHint === 'video' || fileUrl.endsWith('.mp4') || fileUrl.includes('video')) {
        fileType = 'video'
      }

      // Handle Google Drive URLs
      if (isGoogleDriveUrl(fileUrl)) {
        const fileId = getGoogleDriveFileId(fileUrl)
        if (fileId) {
          if (fileType === 'pdf') {
            urlToDisplay = getGoogleDrivePreviewUrl(fileUrl)
          } else {
            // For videos, use export download
            urlToDisplay = `https://drive.google.com/uc?export=download&id=${fileId}`
          }
        }
      }

      setViewerUrl(urlToDisplay)
      setViewerFileType(fileType)
      setViewerFileName(fileName ?? '')
      setViewerDownloadUrl(downloadUrl ?? fileUrl)
    } catch (err) {
      console.error('Error opening file:', err)
      // Fallback: try to open directly
      setViewerUrl(fileUrl)
      setViewerFileType(fileTypeHint ?? (fileUrl.endsWith('.mp4') ? 'video' : 'pdf'))
      setViewerFileName(fileName ?? '')
      setViewerDownloadUrl(downloadUrl ?? fileUrl)
    }
  }

  const closeViewer = () => {
    setViewerUrl(null)
    setViewerFileType(null)
    setViewerFileName('')
    setViewerDownloadUrl(null)
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = ''
    }
  }

  const renderPdfOverlay = () => {
    if (!viewerUrl || viewerFileType !== 'pdf') return null

    const portalRoot = document.getElementById('root') || document.body
    const downloadTarget = viewerDownloadUrl
      ? isGoogleDriveUrl(viewerDownloadUrl)
        ? getGoogleDriveDownloadUrl(viewerDownloadUrl)
        : viewerDownloadUrl
      : viewerUrl

    return createPortal(
      <div className='fixed inset-0 z-[9999] flex flex-col bg-white'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 md:px-6'>
          <div className='flex min-w-0 items-center gap-3'>
            <button
              type='button'
              onClick={closeViewer}
              className='inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50'
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div className='min-w-0'>
              <div className='truncate text-sm font-semibold text-gray-900 md:text-base'>
                {viewerFileName || 'Treatment Plan PDF'}
              </div>
              <div className='text-xs text-gray-500'>Previewing treatment plan in the same tab</div>
            </div>
          </div>

          <button
            type='button'
            onClick={() => window.open(downloadTarget, '_blank', 'noopener,noreferrer')}
            className='inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50'
          >
            <Download size={16} />
            Download
          </button>
        </div>

        <div className='min-h-0 flex-1 bg-[#111827]'>
          <iframe
            src={viewerUrl}
            title={viewerFileName || 'Treatment Plan PDF Viewer'}
            className='block h-full w-full border-0'
            allow='fullscreen'
          />
        </div>
      </div>,
      portalRoot
    )
  }
  const getDoctorRevisionComment = (plan: VspTreatmentPlan) =>
    String(
      plan.doctor_comments ??
        plan.lab_comments ??
        plan.revision_comments ??
        plan.customer_comments ??
        ''
    ).trim()

  const renderPlanCard = (plan: VspTreatmentPlan) => {
    const statusLabel = statusLabelMap[plan.status] ?? plan.status
    const isActionable = plan.status === 'SUBMITTED_TO_DOCTOR'
    const isInRevision = plan.status === 'DOCTOR_REVISION_REQUESTED'
    const isApproved = plan.status === 'DOCTOR_APPROVED'
    const planStatusBadgeStyle = getReviewStatusBadgeStyle(plan.status)
    const hasSubPlans = Array.isArray(plan.sub_plans) && plan.sub_plans.length > 0
    const hasAnyApprovedSubPlan =
      hasSubPlans &&
      plan.sub_plans!.some((subPlan) => {
        const normalizedStatus = getSubPlanStatus(subPlan.status)
        return normalizedStatus === 'DOCTOR_APPROVED' || normalizedStatus === 'APPROVED'
      })
    const hideSubPlanCtaForPractice = isPractice && hasAnyApprovedSubPlan
    const reviewActionBtnClass =
      '!h-9 !min-w-[164px] !rounded-lg !border !border-gray-300 !bg-white !text-gray-700 !font-semibold !text-[14px] hover:!text-gray-800 hover:!border-gray-400 !shadow-none !transition-all'
    const approveBtnClass = `${reviewActionBtnClass} hover:!bg-emerald-50 hover:!border-emerald-300 hover:!text-emerald-700`
    const revisionBtnClass = `${reviewActionBtnClass} hover:!bg-amber-50 hover:!border-amber-300 hover:!text-amber-700`
    const revisionComment = getDoctorRevisionComment(plan)
    const revisionRequestedOn = plan.replan_requested_on ?? plan.updated_at
    const isRevisionCommentLong = revisionComment.split(/\s+/).filter(Boolean).length > 8
    const truncatedRevisionComment = isRevisionCommentLong
      ? `${revisionComment.split(/\s+/).filter(Boolean).slice(0, 8).join(' ')}...`
      : revisionComment

    return (
      <div key={plan.id} className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
          <div className='min-w-0'>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primarySupport text-primaryColor'>
                <FileText size={20} />
              </div>
              <div className='min-w-0'>
                <h3 className='text-lg font-semibold truncate'>
                  {plan.plan_name || 'Treatment Plan'}
                </h3>
                <div className='text-sm text-gray-500'>
                  {plan.created_at ? dayjs(plan.created_at).format('MMM D, YYYY • h:mm A') : ''}
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <span
              className='inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold'
              style={planStatusBadgeStyle}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-3'>
          {plan.attachment_files?.map((file) => (
            <button
              key={file.file_id}
              type='button'
              className='inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition cursor-pointer'
              onClick={(e) => {
                e.preventDefault()
                viewVideoOrPdf(
                  file.url,
                  file.url?.endsWith('.mp4') ? 'video' : 'pdf',
                  file.name,
                  file.download_url
                )
              }}
            >
              {file.url?.endsWith('.mp4') ? <Play size={16} /> : <FileText size={16} />}
              <span className='truncate'>{file.name}</span>
            </button>
          ))}
        </div>

        {isInRevision && (
          <div className='mt-5 overflow-hidden rounded-xl border border-[#F45045]'>
            <div className='bg-[#FEF4F4] px-4 py-3 text-sm font-semibold text-black'>
              Revision requested on{' '}
              {revisionRequestedOn ? dayjs(revisionRequestedOn).format('DD-MMM-YYYY') : '-'}.
            </div>
            {revisionComment && (
              <div className='px-4 py-3 text-sm text-[#475467]'>
                <div className='mb-1 text-sm font-medium text-[#475467]'>Comment</div>
                <div className='break-words text-base leading-6 text-black'>
                  {truncatedRevisionComment}
                </div>
              </div>
            )}
          </div>
        )}

        {(isActionable || isInRevision || isApproved) && (
          <div className='mt-6 rounded-2xl border border-gray-200 bg-white p-5'>
            <div>
              <div className='text-sm font-semibold uppercase tracking-[0.08em] text-gray-900'>
                Plans for review
              </div>
              <div className='text-xs text-gray-500'>Primary Treatment Plan</div>
            </div>

            {hasSubPlans ? (
              <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
                {plan.sub_plans?.map((subPlan, index) => {
                  const subPlanStatus = getSubPlanStatus(subPlan.status)
                  const isPendingSubPlan = isPendingSubPlanStatus(subPlanStatus)
                  const subPlanStatusLabel = subPlanStatusLabelMap[subPlanStatus] ?? subPlanStatus
                  const subPlanStatusBadgeStyle = getReviewStatusBadgeStyle(subPlanStatus)

                  return (
                    <div
                      key={`sub-plan-${plan.id}-${index}`}
                      className='rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_0_rgba(17,24,39,0.02)]'
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div className='text-sm font-semibold text-gray-800'>
                          {subPlan.sub_plan_name || `Alternative Plan ${index + 1}`}
                        </div>
                        <span
                          className='inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold'
                          style={subPlanStatusBadgeStyle}
                        >
                          {subPlanStatusLabel}
                        </span>
                      </div>

                      <div className='mt-3 flex flex-wrap gap-2'>
                        {isPendingSubPlan && !hideSubPlanCtaForPractice ? (
                          <>
                            <Button
                              type='default'
                              icon={<Check size={14} />}
                              className={approveBtnClass}
                              onClick={() => openReviewConfirmation(plan, 'DOCTOR_APPROVED', index)}
                              loading={
                                activeSubPlanActionKey === `${plan.id}-${index}-DOCTOR_APPROVED`
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              type='default'
                              icon={<CircleX size={14} />}
                              className={revisionBtnClass}
                              onClick={() =>
                                openReviewConfirmation(plan, 'DOCTOR_REVISION_REQUESTED', index)
                              }
                              loading={
                                activeSubPlanActionKey ===
                                `${plan.id}-${index}-DOCTOR_REVISION_REQUESTED`
                              }
                            >
                              Request Revision
                            </Button>
                          </>
                        ) : (
                          <span className='text-xs font-semibold text-gray-500'>
                            {hideSubPlanCtaForPractice && isPendingSubPlan
                              ? 'Action completed for this plan'
                              : subPlanStatusLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='mt-3 flex flex-wrap gap-2'>
                {isActionable && (
                  <>
                    <Button
                      type='default'
                      icon={<Check size={14} />}
                      className={approveBtnClass}
                      onClick={() => openReviewConfirmation(plan, 'DOCTOR_APPROVED')}
                      loading={activeActionPlanId === plan.id}
                    >
                      Approve
                    </Button>
                    <Button
                      type='default'
                      icon={<CircleX size={14} />}
                      className={revisionBtnClass}
                      onClick={() => openReviewConfirmation(plan, 'DOCTOR_REVISION_REQUESTED')}
                      loading={activeActionPlanId === plan.id}
                    >
                      Request Revision
                    </Button>
                  </>
                )}
                {(isInRevision || isApproved) && (
                  <span className='text-sm font-semibold text-gray-500'>
                    {isInRevision ? 'In revision' : 'Approved'}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderEmptyState = () => (
    <div className='rounded-3xl flex flex-col items-center justify-center border border-dashed bg-primarySupport p-10 text-center'>
      <div className='mb-4 w-fit flex items-center justify-center rounded-full bg-white/70 p-5'>
        <FileText size={32} className='text-gray-500' />
      </div>
      <h2 className='text-lg font-semibold text-gray-900 mb-2'>No Plans Available</h2>
      <p className='text-sm text-gray-500 mb-6'>
        You have not shared a treatment plan yet. Upload a presentation to start the review process.
      </p>
      {isEnterprisePlanUser && orderId && (
        <Button
          type='primary'
          size='middle'
          onClick={() => setShowCreateForm(true)}
          className='!bg-primaryColor !text-white !border-primaryColor !hover:bg-primaryColor-dark !font-medium'
          style={{
            backgroundColor: '#1677ff',
            borderColor: '#1677ff',
            color: 'white',
          }}
        >
          Create Plan Presentation
        </Button>
      )}
    </div>
  )

  if (showCreateForm) {
    return (
      <Page loading={false}>
        <div className='w-full flex flex-col md:flex-row gap-4 h-full min-h-0'>
          <div className='w-full flex flex-col gap-6 min-w-0'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div>
                <h1 className='text-2xl font-bold uppercase tracking-wide'>Treatment Plans</h1>
                <p className='text-sm text-gray-500'>
                  View, manage, and collaborate on 3D surgical treatment plans.
                </p>
              </div>
            </div>

            <div className='rounded-2xl border border-gray-200 bg-white p-6 md:p-8'>
              <h2 className='text-lg font-semibold mb-6'>Upload Plan Details</h2>

              <div className='space-y-6'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>Plan Name</label>
                  <input
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor'
                    placeholder='Treatment Plan'
                  />
                </div>

                <div>
                  <div className='mb-2 text-sm font-medium text-gray-700'>
                    Does this presentation contain multiple alternative plans?
                  </div>
                  <Radio.Group
                    value={planType}
                    onChange={(e: RadioChangeEvent) => {
                      const selectedPlanType = e.target.value as 'SINGLE_PLAN' | 'MULTIPLE_PLANS'
                      setPlanType(selectedPlanType)
                      if (selectedPlanType === 'MULTIPLE_PLANS') {
                        setSubPlanNames([''])
                      }
                    }}
                    className='flex gap-4'
                  >
                    <Radio.Button
                      value='SINGLE_PLAN'
                      className={`!rounded-lg !h-10 !px-6 !flex !items-center ${
                        planType === 'SINGLE_PLAN'
                          ? '!bg-primarySupport !border-primaryColor !text-primaryColor'
                          : ''
                      }`}
                    >
                      Single Plan
                    </Radio.Button>
                    <Radio.Button
                      value='MULTIPLE_PLANS'
                      className={`!rounded-lg !h-10 !px-6 !flex !items-center ${
                        planType === 'MULTIPLE_PLANS'
                          ? '!bg-primarySupport !border-primaryColor !text-primaryColor'
                          : ''
                      }`}
                    >
                      Multiple Plans (Alternatives)
                    </Radio.Button>
                  </Radio.Group>
                </div>

                {planType === 'MULTIPLE_PLANS' && (
                  <div>
                    <div className='mb-2 text-sm font-medium text-gray-700'>
                      Define Alternative Plans
                    </div>
                    <div className='space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4'>
                      {subPlanNames.map((subPlanName, index) => (
                        <div key={`sub-plan-${index}`} className='flex items-center gap-2'>
                          <input
                            value={subPlanName}
                            onChange={(e) => {
                              const nextSubPlanNames = [...subPlanNames]
                              nextSubPlanNames[index] = e.target.value
                              setSubPlanNames(nextSubPlanNames)
                            }}
                            className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor'
                            placeholder={`Alternative Plan ${index + 1}`}
                          />
                          {subPlanNames.length > 1 && (
                            <Button
                              type='text'
                              danger
                              onClick={() => {
                                setSubPlanNames(subPlanNames.filter((_, i) => i !== index))
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        type='link'
                        className='!px-0'
                        onClick={() => setSubPlanNames([...subPlanNames, ''])}
                      >
                        + Add another alternative
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <div className='mb-2 text-sm font-medium text-gray-700'>
                    Attachments (PDF / MP4)
                  </div>
                  <VspProductionOrderFileUploader
                    patientId={safeParseInt(patientId)}
                    parentPath={planFolderName}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    onUploadingChange={setIsUploading}
                    accept='.pdf,.mp4'
                    maxFileSize={100}
                    maxFileCount={10}
                    title='Click to upload files'
                    subTitle='Supported formats: .pdf, .mp4'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Lab Comments
                  </label>
                  <textarea
                    value={labComments}
                    onChange={(e) => setLabComments(e.target.value)}
                    rows={4}
                    className='w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor'
                    placeholder='Add any notes about these plans to help the doctor decide...'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200'>
                <Button
                  size='large'
                  onClick={() => {
                    resetCreateForm()
                    setShowCreateForm(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='primary'
                  size='large'
                  onClick={handleCreatePlan}
                  loading={saving}
                  disabled={
                    !planName.trim() ||
                    isUploading ||
                    saving ||
                    (planType === 'MULTIPLE_PLANS' &&
                      subPlanNames.map((name) => name.trim()).filter(Boolean).length === 0)
                  }
                  className='!bg-primaryColor !text-white !border-primaryColor hover:!bg-primaryColor'
                  style={{
                    backgroundColor: '#1677ff',
                    borderColor: '#1677ff',
                    color: '#ffffff',
                  }}
                >
                  Submit to Doctor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Page>
    )
  }

  if (viewerUrl && viewerFileType) {
    return (
      <>
        {renderPdfOverlay()}
        <Page loading={false}>
          <div className='flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 md:px-6'>
              <div className='flex min-w-0 items-center gap-3'>
                <Button
                  type='text'
                  icon={<ArrowLeft size={18} />}
                  onClick={closeViewer}
                  className='!flex !items-center !font-semibold !text-gray-700'
                >
                  Back
                </Button>
                <div className='min-w-0'>
                  <div className='truncate text-sm font-semibold text-gray-900 md:text-base'>
                    {viewerFileName || (viewerFileType === 'pdf' ? 'Treatment Plan PDF' : 'Video')}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {viewerFileType === 'pdf'
                      ? 'Previewing treatment plan in the same tab'
                      : 'Previewing treatment plan video in the same tab'}
                  </div>
                </div>
              </div>

              <Button
                type='default'
                icon={<Download size={16} />}
                onClick={() => {
                  const downloadTarget = viewerDownloadUrl || viewerUrl
                  if (!downloadTarget) return
                  window.open(downloadTarget, '_blank', 'noopener,noreferrer')
                }}
              >
                Download
              </Button>
            </div>

            <div className='min-h-0 flex-1 bg-[#111827]'>
              {viewerFileType === 'video' && (
                <div className='flex h-full items-center justify-center p-4'>
                  <video
                    src={viewerUrl}
                    controls
                    autoPlay
                    className='max-h-full max-w-full'
                    style={{objectFit: 'contain'}}
                  />
                </div>
              )}
            </div>
          </div>
        </Page>
      </>
    )
  }

  return (
    <Page loading={loading}>
      <div className='w-full flex flex-col md:flex-row gap-4 h-full min-h-0'>
        <div className='w-full flex flex-col gap-6 min-w-0'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-bold uppercase tracking-wide'>Treatment Plans</h1>
              <p className='text-sm text-gray-500'>
                View, manage, and collaborate on 3D surgical treatment plans.
              </p>
            </div>
            {plans.length > 0 && isEnterprisePlanUser && (
              <Button
                type='primary'
                icon={<Plus size={16} />}
                onClick={() => setShowCreateForm(true)}
                className='!bg-primaryColor !text-white !border-primaryColor'
                style={{
                  backgroundColor: '#1677ff',
                  borderColor: '#1677ff',
                  color: 'white',
                }}
              >
                Upload New Version
              </Button>
            )}
          </div>

          {plans.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className='grid gap-4'>{plans.map((plan) => renderPlanCard(plan))}</div>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(reviewConfirmation)}
        onCancel={closeReviewConfirmation}
        footer={null}
        width={450}
        centered
        destroyOnClose
        maskClosable={!confirmingReviewAction}
      >
        {reviewConfirmation && (
          <div className='pt-2'>
            <div className='text-center mb-6'>
              <h2 className='text-xl font-bold text-gray-900'>{reviewConfirmation.title}</h2>
              <p className='mt-4 text-base leading-7 text-textColor '>
                {reviewConfirmation.description}
              </p>
            </div>

            {reviewConfirmation.status === 'DOCTOR_REVISION_REQUESTED' && (
              <div className='mb-5'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>Comments</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => {
                    setReviewComment(e.target.value)
                    if (reviewCommentError) setReviewCommentError('')
                  }}
                  rows={4}
                  maxLength={1000}
                  className='w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor'
                  placeholder='Add instructions for changes. A new treatment plan will be created and shared with updates as suggested.'
                />
                {reviewCommentError && (
                  <div className='mt-1 text-xs text-red'>{reviewCommentError}</div>
                )}
              </div>
            )}

            <div className='w-full flex justify-center gap-3'>
              <Button
                className='w-full hover:!bg-transparent h-10 hover:shadow-lg'
                onClick={closeReviewConfirmation}
                disabled={confirmingReviewAction}
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  'w-full h-10 hover:shadow-lg',
                  reviewConfirmation.status === 'DOCTOR_REVISION_REQUESTED'
                    ? '!bg-red hover:!bg-red'
                    : '!bg-primaryColor hover:!bg-primaryColor'
                )}
                type='primary'
                onClick={handleConfirmReviewAction}
                loading={confirmingReviewAction}
              >
                {reviewConfirmation.primaryCta}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  )
}

export default VspPatientPlansList
