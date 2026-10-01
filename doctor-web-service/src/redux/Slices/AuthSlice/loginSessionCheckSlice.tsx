// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_SESSION_CHECK} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataLoginSessionCheck = createAsyncThunk(
  'api/postDataLoginSessionCheck',
  async (postDataLoginSessionCheck: ApiPostData, {rejectWithValue}) => {
    const {fingerPrint, email} = postDataLoginSessionCheck?.data
    try {
      const response = await apiHelper(
        URL_SESSION_CHECK + fingerPrint + '/' + email?.toLocaleLowerCase(),
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const loginSessionCheckSlice = createSlice({
  name: 'apiLoginSessionCheck',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataLoginSessionCheck.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataLoginSessionCheck.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataLoginSessionCheck.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default loginSessionCheckSlice.reducer
