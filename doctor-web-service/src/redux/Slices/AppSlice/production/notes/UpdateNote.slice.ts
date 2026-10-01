// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_NOTE_UPDATE} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataNoteUpdate = createAsyncThunk(
  'api/postApiDataNoteUpdate',
  async (postDataNoteUpdate: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_NOTE_UPDATE, HttpMethod.POST, postDataNoteUpdate.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const NoteUpdateSlice = createSlice({
  name: 'apiNoteUpdate',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataNoteUpdate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataNoteUpdate.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataNoteUpdate.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default NoteUpdateSlice.reducer
