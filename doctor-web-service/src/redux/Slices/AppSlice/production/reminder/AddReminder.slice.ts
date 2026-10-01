// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ADD_REMINDER} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataReminderAdd = createAsyncThunk(
  'api/postApiDataReminderAdd',
  async (postDataReminderAdd: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_REMINDER, HttpMethod.POST, postDataReminderAdd.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const ReminderAddSlice = createSlice({
  name: 'apiReminderAdd',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataReminderAdd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataReminderAdd.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataReminderAdd.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default ReminderAddSlice.reducer
