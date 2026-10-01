// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ADD_PATIENT, URL_ADD_PATIENT_FOR_STARTER} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  practice_location_list: any
  size: number
}

interface ApiPostData {
  data: any
  isStarterPlan?: boolean
}

export const postApiDataAddPatientSlice = createAsyncThunk(
  'api/postDataAddPatientSlice',
  async (postDataAddPatientSlice: ApiPostData, {rejectWithValue}) => {
    const {data, isStarterPlan} = postDataAddPatientSlice
    try {
      const response = await apiHelper(
        isStarterPlan ? URL_ADD_PATIENT_FOR_STARTER : URL_ADD_PATIENT,
        HttpMethod.POST,
        data
      )
      return response.data
    } catch (error: any) {
      console.error(error.response?.data)
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const AddPatient = createSlice({
  name: 'apiAddPatientSlice',
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
      .addCase(postApiDataAddPatientSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAddPatientSlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAddPatientSlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataAddPatient} = AddPatient.actions
export default AddPatient.reducer
