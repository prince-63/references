// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  URL_ADD_CUSTOM_BRAND_NAME,
  URL_ADD_DEFAULT_BRAND_NAME,
} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataAddCustomBrandName = createAsyncThunk(
  'api/postDataAddCustomBrandName',
  async (postDataAddCustomBrandName: ApiPostData, {rejectWithValue}) => {
    const postData = postDataAddCustomBrandName.data
    try {
      const response = await apiHelper(URL_ADD_CUSTOM_BRAND_NAME, HttpMethod.POST, postData)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const postApiDataAddDefaultBrandName = createAsyncThunk(
  'api/postDataAddDefaultBrandName',
  async (postDataAddDefaultBrandName: ApiPostData, {rejectWithValue}) => {
    const postData = postDataAddDefaultBrandName.data
    try {
      const response = await apiHelper(URL_ADD_DEFAULT_BRAND_NAME, HttpMethod.POST, postData)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
const AddCustomBrandNameSlice = createSlice({
  name: 'apiAddCustomBrandName',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
    loadingDefaultBrandName: false,
  },
  reducers: {
    clearDataAddCustomBrandName: (state) => {
      state.data = null
      state.error = null
      state.loading = false

      state.loadingDefaultBrandName = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataAddCustomBrandName.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataAddCustomBrandName.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataAddCustomBrandName.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(postApiDataAddDefaultBrandName.pending, (state) => {
        state.loadingDefaultBrandName = true
      })
      .addCase(postApiDataAddDefaultBrandName.fulfilled, (state) => {
        state.loadingDefaultBrandName = false
      })
      .addCase(postApiDataAddDefaultBrandName.rejected, (state) => {
        state.loadingDefaultBrandName = false
      })
  },
})
export const {clearDataAddCustomBrandName} = AddCustomBrandNameSlice.actions
export default AddCustomBrandNameSlice.reducer
