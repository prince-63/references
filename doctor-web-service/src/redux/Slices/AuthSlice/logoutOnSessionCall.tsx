// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'
import {URL_LOGOUT_LOGIN_SESSION} from '../../Endpoints/apiEndpoints'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataLogoutOnSessionCall = createAsyncThunk(
  'api/postDataLogoutOnSessionCall',
  async (postDataLogoutOnSessionCall: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_LOGOUT_LOGIN_SESSION,
        HttpMethod.POST,
        postDataLogoutOnSessionCall.data
      )
      return response.data
    } catch (error: any) {
      console.error(error.response?.data?.error_code)
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const logoutOnSessionCallSlice = createSlice({
  name: 'apiLogoutOnSessionCall',
  initialState: {
    data: null as ApiResponse | null,
    error: null as any | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataLogoutOnSessionCall.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataLogoutOnSessionCall.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataLogoutOnSessionCall.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default logoutOnSessionCallSlice.reducer
