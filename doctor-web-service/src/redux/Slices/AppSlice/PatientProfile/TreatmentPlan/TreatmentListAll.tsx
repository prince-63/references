// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_TREATMENT_LIST} from '../../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../../@utils/apiHelper'

interface ApiPostData {
  data: any
}

export const postApiDataTreatmentAllPlan = createAsyncThunk(
  'api/postDataTreatmentAllPlan',
  async (postDataTreatmentAllPlan: ApiPostData, {rejectWithValue}) => {
    const {patient_id} = postDataTreatmentAllPlan.data
    try {
      const response = await apiHelper(
        URL_TREATMENT_LIST +
          `${patient_id}?create_status=IN_PROGRESS&create_status=DONE&progress_status=&progress_status=NOT_STARTED&progress_status=IN_PROGRESS&progress_status=COMPLETE&progress_status=DISCARDED`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message)
    }
  }
)

const TreatmentPlanAllSlice = createSlice({
  name: 'apiTreatmentPlan',
  initialState: {
    data: null as any,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataTreatmentAllPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataTreatmentAllPlan.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataTreatmentAllPlan.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default TreatmentPlanAllSlice.reducer
