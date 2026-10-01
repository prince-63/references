import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Select, Avatar} from 'antd'
import {Phone, Mail, Building2, Calendar} from 'lucide-react'
import When from 'components/when/When'
import {getFirstLetterCapitalOfWord, getImageUrlById, safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {useNavigate} from 'react-router-dom'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import {getImageUrl} from 'utils/ConstFunctions'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {
  getIndividualTask,
  PatientTaskDetails,
} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import WorkflowStatusSelector from 'screens/Kanban/components/WorkflowStatusSelector'
import MoveToNeedMoreInfoModal, {
  NeedMoreInfoModalContext,
} from 'screens/Kanban/components/MoveToNeedMoreInfoModal'
import MoveToRevisionModal from 'screens/Kanban/components/MoveToRevisionModal'
import MoveToApproveModal from 'screens/Kanban/components/MoveToApproveModal'
import MoveToTreatmentReviewModal from 'screens/Kanban/components/MoveToTreatmentReviewModal'
import MoveToCompleteManufacturingState from 'screens/Kanban/actionModals/MoveToCompleteManufacturingState'
import MoveToShippingState from 'screens/Kanban/actionModals/MoveToShippingState'

// Status cards (same as overview)
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import dayjs from 'dayjs'
import getColorPalette from 'utils/getColorPalette'
import {setTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ResumeTreatment from 'screens/Patients/LeadsProfile/main/alignersTracking/actionModals/ResumeTreatment'
import useFilter from '@hooks/useFilter'
import actionList from '@staticData/actionList'
import InfoCardWithContainer from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCardWithContainer'
import {postApiDataListActivePracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import actionTypes from '@constants/actionTypes'
import ModelUpdateStartDate from 'components/modal/PatientProfile/Tabs/TreatmentPlan/ModelUpdateStartDate'
import ModalSuccess from 'components/modal/Alert/ModalSuccess'
import {
  moveTaskCard,
  setCardDetails,
  setDynamicLabel,
  setDynamicStatus,
  setDynamicWorkflowStatusId,
  setIsOpenDeliverFromPackageModal,
  setIsOpenManufacturingCompleteModal,
  setIsOpenErrorModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorState from 'screens/Kanban/actionModals/ErrorState'
import manufacturingConstants from '@constants/manufacturing.constants'
import {AssigneeUserSelector} from 'screens/Kanban/components/AssigneeUserSelector'
import {getActiveUsers} from 'redux/Slices/AppSlice/orders/orders.slice'
import ModalCard from 'components/modalCard/ModalCard'
import {setOpenShippingDetailsModal} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'

type PatientDetails = RootState['apiGetLeadsProfileDetails']['data']['patient_details']
type ClinicOption = {
  label: string
  value: string
  locationDetails?: any
}

const ContactSeparator = () => <span className='text-[#CFCFCF]'>|</span>

interface ContactDetailsRowProps {
  patient?: PatientDetails | null
  clinicOptions: ClinicOption[]
  clinicSelection?: string
  clinicsLoading: boolean
  disableClinicSelect: boolean
  onClinicChange: (value: string) => void
}

const ContactDetailsRow: React.FC<ContactDetailsRowProps> = ({
  patient,
  clinicOptions,
  clinicSelection,
  clinicsLoading,
  disableClinicSelect,
  onClinicChange,
}) => {
  if (!patient) return null
  const hasEmail = Boolean(patient.email)
  const hasMobile = Boolean(patient.mobile)
  const hasLocation = Boolean(patient.practice_location)

  const {permissionChecks} = useFeatureAccess()
  const practiceLocationPermissions =
    permissionChecks?.practiceLocation?.managePracticeLocations?.isViewable
  const contactPermissions = permissionChecks?.patientDetails?.patientContactDetails?.isViewable
  const canShowClinicDropdown =
    practiceLocationPermissions &&
    (clinicsLoading || clinicOptions.length > 0 || !!clinicSelection || !!patient.practice_location)
  const nothingToShow = !hasEmail && !hasMobile && !hasLocation && !canShowClinicDropdown
  if (nothingToShow) return null

  return (
    <div className='flex flex-wrap items-center gap-4 text-sm text-textColor'>
      {hasEmail && contactPermissions && (
        <div className='flex items-center gap-2'>
          <Mail className='w-4 h-4' />
          <span>{patient.email}</span>
        </div>
      )}

      {hasEmail && (hasMobile || canShowClinicDropdown) && <ContactSeparator />}

      {hasMobile && contactPermissions && (
        <div className='flex items-center gap-2'>
          <Phone className='w-4 h-4' />
          <span>{patient.country_code}</span>
          <span>{patient.mobile}</span>
        </div>
      )}

      {hasMobile && canShowClinicDropdown && <ContactSeparator />}

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
            showSearch
            optionFilterProp='label'
            bordered={false}
            dropdownMatchSelectWidth={false}
            notFoundContent={clinicsLoading ? 'Loading clinics...' : 'No clinics found'}
            style={{minWidth: 160, backgroundColor: 'transparent'}}
            className='!text-sm !text-textColor'
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

interface StatusAlertsSectionProps {
  status?: string | null
  pausedAt?: string | null
  reasonForPause?: string | null
  deactivatedAt?: string | null
  reasonForDeactivation?: string | null
  deactivatedRemarks?: string | null
  onResumeTreatment: () => void
  onSetupTreatment: () => void
  isActionEnabled: boolean
  remarks?: string | null
  trackingStatus?: string | null
  creationStatus?: string | null
  progressStatus?: string | null
  startDate?: string | null
  canUpdateStartDate?: boolean
  onUpdateStartDate?: () => void
  tracking_enabled: boolean
}

const StatusAlertsSection: React.FC<StatusAlertsSectionProps> = ({
  status,
  pausedAt,
  reasonForPause,
  deactivatedAt,
  reasonForDeactivation,
  deactivatedRemarks,
  onResumeTreatment,
  onSetupTreatment,
  isActionEnabled,
  remarks,
  startDate,
  canUpdateStartDate,
  onUpdateStartDate,
}) => {
  const formattedStartDate = startDate ? dayjs(startDate).format('DD MMM YYYY') : '--'
  const now = new Date()
  const date: Date | null = formattedStartDate ? new Date(formattedStartDate) : null
  const isFutureDate =
    date instanceof Date && !isNaN(date.getTime()) && date.getTime() > now.getTime()

  return (
    <>
      <When isTrue={status === treatmentPlanStatusConstants.PAUSED}>
        <InfoCard
          title={`Treatment paused on ${dayjs(pausedAt).format('DD-MMM-YYYY')}`}
          className='bg-orangeSupport text-orange md:border-none border border-orange'
          titleClassName='!text-orange font-semibold'
          iconColor='#BE8901'
          infoIconColor='#BE8901'
          content={`Reason: ${reasonForPause ?? '-'}`}
          showButton={isActionEnabled}
          buttonText='Resume treatment'
          buttonClassName='border-orange text-orange ml-6'
          onClick={onResumeTreatment}
        />
      </When>

      <When isTrue={status === treatmentPlanStatusConstants.DEACTIVATED}>
        <InfoCard
          title={`Treatment deactivated on ${dayjs(deactivatedAt).format('DD-MMM-YYYY')}`}
          className='bg-redSupport text-red md:border-none border border-red'
          titleClassName='!text-red font-semibold'
          iconColor='red'
          infoIconColor='red'
          showButton={isActionEnabled}
          showArrowIcon={false}
          buttonText='Create New Plan'
          content={
            <div className='flex gap-2'>
              <p>Reason: {reasonForDeactivation ?? '--'}.</p>
              <p>Remark: {deactivatedRemarks ?? '--'}</p>
            </div>
          }
          buttonClassName='border-red bg-red text-white ml-6'
          onClick={onSetupTreatment}
        />
      </When>

      <When isTrue={status === treatmentPlanStatusConstants.COMPLETE}>
        <InfoCardWithContainer
          title='Treatment Completed'
          className='flex md:!justify-between !justify-start  border !border-[#0095ff]'
          titleClassName='!text-black font-semibold'
          topSectionClassName='bg-[#E9f3fa]'
          subtitle='This treatment was marked as completed. You may continue processing if required.'
          infoIconColor='#0095ff'
          remarks={remarks}
          remarksClassName='!bg-transparent'
        />
      </When>

      <When isTrue={isFutureDate}>
        <InfoCard
          title={`Treatment will start on ${formattedStartDate}`}
          className='bg-secondarySupport border border-secondaryColor'
          showButton={!!canUpdateStartDate}
          buttonText='Update start date'
          buttonClassName='ml-6'
          onClick={onUpdateStartDate}
          titleClassName='!text-secondaryColor font-semibold'
          infoIconColor={getColorPalette().secondaryColor}
          content='Treatment details have been added. You will be able to see treatment progress once it starts.'
        />
      </When>
    </>
  )
}

const PatientInfoCard: React.FC = () => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {userId, organizationId} = useContext(AuthContext)
  const {permissionChecks} = useFeatureAccess()
  const assigneePermissions = permissionChecks?.patientProfileActions?.assignee
  const taskMovementPermissions = permissionChecks?.workflowActions
  const canViewAssignee = assigneePermissions?.isViewable ?? false
  const canEditAssignee = assigneePermissions?.isEditable ?? false
  const [productionAssignModalOpen, setProductionAssignModalOpen] = useState(false)
  // data sources
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const rawTask = useSelector((state: RootState) => state.workFlow.getIndividualTaskList)
  const params = new URLSearchParams(window.location.search)
  const kanbanName = params.get('kanban_name')
  const allWorkflowTasks = useSelector((state: RootState) => state.workFlow.getAllTask)
  const getIndividualTaskList: any = useMemo(() => {
    const asArray = Array.isArray(allWorkflowTasks) ? allWorkflowTasks : []

    const fallbackTasks = (() => {
      if (!rawTask) return []
      if (Array.isArray(rawTask)) return rawTask
      return [rawTask]
    })()

    const tasks = asArray.length ? asArray : fallbackTasks
    if (!tasks.length) return null

    const parentTasks = tasks.filter((task) => !task?.parent_task_id)
    const toTime = (value?: string | null) =>
      value ? new Date(value).getTime() : Number.MIN_SAFE_INTEGER
    const toBatchId = (value?: number | string | null) => safeParseInt(value) || 0
    const sortByPriority = (items: any[]) =>
      [...items].sort((a, b) => {
        const batchDiff =
          toBatchId(b?.manufacturing_batch_id) - toBatchId(a?.manufacturing_batch_id)
        if (batchDiff !== 0) return batchDiff
        const updatedDiff = toTime(b?.updated_on) - toTime(a?.updated_on)
        if (updatedDiff !== 0) return updatedDiff
        const createdDiff = toTime(b?.created_on) - toTime(a?.created_on)
        if (createdDiff !== 0) return createdDiff
        return (b?.id ?? 0) - (a?.id ?? 0)
      })

    const collection = parentTasks.length ? parentTasks : tasks
    return sortByPriority(collection)[0] ?? null
  }, [allWorkflowTasks, rawTask])

  const latestTaskData: PatientTaskDetails | null = useMemo(() => {
    if (!Array.isArray(allWorkflowTasks)) return null

    const filtered = allWorkflowTasks.filter((t) => t?.workflow_name !== 'ONGOING PRODUCT LIST')

    if (filtered.length === 0) return null

    // if (filtered.length === 1) return filtered[0]

    const showFilteredTaskItem = filtered.find((t) => t?.workflow_name === kanbanName)
    if (showFilteredTaskItem) return showFilteredTaskItem

    return filtered[filtered.length - 1]
  }, [allWorkflowTasks])
  const isShowCreatedByDetails = !latestTaskData?.is_cloned_order && serviceConfig?.PLANNING

  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const remarks = dataLeadsOverview?.treatment_plan_completed_remarks
  const {data: clinicsData, loading: clinicsLoading} = useSelector(
    (state: RootState) => state.apiListActivePracticeLocation
  )
  const {filter: activeAction, handleFilterChange, resetFilter} = useFilter(actionList, false)

  const {isOrganization, isPractice, isStarterPlanUser, isGrowthPlanUser, isEnterprisePlanUser} =
    useAllUserPlan()
  const patientId = data?.patient_details?.id
  const is_your_patient = data?.patient_details?.assigned_practice?.practice_doctor_id == userId
  const isAccessibleActionButton =
    (isOrganization && is_your_patient) || isStarterPlanUser || isPractice || isGrowthPlanUser

  // Ensure treatment plan (for the “will start on …” info)
  const status = dataLeadsOverview?.treatment_plan?.aligner_treatment_status
  const tracking_enabled = dataLeadsOverview?.tracking?.enabled

  const [isUpdateStartDateSuccess, setIsUpdateStartDateSuccess] = useState(false)
  const [updateStartDateSuccessTitle, setUpdateStartDateSuccessTitle] = useState(
    'New start date updated successfully'
  )

  const [clinicSelection, setClinicSelection] = useState<string | undefined>(undefined)
  const [isUpdatingClinic, setIsUpdatingClinic] = useState(false)

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

  // local UI state for status modals
  const [needInfoContext, setNeedInfoContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [needInfoModalOpen, setNeedInfoModalOpen] = useState(false)
  const [revisionContext, setRevisionContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [approveContext, setApproveContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [approveModalOpen, setApproveModalOpen] = useState(false)

  const fetchAccessControlUsers = useCallback(() => {
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
  }, [dispatchAction, userId])

  useEffect(() => {
    if (!canEditAssignee) return
    fetchAccessControlUsers()
  }, [canEditAssignee, fetchAccessControlUsers])

  const assigneeName = useMemo(() => {
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

  const handleSetupTreatmentClick = () => {
    if (!patientId) return
    dispatchAction(setTreatmentPlan({}))

    if (isStarterPlanUser) {
      navigate(`/add-patient-starter?patient_id=${patientId}&step=1`)
      return
    }

    if (isPractice) {
      navigate(`/${patientId}/plans-list/new/setupTreatmentPlan`)
      return
    }

    dispatchAction(setTreatmentPlan({}))
    navigate(`/${patientId}/plans-list/new/setupTreatmentPlan`)
  }

  const handleResumeTreatment = useCallback(() => {
    handleFilterChange(actionTypes.RESUME_TREATMENT)
  }, [handleFilterChange])

  // ---------- Proper comma handling for demographics line ----------
  const journeyId = dataLeadsOverview?.treatment_plan?.journey_id ?? undefined
  const ageText =
    data?.patient_details?.age == null ? undefined : `${data?.patient_details?.age} years`
  const genderRaw = getFirstLetterCapitalOfWord(data?.patient_details?.gender)
  const genderText = genderRaw && genderRaw.trim().length > 0 ? genderRaw : undefined
  const idText = data?.patient_details?.customer_mapped_id
    ? `ID: #${data.patient_details.customer_mapped_id}`
    : undefined
  const demographicsLine = [ageText, genderText, idText].filter(Boolean).join(', ')
  const trackingStartDate = dataLeadsOverview?.tracking?.start_date
  const isFutureDate = trackingStartDate ? dayjs(trackingStartDate).isAfter(dayjs(), 'day') : false

  useEffect(() => {
    resetFilter()
    setIsUpdateStartDateSuccess(false)
    setUpdateStartDateSuccessTitle('')
  }, [patientId, resetFilter])

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

  const handleWorkflowStatusChanged = useCallback(() => {
    refreshTaskDetails()
  }, [refreshTaskDetails])

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
          openError(fallbackMessage, true)
        }
      }

      switch (actionType) {
        case 'PACKAGED': {
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

            dispatchAction(setOpenShippingDetailsModal(true))
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


  const shouldShowAssignee = canViewAssignee && Boolean(rawTask)

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
      <ModalCard
        title='Ongoing productions are assigned to the production user'
        okText='OK'
        showFooter={true}
        open={productionAssignModalOpen}
        showCrossButton={false}
        drawerHeight='200px'
        onClick={() => {
          setProductionAssignModalOpen(false)
        }}
        onClose={() => {
          setProductionAssignModalOpen(false)
        }}
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
      <div className='bg-white flex flex-col w-full mx-auto border-b border-mediumGray  px-6 pt-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between '>
          <div className='flex items-center gap-3'>
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
                <span className='mt-1 text-sm text-textColor'>{demographicsLine}</span>
              )}
            </div>
          </div>

          <ContactDetailsRow
            patient={data?.patient_details}
            clinicOptions={clinicOptions}
            clinicSelection={clinicSelection}
            clinicsLoading={clinicsLoading}
            disableClinicSelect={clinicsLoading || isUpdatingClinic || clinicOptions.length === 0}
            onClinicChange={handleClinicChange}
          />
        </div>

        <div className='border-b border-mediumGray mt-3'></div>

        <div className='mt-4 flex flex-wrap items-center gap-6'>
          {rawTask && !isStarterPlanUser && (
            <div className='flex flex-col'>
              <h3 className='text-base font-medium text-gray-500 mr-4'>Status</h3>
              <WorkflowStatusSelector
                taskId={latestTaskData?.id}
                patientId={patientId}
                workflowId={latestTaskData?.workflow_id}
                workflowName={latestTaskData?.workflow_name}
                currentStatusId={latestTaskData?.current_workflow_status_id}
                currentStatusLabel={latestTaskData?.current_workflow_status_label_name}
                onStatusChange={handleWorkflowStatusChanged}
                onNeedInformationSelected={handleNeedInfoRequested}
                onRevisionSelected={handleRevisionRequested}
                onApprovedSelected={handleApproveRequested}
                onManufacturingAction={handleManufacturingAction}
                taskDetails={latestTaskData}
                className='!min-w-[200px]'
              />
            </div>
          )}

          <NextFollowUpCard date={data?.patient_details?.next_follow_up} />
          {shouldShowAssignee && (
            <div className='flex flex-col'>
              <h3 className='text-base font-medium text-gray-500 mr-4'>Assignee</h3>
              {canEditAssignee ? (
                <AssigneeUserSelector
                  taskId={latestTaskData?.id}
                  assigneeName={assigneeName}
                  assigneeProfileId={assigneeProfileId}
                  onAssigned={refreshTaskDetails}
                  className='!min-w-[200px]'
                  workflowName={latestTaskData?.workflow_name}
                  setProductionAssignModalOpen={setProductionAssignModalOpen}
                />
              ) : (
                <div className='text-gray-900 font-medium'>{assigneeName ?? '-'}</div>
              )}
            </div>
          )}

          <When isTrue={!!latestTaskData?.product_name}>
            <div className='flex flex-col gap-2'>
              <h3 className='text-base font-medium text-gray-500'>Product</h3>
              <div className='text-gray-900 font-medium'>{latestTaskData?.product_name ?? ''}</div>
            </div>
          </When>

          <When isTrue={!!latestTaskData?.patient_created_on}>
            <div className='flex flex-col gap-2'>
              <h3 className='text-base font-medium text-gray-500'>Created on</h3>
              <div className='text-gray-900 font-medium'>
                {dayjs(latestTaskData?.patient_created_on).format('DD-MMM-YYYY')}
              </div>
            </div>
          </When>
          <When
            isTrue={
              !!data?.patient_details?.assigned_practice?.name &&
              isEnterprisePlanUser &&
              isShowCreatedByDetails
            }
          >
            <div className='flex flex-col gap-2'>
              <h3 className='text-base font-medium text-gray-500'>Customer</h3>
              <div className='text-gray-900 font-medium'>
                {data?.patient_details?.assigned_practice?.name}
              </div>
            </div>
          </When>

          {/* Spacer to push button to the right on wide screens */}
          <div className='flex-1' />
          {rawTask && !isStarterPlanUser && !isPractice && (
            <button
              type='button'
              className='ml-auto px-3 py-2 border border-primaryColor text-primaryColor rounded-md text-sm font-medium hover:bg-primaryColor hover:text-white transition-colors inline-flex items-center'
              title='Open Kanban with this patient and current status'
              onClick={() => {
                const task = getIndividualTaskList || {}
                const toUpper = (v: any) => (v ?? '').toString().trim().toUpperCase()
                const rawName = toUpper(task.workflow_name)

                // normalize separators/spaces for matching
                const norm = rawName.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim()

                let workFlow:
                  | 'new-case'
                  | 'planning-in-house'
                  | 'planning-outsource'
                  | 'production-in-house'
                  | 'production-outsource' = 'new-case'

                const has = (s: string) => norm.includes(s)
                const re = (r: RegExp) => r.test(norm)

                // ---- ORDER MATTERS (preserve existing behavior) ----
                if (has('NEW CASE')) {
                  workFlow = 'new-case'
                } else if (re(/(?:PLAN|PLANS|PLANNING)\s+OUTSOURC(?:ED|E|ING)?/)) {
                  // Plan/Plans/Planning Outsourced/Outsource
                  workFlow = 'planning-outsource'
                } else if (has('PLANNING')) {
                  workFlow = 'planning-in-house'
                } else if (
                  re(/(?:PRODUCTION|MANUFACTURING)\s+.*OUTSOURC(?:ED|E|ING)/) ||
                  re(/OUTSOURC(?:ED|E|ING)\s+.*(?:PRODUCTION|MANUFACTURING)/)
                ) {
                  // Production Outsourced variants
                  workFlow = 'production-outsource'
                } else if (
                  // ✅ include both variants here:
                  has('PRODUCTION') ||
                  has('MANUFACTURING') ||
                  has('ONGOING PRODUCTION LIST') ||
                  has('ONGOING PRODUCT LIST') // <- fix: this was the missing case
                ) {
                  workFlow = 'production-in-house'
                }

                // keep your original status logic
                const statusLabel =
                  (task?.current_workflow_status_label_name === 'COMPLETED'
                    ? ''
                    : task?.current_workflow_status_label_name || ''
                  ).toString() || null

                const patientName = (
                  data?.patient_details?.full_name ||
                  task?.patient_name ||
                  ''
                ).toString()

                const params = new URLSearchParams()
                params.set('workFlow', workFlow)
                params.set('view', 'kanban')
                if (statusLabel) params.set('status', statusLabel)
                if (patientName) params.set('search', patientName)

                navigate(`/aligner-orders?${params.toString()}`)
              }}
            >
              <svg
                className='w-4 h-4 mr-2'
                viewBox='0 0 20 24'
                fill='currentColor'
                aria-hidden='true'
                focusable='false'
              >
                <path d='M11.5 1.5l-9 12H9l-1.5 9 9-12H11l.5-9z' />
              </svg>
              Take me to Kanban
            </button>
          )}
        </div>
        <div className=' fixed border-b border-mediumGray mt-2'></div>

        {/* Status cards at the bottom */}
        <div className='mt-6'>
          <StatusAlertsSection
            status={status}
            pausedAt={dataLeadsOverview?.paused_at}
            reasonForPause={dataLeadsOverview?.reason_for_pause}
            deactivatedAt={dataLeadsOverview?.deactivated_at}
            reasonForDeactivation={dataLeadsOverview?.reason_for_deactivation}
            deactivatedRemarks={dataLeadsOverview?.deactivated_remarks}
            onResumeTreatment={handleResumeTreatment}
            onSetupTreatment={handleSetupTreatmentClick}
            isActionEnabled={isAccessibleActionButton}
            remarks={remarks}
            trackingStatus={dataLeadsOverview?.tracking?.status}
            startDate={dataLeadsOverview?.tracking?.start_date}
            canUpdateStartDate={isAccessibleActionButton && isFutureDate && Boolean(journeyId)}
            onUpdateStartDate={() => handleFilterChange(actionTypes.UPDATE_START_DATE)}
            tracking_enabled={tracking_enabled}
          />
        </div>

        {isUpdateStartDateSuccess && (
          <ModalSuccess
            title={updateStartDateSuccessTitle}
            setIsSuccessModelOpen={setIsUpdateStartDateSuccess}
          />
        )}

        <When isTrue={activeAction.UPDATE_START_DATE}>
          <ModelUpdateStartDate
            handleOnClose={(option) => handleFilterChange(option, true)}
            setSuccess={setIsUpdateStartDateSuccess}
            setSuccessTitle={setUpdateStartDateSuccessTitle}
            patientId={patientId}
            alignerJourneyId={journeyId}
          />
        </When>

        <When isTrue={activeAction.RESUME_TREATMENT}>
          <ResumeTreatment
            handleOnClose={(option) => handleFilterChange(option, true)}
            alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id}
          />
        </When>
      </div>
    </>
  )
}

export default PatientInfoCard
