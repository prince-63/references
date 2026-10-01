import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_VSP_DEFAULT_BILLING_ADDRESS,
  URL_VSP_DEFAULT_SHIPPING_ADDRESS,
  URL_VSP_SHIPPING_DETAILS,
  URL_ADD_VSP_SHIPPING_DETAILS,
  URL_VSP_ORDERS,
} from 'redux/Endpoints/apiEndpoints'

export type VspOrderStatus = 'DRAFT' | 'SUBMITTED' | 'CANCELLED' | string
export type VspCaseRecordSelectionMode = 'ADD_NEW' | 'USE_EXISTING' | string
export type VspPrescriptionMode = 'CREATE_NEW' | 'USE_EXISTING' | string

export interface VspCaseRecordRequest {
  record_selection_mode: VspCaseRecordSelectionMode
  extraoral_photo_file_ids?: number[]
  intraoral_photo_file_ids?: number[]
  intraoral_scan_file_ids?: number[]
  stone_cast_file_ids?: number[]
  dicom_file_ids?: number[]
  radio_grap_file_ids?: number[]
  external_links?: string[]
  order_id?: string
  patient_id?: number
}

export interface VspPrescriptionRequest {
  prescription_mode: VspPrescriptionMode
  is_single_jaw?: boolean
  is_bi_jaw?: boolean
  is_undecided?: boolean
  is_genioplasty?: boolean
  is_others?: boolean
  others_description?: string
  order_id?: string
  prescription_id?: number
  treatment_plan?: string
  tentative_surgery_date?: string
  earliest_treatment_plan_by_date?: string
  patient_id?: number
}

export interface VspShippingDetailsRequest {
  shipping_id?: string | number
  addressed_to?: string | null
  name?: string | null
  address_line?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  pincode?: string | null
  default?: boolean
  mobile_number?: string | null
  profile_id?: number | null
  customer_profile_id?: number | null
}

export interface VspBillingDetailsRequest {
  name?: string
  address_line?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  default?: boolean
}

export interface CreateVspOrderRequest {
  patient_id: number
  service_product_id: number
  oral_surgeon_name?: string
  orthodontist_name?: string
  notes_for_lab?: string

  case_record_id?: number
  case_record?: VspCaseRecordRequest

  prescription_id?: number
  prescription?: VspPrescriptionRequest
  shipping_details?: VspShippingDetailsRequest
  billing_details?: VspBillingDetailsRequest

  profile_id?: number
  receiver_profile_id?: number
  sender_profile_id?: number
  status?: VspOrderStatus
}

export interface UpdateVspOrderRequest {
  order_id: string
  patient_id: number
  service_product_id?: number
  case_record_id?: number
  prescription_id?: number
  prescription?: VspPrescriptionRequest
  oral_surgeon_name?: string
  orthodontist_name?: string
  notes_for_lab?: string
  shipping_details?: VspShippingDetailsRequest
  billing_details?: VspBillingDetailsRequest
  status?: VspOrderStatus
  profile_id?: number
  receiver_profile_id?: number
  sender_profile_id?: number
}

export interface GetVspOrderByIdRequest {
  order_id: string
}

export interface UpdateVspOrderStatusRequest {
  order_id: string
  status: VspOrderStatus
}

export interface GetVspDefaultAddressRequest {
  profileId: number
  customerProfileId?: number | null
}

export interface VspDefaultShippingAddressResponse {
  shippingId?: string
  addressedTo?: string
  name?: string
  addressLine?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  isDefault?: boolean
  profileId?: number | null
  customerProfileId?: number | null
  createdAt?: string
}

export interface VspDefaultBillingAddressResponse {
  billingId?: string
  name?: string
  addressLine?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  isDefault?: boolean
  profileId?: number | null
  customerProfileId?: number | null
  createdAt?: string
}

export interface VspFile {
  file_id: number
  drive_file_id: string | null
  name: string
  url: string
  thumbnail_url: string | null
  download_url: string | null
  full_path: string
  created_by: number
  created_by_user_type: string
  deleted_by: number | null
  deleted_by_user_type: string | null
  folder: boolean
  type: string
  extension: string
  child_file_count: number
  child_folder_count: number
  children_files: string[]
  size: number
  created_at: string
  is_cloned_file: boolean
  is_purchase_order_files: boolean
  is_gdrive_platform: boolean
  user_profile_id: number
  files_from_treatment_plan: boolean
  file_display_to_patient: boolean
  default_folder: boolean
  patient_folder: boolean
}

