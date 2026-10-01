// apiSlice.ts

import HttpMethod from '@constants/httpMethods.constants'
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_SUMMARY} from 'redux/Endpoints/apiEndpoints'
import {
  IFile,
  ITreatmentPlan,
  ITreatmentPlanBraces,
} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {IAppointmentDetails, IPatient_details} from 'screens/Summary/types/summary.types'
import {CaseInfo} from '../LeadsProfile/LeadsProfile.slice'
import {PaymentsData} from 'screens/Patients/LeadsProfile/main/payments/types/payments.types'

export interface CaseInfoResponse {
  metadata: CaseInfo
  files: IFile[]
}

export interface ISummaryResponse {
  patient_details: IPatient_details
  case_information_request: CaseInfoResponse
  aligner_journey_details: any
  aligner_treatment_response: ITreatmentPlan
  braces_journey_details: ITreatmentPlanBraces
  appointment_details: {appointments: IAppointmentDetails[]}
  treatment_payments_details: PaymentsData
  pre_treatment_photos: {
    files: IFile[]
  }
}

export const getSummaryData = createAsyncThunk(
  'api/getSummaryData',
  async ({patient_id}: {patient_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_SUMMARY + patient_id, HttpMethod.GET)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const SummarySlice = createSlice({
  name: 'apiSummaryData',
  initialState: {
    summaryData: {} as ISummaryResponse,
    summaryError: null as string | null,
    summaryLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSummaryData.pending, (state) => {
        state.summaryLoading = true
        state.summaryError = null
      })
      .addCase(getSummaryData.fulfilled, (state, action) => {
        state.summaryLoading = false
        state.summaryData = action.payload
      })
      .addCase(getSummaryData.rejected, (state, action) => {
        state.summaryLoading = false
        state.summaryError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default SummarySlice.reducer
