// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_SIGNUP_GOOGLE_STEP_TWO} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'
import getBrandConfig from 'utils/getBrandConfig'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataGoogleStepTwo = createAsyncThunk(
  'api/postDataGoogleStepTwo',
  async (postDataGoogleStepTwo: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_SIGNUP_GOOGLE_STEP_TWO, HttpMethod.POST, {
        ...postDataGoogleStepTwo.data,
        brand: getBrandConfig().brand,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const googleStepTwoSlice = createSlice({
  name: 'apiGoogleLogin',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataGoogleStepTwo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataGoogleStepTwo.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataGoogleStepTwo.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default googleStepTwoSlice.reducer
