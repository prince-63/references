// apiSlice.ts

import HttpMethod from '@constants/httpMethods.constants'
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_PATIENT_DELETE, URL_STATUS_CHANGE} from 'redux/Endpoints/apiEndpoints'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataPatientDelete = createAsyncThunk(
  'api/postApiPatientDelete',
  async (postDataPatientDelete: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_PATIENT_DELETE + postDataPatientDelete.data.patient_id,
        HttpMethod.POST,
        postDataPatientDelete.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

export const postApiDataPatientStatusChange = createAsyncThunk(
  'api/postApiPatientStatusChange',
  async (postDataPatientStatusChange: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_STATUS_CHANGE,
        HttpMethod.POST,
        postDataPatientStatusChange.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const LeadsOverviewSlice = createSlice({
  name: 'apiLeadsOverviewGet',
  initialState: {
    dataPatientDelete: null as ApiResponse | null,
    errorPatientDelete: null as string | null,
    loadingPatientDelete: false,
    dataPatientStatusChange: null as ApiResponse | null,
    errorPatientStatusChange: null as string | null,
    loadingPatientStatusChange: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataPatientDelete.pending, (state) => {
        state.loadingPatientDelete = true
        state.errorPatientDelete = null
      })
      .addCase(postApiDataPatientDelete.fulfilled, (state, action) => {
        state.loadingPatientDelete = false
        state.dataPatientDelete = action.payload
      })
      .addCase(postApiDataPatientDelete.rejected, (state, action) => {
        state.loadingPatientDelete = false
        state.errorPatientDelete =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(postApiDataPatientStatusChange.pending, (state) => {
        state.loadingPatientStatusChange = true
        state.errorPatientStatusChange = null
      })
      .addCase(postApiDataPatientStatusChange.fulfilled, (state, action) => {
        state.loadingPatientStatusChange = false
        state.dataPatientStatusChange = action.payload
      })
      .addCase(postApiDataPatientStatusChange.rejected, (state, action) => {
        state.loadingPatientStatusChange = false
        state.errorPatientStatusChange =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default LeadsOverviewSlice.reducer
