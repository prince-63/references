// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_TREATMENT_DEACTIVATE} from '../../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../../@utils/apiHelper'
import HttpMethod from '../../../../../@constants/httpMethods.constants'

interface ApiResponse {
  [x: string]: number
  data: any
}

interface ApiPostData {
  data: any
}

export const postApiDataTreatmentDeactivate = createAsyncThunk(
  'api/postApiDataTreatmentDeactivate',
  async (postApiDataTreatmentDeactivate: ApiPostData, {rejectWithValue}) => {
    const {aligner_journey_id} = postApiDataTreatmentDeactivate.data

    try {
      const response = await apiHelper(
        URL_TREATMENT_DEACTIVATE + aligner_journey_id,
        HttpMethod.POST,
        postApiDataTreatmentDeactivate.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const TreatmentDeactivateSlice = createSlice({
  name: 'apiDataTreatmentDeactivate',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDatDataTreatmentDeactivate: (state) => {
      state.data = null
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataTreatmentDeactivate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataTreatmentDeactivate.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataTreatmentDeactivate.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDatDataTreatmentDeactivate} = TreatmentDeactivateSlice.actions
export default TreatmentDeactivateSlice.reducer
