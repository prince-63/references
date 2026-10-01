// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_SIGNUP_APPLE_STEP_ONE} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataAppleStepOne = createAsyncThunk(
  'api/postDataAppleStepOne',
  async (postDataAppleStepOne: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_SIGNUP_APPLE_STEP_ONE,
        HttpMethod.POST,
        postDataAppleStepOne.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const appleStepOneSlice = createSlice({
  name: 'apiAppleStepOne',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
    loadingAppleStepOne: true,
  },
  reducers: {
    setLoadingAppleStepOne: (state, action) => {
      state.loadingAppleStepOne = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAppleStepOne.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAppleStepOne.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAppleStepOne.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {setLoadingAppleStepOne} = appleStepOneSlice.actions

export default appleStepOneSlice.reducer
