// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_SIGNUP_APPLE_STEP_TWO} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'
import getBrandConfig from 'utils/getBrandConfig'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataAppleStepTwo = createAsyncThunk(
  'api/postDataAppleStepTwo',
  async (postDataAppleStepTwo: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_SIGNUP_APPLE_STEP_TWO, HttpMethod.POST, {
        ...postDataAppleStepTwo.data,
        brand: getBrandConfig().brand,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const appleStepTwoSlice = createSlice({
  name: 'apiAppleLogin',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAppleStepTwo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAppleStepTwo.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAppleStepTwo.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default appleStepTwoSlice.reducer
