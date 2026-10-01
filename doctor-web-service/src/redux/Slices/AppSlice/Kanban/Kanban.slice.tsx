import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {OrderType} from 'contexts/WorkflowConfigContext'
import {
  URL_ADD_COMMENT,
  URL_GET_CATEGORY,
  URL_GET_COMMENT,
  URL_GET_KANBAN_TASK_LIST,
  URL_GET_SERVICE_PRODUCT,
  URL_GET_WORKFLOW,
  URL_MOVE_TASK_CARD,
  URL_MOVE_WORKFLOW,
  URL_NEW_PLAN_LIST,
  URL_GET_PATIENT_TASK_TRACKER_FILTER,
  URL_GET_PATIENT_TASK_TRACKER_CANCELLED,
  URL_UPDATE_TASK,
  URL_GET_KANBAN_COUNTS,
} from 'redux/Endpoints/apiEndpoints'
import {ProductCategory, ProductService} from 'screens/Kanban/helpers/kanban.types'
import {ColumnType, Task} from 'screens/Kanban/types'
import {PlanDataList} from 'screens/PatientDetailsOverview.tsx/types/PlanList.types'
import {pagination_details} from 'screens/Patients/PatientList/types/patientsList.types'
import {optionType} from 'types/optionType'
import {getStorageType} from 'utils/storage'

export const initialSubWorkflows = (): Record<OrderType, SubWorkflow[]> => {
  return {
    ALIGNER: [],
    PLANNING: [],
    MANUFACTURING: [],
  } as Record<OrderType, SubWorkflow[]>
}

export type WorkflowStatus = {
  id: number
  name: string
  custom?: boolean
  maps_to?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  color?: string
  internalName?: string
  description?: string
  customerEditable?: boolean
  popup?: boolean
  nonDeletable?: boolean
  showInternal?: boolean
  position: number
}

export type SubWorkflow = {
  id: string
  name: string
  statuses: WorkflowStatus[]
  allowAdditionalInProgress?: boolean
  showAdditionalToCustomer?: boolean
}

export type PatientTaskTrackerFilterRequest = {
  profile_id: number
  workflow_name: string
  organization_id: number
  order_type: string
  doctor_id: number
  page_number: number
  page_size: number
  order: 'ASC' | 'DESC'
  sort: 'UPDATED_ON' // 'UPDATED_ON'
}

type CardDetails = {
  id: number | null
  patient_id: number | null
  patient_name: string
  org_id: number | null
  workflow_id: number | null
  workflow_name: string
  current_workflow_status_id: number | null
  current_status_name: string
  previous_workflow_status_id: number | null
  gender: string
  age: number | null
  created_by: string
  created_on: string
  product: string | null
  follow_up_date: string | null
  case_type: string | null
  assignee: string | null
  clinic: string | null
  created_for_profile_id: number | null
  created_for_profile_name: string | null
  order_type: string
  priority_level: string
  practice_name: string | null
  comments_count: number | null
  labels: string[] | null
  linked_plans: string[] | null
  linked_batch_details: string[] | null
  is_active: boolean
  is_archived: boolean
  completion_date: string | null
  estimated_completion_date: string | null
  sequence_number: number | null
  workflow_position: number | null
  parent_task_id: number | null
  order_id: string | null
  manufacturing_batch_id: number | null
  task_type: string | null
  task_created_for: string | null
  result?: string | null
  service_products: unknown // or a proper type if you know it
  manufacturing_batch_response: manufacturing_batch_response
}

type manufacturing_batch_response = {
  patient_id: number | null
  treatment_plan_id: number | null
  patient_full_name: string | null
  patient_profile_url: null
  case_type: string | null
  customer: string | null
  total_aligners: PlanData
  delivered: PlanData
  in_inventory: PlanData
  pending: PlanData
  transit: PlanData
  due_by: null
  reminder_date: null
  reminder_id: null
  order_id: null
  latest_batch_manufacturing_status: string | null
  due_by_status: string | null
  treatment_plan_status_completed: boolean
  treatment_plan_status: string | null
}

