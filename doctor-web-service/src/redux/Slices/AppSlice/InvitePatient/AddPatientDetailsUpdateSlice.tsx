// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ADD_PATIENT_UPDATE} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  practice_location_list: any
  size: number
}

interface ApiPostData {
  data: any
}

export const postApiDataAddPatientDetailsUpdateSlice = createAsyncThunk(
  'api/postDataAddPatientDetailsUpdateSlice',
  async (postDataAddPatientDetailsUpdateSlice: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_ADD_PATIENT_UPDATE,
        HttpMethod.POST,
        postDataAddPatientDetailsUpdateSlice.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data.error_code)
    }
  }
)

const AddPatientDetailsUpdateSlice = createSlice({
  name: 'apiAddPatientDetailsUpdateSlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataAddPatient: (state) => {
      return {
        ...state,
        data: null,
        error: null,
        loading: false,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAddPatientDetailsUpdateSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAddPatientDetailsUpdateSlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAddPatientDetailsUpdateSlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataAddPatient} = AddPatientDetailsUpdateSlice.actions
export default AddPatientDetailsUpdateSlice.reducer
