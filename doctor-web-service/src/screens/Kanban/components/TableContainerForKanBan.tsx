import React, {useEffect, useMemo, useRef, useState, useContext, useCallback} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Table,
} from '@tanstack/react-table'
import cn from '@utils/cn'
import {useNavigate, useSearchParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import dayjs from 'dayjs'
import {Pagination, Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import ProductionIcon from 'assets/icons/ProductionIcon'
import ArrowUpDownIcon from 'assets/icons/ArrowUpDownIcon'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  resetFilterPagination,
  setCardDetails,
  setDynamicLabel,
  setDynamicStatus,
  setDynamicWorkflowStatusId,
  setIsOpenDeliverFromPackageModal,
  setIsOpenManufacturingCompleteModal,
  setIsOpenShippingOrderModal,
  setIsOpenErrorModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {getAccessControlUserList} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {AuthContext} from 'context/AuthContext'
import {getFirstLetterCapitalOfWord, safeParseInt} from 'utils/ConstFunctions'
import {getStorageType} from 'utils/storage'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import WorkflowStatusSelector from './WorkflowStatusSelector'
import MoveToNeedMoreInfoModal, {NeedMoreInfoModalContext} from './MoveToNeedMoreInfoModal'
import MoveToRevisionModal from './MoveToRevisionModal'
import MoveToApproveModal from './MoveToApproveModal'
import MoveToTreatmentReviewModal from './MoveToTreatmentReviewModal'
import MoveToCompleteManufacturingState from '../actionModals/MoveToCompleteManufacturingState'
import MoveToShippingState from '../actionModals/MoveToShippingState'
import MoveToDeliverFromPackageState from '../actionModals/MoveToDeliverFromPackageState'
import ErrorState from '../actionModals/ErrorState'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import productionStatusNameConstants from '@constants/productionStatusName.constants'
import manufacturingConstants from '@constants/manufacturing.constants'
import {AssigneeUserSelector} from './AssigneeUserSelector'
import ConfirmMoveToPlanningDoneState from '../actionModals/ConfirmMoveToPlanningDoneState'
import ModalCard from 'components/modalCard/ModalCard'

type ProductionStatusNameConstantsType = typeof productionStatusNameConstants

const PAGE_SIZE = 10

const workflowTitle = (wf?: string) => {
  switch (wf) {
    case 'new-case':
      return 'New Case'
    case 'planning-in-house':
      return 'Planning In House'
    case 'production-in-house':
      return 'Production In House'
    case 'planning-outsource':
      return 'Plan Outsourced'
    case 'planning-order':
      return 'Planning Order'
    case 'production-outsource':
      return 'Production Outsource'
    default:
      return 'New Case'
  }
}

const toTitleCase = (s?: string) =>
  (s || '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()

interface TableContainerForKanbanProps {
  searchQuery?: string
  selectedStageLabel?: string
  selectedAssigneeId?: number | null
  selectedPracticeLocationId?: number | null
}

const TableContainerForKanban = ({
  searchQuery = '',
  selectedStageLabel,
  selectedAssigneeId,
  selectedPracticeLocationId,
}: TableContainerForKanbanProps) => {
  const {loadingPatientTaskTracker, filterTaskList} = useSelector(
    (state: RootState) => state.kanban
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const navigation = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {dispatchAction} = useDispatchAction()
  const {profileId, userId} = useContext(AuthContext)
  const [searchParams] = useSearchParams()

  const {permissionChecks} = useFeatureAccess()
  const assigneePermissions = permissionChecks?.patientProfileActions?.assignee
  const taskMovementPermissions = permissionChecks?.workflowActions
  const canEditAssignee = assigneePermissions?.isEditable ?? false
  const [productionAssignModalOpen, setProductionAssignModalOpen] = useState(false)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false

  const fetchedAssigneesRef = useRef(false)

  const queryAccessControlUsers = useCallback(
    async (query: string) => {
      const parsedDoctorId = safeParseInt(userId)
      if (!parsedDoctorId) return

      await dispatchAction(
        getAccessControlUserList({
          doctor_id: parsedDoctorId,
          search: query.trim() ? query.trim() : null,
          status: 'ACCEPTED',
          sub_role_id: null,
          page_number: 0,
          page_size: 0,
        })
      )
    },
    [dispatchAction, userId]
  )

  useEffect(() => {
    if (!canEditAssignee || fetchedAssigneesRef.current) return
    fetchedAssigneesRef.current = true
    queryAccessControlUsers('')
  }, [canEditAssignee, queryAccessControlUsers])

  const workflowKey = searchParams.get('workFlow') || 'new-case'
  const workflowName = workflowTitle(workflowKey)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const requestSeqRef = useRef(0)
  const [needInfoContext, setNeedInfoContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [needInfoModalOpen, setNeedInfoModalOpen] = useState(false)
  const [revisionContext, setRevisionContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [approveContext, setApproveContext] = useState<NeedMoreInfoModalContext | null>(null)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const openError = useCallback(
    (text: string, showText: boolean) => {
      dispatchAction(setIsOpenErrorModal({isOpen: true, text, showText}))
    },
    [dispatchAction]
  )

  const handleNeedInfoRequested = useCallback((context: NeedMoreInfoModalContext) => {
    setNeedInfoContext(context)
    setNeedInfoModalOpen(true)
  }, [])

  const handleNeedInfoModalClose = useCallback(() => {
    setNeedInfoModalOpen(false)
    setNeedInfoContext(null)
  }, [])

  const handleRevisionRequested = useCallback((context: NeedMoreInfoModalContext) => {
    setRevisionContext(context)
    setRevisionModalOpen(true)
  }, [])

  const handleRevisionModalClose = useCallback(() => {
    setRevisionModalOpen(false)
    setRevisionContext(null)
  }, [])

  const handleApproveRequested = useCallback((context: NeedMoreInfoModalContext) => {
    setApproveContext(context)
    setApproveModalOpen(true)
  }, [])

  const handleApproveModalClose = useCallback(() => {
    setApproveModalOpen(false)
    setApproveContext(null)
  }, [])

  const applyManufacturingModalContext = useCallback(
    (taskDetails: any, label: string, nextStatusId: number) => {
      if (!taskDetails) return
      dispatchAction(setCardDetails(taskDetails as any))
      dispatchAction(setDynamicLabel(label))
      dispatchAction(setDynamicStatus(label))
      dispatchAction(setDynamicWorkflowStatusId(nextStatusId))
    },
    [dispatchAction]
  )

  // Fetch all rows once per workflow so we can slice locally
  const fetchAll = useCallback(() => {
    const seq = ++requestSeqRef.current
    setCurrentPage(1) // reset UI

    // clear cached list in slice for this workflow
    dispatchAction(resetFilterPagination({workflowKey}))

    const payload: any = {
      profile_id: safeParseInt(profileId),
      workflow_name: workflowName,
      organization_id: getStorageType().getItem('organizationId')
        ? Number(getStorageType().getItem('organizationId'))
        : null,
      order_type: 'ALIGNER',
      page_number: 0,
      page_size: 10, // IMPORTANT: ask for *all* so UI can enforce 10 per page
       sort:'UPDATED_ON',
       "order": "DESC"
    }

    if (searchQuery?.trim()) payload.search = searchQuery.trim()
    if (selectedAssigneeId) payload.assignee_id = selectedAssigneeId
    if (selectedPracticeLocationId) payload.practice_location_id = selectedPracticeLocationId
    if (selectedStageLabel) payload.workflow_status_name = selectedStageLabel

    dispatchAction(getPatientTaskTrackerFiltered(payload as any)).finally(() => {
      if (requestSeqRef.current !== seq) return
      // no-op; we just guard against stale completions
    })
  }, [
    dispatchAction,
    profileId,
    workflowKey,
    workflowName,
    searchQuery,
    selectedAssigneeId,
    selectedPracticeLocationId,
    selectedStageLabel,
  ])

  const handleNeedInfoModalSubmitted = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_context?: NeedMoreInfoModalContext | null) => {
      handleNeedInfoModalClose()
      fetchAll()
    },
    [fetchAll, handleNeedInfoModalClose]
  )

  const handleRevisionModalSubmitted = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_context?: NeedMoreInfoModalContext | null) => {
      handleRevisionModalClose()
      fetchAll()
    },
    [fetchAll, handleRevisionModalClose]
  )

  const handleApproveModalSubmitted = useCallback(
    (context?: NeedMoreInfoModalContext | null) => {
      handleApproveModalClose()
      if (context?.patientId) {
        navigation(`/production-setup-stepper/${context.patientId}`)
      }
      fetchAll()
    },
    [fetchAll, handleApproveModalClose, navigation]
  )

  const handleManufacturingAction = useCallback(
    async (
      actionType: ProductionStatusNameConstantsType[keyof typeof productionStatusNameConstants],
      context: NeedMoreInfoModalContext & {taskDetails?: any}
    ) => {
      if (!context?.taskDetails) return

      dispatchAction(setCardDetails(context.taskDetails as any))

      const nextStatusId = safeParseInt(context?.nextStatusId)
      const taskId = safeParseInt(context?.taskId)
      const patientId = safeParseInt(context?.patientId)
      const workflowId = safeParseInt(context?.workflowId)
      const doctorId = safeParseInt(userId)

      if (!taskId || !patientId || !workflowId || !doctorId || !nextStatusId) return

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
              patient_id: patientId,
              workflow_id: workflowId,
              is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
            })
          ).unwrap()
          SuccessToast('Workflow status updated')
          fetchAll()
        } catch (error: any) {
          const fallbackMessage =
            error?.message || error?.response?.data?.message || 'Failed to update workflow status'
          openError(fallbackMessage, true)
        }
      }

      switch (actionType) {
        case productionStatusNameConstants.PACKAGED: {
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
        case productionStatusNameConstants.SHIPPED: {
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
        case productionStatusNameConstants.DELIVERED: {
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

          openError(
            `This batch can't be moved to ${labelForError} yet. Please move it to Packaged first before proceeding.`,
            latestStatus === manufacturingConstants.DELIVERED
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
      fetchAll,
      openError,
      taskMovementPermissions,
      userId,
    ]
  )

  // Fetch on workflow change
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Reset to page 1 when user types a new search (client-side filter)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Client-side search (patient name / id)
  const searched = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase()
    if (!q) return filterTaskList ?? []
    return (filterTaskList ?? []).filter((t: any) => {
      const name = (t?.patient_name || '').toLowerCase()
      const idStr = (t?.patient_id || '').toString()
      return name.includes(q) || idStr.includes(q)
    })
  }, [filterTaskList, searchQuery])

  // Client-side pagination
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return searched.slice(start, end)
  }, [searched, currentPage])

  const total = searched.length
  const startIdx = total ? (currentPage - 1) * PAGE_SIZE + 1 : 0
  const endIdx = Math.min(currentPage * PAGE_SIZE, total)

  const handleSortingChange = (updater: any) => {
    setSorting((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        id: 'patient',
        accessorKey: 'patient_name',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<div>{isVspPlanning ? 'Patient' : 'Patient Name'}</div>}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-base font-medium text-black truncate ...'>
              <div>{row.original?.patient_name ?? '-'}</div>
              <div className='text-xs text-textColor'>
                {row.original?.gender
                  ? `${getFirstLetterCapitalOfWord(row.original.gender)}${
                      row.original?.age ? `, ${row.original.age} Years` : ''
                    }`
                  : ''}
              </div>
            </div>
          </RenderCell>
        ),
        size: 220,
      },
      {
        id: 'id',
        accessorKey: 'patient_id',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>ID</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium'>
              {row.original?.customer_mapped_id != null
                ? `${row.original?.customer_mapped_id}`
                : '-'}
            </div>
          </RenderCell>
        ),
        size: 120,
      },
      {
        id: 'clinic',
        accessorKey: 'clinic',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Clinic</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm text-textColor'>{row.original?.clinic ?? '-'}</div>
          </RenderCell>
        ),
        size: 180,
      },
      {
        id: 'product',
        accessorKey: 'order_type',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Product</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium'>
              <span className='px-3 py-1 bg-primarySupport rounded-md'>
                {row.original?.order_type ?? '-'}
              </span>
            </div>
          </RenderCell>
        ),
        size: 150,
      },
      {
        id: 'case_type',
        accessorKey: 'case_type',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Case Type</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm'>
              <span className='px-3 py-1 bg-tertiarySupport rounded-md'>
                {toTitleCase(row.original?.case_type || row.original?.workflow_name || '-')}
              </span>
            </div>
          </RenderCell>
        ),
        size: 160,
      },
      {
        id: 'customer',
        accessorKey: 'customer',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Customer</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm'>
              {row.original?.customer ?? row.original?.customer_name ?? '-'}
            </div>
          </RenderCell>
        ),
        size: 180,
      },
      {
        id: 'created_by',
        accessorKey: 'created_by',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<div>Created by</div>}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm'>{row.original?.created_by ?? '-'}</div>
          </RenderCell>
        ),
        size: 160,
      },
      {
        id: 'updated_on',
        accessorKey: 'updated_on',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<div>{isVspPlanning ? 'Last Updated' : 'Updated on'}</div>}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm text-textColor'>
              {row.original?.updated_on
                ? dayjs(row.original.updated_on).format('DD MMM, YYYY')
                : '-'}
            </div>
          </RenderCell>
        ),
        size: 140,
      },
      {
        id: 'stage',
        accessorKey: 'current_status_name',
        enableSorting: true,
        header: () => (
          <RenderTableHeader
            className='w-full font-medium text-xs'
            header={<div>{isVspPlanning ? 'Status' : 'Stage'}</div>}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <WorkflowStatusSelector
              taskId={row.original?.id}
              patientId={row.original?.patient_id}
              workflowId={row.original?.workflow_id}
              workflowName={row.original?.workflow_name}
              currentStatusId={row.original?.current_workflow_status_id}
              currentStatusLabel={row.original?.current_status_name}
              onStatusChange={fetchAll}
              onNeedInformationSelected={handleNeedInfoRequested}
              onRevisionSelected={handleRevisionRequested}
              onApprovedSelected={handleApproveRequested}
              onManufacturingAction={handleManufacturingAction}
              taskDetails={row.original}
              redirectToVspCreateOrderOnReadyForPlanning
              className='!min-w-[140px] !p-0 !m-0 !text-sm !font-medium [&_.ant-select-selector]:!border-none [&_.ant-select-selector]:!border [&_.ant-select-selector]:!border-mediumGray hover:[&_.ant-select-selector]:!border-primaryColor [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:hover:!bg-transparent [&_.ant-select-selection-item]:!text-black  [&_.ant-select-selector:hover_.ant-select-selection-item]:!text-primaryColor [&_.ant-select-selection-placeholder]:!text-gray-500'
            />
          </RenderCell>
        ),
        size: 140,
      },
      {
        id: 'assignee',
        accessorKey: 'assignee',
        enableSorting: true,
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Assignee</div>} />
        ),
        cell: ({row}) => (
          <RenderCell>
            <AssigneeUserSelector
              taskId={row.original?.id}
              assigneeName={row.original?.assignee}
              assigneeProfileId={
                Array.isArray(row.original?.assignees_ids) && row.original.assignees_ids.length
                  ? safeParseInt(row.original.assignees_ids[0])
                  : row.original?.assignee_profile_id != null
                    ? safeParseInt(row.original.assignee_profile_id)
                    : undefined
              }
              workflowName={row.original?.workflow_name}
              workflowId={row.original?.workflow_id}
              patientId={row.original?.patient_id}
              onAssigned={fetchAll}
              className='!min-w-[140px] !p-0 !m-0 !text-sm !font-medium [&_.ant-select-selector]:!border-none [&_.ant-select-selector]:!border [&_.ant-select-selector]:!border-mediumGray hover:[&_.ant-select-selector]:!border-primaryColor [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:hover:!bg-transparent [&_.ant-select-selection-item]:!text-black  [&_.ant-select-selector:hover_.ant-select-selection-item]:!text-primaryColor [&_.ant-select-selection-placeholder]:!text-gray-500'
              selectionTextClassName='text-primaryColor'
              setProductionAssignModalOpen={setProductionAssignModalOpen}
            />
          </RenderCell>
        ),
        size: 160,
      },
    ]

    if (!isVspPlanning) {
      return baseColumns.filter((column) => column.id !== 'customer')
    }

    const visibleColumnIds = new Set([
      'patient',
      'id',
      'product',
      'customer',
      'updated_on',
      'stage',
      'assignee',
    ])

    return baseColumns.filter((column) => visibleColumnIds.has(String(column.id)))
  }, [
    isVspPlanning,
    fetchAll,
    handleNeedInfoRequested,
    handleRevisionRequested,
    handleApproveRequested,
    handleManufacturingAction,
  ])

  const table = useReactTable({
    columns,
    data: pagedRows,
    state: {sorting},
    onSortingChange: handleSortingChange,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {size: 150, minSize: 50, enableSorting: true},
  })

  const TableHeader = (props: Table<any>) => (
    <thead>
      {props.getHeaderGroups().map((headerGroup, index: number) => (
        <tr key={index} className='sticky z-10 top-0 bg-lightGray'>
          {headerGroup.headers.map((header, i: number) => (
            <th
              key={i}
              colSpan={header.colSpan}
              className='text-start text-black text-xs font-medium py-2 px-3 h-10 uppercase'
            >
              <div
                className={cn(
                  'flex items-center justify-between gap-2 w-full text-xs',
                  header.column.getCanSort() && 'cursor-pointer select-none',
                  header.column.getIsLastColumn() ? '' : 'border-r-2 border-mediumGray'
                )}
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {
                  {
                    asc: <ArrowUpDownIcon color1='#666666' color2='#66666680' />,
                    desc: <ArrowUpDownIcon color2='#666666' color1='#66666680' />,
                  }[header.column.getIsSorted() as string]
                }
              </div>
            </th>
          ))}
        </tr>
      ))}
    </thead>
  )

  const TableBody = (props: Table<any>) => {
    const rows = props.getRowModel().rows
    if (rows.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={table.getHeaderGroups()[0]?.headers?.length} className='text-center py-4'>
              <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-18rem)]'>
                <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
                  <ProductionIcon color='#666666' width='32' height='32' />
                </div>
                <p>{searchQuery ? 'No matching orders found' : 'No orders added yet'}</p>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }
    return (
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className='border-b border-lightgray text-black text-base group cursor-pointer'
            onClick={() => {
              const patientId = row.original?.patient_id
              if (patientId) navigation(`${profileBasePath}/${patientId}`)
            }}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className='px-3 py-3'>
                <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

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
        />
      )}
      {approveContext && (
        <MoveToApproveModal
          open={approveModalOpen}
          context={approveContext}
          onClose={handleApproveModalClose}
          onSubmitted={handleApproveModalSubmitted}
        />
      )}
      <MoveToTreatmentReviewModal />
      <MoveToCompleteManufacturingState />
      <MoveToShippingState />
      <MoveToDeliverFromPackageState />
      <ConfirmMoveToPlanningDoneState />
      <ErrorState />
      <div className='border border-mediumGray rounded-lg max-h-[calc(100vh-100px)] w-full overflow-auto'>
        <Spin indicator={<Spinner loading />} spinning={loadingPatientTaskTracker}>
          <table className='w-full'>
            <TableHeader {...table} />
            <TableBody {...table} />
            <tfoot className='border-t border-mediumGray'>
              <tr>
                <td colSpan={table.getHeaderGroups()[0]?.headers?.length} className='text-center'>
                  <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
                    <p className='text-textColor text-sm font-medium'>
                      {total > 0 ? `${startIdx}-${endIdx} from ${total}` : '0-0 from 0'}
                    </p>
                    <Pagination
                      showSizeChanger={false}
                      current={currentPage}
                      defaultPageSize={PAGE_SIZE}
                      total={total}
                      onChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </Spin>
      </div>
    </>
  )
}

export default TableContainerForKanban
