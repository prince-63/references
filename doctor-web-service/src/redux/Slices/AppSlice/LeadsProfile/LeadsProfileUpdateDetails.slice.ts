// apiSlice.ts

import HttpMethod from '@constants/httpMethods.constants'
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_UPDATE_LEADS_PROFILE_DETAILS} from 'redux/Endpoints/apiEndpoints'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiLeadsProfileDetailsUpdate = createAsyncThunk(
  'api/postApiLeadsProfileDetailsUpdate',
  async (postDataLeadsProfileUpdate: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_UPDATE_LEADS_PROFILE_DETAILS,
        HttpMethod.POST,
        postDataLeadsProfileUpdate.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const LeadsProfileDetailsUpdateSlice = createSlice({
  name: 'apiLeadsProfileDetailsUpdate',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    resetUpdatedInfo: (state) => {
      state.data = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiLeadsProfileDetailsUpdate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiLeadsProfileDetailsUpdate.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiLeadsProfileDetailsUpdate.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export default LeadsProfileDetailsUpdateSlice.reducer
export const {resetUpdatedInfo} = LeadsProfileDetailsUpdateSlice.actions
