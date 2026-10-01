// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_CHAT_SEEN} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataChatSeen = createAsyncThunk(
  'api/postDataChatSeen',
  async (postDataChatSeen: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_CHAT_SEEN, HttpMethod.POST, postDataChatSeen.data)

      return response.data
    } catch (error: any) {
      console.error(error)

      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const ChatSeenSlice = createSlice({
  name: 'apiChatSeenSlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataChatSeenSlice: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataChatSeen.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataChatSeen.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataChatSeen.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataChatSeenSlice} = ChatSeenSlice.actions
export default ChatSeenSlice.reducer
