// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_NUDGE_PATIENT} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataPatientNudge = createAsyncThunk(
  'api/postDataPatientNudge',
  async (postDataPatientNudge: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_NUDGE_PATIENT,
        HttpMethod.POST,
        postDataPatientNudge.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const PatientNudgeSlice = createSlice({
  name: 'apiPatientNudge',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataPatientNudge: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataPatientNudge.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataPatientNudge.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataPatientNudge.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataPatientNudge} = PatientNudgeSlice.actions
export default PatientNudgeSlice.reducer
