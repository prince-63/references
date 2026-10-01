// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_STATUS_PRODUCTION_LAB_UPDATE} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  aligner_journey_id: number
  aligner_nos: number[]
  production_lab_id?: number | undefined
  sub_status?: string
  wear_days?: number
}

export const postApiDataStatusProductionLabUpdate = createAsyncThunk(
  'api/postDataStatusProductionLabUpdate',
  async (postDataStatusProductionLabUpdate: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_STATUS_PRODUCTION_LAB_UPDATE,
        HttpMethod.POST,
        postDataStatusProductionLabUpdate
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const StatusProductionLabUpdateSlice = createSlice({
  name: 'apiStatusProductionLabUpdate',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataStatusProductionLabUpdate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataStatusProductionLabUpdate.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataStatusProductionLabUpdate.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default StatusProductionLabUpdateSlice.reducer
