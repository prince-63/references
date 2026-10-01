// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_GET_PRODUCTION_LOGS} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataProductionLog = createAsyncThunk(
  'api/postApiDataProductionLog',
  async (postApiDataProductionLog: ApiPostData, {rejectWithValue}) => {
    const {aligner_journey_id} = postApiDataProductionLog.data

    try {
      const response = await apiHelper(
        URL_GET_PRODUCTION_LOGS + aligner_journey_id,
        HttpMethod.GET,
        postApiDataProductionLog.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const ProductionLogSlice = createSlice({
  name: 'apiDataProductionLog',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataProductionLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataProductionLog.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataProductionLog.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default ProductionLogSlice.reducer
