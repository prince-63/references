// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_WEAR_DAYS_UPDATE} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataWearDaysUpdate = createAsyncThunk(
  'api/postDataWearDaysUpdate',
  async (postDataWearDaysUpdate: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_WEAR_DAYS_UPDATE,
        HttpMethod.POST,
        postDataWearDaysUpdate.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const WearDaysUpdateSlice = createSlice({
  name: 'apiWearDaysUpdate',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataWearDaysUpdate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataWearDaysUpdate.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataWearDaysUpdate.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default WearDaysUpdateSlice.reducer
