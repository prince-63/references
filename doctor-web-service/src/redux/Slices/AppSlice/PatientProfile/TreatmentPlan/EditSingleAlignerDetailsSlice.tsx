// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_TREATMENT_PLAN_EDIT_SINGLE_ALIGNER_DETAILS} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataEditSingleAlignerDetails = createAsyncThunk(
  'api/postApiDataEditSingleAlignerDetails',
  async (postApiDataEditSingleAlignerDetails: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_TREATMENT_PLAN_EDIT_SINGLE_ALIGNER_DETAILS,
        HttpMethod.POST,
        postApiDataEditSingleAlignerDetails.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const EditSingleAlignerDetailsSlice = createSlice({
  name: 'apiDataEditSingleAlignerDetails',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDatDataEditSingleAlignerDetails: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataEditSingleAlignerDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataEditSingleAlignerDetails.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataEditSingleAlignerDetails.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDatDataEditSingleAlignerDetails} = EditSingleAlignerDetailsSlice.actions
export default EditSingleAlignerDetailsSlice.reducer