export interface VspCaseRecordResponse {
  id: number
  order_id: string | null
  record_selection_mode: VspCaseRecordSelectionMode
  status: VspOrderStatus
  extraoral_photo_files: VspFile[]
  intraoral_photo_files: VspFile[]
  intraoral_scan_files: VspFile[]
  stone_cast_files: VspFile[]
  dicom_files: VspFile[]
  radio_grap_files?: VspFile[]
  external_links: string[]
  created_at: string
  updated_at: string
}

export interface VspPrescriptionResponse {
  id: number
  order_id: string
  prescription_mode: VspPrescriptionMode
  is_single_jaw: boolean
  is_bi_jaw: boolean
  is_undecided: boolean
  is_genioplasty: boolean
  is_others: boolean
  others_description: string
  treatment_plan: string
  tentative_surgery_date: string
  earliest_treatment_plan_by_date: string
  status: VspOrderStatus
  created_at: string
  updated_at: string
}

export interface VspTreatmentPlanResponse {
  id: number
  order_id: string
  plan_name: string
  plan_index: number
  plan_type: string
  attachment_files: VspFile[]
  lab_comments: string
  status: VspOrderStatus
  created_at: string
  updated_at: string
}

export interface CreateVspOrderResponse {
  order_id: string
  patient_id: number
  patient_name: string
  created_by_user_profile_id: number
  assigned_to_user_profile_id: number
  receiver_profile_id?: number
  sender_profile_id?: number
  service_product_id: number
  service_product_name: string
  status: VspOrderStatus
  oral_surgeon_name: string
  orthodontist_name: string
  notes_for_lab: string
  shipping_details?: VspShippingDetailsRequest
  billing_details?: VspBillingDetailsRequest
  case_records: VspCaseRecordResponse[]
  prescriptions: VspPrescriptionResponse[]
  treatment_plans: VspTreatmentPlanResponse[]
  created_at: string
  updated_at: string
  gender: string
  age: string
  customer_mapped_id: string
}

export interface VspOrdersState {
  createVspOrderLoading: boolean
  createVspOrderError: string | null
  createdVspOrder: CreateVspOrderResponse | null
  updateVspOrderLoading: boolean
  updateVspOrderError: string | null
  updatedVspOrder: CreateVspOrderResponse | null
  getVspOrderByIdLoading: boolean
  getVspOrderByIdError: string | null
  vspOrderDetails: CreateVspOrderResponse | null
  updateVspOrderStatusLoading: boolean
  updateVspOrderStatusError: string | null
}

const initialState: VspOrdersState = {
  createVspOrderLoading: false,
  createVspOrderError: null,
  createdVspOrder: null,
  updateVspOrderLoading: false,
  updateVspOrderError: null,
  updatedVspOrder: null,
  getVspOrderByIdLoading: false,
  getVspOrderByIdError: null,
  vspOrderDetails: null,
  updateVspOrderStatusLoading: false,
  updateVspOrderStatusError: null,
}

const getErrorMessage = (error: unknown, fallback: string = 'An error occurred') => {
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as {message?: unknown}).message === 'string') {
      return (error as {message: string}).message
    }
    if (
      'status' in error &&
      typeof (error as {status?: {message?: unknown}}).status?.message === 'string'
    ) {
      return (error as {status: {message: string}}).status.message
    }
  }
  return fallback
}

const buildVspDefaultAddressUrl = (baseUrl: string, payload: GetVspDefaultAddressRequest) => {
  const searchParams = new URLSearchParams({
    profileId: String(payload.profileId),
  })

  if (
    payload.customerProfileId !== undefined &&
    payload.customerProfileId !== null &&
    payload.customerProfileId > 0
  ) {
    searchParams.set('customerProfileId', String(payload.customerProfileId))
  }

  return `${baseUrl}?${searchParams.toString()}`
}

export const createVspOrder = createAsyncThunk<
  CreateVspOrderResponse,
  CreateVspOrderRequest,
  {rejectValue: unknown}
>('vspOrders/createVspOrder', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_VSP_ORDERS, HttpMethod.POST, payload)
    return response.data as CreateVspOrderResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const updateVspOrder = createAsyncThunk<
  CreateVspOrderResponse,
  UpdateVspOrderRequest,
  {rejectValue: unknown}
>('vspOrders/updateVspOrder', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_VSP_ORDERS, HttpMethod.PUT, payload)
    return response.data as CreateVspOrderResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const getVspOrderById = createAsyncThunk<
  CreateVspOrderResponse,
  GetVspOrderByIdRequest,
  {rejectValue: unknown}
