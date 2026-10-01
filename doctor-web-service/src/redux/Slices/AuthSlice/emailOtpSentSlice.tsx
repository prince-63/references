// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  URL_EMAIL_OTP_SEND,
  URL_EMAIL_OTP_SEND_FOR_EXISTING_USERS,
} from '../../Endpoints/apiEndpoints'
import HttpMethod from '../../../@constants/httpMethods.constants'
import apiHelper from '../../../@utils/apiHelper'
import getBrandConfig from 'utils/getBrandConfig'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataEmailOTPSlice = createAsyncThunk(
  'api/postDataEmailVerifySlice',
  async (postDataEmailVerifySlice: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_EMAIL_OTP_SEND, HttpMethod.POST, {
        ...postDataEmailVerifySlice.data,
        org_name: getBrandConfig().brand,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status)
    }
  }
)
export const sendOtpForExistingUsers = createAsyncThunk(
  'api/sendOtpForExistingUsers',
  async (sendOtpForExistingUsers: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_EMAIL_OTP_SEND_FOR_EXISTING_USERS,
        HttpMethod.POST,
        sendOtpForExistingUsers.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status)
    }
  }
)

const emailVerifySlice = createSlice({
  name: 'apiEmailVerifySlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataEmailOtpSentSlice: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataEmailOTPSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataEmailOTPSlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataEmailOTPSlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(sendOtpForExistingUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendOtpForExistingUsers.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(sendOtpForExistingUsers.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataEmailOtpSentSlice} = emailVerifySlice.actions

export default emailVerifySlice.reducer
