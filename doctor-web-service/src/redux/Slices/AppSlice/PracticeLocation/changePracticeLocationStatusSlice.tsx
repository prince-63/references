// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_CLINIC_STATUS_CHANGE} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataChangePracticeLocationStatusSlice = createAsyncThunk(
  'api/postDataChangePracticeLocationStatusSlice',
  async (postDataChangePracticeLocationStatusSlice: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_CLINIC_STATUS_CHANGE,
        HttpMethod.POST,
        postDataChangePracticeLocationStatusSlice.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const changePracticeLocationStatusSlice = createSlice({
  name: 'apiChangePracticeLocationStatusSlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataChangePracticeLocation: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataChangePracticeLocationStatusSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataChangePracticeLocationStatusSlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataChangePracticeLocationStatusSlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataChangePracticeLocation} = changePracticeLocationStatusSlice.actions

export default changePracticeLocationStatusSlice.reducer
