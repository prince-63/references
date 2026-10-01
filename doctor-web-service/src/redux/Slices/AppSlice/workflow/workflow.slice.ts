import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {OrderType} from 'contexts/WorkflowConfigContext'
import {
  URL_ADD_WORKFLOW_STATUS,
  URL_DELETE_WORKFLOW_STATUS,
  URL_EDIT_WORKFLOW_STATUS,
  URL_GET_CARD_CONFIGURATION,
  URL_GET_LOGS,
  URL_GET_USER_TASK_DETAILS,
  URL_GET_WORKFLOW,
  URL_NEW_WORKFLOW,
  URL_UPDATE_CARD_CONFIGURATION,
  URL_UPDATE_WORKFLOW_STATUS_POSITIONS,
} from 'redux/Endpoints/apiEndpoints'
import {CardConfigurationField} from 'screens/settings/cardDisplay/CardDisplayPage'
import type {ManufacturingBatchStatus} from '@constants/manufacturingBatchStatus.constants'
import {getStorageType} from 'utils/storage'
import workflowNameConstants from '@constants/workflowName.constants'

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
  maps_to: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'COMPLETED'
  color?: string
  internal_name?: string
  description?: string
  customerEditable?: boolean
  popup?: boolean
  nonDeletable?: boolean
  showInternal?: boolean
  position: number
  label_name: string
}

export type WorkflowDefinition = {
  id: number
  profile_id: number
  org_id: number
  order_type: string
  name: string
  label: string
  system_defined?: boolean
  archived?: boolean
  metadata?: Record<string, any> | null
  statuses: WorkflowStatus[]
  created_at?: string | null
  updated_at?: string | null
  position?: number | null
}

export type SubWorkflow = {
  id: string
  name: string
  label: string
  statuses: WorkflowStatus[]
  allowAdditionalInProgress?: boolean
  showAdditionalToCustomer?: boolean
  position?: string
}

type WorkflowState = {
  aligner: SubWorkflow[]
  source?: 'redux' | 'profile' | 'window' | 'localStorage' | 'unknown'
  updatedAt?: number

  workFlowData: SubWorkflow[]
  newWorkFlowData: WorkflowDefinition[]
  loadingWorkFlow: boolean
  loading: boolean
  cardConfiguration: CardConfigurationField[]
  loadingCardConfiguration: boolean
  getAuditLogsList: any
  getIndividualTaskList: PatientTaskDetails | null
  latestManufacturingBatchStatus: ManufacturingBatchStatus | null
  getAllTask: PatientTaskDetails[] | []
  parentTask: PatientTaskDetails[] | []
  recentParentTask: PatientTaskDetails | null
  productionInHouseTask: PatientTaskDetails | null
  productionOutSourceTask: PatientTaskDetails | null
  manufacturingPlanId: number | null
  manufacturingBatchId: number | null

  auditLogsPaginationDetails: {
    page_number: number
    page_size: number
    total_activities: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  } | null
}

export interface PatientTaskDetails {
  id: number
  patient_id: number
  patient_name: string
  org_id: number
  workflow_id: number
  workflow_name: string
  workflow_label_name?: string | null
  current_workflow_status_id: number
  current_status_name: string
  current_workflow_status_label_name?: string | null
  previous_workflow_status_id: number | null
  gender?: string | null
  age?: number | null
  created_by?: string | null
  created_on?: string | Date
  updated_on?: string | Date
  product?: string | null
  follow_up_date?: string | Date | null
  case_type?: string | null
  assignee?: string | null
  assignee_id?: number | null
  clinic?: string | null
  created_for_profile_id?: number | null
  created_for_profile_name?: string | null
  order_type?: string | null
  priority_level?: string | null
  practice_name?: string | null
  comments_count?: number | null
  labels?: unknown | null
  is_active?: boolean
  is_archived?: boolean
  completion_date?: string | Date | null
  estimated_completion_date?: string | Date | null
  sequence_number?: number | null
  workflow_position?: number | null
  parent_task_id?: number | null
  order_id?: number | string | null
  manufacturing_batch_id?: number | null
  task_type?: string | null
  task_created_for?: string | null
  service_products?: ServiceProduct | null
  manufacturing_products?: unknown | null
  planning_case_type?: string | null
  customer_mapped_id?: string | null
  manufacturing_batch_response?: ManufacturingBatchResponse | null
  customer_profile_exists?: boolean
  manufacturing_sub_task_response?: {
    treatment_plan_id?: number
    manufacturing_id?: number | null
  } | null
  comments?: Array<{
    order_id?: number | string | null
    doctor_id?: number | null
    profile_id?: number | null
    notes?: string | null
    profile_image_url?: string | null
    display_name?: string | null
    created_at?: string | Date | null
    remark?: string | null
    task_id?: number | null
  }>
  product_type?: string | null
  product_name?: string | null
  product_description?: string | null
  product_image?: string | null
  task_order_type?: 'ALIGNER_ORDER' | 'PLANNING_ORDER' | null
  is_cloned_order?: boolean
  patient_created_on: string
}

