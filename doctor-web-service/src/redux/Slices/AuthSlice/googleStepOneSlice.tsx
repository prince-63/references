// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_SIGNUP_GOOGLE_STEP_ONE} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataGoogleStepOne = createAsyncThunk(
  'api/postDataGoogleStepOne',
  async (postDataGoogleStepOne: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_SIGNUP_GOOGLE_STEP_ONE,
        HttpMethod.POST,
        postDataGoogleStepOne.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const googleStepOneSlice = createSlice({
  name: 'apiGoogleStepOne',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
    loadingGoogleStepOne: true,
  },
  reducers: {
    setLoadingGoogleStepOne: (state, action) => {
      state.loadingGoogleStepOne = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataGoogleStepOne.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataGoogleStepOne.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataGoogleStepOne.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {setLoadingGoogleStepOne} = googleStepOneSlice.actions

export default googleStepOneSlice.reducer