>('vspOrders/getVspOrderById', async ({order_id}, {rejectWithValue}) => {
  try {
    const response = await apiHelper(`${URL_VSP_ORDERS}/${order_id}`, HttpMethod.GET)
    return response.data as CreateVspOrderResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const getVspDefaultShippingAddress = createAsyncThunk<
  VspDefaultShippingAddressResponse,
  GetVspDefaultAddressRequest,
  {rejectValue: unknown}
>('vspOrders/getVspDefaultShippingAddress', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(
      buildVspDefaultAddressUrl(URL_VSP_DEFAULT_SHIPPING_ADDRESS, payload),
      HttpMethod.GET
    )
    return response.data as VspDefaultShippingAddressResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const addVspShippingDetails = createAsyncThunk<
  any,
  VspShippingDetailsRequest,
  {rejectValue: unknown}
>('vspOrders/addVspShippingDetails', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_ADD_VSP_SHIPPING_DETAILS, HttpMethod.POST, payload)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const updateVspShippingDetails = createAsyncThunk<
  any,
  VspShippingDetailsRequest,
  {rejectValue: unknown}
>('vspOrders/updateVspShippingDetails', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_VSP_SHIPPING_DETAILS, HttpMethod.PUT, payload)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const getVspDefaultBillingAddress = createAsyncThunk<
  VspDefaultBillingAddressResponse,
  GetVspDefaultAddressRequest,
  {rejectValue: unknown}
>('vspOrders/getVspDefaultBillingAddress', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(
      buildVspDefaultAddressUrl(URL_VSP_DEFAULT_BILLING_ADDRESS, payload),
      HttpMethod.GET
    )
    return response.data as VspDefaultBillingAddressResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const updateVspOrderStatus = createAsyncThunk<
  CreateVspOrderResponse,
  UpdateVspOrderStatusRequest,
  {rejectValue: unknown}
>('vspOrders/updateVspOrderStatus', async ({order_id, status}, {rejectWithValue}) => {
  try {
    const response = await apiHelper(
      `${URL_VSP_ORDERS}/${order_id}/status?status=${status}`,
      HttpMethod.PATCH,
      {}
    )
    return response.data as CreateVspOrderResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

const vspOrdersSlice = createSlice({
  name: 'vspOrders',
  initialState,
  reducers: {
    resetOrders: (state) => {
      state.vspOrderDetails = null
    },
    resetCreateVspOrderState: (state) => {
      state.createVspOrderLoading = false
      state.createVspOrderError = null
      state.createdVspOrder = null
    },
    resetUpdateVspOrderState: (state) => {
      state.updateVspOrderLoading = false
      state.updateVspOrderError = null
      state.updatedVspOrder = null
    },
    resetGetVspOrderByIdState: (state) => {
      state.getVspOrderByIdLoading = false
      state.getVspOrderByIdError = null
      state.vspOrderDetails = null
    },
    resetUpdateVspOrderStatusState: (state) => {
      state.updateVspOrderStatusLoading = false
      state.updateVspOrderStatusError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVspOrder.pending, (state) => {
        state.createVspOrderLoading = true
        state.createVspOrderError = null
      })
      .addCase(createVspOrder.fulfilled, (state, action) => {
        state.createVspOrderLoading = false
        state.createdVspOrder = action.payload
        state.vspOrderDetails = action.payload
      })
      .addCase(createVspOrder.rejected, (state, action) => {
        state.createVspOrderLoading = false
        state.createVspOrderError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(updateVspOrder.pending, (state) => {
        state.updateVspOrderLoading = true
        state.updateVspOrderError = null
      })
      .addCase(updateVspOrder.fulfilled, (state, action) => {
        state.updateVspOrderLoading = false
        state.updatedVspOrder = action.payload
        state.vspOrderDetails = action.payload
      })
      .addCase(updateVspOrder.rejected, (state, action) => {
        state.updateVspOrderLoading = false
        state.updateVspOrderError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(getVspOrderById.pending, (state) => {
        state.getVspOrderByIdLoading = true
        state.getVspOrderByIdError = null
      })
      .addCase(getVspOrderById.fulfilled, (state, action) => {
        state.getVspOrderByIdLoading = false
        state.vspOrderDetails = action.payload
      })
      .addCase(getVspOrderById.rejected, (state, action) => {
        state.getVspOrderByIdLoading = false
        state.getVspOrderByIdError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(updateVspOrderStatus.pending, (state) => {
        state.updateVspOrderStatusLoading = true
        state.updateVspOrderStatusError = null
      })
      .addCase(updateVspOrderStatus.fulfilled, (state) => {
        state.updateVspOrderStatusLoading = false
      })
      .addCase(updateVspOrderStatus.rejected, (state, action) => {
        state.updateVspOrderStatusLoading = false
        state.updateVspOrderStatusError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
  },
})

export const {
  resetOrders,
  resetCreateVspOrderState,
  resetUpdateVspOrderState,
  resetGetVspOrderByIdState,
  resetUpdateVspOrderStatusState,
} = vspOrdersSlice.actions

export default vspOrdersSlice.reducer
