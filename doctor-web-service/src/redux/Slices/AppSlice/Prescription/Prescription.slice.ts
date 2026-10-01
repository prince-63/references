// prescriptionSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  URL_CREATE_PRESCRIPTION,
  URL_GET_PRESCRIPTION_BY_ID,
  URL_GET_PRESCRIPTION_BY_PATIENT,
  URL_DELETE_PRESCRIPTION_BY_ID,
  URL_UPDATE_PRESCRIPTION_BY_ID,
} from 'redux/Endpoints/apiEndpoints'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'

// Request body type for API call
export interface PrescriptionData {
  chief_complaint?: string
  treatment_needed?: string | null
  do_not_move_the_following_tooth?: string | null
  midline?: string | null
  attachments?: string | null
  inter_proximal_reduction?: string | null
  extraction?: string | null
  notes?: string | null
  midline_instructions?: string | null
  attachments_tooth_selected?: string | null
  extraction_tooth_selected?: string | null
  treatment_needed_for_tooth?: string | null
  do_not_move_the_following_selected_tooth?: string | null
  data: Record<string, any>
  form_id: string
  patient_id: number
  prescription_id: number
}

// Slice state
interface PrescriptionState {
  // POST states
  postLoading: boolean
  postError: string | null
  postSuccess: boolean

  // GET by prescriptionId states
  getLoading: boolean
  getError: string | null
  getSuccess: boolean
  prescriptionData: PrescriptionData | null

  // GET by patientId states
  getByPatientLoading: boolean
  getByPatientError: string | null
  getByPatientSuccess: boolean
  prescriptionsByPatient: PrescriptionData[] | []
  deleteLoading: boolean
  deleteError: string | null
  deleteSuccess: boolean
}

const initialState: PrescriptionState = {
  postLoading: false,
  postError: null,
  postSuccess: false,

  getLoading: false,
  getError: null,
  getSuccess: false,
  prescriptionData: null,

  getByPatientLoading: false,
  getByPatientError: null,
  getByPatientSuccess: false,
  prescriptionsByPatient: [],
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
}

// Async thunk for POST
export const postApiDataPrescriptionAdd = createAsyncThunk(
  'api/postApiDataPrescriptionAdd',
  async (postDataPrescriptionAdd: any, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_CREATE_PRESCRIPTION,
        HttpMethod.POST,
        postDataPrescriptionAdd.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

// DELETE prescription thunk
export const deletePrescription = createAsyncThunk(
  'api/deletePrescription',
  async (prescriptionId: number, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_DELETE_PRESCRIPTION_BY_ID}/${prescriptionId}`,
        HttpMethod.DELETE,
        {}
      )
      return response // return the deleted ID for reducer
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message || 'Something went wrong')
    }
  }
)

// Async thunk for GET by prescriptionId
export const getApiDataPrescription = createAsyncThunk(
  'api/getApiDataPrescription',
  async (prescriptionId: number, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_GET_PRESCRIPTION_BY_ID}/${prescriptionId}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

// Async thunk for updating a prescription
export const updatePrescription = createAsyncThunk(
  'api/updatePrescription',
  async (payload: {prescriptionId: number; data: Partial<PrescriptionData>}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_UPDATE_PRESCRIPTION_BY_ID}/${payload.prescriptionId}`,
        HttpMethod.PUT,
        payload.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message || 'Something went wrong')
    }
  }
)

// Async thunk for GET by patientId
export const getApiDataPrescriptionByPatient = createAsyncThunk(
  'api/getApiDataPrescriptionByPatient',
  async (
    params: number | {patientId: number; orderId?: string | null | undefined},
    {rejectWithValue}
  ) => {
    try {
      const patientId = typeof params === 'number' ? params : params.patientId
      let url = `${URL_GET_PRESCRIPTION_BY_PATIENT}/${patientId}`
      // include orderId query when the caller explicitly provides it (even if null)
      if (
        typeof params !== 'number' &&
        'orderId' in params &&
        params.orderId !== undefined &&
        params.orderId
      ) {
        url += `?orderId=${params.orderId}`
      }
      const response = await apiHelper(url, HttpMethod.GET)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const prescriptionSlice = createSlice({
  name: 'prescription',
  initialState,
  reducers: {
    resetPrescriptionState: (state) => {
      state.prescriptionData = null
      state.prescriptionsByPatient = []
    },
  },
  extraReducers: (builder) => {
    // POST reducers
    builder
      .addCase(postApiDataPrescriptionAdd.pending, (state) => {
        state.postLoading = true
        state.postError = null
        state.postSuccess = false
      })
      .addCase(postApiDataPrescriptionAdd.fulfilled, (state) => {
        state.postLoading = false
        state.postSuccess = true
      })
      .addCase(postApiDataPrescriptionAdd.rejected, (state, action) => {
        state.postLoading = false
        state.postError = action.payload as string
      })

    // GET by prescriptionId reducers
    builder
      .addCase(getApiDataPrescription.pending, (state) => {
        state.getLoading = true
        state.getError = null
        state.getSuccess = false
        state.prescriptionData = null
      })
      .addCase(getApiDataPrescription.fulfilled, (state, action) => {
        state.getLoading = false
        state.getSuccess = true
        state.prescriptionData = action.payload
      })
      .addCase(getApiDataPrescription.rejected, (state, action) => {
        state.getLoading = false
        state.getError = action.payload as string
      })

    // GET by patientId reducers
    builder
      .addCase(getApiDataPrescriptionByPatient.pending, (state) => {
        state.getByPatientLoading = true
        state.getByPatientError = null
        state.getByPatientSuccess = false
        state.prescriptionsByPatient = []
      })
      .addCase(getApiDataPrescriptionByPatient.fulfilled, (state, action) => {
        state.getByPatientLoading = false
        state.getByPatientSuccess = true
        const payload = action.payload as any

        let items: PrescriptionData[] = []
        if (Array.isArray(payload)) {
          items = payload
        } else if (Array.isArray(payload?.data)) {
          items = payload.data
        } else if (Array.isArray(payload?.data?.prescriptions)) {
          items = payload.data.prescriptions
        } else if (Array.isArray(payload?.prescriptions)) {
          items = payload.prescriptions
        }

        state.prescriptionsByPatient = items
      })
      .addCase(getApiDataPrescriptionByPatient.rejected, (state, action) => {
        state.getByPatientLoading = false
        state.getByPatientError = action.payload as string
      })
    builder
      // DELETE Prescription
      .addCase(deletePrescription.pending, (state) => {
        state.deleteLoading = true
        state.deleteError = null
        state.deleteSuccess = false
      })
      .addCase(deletePrescription.fulfilled, (state, action) => {
        state.deleteLoading = false
        state.deleteSuccess = true
        // remove deleted prescription from the patient list
        state.prescriptionsByPatient = state.prescriptionsByPatient.filter(
          (p) => p.prescription_id !== action.meta.arg
        )
      })
      .addCase(deletePrescription.rejected, (state, action) => {
        state.deleteLoading = false
        state.deleteError = action.payload as string
        state.deleteSuccess = false
      })
    builder
      // Update Prescription
      .addCase(updatePrescription.pending, (state) => {
        state.postLoading = true
        state.postError = null
        state.postSuccess = false
      })
      .addCase(updatePrescription.fulfilled, (state) => {
        state.postLoading = false
        state.postSuccess = true
      })
      .addCase(updatePrescription.rejected, (state, action) => {
        state.postLoading = false
        state.postError = action.payload as string
      })
  },
})

export const {resetPrescriptionState} = prescriptionSlice.actions
export default prescriptionSlice.reducer
