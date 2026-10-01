import {SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {Select} from 'antd'
import {MdOutlineArrowDropDown, MdOutlineArrowDropUp} from 'react-icons/md'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getNewTreatmentList,
  moveTaskCard,
  setCardDetails,
  setDynamicLabel,
  setDynamicStatus,
  setDynamicWorkflowStatusId,
  setIsOpenConfirmPlanningDoneModal,
  setIsOpenTreatmentApproveModal,
  setIsOpenTreatmentReviewModal,
  setIsOpenErrorModal,
  setIsOpenDeliverFromPackageModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import type {WorkflowStatus as WorkflowStatusType} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import cn from '@utils/cn'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {useNavigate} from 'react-router-dom'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import MoveToNeedMoreInfoModal, {NeedMoreInfoModalContext} from './MoveToNeedMoreInfoModal'
import productionStatusNameConstants from '@constants/productionStatusName.constants'
import manufacturingConstants from '@constants/manufacturing.constants'
import ConfirmMoveToPlanningDoneState from '../actionModals/ConfirmMoveToPlanningDoneState'
import {updateCurrentStep} from 'redux/Slices/AppSlice/orders/orders.slice'

const isProductionOutSourceWorkflowName = (name?: string | null) => {
  if (!name) return false
  const normalized = name.trim().toLowerCase()
  return normalized === 'production outsourced' || normalized === 'production outsource'
}

type RawStatus = Partial<WorkflowStatusType> & {
  workflow_status_id?: number | string | null
}

type SelectorOption = {
  value: number
  label: string
  internal_name: string
  order: number
  name: string
}

type WorkflowStatusSelectorProps = {
  taskId?: number | string | null
  patientId?: number | string | null
  workflowId?: number | string | null
  workflowName?: string | null
  currentStatusId?: number | string | null
  currentStatusLabel?: string | null
  statuses?: RawStatus[]
  className?: string
  placeholder?: string
  onStatusChange?: (nextStatusId: number) => void
  onNeedInformationSelected?: (context: NeedMoreInfoModalContext) => void
  onRevisionSelected?: (context: NeedMoreInfoModalContext) => void
  onApprovedSelected?: (context: NeedMoreInfoModalContext) => void
  onManufacturingAction?: (
    type: (typeof productionStatusNameConstants)[keyof typeof productionStatusNameConstants],
    context: NeedMoreInfoModalContext & {taskDetails?: any}
  ) => void
  taskDetails?: any
  redirectToVspCreateOrderOnReadyForPlanning?: boolean
}

const toValidNumber = (value: number | string | null | undefined): number | undefined => {
  if (value === null || value === undefined) return undefined
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed > 0) return parsed
  return undefined
}

const normalizeLabel = (label?: string | null) => (label || '').trim().toLowerCase()

const isNeedInformationLabel = (label?: string | null) => {
  if (!label) return false
  const normalized = label
    .replace(/[_\s]+/g, ' ')
    .trim()
    .toLowerCase()
  return normalized === 'need information'
}

const isRevisionLabel = (label?: string | null) => {
  if (!label) return false
  const normalized = label
    .replace(/[_\s]+/g, ' ')
    .trim()
    .toLowerCase()
  return normalized === 'in revision'
}

const isApprovedLabel = (label?: string | null) => {
  if (!label) return false
  const normalized = label
    .replace(/[_\s]+/g, ' ')
    .trim()
    .toLowerCase()
  return normalized === 'approved'
}

const isPackagedLabel = (label?: string | null) => {
  if (!label) return false

  const normalized = label
    .replace(/[_\s]+/g, ' ')
    .trim()
    .toLowerCase()
  return normalized === 'packaged'
}

const isShippedLabel = (label?: string | null) => {
  if (!label) return false
  const normalized = label
    .replace(/[_\s]+/g, ' ')
    .trim()
    .toLowerCase()
  return normalized === 'shipped'
}

const isDeliveredLabel = (label?: string | null) => {
  if (!label) return false
  const normalized = label
    .replace(/[_\s]+/g, ' ')
    .trim()
    .toLowerCase()
  return normalized === 'delivered'
}

