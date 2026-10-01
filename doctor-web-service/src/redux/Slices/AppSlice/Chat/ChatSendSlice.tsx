// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_CHAT_SEND} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataChatSend = createAsyncThunk(
  'api/postDataChatSend',
  async (postDataChatSend: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_CHAT_SEND, HttpMethod.POST, postDataChatSend)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const ChatSendSlice = createSlice({
  name: 'apiChatSendSlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataChatSendSlice: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataChatSend.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataChatSend.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataChatSend.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataChatSendSlice} = ChatSendSlice.actions
export default ChatSendSlice.reducer
