// redux/Slices/AppSlice/Profile/Profile.slice.ts
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit'
import {
  URL_BATCHES_TASK_CREATION,
  URL_GET_MY_TASK_LIST,
  URL_GET_PRODUCTION_CHECKLIST_DATA,
  URL_MY_TASK_CREATION,
  URL_MY_TASK_DELETE,
  URL_MY_TASK_UPDATE,
  URL_CUSTOMER_ORDER_DETAIL,
  URL_PATIENT_DOCTOR_MINI_DASHBOARD,
  URL_PATIENT_DOCTOR_MINI_DASHBOARD_V4,
  URL_PATIENT_DOCTOR_MINI_DASHBOARD_CUSTOMER,
  URL_TOGGLE_CUSTOMER_TRACKING,
  URL_PATIENT_ORDER_LIST,
  URL_GET_PATIENT_DETAILS,
  URL_DOCTOR_TOGGLE_DETAILS,
  URL_VSP_MINI_DASHBOARD,
} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
export interface ProductionChecklistItem {
  id: number
  patient_id: number
  profile_id: number
  manufacturing_batch_id: number
  title: string
  checked: boolean
  created_at: string // ISO string
  updated_at: string // ISO string
}

export type ProductionChecklistResponse = ProductionChecklistItem[]
export interface TaskShape {
  my_task_id: number
  patient_id: number
  added_by_profile_id?: number
  title: string
  description: string | null
  assignee_name?: string
  assignee_profile_id?: number
  due_date: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  my_task_type?: 'MY_TASK' | 'PRODUCTION_CHECK_LIST' | 'PRODUCTION_CHECK_LIST_BATCH'
  batch_id?: number | null
  organization_id?: number
}

export type BatchChecklistItemInput = {
  patient_id: number
  profile_id: number
  manufacturing_batch_id: number
  title: string
  checked: boolean
}
export type BatchChecklistResult<T = unknown> = {
  ok: boolean // res.ok (2xx)
  status: number // HTTP status
  data: T | null // parsed JSON or null when empty
}