type PlanData = {
  count: number | null
  upper_range_start: number | null
  lower_range_start: number | null
  upper_range_end: number | null
  lower_range_end: number | null
}
export type KanbanState = {
  kanBanColumns: ColumnType[]
  loadingKanBan: boolean
  kanBanNewColumns: any
  changeWorkFlowData: any
  taskList: Task[]
  loadingTaskList: boolean
  workflowCounts: Record<string, number>
  isOpenMoveToPlanningStateModal: boolean
  isOpenMoveToProductionStateModal: boolean
  isOpenNeedMoreIfoModal: boolean
  isOpenTreatmentReviewModal: ReviewState
  isOpenTreatmentRevisionModal: boolean
  isOpenTreatmentApproveModal: boolean
  isOpenTreatmentApprovedModal: boolean
  productCategory: ProductService[]
  loadingProductCategory: boolean
  categoryList: ProductCategory[]
  loadingCategoryList: boolean
  cardDetails: CardDetails
  plansList: PlanDataList
  loadingPlansList: boolean
  doctorCommentsData: any
  moveCardDetails: any
  comments: any
  isOpenManufacturingCompleteModal: boolean
  isOpenShippingOrderModal: boolean
  isOpenDeliveredOrderModal: boolean
  isOpenErrorModal: ErrorState
  patientTaskTracker: PatientTaskTrackerItem[]
  loadingPatientTaskTracker: boolean
  patientTaskTrackerError?: string | null
  patientTaskTrackerTotal: number
  cancelledInvites: CancelledInviteItem[]
  loadingCancelledInvites: boolean
  cancelledInvitesError?: string | null
  cancelledInvitesMeta: {
    page: number
    size: number
    total: number
    totalPages: number
    isLast: boolean
  }
  isOpenDeliverFromPackageModal: boolean
  filterTaskList: Task[]
  labelCounts: Array<{label_name: string; count: number; total_count: number}>
  paginationDetails: pagination_details
  lastRequestedPage: number | null
  hasNext: boolean
  currentWorkflowKey: any
  isFetchingPage: boolean

  // ✅ New filters
  selectedAssignee: optionType
  selectedPracticeLocation: optionType
  dynamicLabel: string
  dynamicStatus: string
  dynamicWorkflowStatusId: number | null
  error: MoveTaskCardError | null
  isManufacturingCompletionInProgress: boolean
  manufacturingCompletionLockTaskId: boolean
  isOpenConfirmPlanningDoneModal: boolean
  isVspKanbanMovement: boolean
}

interface ErrorState {
  isOpen: boolean
  text: string
  showText?: boolean
}

interface ReviewState {
  isOpen: boolean
  error: string
}
interface Status {
  id: string
  name: string
}

interface Stage {
  id: string
  name: string
  active: boolean
  statuses: Status[]
  isSystemDefined: boolean
}

interface PatientCommentParams {
  doctor_id: number
  profile_id: number
  notes: string
  files?: File[]
}

// Payload type for changeWorkFlow
export interface ChangeWorkFlowPayload {
  manufacturing_id: number | null
  order_type: string
  workflow_name: string
  workflow_status_name: string
  order_id: any
  patient_id: number
  profile_id: number
  service_products: null
  lab_work_flow_name: any
  lab_order_type: any
  lab_workflow_status_name: any
  case_type: string
  lab_profile_id: any
  organization_id: number
  doctor_id: number
  task_id: number
}

export type PatientTaskTrackerItem = CardDetails

export type PatientTaskTrackerFilterResponse =
  | {tasks: PatientTaskTrackerItem[]} // ← your real shape
  | {content: PatientTaskTrackerItem[]; total_elements?: number} // ← fallback (if it ever changes)
  | PatientTaskTrackerItem[]

export interface WorkflowData {
  [key: string]: Stage[]
}

const getWorkFlowName = (workflow_name: string) => {
  switch (workflow_name) {
    case 'New Case':
      return 0
    case 'Plan In House':
      return 1
    case 'Production In House':
      return 2
    default:
      return 0
  }
}

