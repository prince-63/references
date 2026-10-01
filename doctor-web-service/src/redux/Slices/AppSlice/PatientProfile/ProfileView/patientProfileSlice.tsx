// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  URL_PATIENT_PROFILE_OVERVIEW_ACTIONS,
  URL_PATIENT_PROFILE_APPROVE_ALL_PENDING_ACTION,
} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'
import {PatientProfileOverviewActionsData} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {any} from 'ramda'

interface ApiPostData {
  data: any
}

export const postPatientProfileApproveAllPendingAction = createAsyncThunk(
  'api/postDataPatientProfileApproveAllPendingAction',
  async (alignerJourneyId: number, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_PATIENT_PROFILE_APPROVE_ALL_PENDING_ACTION + alignerJourneyId,
        HttpMethod.POST,
        {}
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const postApiDataPatientProfileSlice = createAsyncThunk(
  'api/postDataPatientProfileSlice',
  async (postDataPatientProfileSlice: ApiPostData, {rejectWithValue}) => {
    const patient_id = postDataPatientProfileSlice.data.patientId

    try {
      const response = await apiHelper(
        URL_PATIENT_PROFILE_OVERVIEW_ACTIONS + patient_id,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getApiPatientProfileActions = createAsyncThunk(
  'api/getApiPatientProfileActions',
  async (postDataToGetPatientProfileActions: {alignerJourneyId: number}, {rejectWithValue}) => {
    const aligner_journey_id = postDataToGetPatientProfileActions.alignerJourneyId
    try {
      const response = await apiHelper(
        URL_PATIENT_PROFILE_OVERVIEW_ACTIONS + aligner_journey_id,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const patientProfile = createSlice({
  name: 'apiPatientProfileSlice',
  initialState: {
    data: null as any | null,
    error: null as string | null,
    loading: false,
    dataPatientProfileOverviewActions: {} as PatientProfileOverviewActionsData,
    errorPatientProfileOverviewActions: null as string | null,
    loadingPatientProfileOverviewActions: false,
    approvingAllPendingAction: any,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataPatientProfileSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataPatientProfileSlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataPatientProfileSlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(getApiPatientProfileActions.pending, (state) => {
        state.loadingPatientProfileOverviewActions = true
        state.errorPatientProfileOverviewActions = null
      })
      .addCase(getApiPatientProfileActions.fulfilled, (state, action) => {
        state.loadingPatientProfileOverviewActions = false
        state.dataPatientProfileOverviewActions = action.payload
      })
      .addCase(getApiPatientProfileActions.rejected, (state, action) => {
        state.loadingPatientProfileOverviewActions = false
        state.errorPatientProfileOverviewActions =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(postPatientProfileApproveAllPendingAction.pending, (state) => {
        state.loadingPatientProfileOverviewActions = true
      })
      .addCase(postPatientProfileApproveAllPendingAction.fulfilled, (state, action) => {
        state.loadingPatientProfileOverviewActions = false
        state.approvingAllPendingAction = action.payload
      })
  },
})

export default patientProfile.reducer
