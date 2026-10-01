// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_FORGET_PASSWORD_RESET} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataForgetPasswordReset = createAsyncThunk(
  'api/postDataForgetPasswordReset',
  async (postDataForgetPasswordReset: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_FORGET_PASSWORD_RESET,
        HttpMethod.POST,
        postDataForgetPasswordReset.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const forgetPasswordReset = createSlice({
  name: 'apiForgetPasswordOtpSent',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataForgetPasswordReset: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataForgetPasswordReset.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataForgetPasswordReset.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataForgetPasswordReset.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataForgetPasswordReset} = forgetPasswordReset.actions

export default forgetPasswordReset.reducer
