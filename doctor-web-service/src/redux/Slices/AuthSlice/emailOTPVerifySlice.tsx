// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_EMAIL_OTP_VERIFY} from '../../Endpoints/apiEndpoints'
import HttpMethod from '../../../@constants/httpMethods.constants'
import apiHelper from '../../../@utils/apiHelper'

interface ApiResponse {
  data: any
}
interface ApiPostData {
  data: any
}

export const postApiDataEmailOTPVerifySlice = createAsyncThunk(
  'api/postDataEmailOTPVerifySlice',
  async (postDataEmailOTPVerifySlice: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_EMAIL_OTP_VERIFY,
        HttpMethod.POST,
        postDataEmailOTPVerifySlice.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const emailOTPVerifySlice = createSlice({
  name: 'apiEmailVerifyOTPSlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataEmailOtpVerifySlice: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataEmailOTPVerifySlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataEmailOTPVerifySlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataEmailOTPVerifySlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataEmailOtpVerifySlice} = emailOTPVerifySlice.actions

export default emailOTPVerifySlice.reducer
