// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_DELETE_REMINDER} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataReminderDelete = createAsyncThunk(
  'api/postApiDataReminderDelete',
  async (postDataReminderDelete: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_DELETE_REMINDER,
        HttpMethod.POST,
        postDataReminderDelete.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const ReminderDeleteSlice = createSlice({
  name: 'apiReminderDelete',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataReminderDelete.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataReminderDelete.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataReminderDelete.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default ReminderDeleteSlice.reducer