// Types that match the response you shared
export interface CancelledInviteItem {
  id: number
  patient_id: number
  patient_uuid: string
  patient_name: string
  clinic_name: string | null
  created_by: string
  created_on: string // ISO datetime string
  invitation_status: 'SENT' | 'DELIVERED' | 'OPENED' | 'ACCEPTED' | 'FAILED' | string
}

export interface CancelledInviteResponse {
  content: CancelledInviteItem[]
  pageable: {
    sort: any[]
    offset: number
    page_number: number
    page_size: number
    paged: boolean
    unpaged: boolean
  }
  total_elements: number
  total_pages: number
  last: boolean
  size: number
  number: number
  sort: any[]
  number_of_elements: number
  first: boolean
  empty: boolean
}

export interface GetCancelledTasksRequest {
  profile_id: number
  workflow_name: string
  page_number: number
  page_size: number
}

export interface GetCancelledTasksResult {
  items: CancelledInviteItem[]
  total: number
  page: number
  size: number
  totalPages: number
  isLast: boolean
}
interface MoveTaskCardError {
  error_code?: string
  error_message?: string
  message?: string
  status?: number
}

export const getCancelledPatientTasks = createAsyncThunk<
  GetCancelledTasksResult,
  GetCancelledTasksRequest,
  {rejectValue: string}
>('api/getCancelledPatientTasks', async (payload, {rejectWithValue}) => {
  try {
    const res = await apiHelper(URL_GET_PATIENT_TASK_TRACKER_CANCELLED, HttpMethod.POST, payload)

    const data = res?.data as CancelledInviteResponse

    return {
      items: data.content ?? [],
      total: data.total_elements ?? 0,
      page: data.number ?? payload.page_number,
      size: data.size ?? payload.page_size,
      totalPages: data.total_pages ?? 0,
      isLast: data.last ?? true,
    }
  } catch (e) {
    const err = e as any
    const msg =
      err.response?.data?.status?.message ??
      err.response?.data?.message ??
      err.message ??
      'Failed to fetch cancelled tasks'
    return rejectWithValue(msg)
  }
})