const isPlanningDoneLabel = (label?: string | null) => {
  if (!label) return false
  const normalized = label
    .replace(/[_\s]+/g, ' ')
    .trim()
    .toLowerCase()
  return normalized === 'planning done'
}

const isReadyForPlanningLabel = (label?: string | null) => {
  if (!label) return false
  const normalized = label
    .replace(/[_\s]+/g, ' ')
    .trim()
    .toLowerCase()
  return normalized === 'ready for planning'
}

const WorkflowStatusSelector = ({
  taskId,
  patientId,
  workflowId,
  workflowName,
  currentStatusId,
  currentStatusLabel,
  statuses,
  className,
  placeholder = 'Select status',
  onStatusChange,
  onNeedInformationSelected,
  onRevisionSelected,
  onApprovedSelected,
  onManufacturingAction,
  taskDetails,
  redirectToVspCreateOrderOnReadyForPlanning = false,
}: WorkflowStatusSelectorProps) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {newWorkFlowData} = useSelector((state: RootState) => state.workFlow)
  const {cardDetails, isOpenConfirmPlanningDoneModal} = useSelector(
    (state: RootState) => state.kanban
  )
  const [selectOpen, setSelectOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>(() =>
    toValidNumber(currentStatusId)
  )
  const [selectedStatusLabel, setSelectedStatusLabel] = useState<string | undefined>(() =>
    typeof currentStatusLabel === 'string' ? currentStatusLabel : undefined
  )
  const [needInfoContext, setNeedInfoContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [needInfoModalOpen, setNeedInfoModalOpen] = useState(false)
  const navigate = useNavigate()
  const {permissionChecks} = useFeatureAccess()
  const taskMovementPermissions = permissionChecks?.workflowActions
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const hasPendingApprovalPlan = useCallback(
    async (patient?: number, doctor?: number) => {
      if (!patient || !doctor) return false
      try {
        const response = await dispatchAction(
          getNewTreatmentList({
            patient_id: patient,
            doctor_id: doctor,
            treatment_subtype: 'ALIGNERS',
            order_id: null,
          } as any)
        ).unwrap()

        const plans = Array.isArray(response?.plans_list) ? response.plans_list : []
        return plans.some((plan: any) => {
          const initiatorStatus = String(plan?.initiator_status ?? '').toUpperCase()
          const approverStatus = String(plan?.approver_status ?? '').toUpperCase()
          return initiatorStatus === 'SENT_FOR_APPROVAL' && approverStatus === 'PENDING_APPROVAL'
        })
      } catch (error) {
        return false
      }
    },
    [dispatchAction]
  )

  const derivedStatuses: RawStatus[] = useMemo(() => {
    if (Array.isArray(statuses) && statuses.length) return statuses

    const workflowEntries = Array.isArray(newWorkFlowData)
      ? newWorkFlowData
      : newWorkFlowData
        ? [newWorkFlowData]
        : []

    if (!workflowEntries.length) return []

    const matchedById =
      workflowEntries.find((wf: any) => {
        const wfId = toValidNumber(wf?.id ?? wf?.workflow_id)
        const normalizedWorkflowId = toValidNumber(workflowId)
        return normalizedWorkflowId && wfId === normalizedWorkflowId
      }) ?? null

    if (matchedById?.statuses?.length) {
      return matchedById.statuses as RawStatus[]
    }

    if (workflowName) {
      const lowerName = workflowName.toLowerCase()
      const byName =
        workflowEntries.find(
          (wf: any) => typeof wf?.name === 'string' && wf.name.toLowerCase() === lowerName
        ) ?? null
      if (byName?.statuses?.length) return byName.statuses as RawStatus[]
    }

    return (workflowEntries[0]?.statuses ?? []) as RawStatus[]
  }, [statuses, newWorkFlowData, workflowId, workflowName])

  const statusOptions: SelectorOption[] = useMemo(() => {
    return (derivedStatuses ?? [])
      .map((status) => {
        const value = toValidNumber(status?.id ?? status?.workflow_status_id)
        if (!value) return null
        const rawLabel = status.label_name ?? status.name
        const label = String(rawLabel ?? '').trim().toUpperCase()
        if (!label) return null
        const order = toValidNumber(status.position)
        const internal_name = status.internal_name
        const name = status.name
        return {value, label, order, internal_name, name}
      })
      .filter((option): option is SelectorOption => option !== null)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(({value, label, order, internal_name, name}) => ({
        value,
        label,
        order,
        internal_name,
        name,
      }))
  }, [derivedStatuses])

  const computeInitialValue = useCallback(
    (options: SelectorOption[]): number | undefined => {
      const parsedId = toValidNumber(currentStatusId)
      if (parsedId) return parsedId
      const normalizedLabel = normalizeLabel(currentStatusLabel)
      if (normalizedLabel) {
        const found = options.find((opt) => normalizeLabel(opt.label) === normalizedLabel)
        if (found) return found.value
      }
      return undefined
    },
    [currentStatusId, currentStatusLabel]
  )

  useEffect(() => {
    const initialValue = computeInitialValue(statusOptions)
    setSelectedStatusId(initialValue)
    const initialLabel =
      statusOptions.find((option) => option.value === initialValue)?.label ||
      (typeof currentStatusLabel === 'string' ? currentStatusLabel : undefined)
    setSelectedStatusLabel(initialLabel)
  }, [statusOptions, computeInitialValue, currentStatusLabel])

  useEffect(() => {
    if (!selectedStatusId) return
    const matchingOption = statusOptions.find((option) => option.value === selectedStatusId)
    if (matchingOption && matchingOption.label !== selectedStatusLabel) {
      setSelectedStatusLabel(matchingOption.label)
    }
  }, [statusOptions, selectedStatusId, selectedStatusLabel])

  const applyManufacturingModalContext = useCallback(
    (label?: string | null, nextStatusId?: number) => {
      if (!taskDetails) return
      const resolvedLabel = label ?? ''
      dispatchAction(setCardDetails(taskDetails))
      dispatchAction(setDynamicLabel(resolvedLabel))
      dispatchAction(setDynamicStatus(resolvedLabel))
      dispatchAction(setDynamicWorkflowStatusId(nextStatusId ?? null))
    },
    [dispatchAction, taskDetails]
  )

  const handleStatusChange = async (
    nextValue: number,
    option: SelectorOption | SelectorOption[]
  ) => {
    const nextStatusId = toValidNumber(nextValue)
    const parsedTaskId = toValidNumber(taskId)
    const parsedPatientId = toValidNumber(patientId)
    const parsedWorkflowId = toValidNumber(workflowId)
    const parsedDoctorId = toValidNumber(userId as any)
    const selectedOption = Array.isArray(option) ? option[0] : option
    const nextStatusLabel = selectedOption?.label
    const nextStatusInternalName = selectedOption?.internal_name
    const nextStatusName = selectedOption?.name
    const previousStatusId = selectedStatusId
    const labelForSelection = nextStatusLabel ?? ''
    dispatchAction(setDynamicLabel(labelForSelection))
    dispatchAction(setDynamicStatus(labelForSelection))
    if (taskDetails) {
      dispatchAction(setCardDetails(taskDetails))
    }

    const handleErrorCode = (code?: string | null, message?: string) => {
      const normalizedCode =
        typeof code === 'number' ? String(code) : typeof code === 'string' ? code.trim() : ''
      if (!normalizedCode) return false

      const resolvedMessage = message

      switch (normalizedCode.toUpperCase()) {
        case 'GE0001': {
          const allowed =
            taskMovementPermissions?.allowMovingToPlanningPlansOutsourcedBoard?.isViewable
          if (!allowed) {
            ErrorToast('You do not have permission to move this batch to Planning.')
            return true
          }
          if (parsedPatientId) {
            navigate(`/planning-setup-stepper/${parsedPatientId}`)
          }
          return true
        }
        case 'WF005': {
          const allowed =
            taskMovementPermissions?.allowMovingToProductionProductionOutsourcedBoard?.isViewable
          if (!allowed) {
            ErrorToast('You do not have permission to move this batch to Production.')
            return true
          }
          if (parsedPatientId) {
            navigate(`/production-setup-stepper/${parsedPatientId}`)
          }
          return true
        }
        case 'WF002':
        case 'WF011':
        case 'WF012':
        case 'WF013': {
          dispatchAction(
            setIsOpenTreatmentReviewModal({
              isOpen: true,
              error: resolvedMessage,
            })
          )
          return true
        }
        case 'WF009': {
          dispatchAction(setIsOpenTreatmentApproveModal(true))
          return true
        }
        default:
          return false
      }
    }

    if (
      !nextStatusId ||
      nextStatusId === selectedStatusId ||
      !parsedTaskId ||
      !parsedPatientId ||
      !parsedWorkflowId ||
      !parsedDoctorId
    ) {
      return
    }

    const latestStatus =
      taskDetails?.manufacturing_batch_response?.latest_batch_manufacturing_status
    const isManufacturingAction =
      isPackagedLabel(nextStatusName) ||
      isShippedLabel(nextStatusName) ||
      isDeliveredLabel(nextStatusName)
    const isProductionOutSourceFlow = isProductionOutSourceWorkflowName(workflowName)

    const isPlanningOrder =
      taskDetails?.task_order_type === 'PLANNING_ORDER' || serviceConfig?.PLANNING
    const isPlanningDoneNext =
      isPlanningDoneLabel(nextStatusName) || isPlanningDoneLabel(nextStatusLabel)
    const isPlanningDoneCurrent =
      isPlanningDoneLabel(currentStatusLabel) ||
      isPlanningDoneLabel(taskDetails?.current_status_name)

    if (isPlanningOrder && isPlanningDoneCurrent && !isPlanningDoneNext) {
      dispatchAction(
        setIsOpenErrorModal({
          isOpen: true,
          text: `This case has already progressed beyond ${labelForSelection}. Moving backwards is not allowed once a case has advanced to a later stage.`,
          showText: true,
        })
      )
      return
    }

    if (
      nextStatusName === 'Approved' &&
      taskDetails?.task_order_type === 'PLANNING_ORDER' &&
      serviceConfig?.PLANNING
    ) {
      ErrorToast(`You do not have permission to move this batch to ${nextStatusName}.`)
      return
    }

    if (nextStatusName === 'Planning Done' && taskDetails?.task_order_type === 'PLANNING_ORDER') {
      dispatchAction(setDynamicWorkflowStatusId(nextStatusId ?? null))
      dispatchAction(setIsOpenConfirmPlanningDoneModal(true))
      return
    }

    if (isProductionOutSourceFlow) {
      if (!isManufacturingAction && latestStatus === manufacturingConstants.DELIVERED) {
        dispatchAction(
          setIsOpenErrorModal({
            isOpen: true,
            text: 'This case has already been delivered',
            showText: true,
          })
        )
        return
      }

      const labelForErrors = nextStatusLabel ?? ''

      // Prevent backwards moves when already delivered
      if (
        normalizeLabel(nextStatusName) === 'in progress' &&
        (latestStatus === manufacturingConstants.COMPLETED ||
          latestStatus === manufacturingConstants.DELIVERED ||
          latestStatus === manufacturingConstants.SHIPPED)
      ) {
        dispatchAction(
          setIsOpenErrorModal({
            isOpen: true,
            text: `This case has already progressed beyond ${labelForErrors}. Moving backwards is not allowed once a case has advanced to a later stage.`,
            showText: true,
          })
        )
        return
      }

      if (
        isShippedLabel(nextStatusName) &&
        (latestStatus === manufacturingConstants.DELIVERED ||
          latestStatus === manufacturingConstants.SHIPPED)
      ) {
        dispatchAction(
          setIsOpenErrorModal({
            isOpen: true,
            text: `This case has already progressed beyond ${labelForErrors}. Moving backwards is not allowed once a case has advanced to a later stage.`,
            showText: true,
          })
        )
        return
      }

      if (
        isShippedLabel(nextStatusName) &&
        (latestStatus === manufacturingConstants.COMPLETED ||
          latestStatus === manufacturingConstants.MANUFACTURING_STARTED)
      ) {
        dispatchAction(
          setIsOpenErrorModal({
            isOpen: true,
            text: 'This status can only be updated by the Lab. You’ll be notified once the Lab takes an action.',
            showText: false,
          })
        )
        return
      }

      if (
        isDeliveredLabel(nextStatusName) &&
        (latestStatus === manufacturingConstants.MANUFACTURING_STARTED ||
          latestStatus === manufacturingConstants.COMPLETED)
      ) {
        dispatchAction(
          setIsOpenErrorModal({
            isOpen: true,
            text: 'This status can only be updated by the Lab. You’ll be notified once the Lab takes an action.',
            showText: false,
          })
        )
        return
      }

      if (isDeliveredLabel(nextStatusName) && latestStatus === manufacturingConstants.SHIPPED) {
        applyManufacturingModalContext(nextStatusLabel, nextStatusId)
        dispatchAction(setIsOpenDeliverFromPackageModal(true))
        return
      }
    }

    if (isNeedInformationLabel(nextStatusInternalName)) {
      const contextPayload: NeedMoreInfoModalContext = {
        taskId: parsedTaskId,
        patientId: parsedPatientId,
        workflowId: parsedWorkflowId,
        workflowName,
        previousStatusId,
        nextStatusId,
        label: nextStatusLabel,
      }

      if (onNeedInformationSelected) {
        onNeedInformationSelected(contextPayload)
      } else {
        setNeedInfoContext(contextPayload)
      }

      return
    }

    if (isRevisionLabel(nextStatusInternalName) && onRevisionSelected) {
      const hasPendingPlan = await hasPendingApprovalPlan(parsedPatientId, parsedDoctorId)
      if (hasPendingPlan) {
        onRevisionSelected({
          taskId: parsedTaskId,
          patientId: parsedPatientId,
          workflowId: parsedWorkflowId,
          workflowName,
          previousStatusId,
          nextStatusId,
          label: nextStatusLabel,
        })
        return
      }
    }

    if (isApprovedLabel(nextStatusInternalName) && onApprovedSelected) {
      const hasPendingPlan = await hasPendingApprovalPlan(parsedPatientId, parsedDoctorId)
      if (hasPendingPlan) {
        onApprovedSelected({
          taskId: parsedTaskId,
          patientId: parsedPatientId,
          workflowId: parsedWorkflowId,
          workflowName,
          previousStatusId,
          nextStatusId,
          label: nextStatusLabel,
        })
        return
      }
    }

    if (onManufacturingAction) {
      const manufacturingContext: NeedMoreInfoModalContext & {taskDetails?: any} = {
        taskId: parsedTaskId,
        patientId: parsedPatientId,
        workflowId: parsedWorkflowId,
        workflowName,
        previousStatusId,
        nextStatusId,
        label: nextStatusLabel,
        taskDetails,
      }

      if (isPackagedLabel(nextStatusName)) {
        onManufacturingAction(productionStatusNameConstants.PACKAGED, manufacturingContext)
        return
      }
      if (isShippedLabel(nextStatusName)) {
        onManufacturingAction(productionStatusNameConstants.SHIPPED, manufacturingContext)
        return
      }
      if (isDeliveredLabel(nextStatusName)) {
        onManufacturingAction(productionStatusNameConstants.DELIVERED, manufacturingContext)
        return
      }
    }

    try {
      setUpdating(true)
      await dispatchAction(
        moveTaskCard({
          task_id: parsedTaskId,
          doctor_id: parsedDoctorId,
          workflow_status_id: nextStatusId,
          patient_id: parsedPatientId,
          workflow_id: parsedWorkflowId,
          is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
        })
      ).unwrap()

      setSelectedStatusId(nextStatusId)
      setSelectedStatusLabel(labelForSelection || selectedOption?.label || undefined)
      SuccessToast('Workflow status updated')

      onStatusChange?.(nextStatusId)

      const shouldRedirectToVspCreateOrder =
        redirectToVspCreateOrderOnReadyForPlanning &&
        serviceConfig?.VSP_PLANNING &&
        parsedPatientId &&
        (isReadyForPlanningLabel(nextStatusName) || isReadyForPlanningLabel(nextStatusLabel))

      if (shouldRedirectToVspCreateOrder) {
        dispatchAction(updateCurrentStep(0))
        navigate(`/vsp/create-order?patient_id=${parsedPatientId}`, {
          state: {patientId: parsedPatientId, fromProfile: true},
        })
      }
    } catch (error: any) {
      const fallbackLabel = nextStatusLabel ?? currentStatusLabel ?? ''
      dispatchAction(setDynamicLabel(fallbackLabel))
      dispatchAction(setDynamicStatus(fallbackLabel))
      if (taskDetails) {
        dispatchAction(setCardDetails(taskDetails))
      }
      const errorCode = error?.error_code ?? error?.response?.data?.error_code
      const fallbackMessage =
        error?.message || error?.response?.data?.message || 'Failed to update workflow status'

      const errorHandled = handleErrorCode(errorCode, fallbackMessage)
      if (!errorHandled) {
        ErrorToast(fallbackMessage)
      }
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (!onNeedInformationSelected && needInfoContext) {
      setNeedInfoModalOpen(true)
    }
  }, [needInfoContext, onNeedInformationSelected])

  const stopPropagation = (event: SyntheticEvent) => {
    event.stopPropagation()
  }

  const handleNeedInfoModalClose = () => {
    setNeedInfoModalOpen(false)
    setNeedInfoContext(null)
  }

  const handleNeedInfoModalSubmitted = (context?: NeedMoreInfoModalContext | null) => {
    const sourceContext = context ?? needInfoContext
    const parsedStatusId = toValidNumber(sourceContext?.nextStatusId)
    if (!parsedStatusId) return
    setSelectedStatusId(parsedStatusId)
    setSelectedStatusLabel(sourceContext?.label || undefined)
    SuccessToast('Workflow status updated')
    onStatusChange?.(parsedStatusId)
  }

  const selectedOption = useMemo(
    () => statusOptions.find((option) => option.value === selectedStatusId) ?? null,
    [statusOptions, selectedStatusId]
  )

  const selectValue =
    selectedStatusId && (selectedOption || selectedStatusLabel)
      ? {
          value: selectedStatusId,
          label: selectedStatusLabel || selectedOption?.label || '',
        }
      : undefined
  const shouldRenderConfirmPlanningDoneModal =
    isOpenConfirmPlanningDoneModal && toValidNumber(taskId) === toValidNumber(cardDetails?.id)

  return (
    <>
      <div onClick={stopPropagation} onMouseDown={stopPropagation} onKeyDown={stopPropagation}>
        <Select
          value={selectValue as any}
          labelInValue
          placeholder={placeholder}
          loading={updating}
          options={statusOptions}
          optionFilterProp='label'
          onChange={(value, option) =>
            handleStatusChange(
              (value as {value: number; label: string})?.value ?? (value as number),
              option as SelectorOption
            )
          }
          size='middle'
          notFoundContent='No statuses available'
          listHeight={260}
          popupRender={(menu) => <div className='max-h-[280px] overflow-y-auto'>{menu}</div>}
          onOpenChange={setSelectOpen}
          getPopupContainer={() => document.body}
          className={cn(
            '!min-w-[140px] !p-0 !m-0 !text-sm !font-medium',
            '[&_.ant-select-selector]:!border-1',
            '[&_.ant-select-selector]:!border [&_.ant-select-selector]:!border-mediumGray',
            'hover:[&_.ant-select-selector]:!border-primaryColor',

            '[&_.ant-select-selector]:!shadow-none',
            '[&_.ant-select-selector]:!rounded-md',
            '[&_.ant-select-selector]:!px-3',
            '[&_.ant-select-selector]:!py-1',
            '[&_.ant-select-selector]:hover:!bg-primarySupport',

            '[&_.ant-select-selection-item]:!text-black',
            '[&_.ant-select-selection-placeholder]:!text-gray-500',
            className
          )}
          styles={{
            popup: {
              root: {padding: 0},
            },
          }}
          suffixIcon={
            selectOpen ? (
              <MdOutlineArrowDropUp className='w-5 h-5 text-black' />
            ) : (
              <MdOutlineArrowDropDown className='w-5 h-5 text-black' />
            )
          }
        />
      </div>

      {!onNeedInformationSelected && needInfoContext && (
        <MoveToNeedMoreInfoModal
          open={needInfoModalOpen}
          context={needInfoContext}
          onClose={handleNeedInfoModalClose}
          onSubmitted={handleNeedInfoModalSubmitted}
        />
      )}

      {shouldRenderConfirmPlanningDoneModal && <ConfirmMoveToPlanningDoneState />}
    </>
  )
}

export default WorkflowStatusSelector
