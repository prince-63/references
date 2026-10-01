// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_NEW_TREATMENT} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataNewTreatment = createAsyncThunk(
  'api/postDataNewTreatment',
  async (postDataNewTreatment: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_NEW_TREATMENT,
        HttpMethod.POST,
        postDataNewTreatment.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const addNewTreatmentSlice = createSlice({
  name: 'apiNewTreatment',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataNewTreatment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataNewTreatment.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataNewTreatment.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default addNewTreatmentSlice.reducer
