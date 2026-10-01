// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ADD_CLINIC} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataAddPracticeLocation = createAsyncThunk(
  'api/postDataAddPracticeLocation',
  async (postDataAddPracticeLocation: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_ADD_CLINIC,
        HttpMethod.POST,
        postDataAddPracticeLocation.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const addPracticeLocationSlice = createSlice({
  name: 'apiAddPracticeLocation',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataAddPracticeLocation: (state) => {
      return {
        ...state,
        data: null,
        error: null,
        loading: false,
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAddPracticeLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAddPracticeLocation.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAddPracticeLocation.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataAddPracticeLocation} = addPracticeLocationSlice.actions
export default addPracticeLocationSlice.reducer
