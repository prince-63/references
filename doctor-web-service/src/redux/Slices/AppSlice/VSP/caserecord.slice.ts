import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_VSP_CASE_RECORDS, URL_VSP_ORDER_CASE_RECORDS} from 'redux/Endpoints/apiEndpoints'

export type VspCaseRecordStatus = 'DRAFT' | 'SUBMITTED' | 'CANCELLED' | string
export type VspCaseRecordSelectionMode = 'ADD_NEW' | 'USE_EXISTING' | string

export interface VspCaseRecordFile {
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
  status: VspCaseRecordStatus
  extraoral_photo_files: VspCaseRecordFile[]
  intraoral_photo_files: VspCaseRecordFile[]
  intraoral_scan_files: VspCaseRecordFile[]
  stone_cast_files: VspCaseRecordFile[]
  dicom_files: VspCaseRecordFile[]
  radio_grap_files?: VspCaseRecordFile[]

  external_links: string[]
  created_at: string
  updated_at: string
}

export interface GetVspCaseRecordByIdRequest {
  case_record_id: number | string
}

export interface GetVspCaseRecordsByPatientRequest {
  patient_id: number | string
}

export interface CreateVspCaseRecordRequest {
  record_selection_mode: VspCaseRecordSelectionMode
  extraoral_photo_file_ids?: number[]
  intraoral_photo_file_ids?: number[]
  intraoral_scan_file_ids?: number[]
  stone_cast_file_ids?: number[]
  dicom_file_ids?: number[]
  radio_grap_file_ids?: number[]
  external_links?: string[]
  order_id?: string | null
  patient_id: number
}

export interface UpdateVspCaseRecordRequest {
  case_record_id: number
  case_id?: number
  patient_id: number
  extraoral_photo_file_ids?: number[]
  intraoral_photo_file_ids?: number[]
  intraoral_scan_file_ids?: number[]
  stone_cast_file_ids?: number[]
  dicom_file_ids?: number[]
  radio_grap_file_ids?: number[]
  remove_file_ids?: number[]
  external_links?: string[]
}

export interface VspCaseRecordState {
  createVspCaseRecordLoading: boolean
  createVspCaseRecordError: string | null
  createdVspCaseRecord: VspCaseRecordResponse | null
  updateVspCaseRecordLoading: boolean
  updateVspCaseRecordError: string | null
  getVspCaseRecordByIdLoading: boolean
  getVspCaseRecordByIdError: string | null
  vspCaseRecordDetails: VspCaseRecordResponse | null
  getVspCaseRecordsByPatientLoading: boolean
  getVspCaseRecordsByPatientError: string | null
  vspCaseRecordsByPatient: VspCaseRecordResponse[]
}

