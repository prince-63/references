// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ADD_NEW_CHAT} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataNewChatAdd = createAsyncThunk(
  'api/postDataNewChatAdd',
  async (postDataNewChatAdd: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_NEW_CHAT, HttpMethod.POST, postDataNewChatAdd.data)
      return response.data
    } catch (error: any) {
      console.error(error)
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const NewChatAddSlice = createSlice({
  name: 'apiNewChatAdd',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataNewChatAddSlice: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataNewChatAdd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataNewChatAdd.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataNewChatAdd.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataNewChatAddSlice} = NewChatAddSlice.actions
export default NewChatAddSlice.reducer
