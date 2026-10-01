import {useState, useRef, useEffect, useContext, useMemo} from 'react'
import {SectionItem as PddSectionItem} from './TaskItems.pdd'
type UniqueIdentifier = string

// Local arrayMove helper (non-mutating)
function arrayMoveLocal<T>(arr: T[], from: number, to: number): T[] {
  if (from === to) return arr
  const copy = arr.slice()
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

import type {ColumnType} from '../types'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  clearCardDetails,
  getNewTreatmentList,
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  setCardDetails,
  setDynamicLabel,
  setDynamicStatus,
  setDynamicWorkflowStatusId,
  setIsOpenConfirmPlanningDoneModal,
  setIsOpenDeliverFromPackageModal,
  setIsOpenErrorModal,
  setIsOpenManufacturingCompleteModal,
  setIsOpenNeedMoreIfoModal,
  setIsOpenShippingOrderModal,
  setIsOpenTreatmentApprovedModal,
  setIsOpenTreatmentApproveModal,
  setIsOpenTreatmentReviewModal,
  setIsOpenTreatmentRevisionModal,
  setIsVspKanbanMovement,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import MoveToPlanningState from '../actionModals/MoveToPlanningState'
import {useDispatch, useSelector} from 'react-redux'
import MoveToNeedMoreInfoState from '../actionModals/MoveToNeedMoreInfoState'
import MoveToTreatmentReviewState from '../actionModals/MoveToTreatmentReviewState'
import MoveToTreatmentApproveState from '../actionModals/MoveToTreatmentApproveState'
import MoveToTreatmentRevisionState from '../actionModals/MoveToTreatmentRevisionState'
import MoveToCompleteManufacturingState from '../actionModals/MoveToCompleteManufacturingState'
import MoveToShippingState from '../actionModals/MoveToShippingState'
import MoveToDeliverState from '../actionModals/MoveToDeliverState'
import ErrorState from '../actionModals/ErrorState'
import MoveToDeliverFromPackageState from '../actionModals/MoveToDeliverFromPackageState'
import debounce from 'lodash.debounce'
import {CardConfigurationField} from 'screens/settings/cardDisplay/CardDisplayPage'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import SelectPlansForApprovedModal from '../actionModals/MoveToTreatmentApprovedStateNew'
import {RootState} from 'redux/store'
import ConfirmMoveToPlanningDoneState from '../actionModals/ConfirmMoveToPlanningDoneState'
import {updateCurrentStep} from 'redux/Slices/AppSlice/orders/orders.slice'

const perfNow = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

export type ColumnWithCount = ColumnType & {count?: number}

export const Tasks = ({
  tasks,
  columns,
  headers,
  visibleByStatus,
  onColumnEndVisible,
  cardConfiguration,
}: {
  tasks: any[]
  columns: ColumnWithCount[]
  headers: any[]
  visibleByStatus?: Record<string, number>
  onColumnEndVisible?: (statusName: string, loadedCountInThisColumn: number) => void
  cardConfiguration?: CardConfigurationField[]
}) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const [items, setItems] = useState<Record<string, string[]>>({})
  const [containers, setContainers] = useState<string[]>([])
  const clonedItemsRef = useRef<Record<string, string[]> | null>(null)
  const navigate = useNavigate()

  const {permissionChecks} = useFeatureAccess()
  const taskMovementPermissions = permissionChecks?.workflowActions
  const [searchParams] = useSearchParams()
  const selectedSubWorkflow = searchParams.get('workFlow') || undefined
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {
    isOpenMoveToPlanningStateModal,
    isOpenNeedMoreIfoModal,
    isOpenTreatmentReviewModal,
    isOpenTreatmentApproveModal,
    isOpenTreatmentRevisionModal,
    isOpenManufacturingCompleteModal,
    isOpenShippingOrderModal,
    isOpenDeliveredOrderModal,
    isOpenErrorModal,
    isOpenDeliverFromPackageModal,
    isOpenTreatmentApprovedModal,
    isOpenConfirmPlanningDoneModal,
  } = useSelector((state: RootState) => state.kanban)

  const emitFilterChanged = useMemo(
    () =>
      debounce((detail: any) => {
        try {
          window.dispatchEvent(new CustomEvent('kanban:filterChanged', {detail}))
        } catch {}
      }, 300),
    []
  )
  useEffect(() => () => (emitFilterChanged as any)?.cancel?.(), [emitFilterChanged])

  const dynamicColumns = useMemo(() => {
    const sorted = [...headers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    return sorted.map((h) => ({
      id: h.id,
      name: h.label_name,
      order: h.position,
      color: h.color,
      custom: h.custom,
    }))
  }, [headers])

  const dynamicColumnsLabel = useMemo(() => {
    const sorted = [...headers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    return sorted.map((h) => ({
      id: h.id,
      name: h.name,
      order: h.position,
      color: h.color,
      custom: h.custom,
    }))
  }, [headers])

  const headerIdToName = useMemo(() => {
    const m = new Map<number, string>()
    dynamicColumns.forEach((h) => m.set(h.id, h.name))
    return m
  }, [dynamicColumns])

  const labelToCustom = useMemo(() => {
    const m = new Map<string, boolean>()
    dynamicColumnsLabel.forEach((h) => m.set(String(h.name).trim(), !!h.custom))
    return m
  }, [dynamicColumnsLabel])

  const headerIdToLabel = useMemo(() => {
    const m = new Map<number, string>()
    dynamicColumnsLabel.forEach((h) => m.set(h.id, h.name))
    return m
  }, [dynamicColumnsLabel])

  const columnCountByName = useMemo(() => {
    const m = new Map<string, number>()
    columns?.forEach((c) => m.set(c.name, (c as any).count ?? 0))
    return m
  }, [columns])

  const isCustomByLabel = useMemo(
    () =>
      (label: string | null | undefined): boolean => {
        if (!label) return false
        return !!labelToCustom.get(String(label).trim())
      },
    [labelToCustom]
  )

  // Initial mount / whenever tasks or dynamicColumns change → normalize into columns map
  useEffect(() => {
    const normalizedTasks = Array.isArray(tasks)
      ? tasks.map((t) => ({
          ...t,
          current_workflow_status_id:
            t.current_workflow_status_id != null
              ? t.current_workflow_status_id
              : dynamicColumns[0]?.id || 0,
        }))
      : []

    const cols: Record<string, string[]> = {}
    dynamicColumns.forEach((col) => (cols['column-' + col.id] = []))

    normalizedTasks.forEach((task) => {
      const key = 'column-' + task.current_workflow_status_id
      if (key in cols) cols[key].push('task-' + task.id)
      else {
        const first = dynamicColumns[0]?.id
        if (first != null) cols['column-' + first].push('task-' + task.id)
      }
    })

    setItems(cols)
    setContainers(Object.keys(cols))
  }, [tasks, dynamicColumns])

  // ---------- generic helpers ----------
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) return id as string
    return containers.find((key) => items[key]?.includes(id as string))
  }

  const getLabelByContainer = (containerId: string | undefined): string | null => {
    if (!containerId) return null
    const num = Number(containerId.replace('column-', ''))
    return headerIdToLabel.get(num) ?? null
  }

  const getLabelNameByContainer = (containerId: string | undefined): string | null => {
    if (!containerId) return null
    const num = Number(containerId.replace('column-', ''))
    return headerIdToName.get(num) ?? null
  }
  const workflowStatusIdFromContainer = (containerId: string | undefined): number => {
    if (!containerId) return 0
    return safeParseInt(containerId.split('-').pop())
  }

  const refreshBoard = (workflowName: string) =>
    dispatchAction(
      getPatientTaskTrackerFiltered({
        doctor_id: safeParseInt(userId),
        order_type: 'ALIGNER',
        workflow_name: workflowName,
        page_number: 0,
        page_size: 10,
        sort:'UPDATED_ON',
        "order": "DESC"
      })
    )

  const moveAndRefresh = async (draggedTask: any, overContainer: string) => {
    await dispatchAction(
      moveTaskCard({
        task_id: safeParseInt(draggedTask?.id),
        doctor_id: safeParseInt(userId),
        workflow_status_id: workflowStatusIdFromContainer(overContainer),
        patient_id: safeParseInt(draggedTask?.patient_id),
        workflow_id: safeParseInt(draggedTask?.workflow_id),
        is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
      })
    ).unwrap()
    await refreshBoard(draggedTask.workflow_name)
  }

  const openError = (text: string, showText: boolean) =>
    dispatch(
      setIsOpenErrorModal({
        isOpen: true,
        text,
        showText: showText,
      })
    )

  const isProductionWorkflow = (name?: string) => name === 'Production In House'

  const isProductionOutsourcedWorkflow = (name?: string) =>
    name === 'Production Outsourced' || name === 'Production Outsource'

  const getProductionStageRank = (label?: string | null) => {
    const normalized = String(label || '')
      .trim()
      .toLowerCase()

    switch (normalized) {
      case 'to do':
        return 0
      case 'in progress':
        return 1
      case 'packaged':
        return 2
      case 'shipped':
        return 3
      case 'delivered':
        return 4
      default:
        return null
    }
  }
  // ---------- drag handlers ----------
  function handleDragStartPDD() {
    clonedItemsRef.current = Object.fromEntries(
      Object.entries(items).map(([k, arr]) => [k, arr.map(String)])
    )
  }

  function handleCardDropPDD({
    activeId: draggedId,
    overId,
    edge,
  }: {
    activeId: string
    overId: string
    edge?: 'top' | 'bottom'
  }) {
    if (!draggedId || !overId) return

    const draggedTask = tasks.find((d: any) => 'task-' + d.id === draggedId) ?? null
    if (!draggedTask) return

    dispatch(clearCardDetails())
    if (!hasPermissionsToMove(selectedSubWorkflow)) {
      ErrorToast('You do not have permission to move tasks in this workflow.')
      return
    }
    // containers
    const activeContainer = findContainer(draggedId)
    const overContainer = findContainer(overId)
    if (!activeContainer || !overContainer) return

    // --- destination metadata (label/name/custom) ---
    const resultLabel = getLabelByContainer(overContainer)
    const resultName = getLabelNameByContainer(overContainer)
    const targetIsCustom = isCustomByLabel(resultLabel)

    if (
      !taskMovementPermissions?.allowMovingToNeedMoreInformation?.isViewable &&
      resultLabel === 'Need Information'
    ) {
      ErrorToast(`You do not have permission to move this batch to ${resultLabel}.`)
      return
    }
    if (
      !taskMovementPermissions?.allowRequestingRevision?.isViewable &&
      resultLabel === 'In Revision'
    ) {
      ErrorToast(`You do not have permission to move this batch to  ${resultLabel}.`)
      return
    }

    const targetWorkflowStatusId = workflowStatusIdFromContainer(overContainer)
    dispatch(setDynamicLabel(resultName || ''))
    dispatch(setDynamicStatus(resultLabel || ''))
    dispatch(setDynamicWorkflowStatusId(targetWorkflowStatusId || null))
    const inProductionFlows =
      isProductionWorkflow(draggedTask?.workflow_name) ||
      isProductionOutsourcedWorkflow(draggedTask?.workflow_name)

    let targetIndex: number
    if (!(overId in items)) {
      const overList = items[overContainer] ?? []
      const overIndex = overList.indexOf(overId)
      const modifier = edge === 'bottom' ? 1 : 0
      targetIndex = overIndex >= 0 ? overIndex + modifier : overList.length
    } else {
      targetIndex = (items[overContainer] ?? []).length
    }

    // local reorder
    setItems((prev) => {
      const next = {...prev}
      if (activeContainer === overContainer) {
        const currentIndex = next[activeContainer].indexOf(draggedId)
        if (currentIndex !== targetIndex) {
          next[activeContainer] = arrayMoveLocal(next[activeContainer], currentIndex, targetIndex)
        }
      } else {
        next[activeContainer] = next[activeContainer].filter((v) => v !== draggedId)
        const over = next[overContainer]
        next[overContainer] = [...over.slice(0, targetIndex), draggedId, ...over.slice(targetIndex)]
      }
      return next
    })

    try {
      const originalContainer = clonedItemsRef.current
        ? Object.keys(clonedItemsRef.current).find((k) =>
            clonedItemsRef.current![k].includes(draggedId as string)
          )
        : undefined
      const fromIndex = originalContainer
        ? clonedItemsRef.current![originalContainer].indexOf(draggedId as string)
        : (items[activeContainer] ?? []).indexOf(draggedId as string)
      const toIndex = (items[overContainer] ?? []).indexOf(overId as string)

      const detail = {
        task: draggedTask,
        from: {container: originalContainer ?? activeContainer, index: fromIndex},
        to: {
          container: overContainer,
          index:
            toIndex >= 0
              ? toIndex + (edge === 'bottom' ? 1 : 0)
              : (items[overContainer] ?? []).length,
        },
      }
      window.dispatchEvent(new CustomEvent('kanban:taskMoved', {detail}))
    } catch {}

    // persist card details
    dispatchAction(
      setCardDetails({
        id: draggedTask?.id,
        patient_id: draggedTask?.patient_id,
        patient_name: draggedTask?.patient_name,
        org_id: draggedTask?.org_id,
        workflow_id: draggedTask?.workflow_id,
        workflow_name: draggedTask?.workflow_name,
        current_workflow_status_id: draggedTask?.current_workflow_status_id,
        current_status_name: draggedTask?.current_status_name,
        previous_workflow_status_id: draggedTask?.previous_workflow_status_id,
        gender: draggedTask?.gender,
        age: draggedTask?.age,
        created_by: draggedTask?.created_by,
        created_on: draggedTask?.created_on,
        product: draggedTask?.product,
        follow_up_date: draggedTask?.follow_up_date,
        case_type: draggedTask?.case_type,
        assignee: draggedTask?.assignee,
        clinic: draggedTask?.clinic,
        created_for_profile_id: draggedTask?.created_for_profile_id,
        created_for_profile_name: draggedTask?.created_for_profile_name,
        order_type: draggedTask?.order_type,
        priority_level: draggedTask?.priority_level,
        practice_name: draggedTask?.practice_name,
        comments_count: draggedTask?.comments_count,
        labels: draggedTask?.labels,
        linked_plans: draggedTask?.linked_plans,
        linked_batch_details: draggedTask?.linked_batch_details,
        is_active: draggedTask?.is_active,
        is_archived: draggedTask?.is_archived,
        completion_date: draggedTask?.completion_date,
        estimated_completion_date: draggedTask?.estimated_completion_date,
        sequence_number: draggedTask?.sequence_number,
        workflow_position: draggedTask?.workflow_position,
        parent_task_id: draggedTask?.parent_task_id,
        order_id: draggedTask?.order_id,
        manufacturing_batch_id: draggedTask?.manufacturing_batch_id,
        task_type: draggedTask?.task_type,
        task_created_for: draggedTask?.task_created_for,
        service_products: draggedTask?.service_products,
        result: resultLabel,
        manufacturing_batch_response: draggedTask?.manufacturing_batch_response,
      })
    )

    if (
      draggedTask?.current_status_name === 'Planning Done' &&
      (draggedTask?.task_order_type === 'PLANNING_ORDER' ||
        serviceConfig?.PLANNING ||
        serviceConfig?.VSP_PLANNING)
    ) {
      openError(
        `This case has already progressed beyond  ${resultName}. Moving backwards is not allowed once a case has advanced to a later stage.`,
        true
      )
      return
    }

    if (
      resultLabel === 'Approved' &&
      draggedTask?.task_order_type === 'PLANNING_ORDER' &&
      serviceConfig?.PLANNING &&
      !serviceConfig?.VSP_PLANNING
    ) {
      ErrorToast(`You do not have permission to move this batch to ${resultLabel}.`)
      refreshBoard(draggedTask.workflow_name)
      return
    }

    if (
      resultLabel === 'Planning Done' &&
      (draggedTask?.task_order_type === 'PLANNING_ORDER' || serviceConfig?.VSP_PLANNING)
    ) {
      dispatchAction(setIsOpenConfirmPlanningDoneModal(true))
      return
    }
    if (inProductionFlows && targetIsCustom) {
      const currentStatus = String(draggedTask?.current_status_name || '').trim()
      const lockedStages = ['Packaged', 'Shipped', 'Delivered']
      if (lockedStages.includes(currentStatus)) {
        const snapshot = clonedItemsRef.current
        if (snapshot) setItems(snapshot)

        openError(
          `This case has already progressed beyond  ${resultName}. Moving backwards is not allowed once a case has advanced to a later stage.`,
          true
        )
        return
      }
    }

    // ---------- BUSINESS RULES ----------
    if (isProductionWorkflow(draggedTask?.workflow_name)) {
      const latest = draggedTask?.manufacturing_batch_response?.latest_batch_manufacturing_status
      const label = resultLabel
      const isManufacturingAction =
        label === 'Packaged' || label === 'Shipped' || label === 'Delivered'
      const currentStageRank = getProductionStageRank(draggedTask?.current_status_name)
      const nextStageRank = getProductionStageRank(label)

      if (
        currentStageRank !== null &&
        nextStageRank !== null &&
        currentStageRank >= 2 && // Packaged or later
        nextStageRank < currentStageRank
      ) {
        const snapshot = clonedItemsRef.current
        if (snapshot) setItems(snapshot)

        openError(
          `This case has already progressed beyond ${resultName}. Moving backwards is not allowed once a case has advanced to a later stage.`,
          true
        )
        return
      }

      // VSP movement
      if (serviceConfig?.VSP_PLANNING) {

        if (label === 'Packaged') {
          if (!taskMovementPermissions?.allowPackaging?.isViewable) {
            ErrorToast('You do not have permission to move this batch to Packaged.')
            return
          }
          dispatch(setIsVspKanbanMovement(true))
          dispatch(setIsOpenManufacturingCompleteModal(true))
          return
        }

        if (label === 'Shipped') {
          if (!taskMovementPermissions?.allowShipping?.isViewable) {
            ErrorToast('You do not have permission to move this batch to Shipped.')
            return
          }
          dispatch(setIsVspKanbanMovement(true))
          dispatch(setIsOpenShippingOrderModal(true))
          return
        }

        if (label === 'Delivered') {
          if (!taskMovementPermissions?.allowMarkingAsDelivered?.isViewable) {
            ErrorToast('You do not have permission to move this batch to Delivered.')
            return
          }
          dispatch(setIsVspKanbanMovement(true))
          dispatch(setIsOpenDeliverFromPackageModal(true))
          return
        }
      }

      if (!isManufacturingAction && latest === 'DELIVERED') {
        openError('This case has already been delivered', true)
        return
      }
      // In Progress
      if (label === 'In Progress' && latest === 'MANUFACTURING_STARTED') {
        moveAndRefresh(draggedTask, overContainer)
        return
      }

      // Packaged
      if (label === 'Packaged') {
        if (!taskMovementPermissions?.allowPackaging?.isViewable) {
          ErrorToast('You do not have permission to move this batch to Packaged.')
          return
        }
        if (latest === 'COMPLETED') {
          moveAndRefresh(draggedTask, overContainer)
        } else if (latest === 'MANUFACTURING_STARTED') {
          dispatch(setIsOpenManufacturingCompleteModal(true))
        } else if (latest === 'SHIPPED' || latest === 'DELIVERED') {
          openError(
            `This case has already progressed beyond  ${resultName}. Moving backwards is not allowed once a case has advanced to a later stage.`,
            true
          )
        }
        return
      }

      // Shipped
      if (label === 'Shipped') {
        if (!taskMovementPermissions?.allowShipping?.isViewable) {
          ErrorToast('You do not have permission to move this batch to Shipped.')
          return
        }
        if (latest === 'COMPLETED') {
          dispatch(setIsOpenShippingOrderModal(true))
        } else if (latest === 'SHIPPED') {
          moveAndRefresh(draggedTask, overContainer)
        } else if (latest === 'DELIVERED') {
          openError(
            `This case has already progressed beyond  ${resultName}. Moving backwards is not allowed once a case has advanced to a later stage.`,
            true
          )
        } else {
          openError(
            `This batch can't be moved to ${resultName} yet. Please move it to Packaged first before proceeding.`,
            false
          )
        }
        return
      }

      // Delivered
      if (label === 'Delivered') {
        if (!taskMovementPermissions?.allowMarkingAsDelivered?.isViewable) {
          ErrorToast('You do not have permission to move this batch to Delivered.')
          return
        }
        if (latest === 'SHIPPED') {
          dispatch(setIsOpenDeliverFromPackageModal(true))
        } else if (latest === 'DELIVERED') {
          moveAndRefresh(draggedTask, overContainer)
        } else if (latest === 'COMPLETED') {
          moveAndRefresh(draggedTask, overContainer).finally(() =>
            dispatch(setIsOpenDeliverFromPackageModal(true))
          )
        } else if (latest === 'MANUFACTURING_STARTED') {
          openError(
            `This batch can't be moved to ${resultLabel} yet. Please move it to Packaged  first before proceeding.`,
            false
          )
        }
        return
      }

      if ((label === 'To Do' || label === 'In Progress') && latest === 'COMPLETED') {
        openError(
          `This case has already progressed beyond ${resultName}. Moving backwards is not allowed once a case has advanced to a later stage.`,
          true
        )
        return
      }

      if (label === 'To Do' && latest === 'MANUFACTURING_STARTED') {
        moveAndRefresh(draggedTask, overContainer)
        return
      }

      if (
        (label === 'Packaged' && latest === 'DELIVERED') ||
        (label === 'Shipped' && latest === 'DELIVERED')
      ) {
        openError(
          `This case has already progressed beyond ${resultName}. Moving backwards is not allowed once a case has advanced to a later stage.`,
          true
        )
        return
      }
    }

    if (isProductionOutsourcedWorkflow(draggedTask?.workflow_name)) {
      const latest = draggedTask?.manufacturing_batch_response?.latest_batch_manufacturing_status
      const label = resultLabel
      const isManufacturingAction =
        label === 'Packaged' || label === 'Shipped' || label === 'Delivered'
      const currentStageRank = getProductionStageRank(draggedTask?.current_status_name)
      const nextStageRank = getProductionStageRank(label)

      if (
        currentStageRank !== null &&
        nextStageRank !== null &&
        currentStageRank >= 2 && // Packaged or later
        nextStageRank < currentStageRank
      ) {
        const snapshot = clonedItemsRef.current
        if (snapshot) setItems(snapshot)

        openError(
          `This case has already progressed beyond ${resultLabel}. Moving backwards is not allowed once a case has advanced to a later stage.`,
          true
        )
        return
      }

      if (!isManufacturingAction && latest === 'DELIVERED') {
        openError('This case has already been delivered', true)
        return
      }
      if (
        label === 'In Progress' &&
        (latest === 'COMPLETED' || latest === 'DELIVERED' || latest === 'SHIPPED')
      ) {
        openError(
          `This case has already progressed beyond ${resultLabel}. Moving backwards is not allowed once a case has advanced to a later stage.`,
          true
        )
        return
      }

      if (label === 'Shipped' && (latest === 'DELIVERED' || latest === 'SHIPPED')) {
        openError(
          `This case has already progressed beyond ${resultLabel}. Moving backwards is not allowed once a case has advanced to a later stage.`,
          true
        )
        return
      }

      if (label === 'Shipped' && (latest === 'COMPLETED' || latest === 'MANUFACTURING_STARTED')) {
        openError(
          'This status can only be updated by the Lab. You’ll be notified once the Lab takes an action.',
          false
        )
        return
      }
      if (label === 'Delivered' && (latest === 'MANUFACTURING_STARTED' || latest === 'COMPLETED')) {
        openError(
          'This status can only be updated by the Lab. You’ll be notified once the Lab takes an action.',
          false
        )
        return
      }

      if (label === 'Delivered' && latest === 'SHIPPED') {
        dispatch(setIsOpenDeliverFromPackageModal(true))

        return
      }
      if (label === 'Delivered' && latest === 'DELIVERED') {
        moveAndRefresh(draggedTask, overContainer)
        return
      }
    }

    const isPlanningWorkflow =
      draggedTask?.workflow_name === 'Planning In House' ||
      draggedTask?.workflow_name === 'Plan Outsourced' ||
      draggedTask?.workflow_name === 'Planning Outsource' ||
      draggedTask?.workflow_name === 'Planning Outsourced'

    const isDoneLike =
      resultLabel === 'DONE' ||
      resultLabel === 'Done' ||
      resultLabel === 'PLANNING DONE' ||
      resultLabel === 'Planning Done'

    const refreshedLabel = resultLabel
    if (
      (refreshedLabel === 'NEED_INFORMATION' ||
        refreshedLabel === 'NEED INFORMATION' ||
        refreshedLabel === 'Need Information') &&
      draggedTask?.current_status_name !== 'Need Information'
    ) {
      dispatch(setIsOpenNeedMoreIfoModal(true))
      return
    }

    dispatchAction(
      moveTaskCard({
        task_id: safeParseInt(draggedTask?.id),
        doctor_id: safeParseInt(userId),
        workflow_status_id: workflowStatusIdFromContainer(overContainer),
        patient_id: safeParseInt(draggedTask?.patient_id),
        workflow_id: safeParseInt(draggedTask?.workflow_id),
        is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
      })
    )
      .unwrap()
      .then(() =>
        refreshBoard(draggedTask.workflow_name)
          .unwrap()
          .then(() => {
            const refreshedLabel = resultLabel
            if (serviceConfig?.VSP_PLANNING && resultName === 'Ready for Planning') {
              dispatchAction(updateCurrentStep(0))
              navigate(`/vsp/create-order?patient_id=${draggedTask?.patient_id}`, {
                state: {patientId: draggedTask?.patient_id, fromProfile: true},
              })
            }
            if (
              (refreshedLabel === 'IN_REVISION' ||
                refreshedLabel === 'IN REVISION' ||
                refreshedLabel === 'In Revision') &&
              draggedTask?.current_status_name !== 'In Revision'
            ) {
              const payload = {
                patient_id: safeParseInt(draggedTask?.patient_id),
                doctor_id: safeParseInt(userId),
                treatment_subtype: 'ALIGNERS',
                order_id: null,
              }
              dispatchAction(getNewTreatmentList(payload as any))
                .unwrap()
                .then((response: any) => {
                  const plans = Array.isArray(response?.plans_list) ? response.plans_list : []

                  const hasPendingApprovalPair = plans.some((p: any) => {
                    const init = String(p?.initiator_status ?? '').toUpperCase()
                    const approved = String(p?.approver_status ?? '').toUpperCase()
                    return init === 'SENT_FOR_APPROVAL' && approved === 'PENDING_APPROVAL'
                  })

                  if (hasPendingApprovalPair) {
                    dispatch(setIsOpenTreatmentRevisionModal(true))
                    return
                  }

                  const hasApprovedPair = plans.some((p: any) => {
                    const init = String(p?.initiator_status ?? '').toUpperCase()
                    const approved = String(p?.approver_status ?? '').toUpperCase()
                    return init === 'RE_PLAN' && approved === 'RE_PLAN'
                  })

                  if (hasApprovedPair) {
                    return
                  }
                })
                .catch(() => {})
            }

            if (
              (refreshedLabel === 'APPROVED' || refreshedLabel === 'Approved') &&
              draggedTask?.current_status_name !== 'Approved'
            ) {
              const payload = {
                patient_id: safeParseInt(draggedTask?.patient_id),
                doctor_id: safeParseInt(userId),
                treatment_subtype: 'ALIGNERS',
                order_id: null,
              }
              dispatchAction(getNewTreatmentList(payload as any))
                .unwrap()
                .then((response: any) => {
                  const plans = Array.isArray(response?.plans_list) ? response.plans_list : []

                  const hasPendingApprovalPair = plans.some((p: any) => {
                    const init = String(p?.initiator_status ?? '').toUpperCase()
                    const approved = String(p?.approver_status ?? '').toUpperCase()
                    return init === 'SENT_FOR_APPROVAL' && approved === 'PENDING_APPROVAL'
                  })

                  if (hasPendingApprovalPair) {
                    dispatch(setIsOpenTreatmentApprovedModal(true))
                    return
                  }

                  const hasApprovedPair = plans.some((p: any) => {
                    const init = String(p?.initiator_status ?? '').toUpperCase()
                    const approved = String(p?.approver_status ?? '').toUpperCase()
                    return init === 'APPROVED' && approved === 'APPROVED'
                  })

                  if (hasApprovedPair) {
                    return
                  }
                })
                .catch(() => {})
            }
            if (isPlanningWorkflow && isDoneLike) {
              if (
                !taskMovementPermissions?.allowMovingToProductionProductionOutsourcedBoard
                  ?.isViewable
              ) {
                ErrorToast('You do not have permission to move this batch to Production.')
                return
              }
              navigate(`/production-setup-stepper/${draggedTask?.patient_id}`)
            }
          })
      )
      .catch((error: any) => {
        const snapshot = clonedItemsRef.current
        if (snapshot) setItems(snapshot)

        switch (error?.error_code) {
          case 'GE0001':
            if (!taskMovementPermissions?.allowMovingToPlanningPlansOutsourcedBoard?.isViewable) {
              ErrorToast('You do not have permission to move this batch to Planning.')
              return
            }
            if (serviceConfig?.VSP_PLANNING) {
              navigate('/vsp/create-order', {
                state: {patientId: draggedTask?.patient_id, fromProfile: true},
              })
            } else {
              navigate(`/planning-setup-stepper/${draggedTask?.patient_id}`)
            }
            break
          case 'WF002':
            dispatchAction(setIsOpenTreatmentReviewModal({isOpen: true, error: error?.message}))
            break
          case 'WF009':
            dispatchAction(setIsOpenTreatmentApproveModal(true))
            break
          case 'WF011':
            dispatchAction(setIsOpenTreatmentReviewModal({isOpen: true, error: error?.message}))
            break
          case 'WF012':
            dispatchAction(setIsOpenTreatmentReviewModal({isOpen: true, error: error?.message}))
            break
          case 'WF013':
            dispatchAction(setIsOpenTreatmentReviewModal({isOpen: true, error: error?.message}))
            break
          case 'WF005':
            if (
              !taskMovementPermissions?.allowMovingToProductionProductionOutsourcedBoard?.isViewable
            ) {
              ErrorToast('You do not have permission to move this batch to Production.')
              return
            }
            navigate(`/production-setup-stepper/${draggedTask?.patient_id}`)
            break
          default:
            break
        }
      })
  }

  const hasPermissionsToMove = (selectedSubWorkflow: string | undefined) => {
    switch (selectedSubWorkflow) {
      case 'new-case':
        return permissionChecks?.newCase?.changeStatusMovingTicketBetweenStatuses?.isViewable
      case 'planning-in-house':
        return permissionChecks?.planning?.changeStatusMovingTicketBetweenStatuses?.isViewable
      case 'production-in-house':
        return permissionChecks?.production?.changeStatusMovingTicketBetweenStatuses?.isViewable
      case 'planning-outsource':
        return permissionChecks?.plansOutsourced?.changeStatusMovingTicketBetweenStatuses
          ?.isViewable
      case 'production-outsource':
        return permissionChecks?.productionOutsourced?.changeStatusMovingTicketBetweenStatuses
          ?.isViewable
      default:
        return permissionChecks?.newCase?.changeStatusMovingTicketBetweenStatuses?.isViewable
    }
  }

  function handleColumnDropPDD({
    activeId,
    overId,
    edge,
  }: {
    activeId: string
    overId: string
    edge?: 'left' | 'right'
  }) {
    if (!activeId || !overId || activeId === overId) return
    setContainers((prev) => {
      const from = prev.indexOf(activeId)
      const toBase = prev.indexOf(overId)
      const to = Math.max(0, Math.min(edge === 'right' ? toBase + 1 : toBase, prev.length - 1))
      try {
        window.dispatchEvent(
          new CustomEvent('kanban:containerReordered', {detail: {id: activeId, from, to}})
        )
      } catch {}
      return arrayMoveLocal(prev, from, to)
    })
  }

  // reset clone after items settle
  useEffect(() => {
    requestAnimationFrame(() => {
      clonedItemsRef.current = null
    })
  }, [items])

  // ---------- per-column infinite scroll ----------
  const sentinelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const listElsRef = useRef<Record<string, HTMLElement | null>>({})
  const scrollHandlersRef = useRef<Record<string, (e: Event) => void>>({})
  const lastFiredRef = useRef<Record<string, number>>({})
  const prevDistanceRef = useRef<Record<string, number>>({})

  useEffect(() => {
    // cleanup previous listeners
    Object.entries(listElsRef.current).forEach(([status, el]) => {
      const handler = scrollHandlersRef.current[status]
      if (el && handler) el.removeEventListener('scroll', handler as EventListener)
    })
    listElsRef.current = {}
    scrollHandlersRef.current = {}
    prevDistanceRef.current = {}
    if (!onColumnEndVisible) return
    const THRESHOLD_MAX = 120
    dynamicColumns.forEach((col: any) => {
      const statusName: string = col.name
      const sentinel = sentinelRefs.current[statusName]
      if (!sentinel) return

      const listEl = sentinel.closest('.kanban-column-list') as HTMLElement | null
      if (!listEl) return

      const handler = () => {
        const distance = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight
        const prev = prevDistanceRef.current[statusName]
        const crossedDown =
          (prev === undefined || prev > THRESHOLD_MAX) && distance <= THRESHOLD_MAX
        prevDistanceRef.current[statusName] = distance
        if (!crossedDown) return

        const t = perfNow()
        const last = lastFiredRef.current[statusName] ?? 0
        if (t - last < 250) return
        lastFiredRef.current[statusName] = t

        const containerId = 'column-' + col.id
        const loadedCount = items[containerId]?.length ?? 0
        const totalForStatus = columnCountByName.get(statusName) ?? 0
        const currentlyVisible = visibleByStatus?.[statusName] ?? 0
        const canShowMore = currentlyVisible < totalForStatus
        if (canShowMore) onColumnEndVisible(statusName, loadedCount)
      }

      listEl.addEventListener('scroll', handler, {passive: true})
      handler() // check immediately
      listElsRef.current[statusName] = listEl
      scrollHandlersRef.current[statusName] = handler
    })

    return () => {
      Object.entries(listElsRef.current).forEach(([status, el]) => {
        const handler = scrollHandlersRef.current[status]
        if (el && handler) el.removeEventListener('scroll', handler as EventListener)
      })
      listElsRef.current = {}
      scrollHandlersRef.current = {}
    }
  }, [dynamicColumns, items, visibleByStatus, columnCountByName, onColumnEndVisible])

  // ---------- horizontal scroll / momentum on the board ----------
  useEffect(() => {
    const el = document.querySelector('.kanban') as HTMLElement | null
    if (!el || (el as any).__scrollBound) return
    ;(el as any).__scrollBound = true

    let isDown = false,
      startX = 0,
      scrollLeft = 0
    let draggingPan = false
    const DRAG_THRESHOLD = 4
    const DRAG_SPEED = 2

    let pendingDelta = 0
    let rafId: number | null = null
    const applyPending = () => {
      if (pendingDelta !== 0) {
        el.scrollLeft += pendingDelta
        pendingDelta = 0
      }
      rafId = null
    }

    let momentumId: number | null = null
    let velocity = 0
    const FRICTION = 0.96
    const MIN_VELOCITY = 0.2
    const MAX_VELOCITY = 900
    const SCROLL_MULTIPLIER = 16
    const SCROLL_MULTIPLIER_FAST = 64

    const startMomentum = () => {
      if (momentumId != null) cancelAnimationFrame(momentumId)
      const step = () => {
        if (Math.abs(velocity) < MIN_VELOCITY) {
          velocity = 0
          momentumId = null
          return
        }
        el.scrollLeft += velocity
        velocity *= FRICTION
        if (el.scrollLeft <= 0 || el.scrollLeft + el.clientWidth >= el.scrollWidth) velocity *= 0.4
        momentumId = requestAnimationFrame(step)
      }
      momentumId = requestAnimationFrame(step)
    }

    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!(t.classList.contains('kanban') || t.classList.contains('kanban-container'))) return
      isDown = true
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }
    const onMouseUp = () => {
      isDown = false
      draggingPan = false
    }
    const onMouseLeave = () => {
      isDown = false
      draggingPan = false
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      const x = e.pageX - el.offsetLeft
      const walk = x - startX
      if (!draggingPan) {
        if (Math.abs(walk) < DRAG_THRESHOLD) return
        draggingPan = true
      }
      e.preventDefault()
      el.scrollLeft = scrollLeft - walk * DRAG_SPEED
    }
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null
      const columnList = target?.closest('.kanban-column-list') as HTMLElement | null
      const RATIO = 2
      const MIN_X = 4
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      if (columnList && !e.shiftKey) return

      const horizontalIntent = e.shiftKey || (absX >= MIN_X && absX > RATIO * absY)
      if (!horizontalIntent) return

      e.preventDefault()
      const useDelta = e.shiftKey && absX < MIN_X ? e.deltaY : e.deltaX
      const multiplier = e.shiftKey ? SCROLL_MULTIPLIER_FAST : SCROLL_MULTIPLIER
      const scaled = useDelta * multiplier
      pendingDelta += scaled
      velocity = Math.max(Math.min(velocity + scaled, MAX_VELOCITY), -MAX_VELOCITY)
      if (rafId == null) rafId = requestAnimationFrame(applyPending)

      clearTimeout((el as any)._momentumTimer)
      ;(el as any)._momentumTimer = setTimeout(() => {
        if (momentumId == null) startMomentum()
      }, 60)
    }

    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('wheel', onWheel, {passive: false})

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('wheel', onWheel as any)
      ;(el as any).__scrollBound = false
    }
  }, [])

  // ---------- render ----------
  return (
    <div className='kanban-wrapper'>
      <div className='kanban'>
        {/* modals */}
        {isOpenMoveToPlanningStateModal && <MoveToPlanningState />}
        {isOpenNeedMoreIfoModal && <MoveToNeedMoreInfoState />}
        {isOpenTreatmentReviewModal?.isOpen && <MoveToTreatmentReviewState />}
        {isOpenTreatmentApproveModal && <MoveToTreatmentApproveState />}
        {isOpenTreatmentRevisionModal && <MoveToTreatmentRevisionState />}
        {isOpenManufacturingCompleteModal && <MoveToCompleteManufacturingState />}
        {isOpenShippingOrderModal && <MoveToShippingState />}
        {isOpenDeliveredOrderModal && <MoveToDeliverState />}
        {isOpenErrorModal?.isOpen && <ErrorState />}
        {isOpenDeliverFromPackageModal && <MoveToDeliverFromPackageState />}
        {isOpenTreatmentApprovedModal && <SelectPlansForApprovedModal />}
        {isOpenConfirmPlanningDoneModal && <ConfirmMoveToPlanningDoneState />}

        <div className='kanban-container'>
          {containers.map((containerId) => {
            const columnId = parseInt(containerId.replace('column-', ''))
            const col = dynamicColumns.find((c: any) => c.id === columnId)
            const colName = col ? col.name : `Unknown Column (${columnId})`
            const apiTotalCount = columnCountByName.get(colName) ?? 0

            return (
              <PddSectionItem
                key={containerId}
                id={containerId}
                name={colName?.toUpperCase()}
                items={items[containerId] ?? []}
                data={tasks}
                color={col?.color}
                count={apiTotalCount}
                sentinelRef={(el) => {
                  if (colName) sentinelRefs.current[colName] = el
                }}
                onCardDragStart={handleDragStartPDD}
                onCardDrop={handleCardDropPDD}
                onColumnDrop={handleColumnDropPDD}
                cardConfiguration={cardConfiguration}
              />
            )
          })}
          <div className='shrink-0 w-2 md:w-[210px]' />
        </div>
      </div>
    </div>
  )
}
