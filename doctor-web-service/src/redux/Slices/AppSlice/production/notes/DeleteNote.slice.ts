// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_NOTE_DELETE} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataNoteDelete = createAsyncThunk(
  'api/postApiDataNoteDelete',
  async (postDataNoteDelete: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_NOTE_DELETE, HttpMethod.POST, postDataNoteDelete.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const NoteDeleteSlice = createSlice({
  name: 'apiNoteDelete',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataNoteDelete.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataNoteDelete.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataNoteDelete.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default NoteDeleteSlice.reducer