// Fetch global counts for each kanban board in side panel
export const getKanbanCountsByProfile = createAsyncThunk(
  'api/getKanbanCountsByProfile',
  async (params: {profile_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_GET_KANBAN_COUNTS}${params.profile_id}`,
        HttpMethod.GET,
        null
      )
      // Response: [{ kanban_name: string, count: number }]
      return (response?.data ?? []) as Array<{kanban_name: string; count: number}>
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getKanbanColumnsData = createAsyncThunk(
  'api/getKanbanColumnsData',
  async (params: {profile_id?: number; workflow_name: string}, {rejectWithValue}) => {
    const organizationId = getStorageType().getItem('organizationId')
      ? Number(getStorageType().getItem('organizationId'))
      : null
    try {
      const workflow = getWorkFlowName(params.workflow_name)
      const response = await apiHelper(
        URL_GET_WORKFLOW +
          `profileId=${params.profile_id}&orgId=${organizationId}&archived=false&page=0&size=10&sort=DESC`,
        HttpMethod.GET,
        params
      )

      const data = response.data[workflow]?.statuses?.map((status: any) => ({
        id: status.id,
        name: status.label_name || status.name,
        order: status.position,
      }))

      return data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)
export const getTaskList = createAsyncThunk(
  'api/getTaskList',
  async (
    params: {
      order_type: string
      doctor_id: number
      workflow_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_KANBAN_TASK_LIST, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getPatientTaskTrackerFiltered = createAsyncThunk(
  'api/getPatientTaskTrackerFiltered',
  async (params: any, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_GET_PATIENT_TASK_TRACKER_FILTER, HttpMethod.POST, params)
      const data: any = response?.data
      const label_counts: any = data?.label_counts
      const pagination_details: any = data?.pagination_details
      const tasks: any = data?.tasks

      return {tasks, label_counts, pagination_details}
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const moveTaskCard = createAsyncThunk<
  any, // Success response type
  {
    task_id: number
    doctor_id: number
    workflow_status_id: number
    patient_id: number
    workflow_id: number
    is_vsp_task_moving: boolean
  },
  {
    rejectValue: MoveTaskCardError // Error type
  }
>('api/moveTaskCard', async (params, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_MOVE_TASK_CARD, HttpMethod.PUT, params)
    return response.data
  } catch (error: any) {
    return rejectWithValue({
      error_code: error?.response?.data?.error_code,
      message: error?.response?.data?.message,
      status: error?.response?.status,
    })
  }
})

export const getProductCategoryList = createAsyncThunk(
  'api/getProductCategoryList',
  async (
    params: {
      profileId: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_CATEGORY + params.profileId, HttpMethod.GET, params)
      return response.data as ProductCategory[]
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getProductServiceList = createAsyncThunk(
  'api/getProductServiceList',
  async (
    params: {
      category_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_GET_SERVICE_PRODUCT + params.category_id,
        HttpMethod.GET,
        params
      )
      return response.data as ProductService[]
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getKanbanTypeData = createAsyncThunk(
  'api/getKanbanTypeData',
  async (
    params: {
      profile_id: number
      doctor_id: number
      organization_id: number
      workflow_name: string
      order_type: string
    },
    {rejectWithValue}
  ) => {
    try {
      const workflow = getWorkFlowName(params.workflow_name)
      const response = await apiHelper(URL_GET_KANBAN_TASK_LIST, HttpMethod.POST, params)

      if (!response?.data) {
        throw new Error('No data received from API')
      }
      const workflowData = response.data[workflow]
      if (!workflowData) {
        return []
      }

      if (!workflowData.statuses || !Array.isArray(workflowData.statuses)) {
        return []
      }

      const data = workflowData.statuses
        .filter((status: any) => {
          const isValid = status && typeof status === 'object'
          if (!isValid) return isValid
        })
        .map((status: any) => {
          const mapped = {
            id: status.id || null,
            name: status.label_name || status.name || 'Unknown Status',
            order: status.position || 0,
          }
          return mapped
        })

      return data
    } catch (error: any) {
      console.error('Error in getKanbanTypeData:', error)

      if (error?.response?.data?.error_code) {
        return rejectWithValue(error.response.data.error_code)
      }

      if (error?.message) {
        return rejectWithValue(error.message)
      }

      return rejectWithValue('Failed to fetch kanban data')
    }
  }
)

export const addDoctorComment = createAsyncThunk(
  'api/addDoctorComment',
  async (postPatientCommentParams: PatientCommentParams, {rejectWithValue}) => {
    try {
      const formData = new FormData()

      postPatientCommentParams?.files?.forEach((file) => {
        formData.append('files', file)
      })

      delete postPatientCommentParams.files
      formData.append('request', JSON.stringify(postPatientCommentParams))

      const response = await apiHelper(URL_ADD_COMMENT, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const getDoctorComments = createAsyncThunk(
  'api/getDoctorComments',
  async (
    params: {
      patientId: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_COMMENT + params?.patientId, HttpMethod.GET)

      return response.data
    } catch (error: any) {
      if (error?.response?.data?.error_code) {
        return rejectWithValue(error.response.data.error_code)
      }
      if (error?.message) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Failed to fetch kanban data')
    }
  }
)

export const changeWorkFlow = createAsyncThunk(
  'api/changeWorkFlow',
  async (params: ChangeWorkFlowPayload, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_MOVE_WORKFLOW, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getNewTreatmentList = createAsyncThunk(
  'api/getNewTreatmentList',
  async (
    params: {
      patient_id: number
      doctor_id: number
      treatment_subtype: string
      order_id?: string | null
      is_latest_order_plan_required?: boolean
      is_only_approved?: boolean
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_NEW_PLAN_LIST, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const addDueDateTask = createAsyncThunk(
  'api/addDueDateTask',
  async (params: {task_id: number; estimated_completion_date: string}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_UPDATE_TASK, HttpMethod.PUT, params)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

const initialState: KanbanState = {
  kanBanColumns: [],
  loadingKanBan: false,
  kanBanNewColumns: [],
  changeWorkFlowData: [],
  taskList: [],
  loadingTaskList: false,
  workflowCounts: {},
  isOpenMoveToPlanningStateModal: false,
  isOpenMoveToProductionStateModal: false,
  isOpenNeedMoreIfoModal: false,
  isOpenTreatmentReviewModal: {isOpen: false, error: ''},
  isOpenTreatmentRevisionModal: false,
  isOpenTreatmentApproveModal: false,
  isOpenTreatmentApprovedModal: false,
  isOpenManufacturingCompleteModal: false,
  isOpenShippingOrderModal: false,
  isOpenDeliveredOrderModal: false,
  isOpenDeliverFromPackageModal: false,
  isOpenErrorModal: {isOpen: false, text: '', showText: true},
  productCategory: [],
  loadingProductCategory: false,
  categoryList: [],
  loadingCategoryList: false,
  cancelledInvites: [],
  loadingCancelledInvites: false,
  cancelledInvitesError: null,
  cancelledInvitesMeta: {
    page: 0,
    size: 10,
    total: 0,
    totalPages: 0,
    isLast: true,
  },

  cardDetails: {
    id: null,
    patient_id: null,
    patient_name: '',
    org_id: null,
    workflow_id: null,
    workflow_name: '',
    current_workflow_status_id: null,
    current_status_name: '',
    previous_workflow_status_id: null,
    gender: '',
    age: null,
    created_by: '',
    created_on: '',
    product: null,
    follow_up_date: null,
    case_type: null,
    assignee: null,
    clinic: null,
    created_for_profile_id: null,
    created_for_profile_name: null,
    order_type: '',
    priority_level: '',
    practice_name: null,
    comments_count: null,
    labels: null,
    linked_plans: null,
    linked_batch_details: null,
    is_active: true,
    is_archived: false,
    completion_date: null,
    estimated_completion_date: null,
    sequence_number: null,
    workflow_position: null,
    parent_task_id: null,
    order_id: null,
    manufacturing_batch_id: null,
    task_type: null,
    task_created_for: null,
    service_products: null,
    result: null,
    manufacturing_batch_response: {
      patient_id: null,
      treatment_plan_id: null,
      patient_full_name: null,
      patient_profile_url: null,
      case_type: null,
      customer: null,
      total_aligners: {
        count: null,
        upper_range_start: null,
        lower_range_start: null,
        upper_range_end: null,
        lower_range_end: null,
      },
      delivered: {
        count: null,
        upper_range_start: null,
        lower_range_start: null,
        upper_range_end: null,
        lower_range_end: null,
      },
      in_inventory: {
        count: null,
        upper_range_start: null,
        lower_range_start: null,
        upper_range_end: null,
        lower_range_end: null,
      },
      pending: {
        count: null,
        upper_range_start: null,
        lower_range_start: null,
        upper_range_end: null,
        lower_range_end: null,
      },
      transit: {
        count: null,
        upper_range_start: null,
        lower_range_start: null,
        upper_range_end: null,
        lower_range_end: null,
      },
      due_by: null,
      reminder_date: null,
      reminder_id: null,
      order_id: null,
      latest_batch_manufacturing_status: null,
      due_by_status: null,
      treatment_plan_status_completed: false,
      treatment_plan_status: null,
    },
  },
  plansList: {
    total_plans: 0,
    approved: 0,
    pending_approval: 0,
    total_hours: 0,
    plans_list: [],
  },
  loadingPlansList: false,
  doctorCommentsData: [],
  moveCardDetails: [],
  comments: [],
  patientTaskTracker: [],
  loadingPatientTaskTracker: false,
  patientTaskTrackerError: null,
  patientTaskTrackerTotal: 0,
  filterTaskList: [],
  labelCounts: [],
  paginationDetails: {
    has_next: false,
    has_previous: false,
    page_number: 0,
    page_size: 10,
    total_patients: 0,
    total_pages: 0,
    customer_patients: 0,
    practice_patient: 0,
  },
  lastRequestedPage: 0,
  hasNext: false,
  currentWorkflowKey: '',
  isFetchingPage: false,

  // ✅ New filters default
  selectedAssignee: {} as optionType,
  selectedPracticeLocation: {} as optionType,
  dynamicLabel: '',
  dynamicStatus: '',
  dynamicWorkflowStatusId: null,
  error: null as MoveTaskCardError | null,
  manufacturingCompletionLockTaskId: null as number | null,
  isOpenConfirmPlanningDoneModal: false,
  isVspKanbanMovement: false,
}

const KanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    setIsOpenMoveToPlanningStateModal(state, action) {
      state.isOpenMoveToPlanningStateModal = action.payload
    },
    setIsOpenConfirmPlanningDoneModal(state, action) {
      state.isOpenConfirmPlanningDoneModal = action.payload
    },
    setIsVspKanbanMovement(state, action: PayloadAction<boolean>) {
      state.isVspKanbanMovement = action.payload
    },
    setIsOpenNeedMoreIfoModal(state, action) {
      state.isOpenNeedMoreIfoModal = action.payload
    },
    setCardDetails(state, action: PayloadAction<CardDetails>) {
      state.cardDetails = action.payload
    },
    setIsOpenTreatmentReviewModal(state, action: PayloadAction<{isOpen: boolean; error: string}>) {
      state.isOpenTreatmentReviewModal.isOpen = action.payload.isOpen
      state.isOpenTreatmentReviewModal.error = action.payload.error
    },
    setDynamicLabel(state, action: PayloadAction<string>) {
      state.dynamicLabel = action.payload
    },
    setDynamicStatus(state, action: PayloadAction<string>) {
      state.dynamicStatus = action.payload
    },
    setDynamicWorkflowStatusId(state, action: PayloadAction<number | null>) {
      state.dynamicWorkflowStatusId = action.payload
    },
    setIsOpenTreatmentRevisionModal(state, action) {
      state.isOpenTreatmentRevisionModal = action.payload
    },
    setIsOpenTreatmentApproveModal(state, action) {
      state.isOpenTreatmentApproveModal = action.payload
    },
    setIsOpenTreatmentApprovedModal(state, action) {
      state.isOpenTreatmentApprovedModal = action.payload
    },
    setIsOpenMoveToProductionStateModal(state, action) {
      state.isOpenMoveToProductionStateModal = action.payload
    },
    clearCardDetails: (state) => {
      state.cardDetails = initialState.cardDetails
    },
    setIsOpenManufacturingCompleteModal(state, action) {
      state.isOpenManufacturingCompleteModal = action.payload
    },
    setManufacturingCompletionLockTaskId(state, action: PayloadAction<number | null>) {
      state.manufacturingCompletionLockTaskId = action.payload
    },
    setIsOpenShippingOrderModal(state, action) {
      state.isOpenShippingOrderModal = action.payload
    },
    setIsOpenDeliveredOrderModal(state, action) {
      state.isOpenDeliveredOrderModal = action.payload
    },
    setIsOpenErrorModal: (
      state,
      action: PayloadAction<{isOpen: boolean; text: string; showText: boolean}>
    ) => {
      state.isOpenErrorModal.isOpen = action.payload.isOpen
      state.isOpenErrorModal.text = action.payload.text
      state.isOpenErrorModal.showText = action.payload.showText ?? true
    },
    setIsOpenDeliverFromPackageModal(state, action) {
      state.isOpenDeliverFromPackageModal = action.payload
    },

    resetFilterPagination(state, action: PayloadAction<{workflowKey: string}>) {
      state.filterTaskList = []
      state.labelCounts = []
      ;((state.paginationDetails = {
        has_next: false,
        has_previous: false,
        page_number: 0,
        page_size: 10,
        total_patients: 0,
        total_pages: 0,
      } as pagination_details),
        (state.lastRequestedPage = 0))
      state.hasNext = false
      state.isFetchingPage = false
      state.currentWorkflowKey = action.payload.workflowKey
    },
    setSelectedAssignee(state, action: PayloadAction<optionType>) {
      state.selectedAssignee = action.payload
    },
    setSelectedPracticeLocation(state, action: PayloadAction<optionType>) {
      state.selectedPracticeLocation = action.payload
    },
    resetKanbanFilters(state) {
      state.selectedAssignee = {} as optionType
      state.selectedPracticeLocation = {} as optionType
    },
    resetCancelledInvites(state) {
      state.cancelledInvites = []
      state.cancelledInvitesError = null
      state.cancelledInvitesMeta = {page: 0, size: 10, total: 0, totalPages: 0, isLast: true}
    },
    resetPlansList(state) {
      state.plansList = initialState.plansList
      state.loadingPlansList = false
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getKanbanCountsByProfile.fulfilled, (state, action) => {
        state.workflowCounts = {}
        const list = action.payload as Array<{kanban_name: string; count: number}>
        const map: Record<string, number> = {}
        for (const item of list ?? []) {
          if (!item || typeof item !== 'object') continue
          map[item.kanban_name] = Number(item.count) || 0
        }

        state.workflowCounts = {
          ...state.workflowCounts,
          ...map,
        }
      })

      .addCase(getKanbanColumnsData.pending, (state) => {
        state.loadingKanBan = true
      })
      .addCase(getKanbanColumnsData.fulfilled, (state, action) => {
        state.loadingKanBan = false
        state.kanBanColumns = action.payload
      })
      .addCase(getKanbanColumnsData.rejected, (state) => {
        state.loadingKanBan = false
      })

      .addCase(getTaskList.pending, (state) => {
        state.loadingTaskList = true
      })
      .addCase(getTaskList.fulfilled, (state, action) => {
        state.loadingTaskList = false
        state.taskList = action.payload
        // Do not overwrite side panel counts here; they come from kanban-counts API
      })
      .addCase(getTaskList.rejected, (state) => {
        state.loadingTaskList = false
      })

      .addCase(getProductCategoryList.pending, (state) => {
        state.loadingCategoryList = true
      })
      .addCase(getProductCategoryList.fulfilled, (state, action) => {
        state.loadingCategoryList = false
        state.categoryList = action.payload
      })
      .addCase(getProductCategoryList.rejected, (state) => {
        state.loadingCategoryList = false
      })

      .addCase(getProductServiceList.pending, (state) => {
        state.loadingProductCategory = true
      })
      .addCase(getProductServiceList.fulfilled, (state, action) => {
        state.loadingProductCategory = false
        state.productCategory = action.payload
      })
      .addCase(getProductServiceList.rejected, (state) => {
        state.loadingProductCategory = false
      })

      .addCase(getKanbanTypeData.pending, (state) => {
        state.loadingKanBan = true
      })
      .addCase(getKanbanTypeData.fulfilled, (state, action) => {
        state.loadingKanBan = false
        state.kanBanNewColumns = action.payload
      })
      .addCase(getKanbanTypeData.rejected, (state) => {
        state.loadingKanBan = false
      })
      .addCase(changeWorkFlow.pending, (state) => {
        state.loadingKanBan = true
      })
      .addCase(changeWorkFlow.fulfilled, (state, action) => {
        state.loadingKanBan = false
        state.changeWorkFlowData = action.payload
      })
      .addCase(changeWorkFlow.rejected, (state) => {
        state.loadingKanBan = false
      })

      .addCase(getNewTreatmentList.pending, (state) => {
        state.loadingPlansList = true
      })
      .addCase(getNewTreatmentList.fulfilled, (state, action) => {
        state.loadingPlansList = false
        state.plansList = action.payload
      })
      .addCase(getNewTreatmentList.rejected, (state) => {
        state.loadingPlansList = false
      })
      .addCase(addDoctorComment.pending, (state) => {
        state.loadingKanBan = true
      })
      .addCase(addDoctorComment.fulfilled, (state, action) => {
        state.loadingKanBan = false
        state.doctorCommentsData = action.payload
      })
      .addCase(addDoctorComment.rejected, (state) => {
        state.loadingKanBan = false
      })
      .addCase(moveTaskCard.pending, (state) => {
        state.loadingKanBan = true
      })
      .addCase(moveTaskCard.fulfilled, (state, action) => {
        state.loadingKanBan = false
        state.moveCardDetails = action.payload
      })
      .addCase(moveTaskCard.rejected, (state, action) => {
        state.loadingKanBan = false
        state.error = action.payload as MoveTaskCardError
      })
      .addCase(getDoctorComments.pending, (state) => {
        state.loadingKanBan = true
      })
      .addCase(getDoctorComments.fulfilled, (state, action) => {
        state.loadingKanBan = false
        state.comments = action.payload
      })
      .addCase(getDoctorComments.rejected, (state) => {
        state.loadingKanBan = false
      })
      .addCase(getPatientTaskTrackerFiltered.pending, (state) => {
        state.loadingPatientTaskTracker = true
        state.patientTaskTrackerError = null
        state.isFetchingPage = true // <— guard ON
      })
      .addCase(getPatientTaskTrackerFiltered.fulfilled, (state, action) => {
        state.loadingPatientTaskTracker = false
        state.isFetchingPage = false // <— guard OFF

        const incoming = action.payload.tasks ?? []
        const pageNum = action.meta?.arg?.page_number ?? 0

        if (pageNum > 0) {
          // de-dupe by id when appending
          const seen = new Set<number>()
          const merged = [...(state.filterTaskList ?? []), ...incoming].filter((t) => {
            if (seen.has(t.id)) return false
            seen.add(t.id)
            return true
          })
          state.filterTaskList = merged
        } else {
          state.filterTaskList = incoming
        }

        state.labelCounts = action.payload.label_counts ?? []
        state.paginationDetails = action.payload.pagination_details ?? null
        state.lastRequestedPage = pageNum
        state.hasNext = Boolean(action.payload.pagination_details?.has_next)
        // Do not overwrite side panel counts here; they come from kanban-counts API
      })
      .addCase(getPatientTaskTrackerFiltered.rejected, (state) => {
        state.loadingPatientTaskTracker = false
        state.isFetchingPage = false // <— guard OFF even on error
      })
      .addCase(getCancelledPatientTasks.pending, (state) => {
        state.loadingCancelledInvites = true
        state.cancelledInvitesError = null
      })

      .addCase(getCancelledPatientTasks.fulfilled, (state, {payload}) => {
        state.loadingCancelledInvites = false
        state.cancelledInvites = payload.items
        state.cancelledInvitesMeta = {
          page: payload.page,
          size: payload.size,
          total: payload.total,
          totalPages: payload.totalPages,
          isLast: payload.isLast,
        }
      })

      .addCase(getCancelledPatientTasks.rejected, (state, {payload}) => {
        state.loadingCancelledInvites = false
        state.cancelledInvitesError = (payload as string) ?? 'Failed to fetch cancelled tasks'
      })
  },
})

export const {
  setIsOpenMoveToPlanningStateModal,
  setCardDetails,
  clearCardDetails,
  setIsOpenNeedMoreIfoModal,
  setIsOpenTreatmentReviewModal,
  setIsOpenTreatmentApproveModal,
  setIsOpenTreatmentApprovedModal,
  setIsOpenTreatmentRevisionModal,
  setIsOpenMoveToProductionStateModal,
  setIsOpenManufacturingCompleteModal,
  setManufacturingCompletionLockTaskId,
  setIsOpenShippingOrderModal,
  setIsOpenDeliveredOrderModal,
  setIsOpenErrorModal,
  setIsOpenDeliverFromPackageModal,
  resetFilterPagination,
  setSelectedAssignee,
  setSelectedPracticeLocation,
  resetKanbanFilters,
  resetCancelledInvites,
  setDynamicLabel,
  setDynamicStatus,
  setDynamicWorkflowStatusId,
  resetPlansList,
  setIsOpenConfirmPlanningDoneModal,
  setIsVspKanbanMovement,
} = KanbanSlice.actions
export default KanbanSlice.reducer
