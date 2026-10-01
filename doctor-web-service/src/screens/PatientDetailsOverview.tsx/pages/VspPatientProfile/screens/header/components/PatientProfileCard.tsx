import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {Building2, MailIcon, Pencil, PhoneIcon} from 'lucide-react'
import {useCallback, useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {AssigneeUserSelector} from 'screens/Kanban/components/AssigneeUserSelector'
import {setKanbanCardDetails} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {getIndividualTask, PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {StatusBadge} from '@utils/getStatusConfig'
import {Select} from 'antd'

const PatientProfileCard = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const {
    patientData: patient,
    selectedOrderId,
    vsp_stepper,
  } = useSelector((state: RootState) => state.customerPatientProfile)
  const {vspOrderDetails} = useSelector((state: RootState) => state.vspOrders)
  const allWorkflowTasks = useSelector((state: RootState) => state.workFlow.getAllTask)
  const {isEnterprisePlanUser} = useAllUserPlan()
  const globalStatus = vsp_stepper?.order_status ?? 'DRAFT'
  const refreshTaskDetails = useCallback(() => {
    if (!userId || !patientId) return

    dispatchAction(
      getIndividualTask({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
      })
    )
  }, [dispatchAction, patientId, userId])

  useEffect(() => {
    refreshTaskDetails()
  }, [refreshTaskDetails])

  const selectedTaskData: PatientTaskDetails | null = useMemo(() => {
    if (!Array.isArray(allWorkflowTasks)) return null

    const filteredTasks = allWorkflowTasks.filter(
      (task) => task?.workflow_name !== 'ONGOING PRODUCT LIST'
    )
    if (filteredTasks.length === 0) return null

    const parentTasks = filteredTasks.filter((task) => !task?.parent_task_id)
    const sourceTasks = parentTasks.length ? parentTasks : filteredTasks
    const targetOrderId = selectedOrderId ?? patient?.order_id ?? null

    if (targetOrderId != null) {
      const matchedTask = sourceTasks.find(
        (task) => String(task?.order_id ?? '') === String(targetOrderId)
      )
      if (matchedTask) return matchedTask
    }

    dispatchAction(setKanbanCardDetails(sourceTasks[0] ?? null))
    return sourceTasks[0] ?? null
  }, [allWorkflowTasks, dispatchAction, patient?.order_id, selectedOrderId])

  const statusLabel = useMemo(() => {
    const label =
      selectedTaskData?.current_workflow_status_label_name ||
      selectedTaskData?.current_status_name ||
      vsp_stepper?.order_status ||
      'Pending'

    return String(label)
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase())
  }, [
    selectedTaskData?.current_status_name,
    selectedTaskData?.current_workflow_status_label_name,
    vsp_stepper?.order_status,
  ])

  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='flex flex-col sm:flex-row items-start justify-between gap-3'>
        <div className='flex gap-3 md:gap-4'>
          <div className='flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full bg-primarySupport text-primaryColor border border-gray-200 text-lg md:text-xl font-bold'>
            {patient?.full_name?.trim()?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <PatientBasicInfoCard />
        </div>

        {isEnterprisePlanUser ? (
          <Select
            options={[
              {
                label: statusLabel,
                value: selectedTaskData?.current_workflow_status_id ?? globalStatus,
              },
            ]}
            disabled
            value={selectedTaskData?.current_workflow_status_id ?? globalStatus}
          />
        ) : (
          <StatusBadge status={globalStatus} />
        )}
      </div>

      {selectedTaskData && isEnterprisePlanUser && (
        <PatientCardDetails
          selectedTaskData={selectedTaskData}
          refreshTaskDetails={refreshTaskDetails}
          vspOrderDetails={vspOrderDetails}
        />
      )}
    </div>
  )
}

export default PatientProfileCard

