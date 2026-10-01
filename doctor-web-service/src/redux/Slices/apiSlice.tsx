// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiData = createAsyncThunk(
  'api/postData',
  async (postData: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await axios.get<ApiResponse>(
        'https://jsonplaceholder.typicode.com/posts/1',
        postData
      )
      return response.data
    } catch (error: any) {
      // Manually specify the type of 'error' as 'any'
      return rejectWithValue(error.response?.data)
    }
  }
)

const apiSlice = createSlice({
  name: 'api',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiData.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default apiSlice.reducer
