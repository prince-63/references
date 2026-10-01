// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ACTIVE_CLINIC_LIST} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'
import {safeParseInt} from 'utils/ConstFunctions'

interface ApiResponse {
  practice_location_list: any
  size: number
}

interface ApiPostData {
  data: any
}

export const postApiDataListActivePracticeLocation = createAsyncThunk(
  'api/postDataListActivePracticeLocation',
  async (postDataListActivePracticeLocation: ApiPostData, {rejectWithValue}) => {
    const {doctor_id} = postDataListActivePracticeLocation.data

    try {
      const response = await apiHelper(URL_ACTIVE_CLINIC_LIST, HttpMethod.POST, {
        doctor_id: safeParseInt(doctor_id),
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const listPracticeLocationSlice = createSlice({
  name: 'apiListActivePracticeLocation',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataListActivePracticeLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataListActivePracticeLocation.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataListActivePracticeLocation.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default listPracticeLocationSlice.reducer
