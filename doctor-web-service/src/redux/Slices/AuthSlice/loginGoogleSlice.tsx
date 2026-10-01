// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_SIGNUP_GOOGLE} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataGoogleLogin = createAsyncThunk(
  'api/postDataGoogleLogin',
  async (postDataGoogleLogin: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_SIGNUP_GOOGLE, HttpMethod.POST, postDataGoogleLogin.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const loginGoogleSlice = createSlice({
  name: 'apiGoogleLogin',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataLoginGoogle: (state) => {
      return {
        ...state,
        data: null,
        error: null,
        loading: false,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataGoogleLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataGoogleLogin.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataGoogleLogin.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataLoginGoogle} = loginGoogleSlice.actions
export default loginGoogleSlice.reducer
