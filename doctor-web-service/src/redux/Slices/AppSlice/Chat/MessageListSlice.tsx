// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_MESSAGE_LIST} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  practice_location_list: any
  size: number
}

interface ApiPostData {
  data: any
}

export const postApiDataMessageList = createAsyncThunk(
  'api/postDataMessageList',
  async (postDataMessageList: ApiPostData, {rejectWithValue}) => {
    const {doctor_id, patient_id} = postDataMessageList.data
    try {
      const response = await apiHelper(
        URL_MESSAGE_LIST + `${doctor_id}/${patient_id}/Doctor`,
        HttpMethod.GET
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const MessageListSlice = createSlice({
  name: 'apiMessageList',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataMessageListSlice: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataMessageList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataMessageList.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataMessageList.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataMessageListSlice} = MessageListSlice.actions

export default MessageListSlice.reducer
