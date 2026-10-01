// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_CLINIC_LIST} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  practice_location_list: any
  size: number
}

interface ApiPostData {
  data: any
}

export const postApiDataListPracticeLocation = createAsyncThunk(
  'api/postDataListPracticeLocation',
  async (postDataListPracticeLocation: ApiPostData, {rejectWithValue}) => {
    const {doctor_id} = postDataListPracticeLocation.data
    try {
      const response = await apiHelper(URL_CLINIC_LIST, HttpMethod.POST, {doctor_id})
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const listPracticeLocationSlice = createSlice({
  name: 'apiListPracticeLocation',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataListPracticeLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataListPracticeLocation.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataListPracticeLocation.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default listPracticeLocationSlice.reducer
