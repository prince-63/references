// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_NOTE_ADD} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataNoteAdd = createAsyncThunk(
  'api/postApiDataNoteAdd',
  async (postDataNoteAdd: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_NOTE_ADD, HttpMethod.POST, postDataNoteAdd.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const NoteAddSlice = createSlice({
  name: 'apiNoteAdd',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataNoteAdd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataNoteAdd.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataNoteAdd.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default NoteAddSlice.reducer
