// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_FORGET_OTP_VERIFY} from '../../Endpoints/apiEndpoints'
import HttpMethod from '../../../@constants/httpMethods.constants'
import apiHelper from '../../../@utils/apiHelper'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataForgetPasswordOtpVerify = createAsyncThunk(
  'api/postDataForgetPasswordOtpVerify',
  async (postDataForgetPasswordOtpVerify: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_FORGET_OTP_VERIFY,
        HttpMethod.POST,
        postDataForgetPasswordOtpVerify.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const forgetPasswordOtpVerifySlice = createSlice({
  name: 'apiForgetPasswordOtpSent',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataForgetPasswordOtpVerify: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataForgetPasswordOtpVerify.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataForgetPasswordOtpVerify.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataForgetPasswordOtpVerify.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataForgetPasswordOtpVerify} = forgetPasswordOtpVerifySlice.actions

export default forgetPasswordOtpVerifySlice.reducer
