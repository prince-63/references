// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_SIGNUP_APPLE} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataAppleLogin = createAsyncThunk(
  'api/postDataAppleLogin',
  async (postDataAppleLogin: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_SIGNUP_APPLE, HttpMethod.POST, postDataAppleLogin.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const loginAppleSlice = createSlice({
  name: 'apiAppleLogin',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataLoginApple: (state) => {
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
      .addCase(postApiDataAppleLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAppleLogin.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAppleLogin.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataLoginApple} = loginAppleSlice.actions
export default loginAppleSlice.reducer
