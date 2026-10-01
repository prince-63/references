// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_FORGET_OTP_SENT} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataForgetPasswordOtpSend = createAsyncThunk(
  'api/postDataForgetPasswordOtpSend',
  async (postDataForgetPasswordOtpSend: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_FORGET_OTP_SENT,
        HttpMethod.POST,
        postDataForgetPasswordOtpSend.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const forgetPasswordOtpSentSlice = createSlice({
  name: 'apiForgetPasswordOtpSent',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataForgetPasswordOtpSend.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataForgetPasswordOtpSend.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataForgetPasswordOtpSend.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default forgetPasswordOtpSentSlice.reducer