export const AddMyTaskData = createAsyncThunk(
  'api/AddMyTaskData',
  async (
    postDataNewTreatment: {
      doctor_id: number
      patient_id: number
      title: string
      description: string | null
      assignee_profile_id?: number
      due_date: string
      status: 'PENDING' | 'COMPLETED'
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      my_task_type?: 'MY_TASK' | 'PRODUCTION_CHECK_LIST' | 'PRODUCTION_CHECK_LIST_BATCH'
      batch_id?: number | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_MY_TASK_CREATION, HttpMethod.POST, postDataNewTreatment)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export type IPatientOrder = {
  order_id: string
  patient_id: number
  order_creation_date: string
  order_type: string
  order_status: string
  service_products: Product | null
  linked_order_id: string | null
  is_cloned_order: boolean | null
  product_type: string
  product_name: string
  product_description: string
  product_image: string
  isClonedOrder: boolean | null
}

export type CustomerOrderPagination = {
  page_number: number
  page_size: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export type CustomerOrder = IPatientOrder & {
  patient_name?: string
  gender?: string
  age?: number
  pagination_details?: CustomerOrderPagination
  order_type: string
}

export const AddBatchTaskData = createAsyncThunk<
  BatchChecklistResult,
  BatchChecklistItemInput[],
  {rejectValue: any}
>('api/AddBatchTaskData', async (input, {rejectWithValue}) => {
  try {
    const sanitizedData = input.map((item) => ({
      patient_id: Number(item.patient_id),
      profile_id: Number(item.profile_id),
      manufacturing_batch_id: Number(item.manufacturing_batch_id),
      title: String(item.title),
      checked: Boolean(item.checked),
    }))

    const response = await apiHelper(
      URL_BATCHES_TASK_CREATION,
      HttpMethod.POST,
      {
        data: sanitizedData,
      },
      true
    )

    const status = response?.status ?? 0
    const data = response?.data ?? null
    const ok = status >= 200 && status < 300

    return {ok, status, data}
  } catch (error: any) {
    if (error?.response) {
      return rejectWithValue({status: error.response.status, data: error.response.data})
    }
    return rejectWithValue({message: error?.message})
  }
})

export const UpdateMyTaskData = createAsyncThunk(
  'api/UpdateMyTaskData',
  async (
    param: {
      my_task_id: number
      doctor_id: number
      patient_id: number
      title: string
      description: string | null
      assignee_profile_id?: number
      due_date: string
      status: 'PENDING' | 'COMPLETED'
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      profile_id: number
      organization_id: number
      my_task_type?: 'MY_TASK' | 'PRODUCTION_CHECK_LIST' | 'PRODUCTION_CHECK_LIST_BATCH'
      batch_id?: number | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_MY_TASK_UPDATE, HttpMethod.PUT, param)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const DeleteMyTaskData = createAsyncThunk(
  'api/DeleteMyTaskData',
  async (param: {my_task_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_MY_TASK_DELETE + param.my_task_id,
        HttpMethod.DELETE,
        param
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getMyTaskList = createAsyncThunk(
  'api/getMyTaskList',
  async (
    param: {
      doctor_id: number
      patient_id: number
      filter: 'ALL' | 'COMPLETED' | 'PENDING' | null
      my_task_id?: number
      assignee_profile_id?: number
      order: 'ASC' | 'DESC'
      profile_id?: number
      my_task_type?: 'MY_TASK' | 'PRODUCTION_CHECK_LIST' | 'PRODUCTION_CHECK_LIST_BATCH'
      batch_id?: number | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_MY_TASK_LIST, HttpMethod.POST, param)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getCheckListData = createAsyncThunk(
  'api/getCheckListData',
  async (
    params: {
      batch_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_PRODUCTION_CHECKLIST_DATA}${params.batch_id}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

type BatchKey = string // `${patient_id}:${batch_id ?? 'null'}`
const makeBatchKey = (patient_id: number, batch_id: number | null | undefined): BatchKey =>
  `${patient_id}:${batch_id ?? 'null'}`

export const PatientOrderList = createAsyncThunk(
  'api/PatientOrderList',
  async (
    param: {
      doctor_id: number
      patient_id: number
      sort_criteria: {
        type: string
        sort: string
      }
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_PATIENT_ORDER_LIST, HttpMethod.POST, param)
      const filtered = response.data?.filter((o: IPatientOrder) => o.order_status !== 'DRAFT') ?? []
      return filtered
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export type CustomerOrderDetailRequest = {
  sort_criteria: {
    type: string
    sort: string
  }

  customer_profile_id: number
  page?: number
  page_size?: number
  search?: string | null
}

export const getCustomerOrderDetail = createAsyncThunk(
  'api/getCustomerOrderDetail',
  async (param: CustomerOrderDetailRequest, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_CUSTOMER_ORDER_DETAIL, HttpMethod.POST, param)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getPatientDoctorMiniDashboard = createAsyncThunk(
  'api/getPatientDoctorMiniDashboard',
  async (
    params: {
      customer_profile_id: number
      organization_id: number
      profile_id: number
      doctor_id: number
      user_type: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_PATIENT_DOCTOR_MINI_DASHBOARD, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export type MiniDashboardV4Request = {
  customer_profile_id: number
  profile_id: number
}

export const getPatientDoctorMiniDashboardV4 = createAsyncThunk(
  'api/getPatientDoctorMiniDashboardV4',
  async (params: MiniDashboardV4Request, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_PATIENT_DOCTOR_MINI_DASHBOARD_V4,
        HttpMethod.POST,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export type CustomerMiniDashboardRequest = {
  doctor_id: number
  profile_id: number
  owner_profile_id: number
  user_type: 'CUSTOMER' | string
}

export type CustomerMiniDashboardResponse = {
  total_patients: number
  total_customer_orders: number
  last_order_at: string | null
  customer_tracking_enabled: boolean
  customer_stl_file_view_enabled: boolean
  customer_scan_file_view_enabled: boolean
  customer_print_file_view_enabled: boolean
}

export type VspMiniDashboardPaginationDetails = {
  page_number: number
  page_size: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export type VspMiniDashboardOrderInfo = {
  patient_id: number
  patient_name: string
  order_id: string
  service_product_name: string
  order_type: string
  created_on: string
}

export type VspMiniDashboardPatientInfo = {
  patient_id: number
  patient_uuid?: string
  patient_name: string
  created_by: string
}

export type VspMiniDashboardResponse = CustomerMiniDashboardResponse & {
  vsp_order_details: {
    pagination_details: VspMiniDashboardPaginationDetails
    order_info_list: VspMiniDashboardOrderInfo[]
  }
  vsp_patient_details: {
    pagination_details: VspMiniDashboardPaginationDetails
    patient_info_list: VspMiniDashboardPatientInfo[]
  }
}

export type VspMiniDashboardRequest = {
  profile_id: number
  customer_profile_id: number
  order_sort_by: string
  patient_sort_by: string
  order_by: 'ASC' | 'DESC' | string
  pagination: {
    order_pagination: {
      page_size: number
      page_no: number
    }
    patient_pagination: {
      page_size: number
      page_no: number
    }
  }
}

const getMiniDashboardRequestKey = (
  params:
    | MiniDashboardV4Request
    | CustomerMiniDashboardRequest
    | VspMiniDashboardRequest
    | {
        customer_profile_id?: number
        profile_id?: number
        owner_profile_id?: number
      }
    | undefined
) => {
  if (!params) return 'unknown'

  if ('customer_profile_id' in params) {
    return `customer:${params.customer_profile_id}:profile:${params.profile_id ?? 'unknown'}`
  }

  if ('owner_profile_id' in params) {
    return `owner:${params.owner_profile_id}:profile:${params.profile_id ?? 'unknown'}`
  }

  return `profile:${params.profile_id ?? 'unknown'}`
}

export const getPatientDoctorMiniDashboardCustomer = createAsyncThunk<
  CustomerMiniDashboardResponse,
  CustomerMiniDashboardRequest
>(
  'api/getPatientDoctorMiniDashboardCustomer',
  async (params: CustomerMiniDashboardRequest, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_PATIENT_DOCTOR_MINI_DASHBOARD_CUSTOMER,
        HttpMethod.POST,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getVspMiniDashboard = createAsyncThunk<
  VspMiniDashboardResponse,
  VspMiniDashboardRequest
>('api/getVspMiniDashboard', async (params: VspMiniDashboardRequest, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_VSP_MINI_DASHBOARD, HttpMethod.POST, params)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data)
  }
})

export const getPatientDetails = createAsyncThunk(
  'api/getPatientDetails',
  async (params: {patientId: number}, {rejectWithValue}) => {
    const {patientId} = params
    try {
      const url = `${URL_GET_PATIENT_DETAILS}/${patientId}`
      const response = await apiHelper(url, HttpMethod.GET)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const toggleCustomerTracking = createAsyncThunk(
  'api/toggleCustomerTracking',
  async ({customerProfileId}: {customerProfileId: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_TOGGLE_CUSTOMER_TRACKING}${customerProfileId}`,
        HttpMethod.POST,
        {}
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export type DoctorToggleType = 'TRACKING' | 'SCAN_FILE' | 'PRINT_FILE'

export const toggleDoctorDetails = createAsyncThunk(
  'api/toggleDoctorDetails',
  async (
    payload: {
      profile_id: number
      organization_id: number
      doctor_id: number
      customer_profile_id: number
      toggle_type: DoctorToggleType[]
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_DOCTOR_TOGGLE_DETAILS, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const ProfileSlice = createSlice({
  name: 'ProfileSlice',
  initialState: {
    myTaskList: null as TaskShape[] | null,
    loadingMyTasks: false,

    productionTaskList: null as TaskShape[] | null,
    loadingProductionTasks: false,

    productionTaskListByBatch: {} as Record<BatchKey, TaskShape[]>,
    loadingProductionTasksByBatch: {} as Record<BatchKey, boolean>,

    productionChecklistLocalByPatient: {} as Record<number, TaskShape[]>,
    getProductionChecklist: [] as ProductionChecklistResponse | null,

    patientOrderList: [] as IPatientOrder[],
    loadingPatientOrderList: false,
    customerOrderDetail: [] as CustomerOrder[],
    loadingCustomerOrderDetail: false,
    customerOrderPagination: null as CustomerOrderPagination | null,
    miniDashboardData: null as any,
    loadingMiniDashboard: false,
    latestMiniDashboardRequestId: null as string | null,
    latestMiniDashboardRequestKey: null as string | null,
    togglingCustomerTracking: false,
    toggleCustomerTrackingStatus: 'idle' as 'idle' | 'pending' | 'succeeded' | 'failed',
    toggleCustomerTrackingError: null as unknown,
    patientDetailsList: null as any,
    loadingPatientDetails: false,
  },
  reducers: {
    setMyTaskList(state, action: PayloadAction<TaskShape[] | null>) {
      state.myTaskList = action.payload
    },
    clearMyTaskList(state) {
      state.myTaskList = null
    },
    setProductionTaskList(state, action: PayloadAction<TaskShape[] | null>) {
      state.productionTaskList = action.payload
    },
    clearProductionTaskList(state) {
      state.productionTaskList = null
    },
    setProductionTaskListByBatch(
      state,
      action: PayloadAction<{patient_id: number; batch_id: number | null; tasks: TaskShape[]}>
    ) {
      const key = makeBatchKey(action.payload.patient_id, action.payload.batch_id)
      state.productionTaskListByBatch[key] = action.payload.tasks
    },
    clearProductionTaskListByBatch(
      state,
      action: PayloadAction<{patient_id: number; batch_id: number | null}>
    ) {
      const key = makeBatchKey(action.payload.patient_id, action.payload.batch_id)
      delete state.productionTaskListByBatch[key]
    },
    clearAllBatchProductionTaskLists(state) {
      state.productionTaskListByBatch = {}
      state.loadingProductionTasksByBatch = {}
    },

    setProductionChecklistLocal(
      state,
      action: PayloadAction<{patientId: number; tasks: TaskShape[]}>
    ) {
      state.productionChecklistLocalByPatient[action.payload.patientId] = action.payload.tasks
    },

    /** Add a new local checklist item */
    addProductionTaskLocal(
      state,
      action: PayloadAction<{patientId: number; title: string; priority?: TaskShape['priority']}>
    ) {
      const {patientId, title, priority = 'MEDIUM'} = action.payload
      const list = state.productionChecklistLocalByPatient[patientId] || []
      const newItem: TaskShape = {
        my_task_id: Date.now(), // simple unique id
        patient_id: patientId,
        title,
        description: null,
        due_date: new Date().toISOString(),
        status: 'PENDING',
        priority,
        my_task_type: 'PRODUCTION_CHECK_LIST',
      }
      state.productionChecklistLocalByPatient[patientId] = [...list, newItem]
    },

    /** Toggle COMPLETE/PENDING for a local item */
    toggleProductionTaskLocal(
      state,
      action: PayloadAction<{patientId: number; my_task_id: number}>
    ) {
      const {patientId, my_task_id} = action.payload
      const list = state.productionChecklistLocalByPatient[patientId]
      if (!list) return
      state.productionChecklistLocalByPatient[patientId] = list.map((t) =>
        t.my_task_id === my_task_id
          ? {...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'}
          : t
      )
    },

    /** Clear all local items for a patient */
    clearProductionChecklistLocal(state, action: PayloadAction<{patientId: number}>) {
      delete state.productionChecklistLocalByPatient[action.payload.patientId]
    },
  },
  extraReducers: (builder) => {
    /** Server-backed lists loading states (unchanged) */
    builder
      .addCase(getMyTaskList.pending, (state, action) => {
        const type = (action.meta?.arg as any)?.my_task_type
        if (type === 'PRODUCTION_CHECK_LIST') {
          state.loadingProductionTasks = true
        } else if (type === 'PRODUCTION_CHECK_LIST_BATCH') {
          const {patient_id, batch_id} = action.meta?.arg as any
          const batchKey = makeBatchKey(patient_id, batch_id)
          state.loadingProductionTasksByBatch[batchKey] = true
        } else {
          state.loadingMyTasks = true
        }
      })
      .addCase(getMyTaskList.fulfilled, (state, action) => {
        const type = (action.meta?.arg as any)?.my_task_type
        if (type === 'PRODUCTION_CHECK_LIST') {
          state.loadingProductionTasks = false
          state.productionTaskList = action.payload
        } else if (type === 'PRODUCTION_CHECK_LIST_BATCH') {
          const {patient_id, batch_id} = action.meta?.arg as any
          const batchKey = makeBatchKey(patient_id, batch_id)
          state.loadingProductionTasksByBatch[batchKey] = false
          state.productionTaskListByBatch[batchKey] = action.payload
        } else {
          state.loadingMyTasks = false
          state.myTaskList = action.payload
        }
      })
      .addCase(getMyTaskList.rejected, (state, action) => {
        const type = (action.meta?.arg as any)?.my_task_type
        if (type === 'PRODUCTION_CHECK_LIST') {
          state.loadingProductionTasks = false
        } else if (type === 'PRODUCTION_CHECK_LIST_BATCH') {
          const {patient_id, batch_id} = action.meta?.arg as any
          const batchKey = makeBatchKey(patient_id, batch_id)
          state.loadingProductionTasksByBatch[batchKey] = false
        } else {
          state.loadingMyTasks = false
        }
      })

    builder.addCase(getCheckListData.pending, (state) => {
      state.loadingProductionTasks = true
    })

    builder.addCase(getCheckListData.fulfilled, (state, action) => {
      state.loadingProductionTasks = false
      state.getProductionChecklist = action.payload
    })
    builder.addCase(getCheckListData.rejected, (state) => {
      state.loadingProductionTasks = false
    })
    builder.addCase(PatientOrderList.rejected, (state) => {
      state.loadingPatientOrderList = false
    })

    builder.addCase(PatientOrderList.pending, (state) => {
      state.loadingPatientOrderList = true
    })

    builder.addCase(toggleCustomerTracking.pending, (state) => {
      state.togglingCustomerTracking = true
      state.toggleCustomerTrackingStatus = 'pending'
      state.toggleCustomerTrackingError = null
    })

    builder.addCase(toggleCustomerTracking.fulfilled, (state, action) => {
      state.togglingCustomerTracking = false
      state.toggleCustomerTrackingStatus = 'succeeded'
      const payload = action.payload as any
      const current = state.miniDashboardData

      // Determine the next enabled value: prefer API payload, else flip current
      const nextEnabled =
        payload && typeof payload.customer_tracking_enabled === 'boolean'
          ? payload.customer_tracking_enabled
          : !(
              current &&
              !Array.isArray(current) &&
              typeof current.customer_tracking_enabled === 'boolean' &&
              current.customer_tracking_enabled
            )

      // If API returned an object, merge it; otherwise just update the toggle flag
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        state.miniDashboardData = {
          ...current,
          ...payload,
          customer_tracking_enabled: nextEnabled,
        }
      } else if (current && !Array.isArray(current)) {
        state.miniDashboardData = {
          ...current,
          customer_tracking_enabled: nextEnabled,
        }
      }
    })

    builder.addCase(toggleCustomerTracking.rejected, (state, action) => {
      state.togglingCustomerTracking = false
      state.toggleCustomerTrackingStatus = 'failed'
      state.toggleCustomerTrackingError = action.payload ?? action.error
    })

    builder.addCase(toggleDoctorDetails.pending, (state) => {
      state.togglingCustomerTracking = true
      state.toggleCustomerTrackingStatus = 'pending'
      state.toggleCustomerTrackingError = null
    })

    builder.addCase(toggleDoctorDetails.fulfilled, (state, action) => {
      state.togglingCustomerTracking = false
      state.toggleCustomerTrackingStatus = 'succeeded'
      const toggleTypes = (action.meta as any)?.arg?.toggle_type as string[] | undefined
      if (toggleTypes?.includes('TRACKING')) {
        const payload = action.payload as any
        const current = state.miniDashboardData

        // Determine the next enabled value: prefer API payload, else flip current
        const nextEnabled =
          payload && typeof payload.customer_tracking_enabled === 'boolean'
            ? payload.customer_tracking_enabled
            : !(
                current &&
                !Array.isArray(current) &&
                typeof current.customer_tracking_enabled === 'boolean' &&
                current.customer_tracking_enabled
              )

        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          state.miniDashboardData = {
            ...current,
            ...payload,
            customer_tracking_enabled: nextEnabled,
          }
        } else if (current && !Array.isArray(current)) {
          state.miniDashboardData = {
            ...current,
            customer_tracking_enabled: nextEnabled,
          }
        }
      }
    })

    builder.addCase(toggleDoctorDetails.rejected, (state, action) => {
      state.togglingCustomerTracking = false
      state.toggleCustomerTrackingStatus = 'failed'
      state.toggleCustomerTrackingError = action.payload ?? action.error
    })

    builder.addCase(PatientOrderList.fulfilled, (state, action) => {
      state.loadingPatientOrderList = false
      state.patientOrderList = action.payload
    })

    builder.addCase(getCustomerOrderDetail.pending, (state) => {
      state.loadingCustomerOrderDetail = true
    })
    builder.addCase(getCustomerOrderDetail.fulfilled, (state, action) => {
      state.loadingCustomerOrderDetail = false
      const data = action.payload as any
      const orders: CustomerOrder[] = Array.isArray(data) ? data : (data?.orders ?? [])
      const rawPagination =
        (Array.isArray(data) ? data?.[0]?.pagination_details : data?.pagination_details) ?? null
      const pagination: CustomerOrderPagination | null = rawPagination
        ? {
            page_number: Number(rawPagination.page_number) || 0,
            page_size: Number(rawPagination.page_size) || 0,
            total_patients: Number(rawPagination.total_patients) || 0,
            total_pages: Number(rawPagination.total_pages) || 0,
            has_next: Boolean(rawPagination.has_next),
            has_previous: Boolean(rawPagination.has_previous),
          }
        : null

      state.customerOrderDetail = orders
      state.customerOrderPagination = pagination
    })
    builder.addCase(getCustomerOrderDetail.rejected, (state) => {
      state.loadingCustomerOrderDetail = false
    })

    builder.addCase(getPatientDetails.pending, (state) => {
      state.loadingPatientDetails = true
    })
    builder.addCase(getPatientDetails.fulfilled, (state, action) => {
      state.loadingPatientDetails = false
      state.patientDetailsList = action.payload
    })
    builder.addCase(getPatientDetails.rejected, (state) => {
      state.loadingPatientDetails = false
    })

    builder.addCase(getPatientDoctorMiniDashboard.pending, (state, action) => {
      state.loadingMiniDashboard = true
      state.latestMiniDashboardRequestId = action.meta.requestId
      state.latestMiniDashboardRequestKey = getMiniDashboardRequestKey(action.meta.arg as any)
    })
    builder.addCase(getPatientDoctorMiniDashboard.fulfilled, (state, action) => {
      if (state.latestMiniDashboardRequestId !== action.meta.requestId) return
      state.loadingMiniDashboard = false
      state.miniDashboardData = action.payload
    })
    builder.addCase(getPatientDoctorMiniDashboard.rejected, (state, action) => {
      if (state.latestMiniDashboardRequestId !== action.meta.requestId) return
      state.loadingMiniDashboard = false
    })

    builder.addCase(getPatientDoctorMiniDashboardV4.pending, (state, action) => {
      state.loadingMiniDashboard = true
      state.latestMiniDashboardRequestId = action.meta.requestId
      state.latestMiniDashboardRequestKey = getMiniDashboardRequestKey(action.meta.arg)
    })
    builder.addCase(getPatientDoctorMiniDashboardV4.fulfilled, (state, action) => {
      if (state.latestMiniDashboardRequestId !== action.meta.requestId) return
      state.loadingMiniDashboard = false
      state.miniDashboardData = action.payload
    })
    builder.addCase(getPatientDoctorMiniDashboardV4.rejected, (state, action) => {
      if (state.latestMiniDashboardRequestId !== action.meta.requestId) return
      state.loadingMiniDashboard = false
    })

    builder.addCase(getPatientDoctorMiniDashboardCustomer.pending, (state, action) => {
      state.loadingMiniDashboard = true
      state.latestMiniDashboardRequestId = action.meta.requestId
      state.latestMiniDashboardRequestKey = getMiniDashboardRequestKey(action.meta.arg)
    })
    builder.addCase(getPatientDoctorMiniDashboardCustomer.fulfilled, (state, action) => {
      if (state.latestMiniDashboardRequestId !== action.meta.requestId) return
      state.loadingMiniDashboard = false
      state.miniDashboardData = action.payload
    })
    builder.addCase(getPatientDoctorMiniDashboardCustomer.rejected, (state, action) => {
      if (state.latestMiniDashboardRequestId !== action.meta.requestId) return
      state.loadingMiniDashboard = false
    })

    builder.addCase(getVspMiniDashboard.pending, (state, action) => {
      state.loadingMiniDashboard = true
      state.latestMiniDashboardRequestId = action.meta.requestId
      state.latestMiniDashboardRequestKey = getMiniDashboardRequestKey(action.meta.arg)
    })
    builder.addCase(getVspMiniDashboard.fulfilled, (state, action) => {
      if (state.latestMiniDashboardRequestId !== action.meta.requestId) return
      state.loadingMiniDashboard = false
      state.miniDashboardData = action.payload
    })
    builder.addCase(getVspMiniDashboard.rejected, (state, action) => {
      if (state.latestMiniDashboardRequestId !== action.meta.requestId) return
      state.loadingMiniDashboard = false
    })
  },
})

/** Export actions */
export const {
  // server lists
  setMyTaskList,
  clearMyTaskList,
  setProductionTaskList,
  clearProductionTaskList,
  setProductionTaskListByBatch,
  clearProductionTaskListByBatch,
  clearAllBatchProductionTaskLists,

  // local-only production checklist
  setProductionChecklistLocal,
  addProductionTaskLocal,
  toggleProductionTaskLocal,
  clearProductionChecklistLocal,
} = ProfileSlice.actions

// Alias to keep your previous import name working (if used elsewhere)
export const {setProductionTaskList: setProductTaskList} = ProfileSlice.actions

export default ProfileSlice.reducer
