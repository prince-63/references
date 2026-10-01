import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Avatar, Modal, Select} from 'antd'
import {Phone, Mail, Building2, Calendar, ChevronDown} from 'lucide-react'
import When from 'components/when/When'
import {
  getFirstLetterCapitalOfWord,
  getSalutations,
  safeParseInt,
  getImageUrl,
  getImageUrlById,
} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {useNavigate} from 'react-router-dom'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {
  getIndividualTask,
  PatientTaskDetails,
} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import dayjs from 'dayjs'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useFilter from '@hooks/useFilter'
import actionList from '@staticData/actionList'
import {postApiDataListActivePracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {MdOutlineArrowDropDown, MdOutlineArrowDropUp} from 'react-icons/md'
import {RowDataUserList} from 'screens/AccessControl/AccessControlList/types/accessControlList.types'
import hasValue from 'utils/hasValue'
import WorkflowStatusSelector from 'screens/Kanban/components/WorkflowStatusSelector'
import MoveToNeedMoreInfoModal, {
  NeedMoreInfoModalContext,
} from 'screens/Kanban/components/MoveToNeedMoreInfoModal'
import MoveToRevisionModal from 'screens/Kanban/components/MoveToRevisionModal'
import MoveToApproveModal from 'screens/Kanban/components/MoveToApproveModal'
import MoveToTreatmentReviewModal from 'screens/Kanban/components/MoveToTreatmentReviewModal'
import MoveToCompleteManufacturingState from 'screens/Kanban/actionModals/MoveToCompleteManufacturingState'
import MoveToShippingState from 'screens/Kanban/actionModals/MoveToShippingState'
import {
  moveTaskCard,
  setCardDetails,
  setDynamicLabel,
  setDynamicStatus,
  setDynamicWorkflowStatusId,
  setIsOpenDeliverFromPackageModal,
  setIsOpenManufacturingCompleteModal,
  setIsOpenShippingOrderModal,
  setIsOpenErrorModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorState from 'screens/Kanban/actionModals/ErrorState'
import manufacturingConstants from '@constants/manufacturing.constants'
import {AssigneeUserSelector} from 'screens/Kanban/components/AssigneeUserSelector'
import {getActiveUsers} from 'redux/Slices/AppSlice/orders/orders.slice'

type PatientDetails = RootState['apiGetLeadsProfileDetails']['data']['patient_details']
type UserListItem = {
  profile_id: number
  display_name: string
  full_name?: string
  first_name?: string
  last_name?: string
}
type ClinicOption = {
  label: string
  value: string
  locationDetails?: any
}

interface ContactDetailsRowProps {
  patient?: PatientDetails | null
  clinicOptions: ClinicOption[]
  clinicSelection?: string
  clinicsLoading: boolean
  disableClinicSelect: boolean
  onClinicChange: (value: string) => void
}

/**
 * CONTACT DETAILS ROW
 * Hooks must always be called, even when patient is null.
 */
const ContactDetailsRow: React.FC<ContactDetailsRowProps> = ({
  patient,
  clinicOptions,
  clinicSelection,
  clinicsLoading,
  disableClinicSelect,
  onClinicChange,
}) => {
  // ✅ hooks first & unconditional
  const [open, setOpen] = useState(false)
  const {permissionChecks} = useFeatureAccess()

  const hasEmail = Boolean(patient?.email)
  const hasMobile = Boolean(patient?.mobile)
  const hasLocation = Boolean(patient?.practice_location)

  const practiceLocationPermissions =
    permissionChecks?.practiceLocation?.managePracticeLocations?.isViewable
  const contactPermissions = permissionChecks?.patientDetails?.patientContactDetails?.isViewable

  const canShowClinicDropdown =
    practiceLocationPermissions &&
    (clinicsLoading ||
      clinicOptions.length > 0 ||
      !!clinicSelection ||
      !!patient?.practice_location)

  const nothingToShow =
    !patient && !hasEmail && !hasMobile && !hasLocation && !canShowClinicDropdown

  if (!patient || nothingToShow) return null

  return (
    <div className='flex flex-col gap-4'>
      {hasEmail && contactPermissions && (
        <div className='flex items-center gap-2'>
          <Mail className='w-4 h-4' />
          <span
            style={{
              fontFamily: 'Figtree',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '0.01em',
              color: '#000000',
            }}
          >
            {patient.email}
          </span>
        </div>
      )}

      {hasMobile && contactPermissions && (
        <div className='flex items-center gap-2'>
          <Phone className='w-4 h-4' />
          <span className='font-figtree font-medium text-[14px] leading-[20px] tracking-[0.01em]'>
            {patient.country_code}
          </span>
          <span className='font-figtree font-medium text-[14px] leading-[20px] tracking-[0.01em]'>
            {patient.mobile}
          </span>
        </div>
      )}

      {canShowClinicDropdown && (
        <div className='flex items-center gap-2'>
          <Building2 className='w-4 h-4' />
          <Select
            value={clinicSelection ?? undefined}
            onChange={(newValue) => onClinicChange(String(newValue))}
            options={clinicOptions}
            placeholder={
              clinicsLoading
                ? 'Loading clinics...'
                : clinicOptions.length
                  ? 'Select clinic'
                  : 'No clinics available'
            }
            loading={clinicsLoading}
            disabled={disableClinicSelect}
            optionFilterProp='label'
            variant='borderless'
            popupMatchSelectWidth={false}
            notFoundContent={clinicsLoading ? 'Loading clinics...' : 'No clinics found'}
            style={{
              backgroundColor: 'transparent',
              width: '100%',
              padding: 0,
            }}
            className='
              !font-figtree
              !text-[14px]
              !leading-[20px]
              !tracking-[0.01em]
              !text-black
              !p-0
              !m-0
              [&_.ant-select-selector]:!p-0
              [&_.ant-select-selection-item]:!font-medium
              [&_.ant-select-selection-placeholder]:!font-medium
              [&_.ant-select-selection-item]:!font-figtree
              [&_.ant-select-selection-placeholder]:!font-figtree
              [&_.ant-select-selection-item]:!text-[14px]
              [&_.ant-select-selection-placeholder]:!text-[14px]
            '
            styles={{
              popup: {
                root: {padding: 0},
              },
            }}
            onOpenChange={setOpen}
            suffixIcon={
              open ? (
                <MdOutlineArrowDropUp className='w-5 h-5 text-black' />
              ) : (
                <MdOutlineArrowDropDown className='w-5 h-5 text-black' />
              )
            }
          />
        </div>
      )}
    </div>
  )
}

const NextFollowUpCard: React.FC<{date?: string | null}> = ({date}) => {
  if (!date) return null
  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-base font-medium text-gray-500'>Next Follow-up</h3>
      <div className='flex items-center gap-2 text-gray-800'>
        <Calendar className='w-4 h-4 text-gray-400' />
        <span className='font-medium'>{date}</span>
      </div>
    </div>
  )
}

interface PatientInfoCardProps {
  onOpenActivity?: () => void
}

const PatientInfoCardMobileView: React.FC<PatientInfoCardProps> = ({onOpenActivity}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {userId, organizationId, profileId, userDetail} = useContext(AuthContext)
  const {permissionChecks} = useFeatureAccess()
  const assigneePermissions = permissionChecks?.patientManagement?.patientManagement
  const taskMovementPermissions = permissionChecks?.workflowActions
  const canViewAssignee = assigneePermissions?.isViewable ?? false
  const canEditAssignee = assigneePermissions?.isEditable ?? false
  const [productionAssignModalOpen, setProductionAssignModalOpen] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const kanbanName = params.get('kanban_name')
  // data sources
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const rawTask = useSelector((state: RootState) => state.workFlow.getIndividualTaskList)
  const {userList: accessControlUserList} = useSelector((state: RootState) => state.accessControl)

  const {data: clinicsData, loading: clinicsLoading} = useSelector(
    (state: RootState) => state.apiListActivePracticeLocation
  )
  const {resetFilter} = useFilter(actionList, false)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const {isEnterprisePlanUser, isStarterPlanUser} = useAllUserPlan()
  const patientId = data?.patient_details?.id

  const [clinicSelection, setClinicSelection] = useState<string | undefined>(undefined)
  const [isUpdatingClinic, setIsUpdatingClinic] = useState(false)
  const [isMobileMetaOpen, setIsMobileMetaOpen] = useState(false)
  const [isRecentActivityButtonActive, setIsRecentActivityButtonActive] = useState(false)

  const allWorkflowTasks = useSelector((state: RootState) => state.workFlow.getAllTask)
  const latestTaskData: PatientTaskDetails | null = useMemo(() => {
    if (!Array.isArray(allWorkflowTasks)) return null

    const filtered = allWorkflowTasks.filter((t) => t?.workflow_name !== 'ONGOING PRODUCT LIST')

    if (filtered.length === 0) return null

    if (filtered.length === 1) return filtered[0]

    const notDelivered = filtered.find((t) => t?.current_status_name !== 'Delivered')
    if (notDelivered) return notDelivered

    return filtered[0]
  }, [allWorkflowTasks])
  const getIndividualTaskList: any =
    latestTaskData ?? (Array.isArray(rawTask) ? rawTask[0] : rawTask)
  const [needInfoContext, setNeedInfoContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [needInfoModalOpen, setNeedInfoModalOpen] = useState(false)
  const [revisionContext, setRevisionContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [approveContext, setApproveContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [approveModalOpen, setApproveModalOpen] = useState(false)

  useEffect(() => {
    if (isUpdatingClinic) return
    const currentLocationId = data?.patient_details?.practice_location_id
    const parsedLocationId = safeParseInt(currentLocationId)

    if (!parsedLocationId) {
      setClinicSelection(undefined)
      return
    }

    setClinicSelection(String(parsedLocationId))
  }, [data?.patient_details?.practice_location_id, isUpdatingClinic])

  useEffect(() => {
    const parsedDoctorId = safeParseInt(userId)
    if (!parsedDoctorId) return

    dispatchAction(
      postApiDataListActivePracticeLocation({
        data: {
          doctor_id: parsedDoctorId,
        },
      }) as any
    )
  }, [dispatchAction, userId])

  const clinicOptions = useMemo<ClinicOption[]>(() => {
    const locations = Array.isArray(clinicsData?.practice_location_list)
      ? clinicsData.practice_location_list
      : []
    const options = locations.map((clinic: any) => ({
      label: clinic.practice_location_name,
      value: String(clinic.practice_location_id),
      locationDetails: clinic,
    }))

    const assignedLocationId = data?.patient_details?.practice_location_id
    const assignedLocationName = data?.patient_details?.assigned_practice?.name

    if (
      assignedLocationId != null &&
      assignedLocationName &&
      !options.some((option) => option.value === String(assignedLocationId))
    ) {
      options.push({
        label: assignedLocationName,
        value: String(assignedLocationId),
        locationDetails: {
          city: (data?.patient_details as any)?.practice_location_city ?? null,
          state: (data?.patient_details as any)?.practice_location_state ?? null,
          country: (data?.patient_details as any)?.practice_location_country ?? null,
        },
      })
    }

    return options
  }, [
    clinicsData,
    data?.patient_details?.assigned_practice?.name,
    data?.patient_details?.practice_location_id,
  ])

  // users for assignee dropdown
  const queryAccessControlUsers = async () => {
    const parsedDoctorId = safeParseInt(userId)
    if (!parsedDoctorId) return

    dispatchAction(
      getActiveUsers({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: '',
          doctor_id: safeParseInt(userId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['LAB_STAFF', 'INTERNAL_USER'],
        },
      })
    )
  }

  useEffect(() => {
    if (!canEditAssignee) return
    queryAccessControlUsers()
  }, [canEditAssignee])

  const parsedProfileId = safeParseInt(profileId)
  const assignedUserName = useMemo(() => {
    const raw = (latestTaskData as any)?.assignee
    if (typeof raw !== 'string') return undefined
    const trimmed = raw.trim()
    return trimmed.length ? trimmed : undefined
  }, [latestTaskData])

  const assigneeProfileId = useMemo(() => {
    const ids = (latestTaskData as any)?.assignees_ids
    if (Array.isArray(ids) && ids.length > 0) {
      const parsed = safeParseInt(ids[0])
      if (parsed) return parsed
    }

    const parsedProfileId = safeParseInt((latestTaskData as any)?.assignee_profile_id)
    if (parsedProfileId) return parsedProfileId

    const parsedAssigneeId = safeParseInt((latestTaskData as any)?.assignee_id)
    return parsedAssigneeId || undefined
  }, [latestTaskData])

  const users: UserListItem[] = useMemo(() => {
    type RawAccessControlUser = RowDataUserList & {
      profile_id?: number
      display_name?: string
      full_name?: string
    }

    const rawUsers = Array.isArray(accessControlUserList?.users)
      ? (accessControlUserList.users as RawAccessControlUser[])
      : []
    const map = new Map<
      number,
      {
        display_name: string
        full_name: string
        first_name?: string
        last_name?: string
      }
    >()

    rawUsers.forEach((user) => {
      const parsedId = safeParseInt((user as any)?.profile_id)
      if (!Number.isFinite(parsedId) || parsedId <= 0) return

      const rawFirstName = typeof user.first_name === 'string' ? user.first_name.trim() : ''
      const rawLastName = typeof user.last_name === 'string' ? user.last_name.trim() : ''
      const rawDisplayNameCandidate =
        typeof user.display_name === 'string' && user.display_name.trim().length > 0
          ? user.display_name
          : typeof user.full_name === 'string' && user.full_name.trim().length > 0
            ? user.full_name
            : [rawFirstName, rawLastName].filter(Boolean).join(' ').trim()

      let displayName = rawDisplayNameCandidate.trim()
      const salutation = typeof user.salutation === 'string' ? user.salutation.trim() : ''

      if (salutation && displayName) {
        const normalizedDisplay = displayName.toLowerCase()
        const normalizedSalutation = salutation.toLowerCase()
        const hasSalutationPrefix =
          normalizedDisplay.startsWith(`${normalizedSalutation} `) ||
          normalizedDisplay.startsWith(`${normalizedSalutation}. `)

        if (!hasSalutationPrefix) {
          const prefix = getSalutations(salutation).trim()
          displayName = `${prefix} ${displayName}`.trim()
        }
      } else if (salutation && !displayName) {
        displayName = getSalutations(salutation).trim()
      }

      const finalDisplayName = displayName.replace(/\s+/g, ' ').trim()
      if (!finalDisplayName) return

      if (!map.has(parsedId)) {
        const fullName =
          typeof user.full_name === 'string' && user.full_name.trim().length > 0
            ? user.full_name.trim()
            : [rawFirstName, rawLastName].filter(Boolean).join(' ').trim() || finalDisplayName

        map.set(parsedId, {
          display_name: finalDisplayName,
          full_name: fullName,
          first_name: rawFirstName || undefined,
          last_name: rawLastName || undefined,
        })
      }
    })

    return Array.from(map.entries()).map(([profile_id, details]) => ({
      profile_id,
      display_name: details.display_name,
      full_name: details.full_name,
      first_name: details.first_name,
      last_name: details.last_name,
    }))
  }, [accessControlUserList?.users, latestTaskData])

  const meDisplayName = useMemo(() => {
    if (!parsedProfileId) return undefined
    const meFromList = users.find((u) => Number(u.profile_id) === parsedProfileId)
    if (meFromList) {
      return meFromList.display_name || 'User'
    }
    const salutationPrefix =
      typeof userDetail?.salutation === 'string' && userDetail.salutation.trim().length > 0
        ? getSalutations(userDetail.salutation).trim()
        : ''
    const namePart = [userDetail?.first_name ?? '', userDetail?.last_name ?? '']
      .filter(Boolean)
      .join(' ')
      .trim()
    const fallback = [salutationPrefix, namePart].filter(Boolean).join(' ').trim()
    return fallback || undefined
  }, [parsedProfileId, users, userDetail])

  const assigneeDisplayName = useMemo(() => {
    if (
      assigneeProfileId &&
      parsedProfileId &&
      Number(assigneeProfileId) === Number(parsedProfileId)
    ) {
      return meDisplayName || assignedUserName || 'Select user'
    }

    if (assigneeProfileId) {
      const match = users.find((user) => Number(user.profile_id) === Number(assigneeProfileId))
      if (match?.display_name) return match.display_name
    }

    return assignedUserName ?? 'Select user'
  }, [assigneeProfileId, assignedUserName, meDisplayName, parsedProfileId, users])

  const refreshTaskDetails = useCallback(() => {
    const parsedDoctorId = safeParseInt(userId)
    const parsedPatientId = safeParseInt(patientId)
    if (!parsedDoctorId || !parsedPatientId) return
    dispatchAction(
      getIndividualTask({
        doctor_id: parsedDoctorId,
        patient_id: parsedPatientId,
        organization_id: safeParseInt(organizationId),
        workflow_name: kanbanName,
      }) as any
    )
  }, [dispatchAction, organizationId, patientId, userId])

  const refreshAssessmentDetails = useCallback(() => {
    const parsedDoctorId = safeParseInt(userId)
    const parsedPatientId = safeParseInt(patientId)
    if (!parsedDoctorId || !parsedPatientId) return
    dispatchAction(
      getLeadsProfileDetails({
        patient_id: parsedPatientId,
        doctor_id: parsedDoctorId,
      })
    )
  }, [dispatchAction, patientId, userId])

  const handlePlanStatusRefresh = useCallback(() => {
    refreshTaskDetails()
    refreshAssessmentDetails()
  }, [refreshAssessmentDetails, refreshTaskDetails])

  const handleClinicChange = useCallback(
    (value: string) => {
      const parsedPatientId = safeParseInt(patientId)
      const parsedLocationId = safeParseInt(value)

      if (!parsedPatientId || !parsedLocationId) {
        ErrorToast('Unable to update clinic. Please try again.')
        return
      }

      if (value === clinicSelection) return

      const previousSelection = clinicSelection
      setClinicSelection(value)
      setIsUpdatingClinic(true)

      const selectedClinic = clinicOptions.find((option) => option.value === value)
      const locations = Array.isArray(clinicsData?.practice_location_list)
        ? clinicsData.practice_location_list
        : []
      const selectedLocationDetails =
        selectedClinic?.locationDetails ??
        locations.find(
          (location: any) => String(location.practice_location_id) === String(parsedLocationId)
        )
      const locationCity =
        selectedLocationDetails?.city ?? selectedLocationDetails?.practice_location_city ?? null
      const locationState =
        selectedLocationDetails?.state ?? selectedLocationDetails?.practice_location_state ?? null
      const locationCountry =
        selectedLocationDetails?.country ??
        selectedLocationDetails?.practice_location_country ??
        null

      dispatchAction(
        postApiLeadsProfileDetailsUpdate({
          data: {
            patient_id: parsedPatientId,
            practice_location_id: String(parsedLocationId),
            practice_location_name: selectedClinic?.label ?? null,
            city: locationCity,
            state: locationState,
            country: locationCountry,
            practice_location_city: locationCity,
            practice_location_state: locationState,
            practice_location_country: locationCountry,
          },
        }) as any
      )
        .unwrap()
        .then(() => {
          const parsedDoctorId = safeParseInt(userId)
          if (parsedPatientId && parsedDoctorId) {
            dispatchAction(
              getLeadsProfileDetails({
                doctor_id: parsedDoctorId,
                patient_id: parsedPatientId,
              }) as any
            )
          }
        })
        .catch((error: any) => {
          const errorMessage =
            typeof error === 'string' ? error : 'Failed to update clinic. Please try again.'
          ErrorToast(errorMessage)
          setClinicSelection(previousSelection)
        })
        .finally(() => {
          setIsUpdatingClinic(false)
        })
    },
    [clinicOptions, clinicSelection, clinicsData, dispatchAction, patientId, userId]
  )

  const handleNavigateToKanban = useCallback(() => {
    const task = latestTaskData || {}

    const toUpper = (v: any) => (v ?? '').toString().trim().toUpperCase()
    const rawName = toUpper(task.workflow_name)

    const norm = rawName.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim()

    let workFlow:
      | 'new-case'
      | 'planning-in-house'
      | 'planning-outsource'
      | 'production-in-house'
      | 'production-outsource' = 'new-case'

    const has = (s: string) => norm.includes(s)
    const re = (r: RegExp) => r.test(norm)

    if (has('NEW CASE')) {
      workFlow = 'new-case'
    } else if (re(/(?:PLAN|PLANS|PLANNING)\s+OUTSOURC(?:ED|E|ING)?/)) {
      workFlow = 'planning-outsource'
    } else if (has('PLANNING')) {
      workFlow = 'planning-in-house'
    } else if (
      re(/(?:PRODUCTION|MANUFACTURING)\s+.*OUTSOURC(?:ED|E|ING)/) ||
      re(/OUTSOURC(?:ED|E|ING)\s+.*(?:PRODUCTION|MANUFACTURING)/)
    ) {
      workFlow = 'production-outsource'
    } else if (
      has('PRODUCTION') ||
      has('MANUFACTURING') ||
      has('ONGOING PRODUCTION LIST') ||
      has('ONGOING PRODUCT LIST')
    ) {
      workFlow = 'production-in-house'
    }

    const statusLabel =
      (task?.current_workflow_status_label_name === 'COMPLETED'
        ? ''
        : task?.current_workflow_status_label_name || ''
      ).toString() || null

    const patientName = (data?.patient_details?.full_name || task?.patient_name || '').toString()

    const params = new URLSearchParams()
    params.set('workFlow', workFlow)
    params.set('view', 'kanban')
    if (statusLabel) params.set('status', statusLabel)
    if (patientName) params.set('search', patientName)

    navigate(`/aligner-orders?${params.toString()}`)
  }, [data?.patient_details?.full_name, latestTaskData, navigate])

  const ageText =
    data?.patient_details?.age == null ? undefined : `${data?.patient_details?.age} years`
  const genderRaw = getFirstLetterCapitalOfWord(data?.patient_details?.gender)
  const genderText = genderRaw && genderRaw.trim().length > 0 ? genderRaw : undefined
  const idText = data?.patient_details?.customer_mapped_id
    ? `ID: #${data.patient_details.customer_mapped_id}`
    : undefined
  const demographicsLine = [ageText, genderText, idText].filter(Boolean).join(', ')

  useEffect(() => {
    resetFilter()
  }, [patientId, resetFilter])

  const toggleMobileMeta = useCallback(() => {
    setIsMobileMetaOpen((prev) => !prev)
    setIsRecentActivityButtonActive(false)
  }, [])

  const handleNeedInfoRequested = useCallback((context: NeedMoreInfoModalContext) => {
    setNeedInfoContext(context)
    setNeedInfoModalOpen(true)
  }, [])

  const handleNeedInfoModalClose = useCallback(() => {
    setNeedInfoModalOpen(false)
    setNeedInfoContext(null)
  }, [])

  const handleNeedInfoModalSubmitted = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_context?: NeedMoreInfoModalContext | null) => {
      handleNeedInfoModalClose()
      refreshTaskDetails()
    },
    [handleNeedInfoModalClose, refreshTaskDetails]
  )

  const handleRevisionRequested = useCallback((context: NeedMoreInfoModalContext) => {
    setRevisionContext(context)
    setRevisionModalOpen(true)
  }, [])

  const handleRevisionModalClose = useCallback(() => {
    setRevisionModalOpen(false)
    setRevisionContext(null)
  }, [])

  const handleRevisionModalSubmitted = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_context?: NeedMoreInfoModalContext | null) => {
      handleRevisionModalClose()
      refreshTaskDetails()
    },
    [handleRevisionModalClose, refreshTaskDetails]
  )

  const handleApproveRequested = useCallback((context: NeedMoreInfoModalContext) => {
    setApproveContext(context)
    setApproveModalOpen(true)
  }, [])

  const handleApproveModalClose = useCallback(() => {
    setApproveModalOpen(false)
    setApproveContext(null)
  }, [])

  const handleApproveModalSubmitted = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_context?: NeedMoreInfoModalContext | null) => {
      handleApproveModalClose()
      refreshTaskDetails()
    },
    [handleApproveModalClose, refreshTaskDetails]
  )

  const openError = useCallback(
    (text: string, showText: boolean) => {
      dispatchAction(setIsOpenErrorModal({isOpen: true, text, showText}))
    },
    [dispatchAction]
  )

  const applyManufacturingModalContext = useCallback(
    (taskDetails: any, label: string, nextStatusId: number) => {
      if (!taskDetails || !nextStatusId) return
      dispatchAction(setCardDetails(taskDetails))
      dispatchAction(setDynamicLabel(label))
      dispatchAction(setDynamicStatus(label))
      dispatchAction(setDynamicWorkflowStatusId(nextStatusId))
    },
    [dispatchAction]
  )

  const handleManufacturingAction = useCallback(
    async (
      actionType: 'PACKAGED' | 'SHIPPED' | 'DELIVERED',
      context: NeedMoreInfoModalContext & {taskDetails?: any}
    ) => {
      if (!context?.taskDetails) return

      dispatchAction(setCardDetails(context.taskDetails))

      const nextStatusId = safeParseInt(context?.nextStatusId)
      const taskId = safeParseInt(context?.taskId)
      const parsedPatientId = safeParseInt(context?.patientId)
      const workflowId = safeParseInt(context?.workflowId)
      const doctorId = safeParseInt(userId)

      if (!taskId || !parsedPatientId || !workflowId || !doctorId || !nextStatusId) return

      const taskDetails = context.taskDetails
      const latestStatus =
        taskDetails?.manufacturing_batch_response?.latest_batch_manufacturing_status ?? ''
      const label = context?.label ?? ''
      const labelForError = label || 'this stage'

      const moveTask = async () => {
        try {
          await dispatchAction(
            moveTaskCard({
              task_id: taskId,
              doctor_id: doctorId,
              workflow_status_id: nextStatusId,
              patient_id: parsedPatientId,
              workflow_id: workflowId,
              is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
            })
          ).unwrap()
          SuccessToast('Workflow status updated')
          refreshTaskDetails()
        } catch (error: any) {
          const fallbackMessage =
            error?.message || error?.response?.data?.message || 'Failed to update workflow status'
          ErrorToast(fallbackMessage)
        }
      }

      switch (actionType) {
        case 'PACKAGED': {
          if (!taskMovementPermissions?.allowPackaging?.isViewable) {
            ErrorToast('You do not have permission to move this batch to Packaged.')
            return
          }

          if (latestStatus === manufacturingConstants.COMPLETED) {
            await moveTask()
            return
          }

          if (latestStatus === manufacturingConstants.MANUFACTURING_STARTED) {
            applyManufacturingModalContext(taskDetails, label, nextStatusId)
            dispatchAction(setIsOpenManufacturingCompleteModal(true))
            return
          }

          if (
            latestStatus === manufacturingConstants.SHIPPED ||
            latestStatus === manufacturingConstants.DELIVERED
          ) {
            openError(
              `This case has already progressed beyond ${labelForError}. Moving backwards is not allowed once a case has advanced to a later stage.`,
              true
            )
          }
          return
        }
        case 'SHIPPED': {
          if (!taskMovementPermissions?.allowShipping?.isViewable) {
            ErrorToast('You do not have permission to move this batch to Shipped.')
            return
          }

          if (latestStatus === manufacturingConstants.COMPLETED) {
            applyManufacturingModalContext(taskDetails, label, nextStatusId)
            dispatchAction(setIsOpenShippingOrderModal(true))
            return
          }

          if (latestStatus === manufacturingConstants.SHIPPED) {
            await moveTask()
            return
          }

          if (latestStatus === manufacturingConstants.DELIVERED) {
            openError(
              `This case has already progressed beyond ${labelForError}. Moving backwards is not allowed once a case has advanced to a later stage.`,
              true
            )
            return
          }

          openError(
            `This batch can't be moved to ${labelForError} yet. Please move it to Packaged first before proceeding.`,
            false
          )
          return
        }
        case 'DELIVERED': {
          if (!taskMovementPermissions?.allowMarkingAsDelivered?.isViewable) {
            ErrorToast('You do not have permission to move this batch to Delivered.')
            return
          }

          if (latestStatus === manufacturingConstants.SHIPPED) {
            applyManufacturingModalContext(taskDetails, label, nextStatusId)
            dispatchAction(setIsOpenDeliverFromPackageModal(true))
            return
          }

          if (latestStatus === manufacturingConstants.DELIVERED) {
            await moveTask()
            return
          }

          if (latestStatus === manufacturingConstants.COMPLETED) {
            applyManufacturingModalContext(taskDetails, label, nextStatusId)
            await moveTask()
            dispatchAction(setIsOpenDeliverFromPackageModal(true))
            return
          }

          if (latestStatus === manufacturingConstants.MANUFACTURING_STARTED) {
            openError(
              `This batch can't be moved to ${labelForError} yet. Please move it to Packaged first before proceeding.`,
              false
            )
            return
          }

          openError(
            `This batch can't be moved to ${labelForError} yet. Please move it to Packaged first before proceeding.`,
            false
          )
          return
        }
        default:
          return
      }
    },
    [
      applyManufacturingModalContext,
      dispatchAction,
      openError,
      refreshTaskDetails,
      taskMovementPermissions,
      userId,
    ]
  )


  const statusAssignmentContent = (
    <>
      <When isTrue={!isStarterPlanUser && hasValue(latestTaskData)}>
        <div className='flex flex-col gap-2'>
          <h3 className='text-base font-medium text-gray-500 mr-4'>Status</h3>
          <div className='border border-mediumGray rounded-md'>
            <WorkflowStatusSelector
              taskId={latestTaskData?.id}
              patientId={patientId}
              workflowId={latestTaskData?.workflow_id}
              workflowName={latestTaskData?.workflow_name}
              currentStatusId={latestTaskData?.current_workflow_status_id}
              currentStatusLabel={latestTaskData?.current_workflow_status_label_name}
              taskDetails={latestTaskData}
              onStatusChange={handlePlanStatusRefresh}
              onNeedInformationSelected={handleNeedInfoRequested}
              onRevisionSelected={handleRevisionRequested}
              onApprovedSelected={handleApproveRequested}
              onManufacturingAction={handleManufacturingAction}
              className='w-full'
            />
          </div>
        </div>
      </When>
      <NextFollowUpCard date={data?.patient_details?.next_follow_up} />
      <When isTrue={!isStarterPlanUser && canViewAssignee && hasValue(getIndividualTaskList)}>
        {canEditAssignee ? (
          <div className='flex flex-col gap-2'>
            <h3 className='text-base font-medium text-gray-500 mr-4'>Assigned User</h3>
            <AssigneeUserSelector
              taskId={latestTaskData?.id}
              assigneeName={assigneeDisplayName}
              assigneeProfileId={assigneeProfileId}
              onAssigned={refreshTaskDetails}
              workflowName={latestTaskData?.workflow_name}
              setProductionAssignModalOpen={setProductionAssignModalOpen}
            />
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            <h3 className='text-base font-medium text-gray-500 mr-4'>Assigned User</h3>
            <div className='text-gray-900 font-medium'>{assigneeDisplayName ?? '-'}</div>
          </div>
        )}
      </When>
    </>
  )

  const additionalMetaContent = (
    <>
      <When isTrue={!!latestTaskData?.service_products?.product_name}>
        <div className='flex flex-col gap-2'>
          <h3 className='text-base font-medium text-gray-500'>Product</h3>
          <div className='text-gray-900 font-medium'>
            {latestTaskData?.service_products?.product_name}
          </div>
        </div>
      </When>

      <When isTrue={!!latestTaskData?.created_on}>
        <div className='flex flex-col gap-2'>
          <h3 className='text-base font-medium text-gray-500'>Created on</h3>
          <div className='text-gray-900 font-medium'>
            {dayjs(latestTaskData?.created_on).format('DD-MMM-YYYY')}
          </div>
        </div>
      </When>

      <When isTrue={!!data?.patient_details?.assigned_practice?.name && isEnterprisePlanUser}>
        <div className='flex flex-col gap-2'>
          <h3 className='text-base font-medium text-gray-500'>Customer</h3>
          <div className='text-gray-900 font-medium'>
            {data?.patient_details?.assigned_practice?.name}
          </div>
        </div>
      </When>
    </>
  )

  const kanbanButton = (
    <AntdButton
      onClick={handleNavigateToKanban}
      type='primary'
      className='bg-primarySupport border border-primaryColor hover:!bg-primarySupport hover:!border-primaryColor hover:!text-primaryColor text-primaryColor h-10 font-semibold flex-1 md:flex-none md:px-4 rounded-md'
      text='Take me to Kanban'
    />
  )

  const recentActivityButton = (
    <When isTrue={!isStarterPlanUser}>
      <button
        type='button'
        className='flex-1 h-10 border border-mediumGray rounded-md bg-white px-4 text-sm font-medium text-textColor flex items-center justify-between'
        onClick={() => {
          onOpenActivity?.()
          setIsRecentActivityButtonActive((prev) => !prev)
        }}
      >
        <span>Recent Activity</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isRecentActivityButtonActive ? 'rotate-180' : ''
          }`}
        />
      </button>
    </When>
  )

  const containerClassName =
    'bg-white flex flex-col w-full mx-auto border border-mediumGray rounded-xl p-4 gap-4'

  const src = data?.patient_details?.profile_image_id
    ? getImageUrlById(data?.patient_details?.profile_image_id)
    : data?.patient_details?.profile_picture_url

  const resolvedAvatarSrc =
    src && src.includes('patient/drive/image/')
      ? getImageUrl({
          url: src,
          is_gdrive_platform: true,
          drive_file_id: src.match(/patient\/drive\/image\/([^/?#]+)/)?.[1],
        }) || src
      : src
  return (
    <>
      <Modal
        title='Ongoing productions are assigned to the production user'
        okText='OK'
        open={productionAssignModalOpen}
        onOk={() => setProductionAssignModalOpen(false)}
        cancelButtonProps={{style: {display: 'none'}}}
        closable={false}
      />

      {needInfoContext && (
        <MoveToNeedMoreInfoModal
          open={needInfoModalOpen}
          context={needInfoContext}
          onClose={handleNeedInfoModalClose}
          onSubmitted={handleNeedInfoModalSubmitted}
        />
      )}
      {revisionContext && (
        <MoveToRevisionModal
          open={revisionModalOpen}
          context={revisionContext}
          onClose={handleRevisionModalClose}
          onSubmitted={handleRevisionModalSubmitted}
          onSuccess={handlePlanStatusRefresh}
        />
      )}
      {approveContext && (
        <MoveToApproveModal
          open={approveModalOpen}
          context={approveContext}
          onClose={handleApproveModalClose}
          onSubmitted={handleApproveModalSubmitted}
          onSuccess={handlePlanStatusRefresh}
        />
      )}
      <MoveToTreatmentReviewModal />
      <MoveToCompleteManufacturingState onSuccess={refreshTaskDetails} />
      <MoveToShippingState onSuccess={refreshTaskDetails} />
      <ErrorState />
      <div className='flex flex-col gap-4'>
        <div className={containerClassName}>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between '>
            <div className='flex w-full items-start justify-between gap-3'>
              <div className='flex items-center gap-3 '>
                {resolvedAvatarSrc ? (
                  <Avatar className='object-cover rounded-full w-11 h-11' src={resolvedAvatarSrc} />
                ) : (
                  <PatientProfileInitials
                    name={[
                      data?.patient_details?.first_name ?? '',
                      data?.patient_details?.last_name ?? '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                      .trim()}
                    className='h-12 w-12 text-base font-semibold'
                  />
                )}
                <div className='flex flex-col'>
                  <h1 className='text-xl font-semibold text-neutralBlack'>
                    {data?.patient_details?.full_name}
                  </h1>
                  {demographicsLine && (
                    <span className='mt-1 font-figtree font-medium text-[14px] leading-[20px] tracking-[0.01em] text-textColor'>
                      {demographicsLine}
                    </span>
                  )}
                </div>
              </div>

              <button
                type='button'
                onClick={toggleMobileMeta}
                aria-expanded={isMobileMetaOpen}
                aria-label={isMobileMetaOpen ? 'Hide recent activity' : 'Show recent activity'}
                className='p-2 -mr-2 text-textColor'
              >
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${isMobileMetaOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            <div className='border border-b-1 border-mediumGray'></div>

            <ContactDetailsRow
              patient={data?.patient_details}
              clinicOptions={clinicOptions}
              clinicSelection={clinicSelection}
              clinicsLoading={clinicsLoading}
              disableClinicSelect={clinicsLoading || isUpdatingClinic || clinicOptions.length === 0}
              onClinicChange={handleClinicChange}
            />
          </div>
          <When isTrue={isMobileMetaOpen}>
            <div className='w-full flex flex-col gap-4'>
              {statusAssignmentContent}
              {additionalMetaContent}
            </div>
          </When>
        </div>

        <div className='flex gap-3 w-full px-4 mb-4'>
          {getIndividualTaskList && !isStarterPlanUser && kanbanButton}
          {recentActivityButton}
        </div>
      </div>
    </>
  )
}

export default PatientInfoCardMobileView
