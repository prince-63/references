import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_VSP_ORDER_PRESCRIPTIONS, URL_VSP_PRESCRIPTIONS} from 'redux/Endpoints/apiEndpoints'

export type VspPrescriptionMode = 'CREATE_NEW' | 'USE_EXISTING' | string
export type VspPrescriptionStatus = 'DRAFT' | 'SUBMITTED' | 'CANCELLED' | string

export interface CreateVspPrescriptionRequest {
  prescription_mode: VspPrescriptionMode
  is_single_jaw: boolean
  is_bi_jaw: boolean
  is_undecided: boolean
  is_genioplasty: boolean
  is_others: boolean
  others_description?: string
  order_id?: string
  prescription_id?: number
  treatment_plan: string
  tentative_surgery_date: string
  earliest_treatment_plan_by_date: string
  patient_id?: number
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
  status: VspPrescriptionStatus
  created_at: string
  updated_at: string
}

export interface GetVspPrescriptionByIdRequest {
  prescription_id: number | string
}

export interface GetVspPrescriptionsByPatientRequest {
  patient_id: number | string
}

export interface VspPrescriptionState {
  createVspPrescriptionLoading: boolean
  createVspPrescriptionError: string | null
  createdVspPrescription: VspPrescriptionResponse | null
  updateVspPrescriptionLoading: boolean
  updateVspPrescriptionError: string | null
  updatedVspPrescription: VspPrescriptionResponse | null
  getVspPrescriptionByIdLoading: boolean
  getVspPrescriptionByIdError: string | null
  vspPrescriptionDetails: VspPrescriptionResponse | null
  getVspPrescriptionsByPatientLoading: boolean
  getVspPrescriptionsByPatientError: string | null
  vspPrescriptionsByPatient: VspPrescriptionResponse[]
}

const initialState: VspPrescriptionState = {
  createVspPrescriptionLoading: false,
  createVspPrescriptionError: null,
  createdVspPrescription: null,
  updateVspPrescriptionLoading: false,
  updateVspPrescriptionError: null,
  updatedVspPrescription: null,
  getVspPrescriptionByIdLoading: false,
  getVspPrescriptionByIdError: null,
  vspPrescriptionDetails: null,
  getVspPrescriptionsByPatientLoading: false,
  getVspPrescriptionsByPatientError: null,
  vspPrescriptionsByPatient: [],
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

export const createVspPrescription = createAsyncThunk<
  VspPrescriptionResponse,
  CreateVspPrescriptionRequest,
  {rejectValue: unknown}
>('vspPrescription/createVspPrescription', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_VSP_ORDER_PRESCRIPTIONS, HttpMethod.POST, payload)
    return response.data as VspPrescriptionResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const getVspPrescriptionById = createAsyncThunk<
  VspPrescriptionResponse,
  GetVspPrescriptionByIdRequest,
  {rejectValue: unknown}
>('vspPrescription/getVspPrescriptionById', async ({prescription_id}, {rejectWithValue}) => {
  try {
    const response = await apiHelper(
      `${URL_VSP_PRESCRIPTIONS}/${prescription_id}`,
      HttpMethod.GET,
      {}
    )
    return response.data as VspPrescriptionResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const getVspPrescriptionsByPatient = createAsyncThunk<
  VspPrescriptionResponse[],
  GetVspPrescriptionsByPatientRequest,
  {rejectValue: unknown}
>('vspPrescription/getVspPrescriptionsByPatient', async ({patient_id}, {rejectWithValue}) => {
  try {
    const response = await apiHelper(
      `${URL_VSP_PRESCRIPTIONS}/patient/${patient_id}`,
      HttpMethod.GET,
      {}
    )
    return response.data as VspPrescriptionResponse[]
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

export const updateVspPrescription = createAsyncThunk<
  VspPrescriptionResponse,
  CreateVspPrescriptionRequest,
  {rejectValue: unknown}
>('vspPrescription/updateVspPrescription', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_VSP_PRESCRIPTIONS, HttpMethod.PUT, payload)
    return response.data as VspPrescriptionResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

const vspPrescriptionSlice = createSlice({
  name: 'vspPrescription',
  initialState,
  reducers: {
    resetCreateVspPrescriptionState: (state) => {
      state.createVspPrescriptionLoading = false
      state.createVspPrescriptionError = null
      state.createdVspPrescription = null
    },
    resetUpdateVspPrescriptionState: (state) => {
      state.updateVspPrescriptionLoading = false
      state.updateVspPrescriptionError = null
      state.updatedVspPrescription = null
    },
    resetGetVspPrescriptionByIdState: (state) => {
      state.getVspPrescriptionByIdLoading = false
      state.getVspPrescriptionByIdError = null
      state.vspPrescriptionDetails = null
    },
    resetGetVspPrescriptionsByPatientState: (state) => {
      state.getVspPrescriptionsByPatientLoading = false
      state.getVspPrescriptionsByPatientError = null
      state.vspPrescriptionsByPatient = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVspPrescription.pending, (state) => {
        state.createVspPrescriptionLoading = true
        state.createVspPrescriptionError = null
      })
      .addCase(createVspPrescription.fulfilled, (state, action) => {
        state.createVspPrescriptionLoading = false
        state.createdVspPrescription = action.payload
        state.vspPrescriptionDetails = action.payload
      })
      .addCase(createVspPrescription.rejected, (state, action) => {
        state.createVspPrescriptionLoading = false
        state.createVspPrescriptionError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(getVspPrescriptionById.pending, (state) => {
        state.getVspPrescriptionByIdLoading = true
        state.getVspPrescriptionByIdError = null
      })
      .addCase(getVspPrescriptionById.fulfilled, (state, action) => {
        state.getVspPrescriptionByIdLoading = false
        state.vspPrescriptionDetails = action.payload
      })
      .addCase(getVspPrescriptionById.rejected, (state, action) => {
        state.getVspPrescriptionByIdLoading = false
        state.getVspPrescriptionByIdError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(getVspPrescriptionsByPatient.pending, (state) => {
        state.getVspPrescriptionsByPatientLoading = true
        state.getVspPrescriptionsByPatientError = null
      })
      .addCase(getVspPrescriptionsByPatient.fulfilled, (state, action) => {
        state.getVspPrescriptionsByPatientLoading = false
        state.vspPrescriptionsByPatient = action.payload
      })
      .addCase(getVspPrescriptionsByPatient.rejected, (state, action) => {
        state.getVspPrescriptionsByPatientLoading = false
        state.getVspPrescriptionsByPatientError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(updateVspPrescription.pending, (state) => {
        state.updateVspPrescriptionLoading = true
        state.updateVspPrescriptionError = null
      })
      .addCase(updateVspPrescription.fulfilled, (state, action) => {
        state.updateVspPrescriptionLoading = false
        state.updatedVspPrescription = action.payload
        state.vspPrescriptionDetails = action.payload
      })
      .addCase(updateVspPrescription.rejected, (state, action) => {
        state.updateVspPrescriptionLoading = false
        state.updateVspPrescriptionError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
  },
})

export const {
  resetCreateVspPrescriptionState,
  resetUpdateVspPrescriptionState,
  resetGetVspPrescriptionByIdState,
  resetGetVspPrescriptionsByPatientState,
} = vspPrescriptionSlice.actions

export default vspPrescriptionSlice.reducer