const PatientBasicInfoCard = () => {
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const {permissionChecks} = useFeatureAccess()
  const patientManagementAccess = permissionChecks?.patientManagement?.patientManagement?.isEditable
  const patientInvitationAccess = permissionChecks?.patientManagement?.patientInvitation?.isViewable
  const {patientData: patient} = useSelector((state: RootState) => state.customerPatientProfile)

  return (
    <div className='flex flex-col gap-1 md:gap-1.5'>
      <div className='flex items-center gap-2'>
        <h2 className='text-lg md:text-xl font-bold text-gray-900'>{patient?.full_name}</h2>
        {patientManagementAccess && (
          <button
            onClick={() => {
              dispatchAction(
                getLeadsProfileDetails({
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                })
              )
                .unwrap()
                .then(() => {
                  navigate(`/add-patient?isEdit=${true}&patientId=${patientId}`)
                })
            }}
            className='text-gray-400 hover:text-primaryColor transition'
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600'>
        {patient?.customer_mapped_id && (
          <span>
            ID: <span className='font-medium text-gray-400'>#{patient.customer_mapped_id}</span>
          </span>
        )}
        {patient?.age != null && (
          <span>
            Age: <span className='font-medium text-gray-400'>{patient.age}yo</span>
          </span>
        )}
        {patient?.gender && (
          <span>
            Gender: <span className='font-medium text-gray-400 capitalize'>{patient.gender}</span>
          </span>
        )}
        {patient?.mobile && (
          <span className='flex items-center gap-1'>
            <PhoneIcon size={13} className='text-gray-400' />
            <span className='font-medium text-gray-400'>
              {patient.country_code ? `${patient.country_code} ` : ''}
              {patient.mobile}
            </span>
          </span>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600 font-semibold'>
        {patient?.email && patientInvitationAccess && (
          <span className='flex items-center gap-1'>
            <MailIcon size={13} className='text-gray-400' />
            <span className='font-medium text-gray-400'>{patient.email}</span>
          </span>
        )}
        {patient?.practice_location_name && patientInvitationAccess && (
          <span className='flex items-center gap-1'>
            <Building2 size={13} className='text-gray-400' />
            <span className='font-medium text-gray-400'>{patient.practice_location_name}</span>
          </span>
        )}
      </div>
    </div>
  )
}

const PatientCardDetails = ({
  selectedTaskData,
  refreshTaskDetails,
  vspOrderDetails,
}: {
  selectedTaskData: PatientTaskDetails
  refreshTaskDetails: () => void
  vspOrderDetails: RootState['vspOrders']['vspOrderDetails']
}) => {
  const {permissionChecks} = useFeatureAccess()
  const {patientData: patient} = useSelector((state: RootState) => state.customerPatientProfile)
  const assigneePermissions = permissionChecks?.patientProfileActions?.assignee
  const canViewAssignee = assigneePermissions?.isViewable ?? false
  const canEditAssignee = assigneePermissions?.isEditable ?? false

  const assigneeName = useMemo(() => {
    const raw = (selectedTaskData as any)?.assignee
    if (typeof raw !== 'string') return undefined
    const trimmed = raw.trim()
    return trimmed.length ? trimmed : undefined
  }, [selectedTaskData])

  const assigneeProfileId = useMemo(() => {
    const ids = (selectedTaskData as any)?.assignees_ids
    if (Array.isArray(ids) && ids.length > 0) {
      const parsed = safeParseInt(ids[0])
      if (parsed) return parsed
    }

    const parsedProfileId = safeParseInt((selectedTaskData as any)?.assignee_profile_id)
    if (parsedProfileId) return parsedProfileId

    const parsedAssigneeId = safeParseInt((selectedTaskData as any)?.assignee_id)
    return parsedAssigneeId || undefined
  }, [selectedTaskData])

  const customerName = patient?.customer_name ?? patient?.created_by ?? '-'
  const productName =
    vspOrderDetails?.service_product_name ??
    selectedTaskData?.product_name ??
    selectedTaskData?.service_products?.product_name ??
    '-'

  return (
    <div className='w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2'>
      <div className='grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-3 text-sm'>
        <div>
          <p className='text-[10px] font-semibold uppercase tracking-wide text-gray-500'>
            Customer
          </p>
          <p className='font-semibold text-gray-900'>{customerName}</p>
        </div>

        <div className='md:w-1/4'>
          <p className='text-[10px] font-semibold uppercase tracking-wide text-gray-500'>
            Assignee
          </p>
          {canViewAssignee ? (
            canEditAssignee ? (
              <AssigneeUserSelector
                taskId={selectedTaskData.id}
                assigneeName={assigneeName}
                assigneeProfileId={assigneeProfileId}
                onAssigned={refreshTaskDetails}
                workflowName={selectedTaskData.workflow_name}
                patientId={safeParseInt((selectedTaskData as any)?.patient_id)}
                workflowId={safeParseInt((selectedTaskData as any)?.workflow_id)}
                className='!min-w-[160px]'
              />
            ) : (
              <p className='font-semibold text-gray-900'>{assigneeName ?? '-'}</p>
            )
          ) : (
            <p className='font-semibold text-gray-900'>-</p>
          )}
        </div>

        <div>
          <p className='text-[10px] font-semibold uppercase tracking-wide text-gray-500'>Product</p>
          <p className='font-semibold text-gray-900'>{productName}</p>
        </div>
      </div>
    </div>
  )
}