const initialState: VspCaseRecordState = {
  createVspCaseRecordLoading: false,
  createVspCaseRecordError: null,
  createdVspCaseRecord: null,
  updateVspCaseRecordLoading: false,
  updateVspCaseRecordError: null,
  getVspCaseRecordByIdLoading: false,
  getVspCaseRecordByIdError: null,
  vspCaseRecordDetails: null,
  getVspCaseRecordsByPatientLoading: false,
  getVspCaseRecordsByPatientError: null,
  vspCaseRecordsByPatient: [],
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

export const getVspCaseRecordById = createAsyncThunk<
  VspCaseRecordResponse,
  GetVspCaseRecordByIdRequest,
  {rejectValue: unknown}
>('vspCaseRecord/getVspCaseRecordById', async ({case_record_id}, {rejectWithValue}) => {
  try {
    const response = await apiHelper(`${URL_VSP_CASE_RECORDS}/${case_record_id}`, HttpMethod.GET)
    return response.data as VspCaseRecordResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const getVspCaseRecordsByPatient = createAsyncThunk<
  VspCaseRecordResponse[],
  GetVspCaseRecordsByPatientRequest,
  {rejectValue: unknown}
>('vspCaseRecord/getVspCaseRecordsByPatient', async ({patient_id}, {rejectWithValue}) => {
  try {
    const response = await apiHelper(
      `${URL_VSP_CASE_RECORDS}/patient/${patient_id}`,
      HttpMethod.GET,
      {}
    )
    return response.data as VspCaseRecordResponse[]
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const createVspCaseRecord = createAsyncThunk<
  VspCaseRecordResponse,
  CreateVspCaseRecordRequest,
  {rejectValue: unknown}
>('vspCaseRecord/createVspCaseRecord', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_VSP_ORDER_CASE_RECORDS, HttpMethod.POST, payload)
    return response.data as VspCaseRecordResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const updateVspCaseRecord = createAsyncThunk<
  VspCaseRecordResponse,
  UpdateVspCaseRecordRequest,
  {rejectValue: unknown}
>('vspCaseRecord/updateVspCaseRecord', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_VSP_CASE_RECORDS, HttpMethod.PUT, payload)
    return response.data as VspCaseRecordResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

const vspCaseRecordSlice = createSlice({
  name: 'vspCaseRecord',
  initialState,
  reducers: {
    resetCreateVspCaseRecordState: (state) => {
      state.createVspCaseRecordLoading = false
      state.createVspCaseRecordError = null
      state.createdVspCaseRecord = null
      state.updateVspCaseRecordLoading = false
      state.updateVspCaseRecordError = null
    },
    resetGetVspCaseRecordByIdState: (state) => {
      state.getVspCaseRecordByIdLoading = false
      state.getVspCaseRecordByIdError = null
      state.vspCaseRecordDetails = null
    },
    resetGetVspCaseRecordsByPatientState: (state) => {
      state.getVspCaseRecordsByPatientLoading = false
      state.getVspCaseRecordsByPatientError = null
      state.vspCaseRecordsByPatient = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVspCaseRecord.pending, (state) => {
        state.createVspCaseRecordLoading = true
        state.createVspCaseRecordError = null
      })
      .addCase(createVspCaseRecord.fulfilled, (state, action) => {
        state.createVspCaseRecordLoading = false
        state.createdVspCaseRecord = action.payload
        state.vspCaseRecordDetails = action.payload
      })
      .addCase(createVspCaseRecord.rejected, (state, action) => {
        state.createVspCaseRecordLoading = false
        state.createVspCaseRecordError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(updateVspCaseRecord.pending, (state) => {
        state.updateVspCaseRecordLoading = true
        state.updateVspCaseRecordError = null
      })
      .addCase(updateVspCaseRecord.fulfilled, (state, action) => {
        state.updateVspCaseRecordLoading = false
        state.createdVspCaseRecord = action.payload
        state.vspCaseRecordDetails = action.payload
      })
      .addCase(updateVspCaseRecord.rejected, (state, action) => {
        state.updateVspCaseRecordLoading = false
        state.updateVspCaseRecordError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(getVspCaseRecordById.pending, (state) => {
        state.getVspCaseRecordByIdLoading = true
        state.getVspCaseRecordByIdError = null
      })
      .addCase(getVspCaseRecordById.fulfilled, (state, action) => {
        state.getVspCaseRecordByIdLoading = false
        state.vspCaseRecordDetails = action.payload
      })
      .addCase(getVspCaseRecordById.rejected, (state, action) => {
        state.getVspCaseRecordByIdLoading = false
        state.getVspCaseRecordByIdError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(getVspCaseRecordsByPatient.pending, (state) => {
        state.getVspCaseRecordsByPatientLoading = true
        state.getVspCaseRecordsByPatientError = null
      })
      .addCase(getVspCaseRecordsByPatient.fulfilled, (state, action) => {
        state.getVspCaseRecordsByPatientLoading = false
        state.vspCaseRecordsByPatient = action.payload
      })
      .addCase(getVspCaseRecordsByPatient.rejected, (state, action) => {
        state.getVspCaseRecordsByPatientLoading = false
        state.getVspCaseRecordsByPatientError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
  },
})

export const {
  resetCreateVspCaseRecordState,
  resetGetVspCaseRecordByIdState,
  resetGetVspCaseRecordsByPatientState,
} = vspCaseRecordSlice.actions

export default vspCaseRecordSlice.reducer
