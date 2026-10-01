// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_CHAT_EVENT_ID} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataChatEventSlice = createAsyncThunk(
  'api/postDataChatEventSlice',
  async (postDataChatEventSlice: ApiPostData, {rejectWithValue}) => {
    const {doctor_id, patient_id} = postDataChatEventSlice.data
    try {
      const response = await apiHelper(
        URL_CHAT_EVENT_ID +
          `${doctor_id}?patient_id=${patient_id}&active=true&event_type=MESSAGE_SENT_TO_PATIENT`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const ChatEventSlice = createSlice({
  name: 'apiChatEventSlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataChatEventSlice: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataChatEventSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataChatEventSlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataChatEventSlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataChatEventSlice} = ChatEventSlice.actions

export default ChatEventSlice.reducer