export interface ServiceProduct {
  id: number
  doctor_id?: number | null
  created_at?: string | Date | null
  created_by?: number | null
  is_default?: boolean | null
  profile_id?: number | null
  updated_at?: string | Date | null
  updated_by?: number | null
  is_last_used?: boolean | null
  product_name?: string | null
  product_type?: string | null
  product_image?: string | null
  org_brand_name?: string | null
  organization_id?: number | null
  product_metadata?: any | null
  added_by_user_name?: string | null
  is_product_enabled?: boolean | null
  product_category_id?: number | null
  product_description?: string | null
  product_category_name?: string | null
  is_disabled_for_customer?: boolean | null
}

export interface ManufacturingBatchAlignerCounts {
  count?: number | null
  upper_range_start?: number | null
  lower_range_start?: number | null
  upper_range_end?: number | null
  lower_range_end?: number | null
  stages?: unknown | null
}

export interface ManufacturingBatchResponse {
  patient_id?: number | null
  treatment_plan_id?: number | null
  patient_full_name?: string | null
  patient_profile_url?: string | null
  case_type?: string | null
  customer?: string | null
  total_aligners?: ManufacturingBatchAlignerCounts | null
  delivered?: ManufacturingBatchAlignerCounts | null
  in_inventory?: ManufacturingBatchAlignerCounts | null
  pending?: ManufacturingBatchAlignerCounts | null
  transit?: ManufacturingBatchAlignerCounts | null
  due_by?: string | null
  reminder_date?: string | null
  reminder_id?: number | string | null
  order_id?: number | string | null
  latest_batch_manufacturing_status?: ManufacturingBatchStatus | null
  due_by_status?: string | null
  treatment_plan_status_completed?: boolean | null
  treatment_plan_status?: string | null
  batch_number?: number | string | null
  ongoing_task_packaged_count?: number | null
  current_batch_total_aligners?: number | null
  archived_on?: string | null
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

export interface WorkflowData {
  [key: string]: Stage[]
}

export const getWorkFlow = createAsyncThunk(
  'api/getWorkFlow',
  async (params: {profile_id?: number; workflowConfig?: string}, {rejectWithValue}) => {
    const organizationId = getStorageType().getItem('organizationId')
      ? Number(getStorageType().getItem('organizationId'))
      : null
    try {
      const response = await apiHelper(
        URL_GET_WORKFLOW +
          `profileId=${params.profile_id}&orgId=${organizationId}&orderType=ALIGNER&archived=false&workflowConfig=${params.workflowConfig}`,
        HttpMethod.GET,
        params
      )
      return response.data as SubWorkflow[]
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const addWorkflowStatus = createAsyncThunk(
  'api/addWorkflowStatus',
  async (
    params: {workflowId?: number; name: string; color: string; position: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_ADD_WORKFLOW_STATUS + `${params.workflowId}/statuses`,
        HttpMethod.POST,
        {
          name: params.name,
          label_name: params.name,
          description: null,
          internal_name: 'IN_PROGRESS',
          maps_to: 'IN_PROGRESS',
          color: params.color,
          custom: true,
          non_deletable: false,
          position: params.position,
        }
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const editWorkflowStatus = createAsyncThunk(
  'api/editWorkflowStatus',
  async (params: {statusId?: number; name: string; color: string}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_EDIT_WORKFLOW_STATUS + `${params.statusId}`,
        HttpMethod.PUT,
        {
          label_name: params.name,
          description: null,
          color: params.color,
        }
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const changePositionWorkflowStatus = createAsyncThunk(
  'api/changePositionWorkflowStatus',
  async (params: {statusId?: number; position: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_UPDATE_WORKFLOW_STATUS_POSITIONS + `${params.statusId}/position`,
        HttpMethod.PUT,
        {
          position: params.position,
        }
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const deleteWorkflowStatus = createAsyncThunk(
  'api/deleteWorkflowStatus',
  async (params: {statusId?: number; profileId?: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_DELETE_WORKFLOW_STATUS}?statusId=${params.statusId}&profileId=${params.profileId}`,
        HttpMethod.DELETE,
        params
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getCardConfiguration = createAsyncThunk(
  'api/getCardConfiguration',
  async (params: {profileId?: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GET_CARD_CONFIGURATION + `${params.profileId}`,
        HttpMethod.GET
      )

      return response.data?.card_display_fields || []
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const updateCardConfiguration = createAsyncThunk(
  'api/updateCardConfiguration',
  async (params: CardConfigurationField, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_UPDATE_CARD_CONFIGURATION + params?.id,
        HttpMethod.PUT,
        params
      )

      return response.data?.card_display_fields || []
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getAuditLogs = createAsyncThunk(
  'api/getAuditLogs',
  async (params: {patient_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_GET_LOGS, HttpMethod.POST, params)

      const rawData = response?.data

      if (Array.isArray(rawData)) {
        return {
          content: rawData,
          pagination_details: null,
        }
      }

      const content = Array.isArray(rawData?.content)
        ? rawData.content
        : Array.isArray(rawData)
          ? rawData
          : []

      return {
        content,
        pagination_details: rawData?.pagination_details ?? null,
      }
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getNewWorkflow = createAsyncThunk(
  'api/getNewWorkflow',
  async (
    params: {
      profile_id?: number
      organization_id: number
      kanban_name: string
      kanban_header_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_NEW_WORKFLOW, HttpMethod.POST, params)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.workflow?.loadingWorkFlow) {
        return false
      }
      const currentWorkflow = state.workflow?.newWorkFlowData
      const matchingWorkflow = Array.isArray(currentWorkflow)
        ? currentWorkflow.find((w: any) => w.name === arg.kanban_name)
        : currentWorkflow?.name === arg.kanban_name
          ? currentWorkflow
          : null

      if (matchingWorkflow?.statuses?.length) {
        return false
      }
    },
  }
)

export const getIndividualTask = createAsyncThunk(
  'api/getIndividualTask',
  async (
    params: {
      patient_id: number
      doctor_id: number
      organization_id?: number
      workflow_name?: string | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_USER_TASK_DETAILS, HttpMethod.POST, params)

      if (Array.isArray(response?.data)) {
        return response.data
      }
      return response?.data ? [response.data] : []
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

const initialState: WorkflowState = {
  aligner: [],
  source: 'unknown',
  updatedAt: undefined,
  parentTask: [],
  latestManufacturingBatchStatus: null,
  recentParentTask: null,
  productionInHouseTask: null,
  productionOutSourceTask: null,
  manufacturingPlanId: null,
  manufacturingBatchId: null,
  workFlowData: [] as SubWorkflow[],
  loadingWorkFlow: false,
  loading: false,
  newWorkFlowData: [] as WorkflowDefinition[],
  cardConfiguration: [] as CardConfigurationField[],
  getAuditLogsList: [] as any,
  loadingCardConfiguration: false,
  auditLogsPaginationDetails: null,
  getIndividualTaskList: null,
  getAllTask: [],
}

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setAlignerWorkflow(state, action: PayloadAction<SubWorkflow[]>) {
      state.aligner = action.payload || []
      state.source = 'redux'
      state.updatedAt = Date.now()
    },
    resetWorkflow(state) {
      state.aligner = []
      state.source = 'unknown'
      state.updatedAt = undefined
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(getWorkFlow.pending, (state) => {
        state.loadingWorkFlow = true
      })
      .addCase(getWorkFlow.fulfilled, (state, action) => {
        state.loadingWorkFlow = false
        state.workFlowData = action.payload
      })
      .addCase(getWorkFlow.rejected, (state) => {
        state.loadingWorkFlow = false
      })

      .addCase(getCardConfiguration.pending, (state) => {
        state.loadingCardConfiguration = true
      })
      .addCase(getCardConfiguration.fulfilled, (state, action) => {
        state.loadingCardConfiguration = false
        state.cardConfiguration = action.payload
      })
      .addCase(getCardConfiguration.rejected, (state) => {
        state.loadingCardConfiguration = false
      })

      .addCase(getAuditLogs.pending, (state) => {
        state.loadingCardConfiguration = true
      })
      .addCase(getAuditLogs.fulfilled, (state, action) => {
        state.loadingCardConfiguration = false
        const content = Array.isArray(action.payload?.content) ? action.payload.content : []
        state.getAuditLogsList = content
        state.auditLogsPaginationDetails = action.payload?.pagination_details ?? null
      })
      .addCase(getAuditLogs.rejected, (state) => {
        state.loadingCardConfiguration = false
        state.auditLogsPaginationDetails = null
      })

      .addCase(getNewWorkflow.pending, (state) => {
        state.loadingWorkFlow = true
      })
      .addCase(getNewWorkflow.fulfilled, (state, action) => {
        state.loadingWorkFlow = false
        state.newWorkFlowData = action.payload
      })
      .addCase(getNewWorkflow.rejected, (state) => {
        state.loadingWorkFlow = false
      })

      .addCase(getIndividualTask.pending, (state) => {
        state.loadingWorkFlow = true
      })
      .addCase(getIndividualTask.fulfilled, (state, action) => {
        state.loadingWorkFlow = false
        const tasks: PatientTaskDetails[] = Array.isArray(action.payload)
          ? (action.payload as PatientTaskDetails[])
          : []

        const productionInHouseTasks = tasks
          .filter((t) => t?.workflow_name === workflowNameConstants.PRODUCTION_IN_HOUSE)
          .sort((a, b) => b.id - a.id)
        const productionOutSourceTasks = tasks
          .filter((t) => t?.workflow_name === workflowNameConstants.PRODUCTION_OUTSOURCE)
          .sort((a, b) => b.id - a.id)

        const recentProductionInHouseTasks = productionInHouseTasks[0]
        const recentProductionOutSourceTask = productionOutSourceTasks[0]

        const parentTasks = tasks.filter((t) => !t?.parent_task_id)
        const recentParentTasks = !!parentTasks && parentTasks.length > 0 ? parentTasks[0] : null
        state.parentTask = parentTasks.length ? parentTasks : []
        state.recentParentTask = recentParentTasks
        state.latestManufacturingBatchStatus =
          recentProductionInHouseTasks?.manufacturing_batch_response
            ?.latest_batch_manufacturing_status ??
          recentProductionOutSourceTask?.manufacturing_batch_response
            ?.latest_batch_manufacturing_status ??
          null
        state.manufacturingPlanId =
          recentProductionInHouseTasks?.manufacturing_batch_response?.treatment_plan_id ??
          recentProductionOutSourceTask?.manufacturing_batch_response?.treatment_plan_id ??
          null
        state.manufacturingBatchId =
          recentProductionInHouseTasks?.manufacturing_batch_id ??
          recentProductionOutSourceTask?.manufacturing_batch_id ??
          null
        state.productionInHouseTask = recentProductionInHouseTasks
        state.productionOutSourceTask = recentProductionOutSourceTask
        state.getAllTask = tasks
        state.getIndividualTaskList = tasks[tasks.length - 1] ?? null
      })
      .addCase(getIndividualTask.rejected, (state) => {
        state.loadingWorkFlow = false
        state.getAllTask = []
        state.getIndividualTaskList = null
      })
  },
})

export const {setAlignerWorkflow, resetWorkflow} = workflowSlice.actions
export default workflowSlice.reducer
