// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_EDIT_CLINIC} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'
interface PracticeLocationResponse {
  practice_location_list: PracticeLocation[]
  size: number
}
export interface PracticeLocation {
  practice_location_id: number
  practice_location_name: string
  mobile_number: string
  email_id: string | null
  address: string
  doctor_name: string | null
  practice_location_in_charge_doctor_name: string | null
  pin_code: number
  city: string
  state: string
  country: string
  google_map_url: string
  doctor_type: string | null
  health_care_number: string | null
  website_url: string
  clinic_logo: string | null
  business_registration_number: string | null
  clinic_timing: string | null
  service_offered: string | null
  practice_location_type: string
  social_handles: string | null
  created_by: number
  updated_by: number | null
  deleted_by: number | null
  delete_at: string | null
  country_code: string | null
  doctor_id: number
  active: boolean
  size: number
}

interface ApiPostData {
  data: any
}

export const postApiDataEditPracticeLocation = createAsyncThunk(
  'api/postDataEditPracticeLocation',
  async (postDataEditPracticeLocation: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_EDIT_CLINIC,
        HttpMethod.POST,
        postDataEditPracticeLocation.data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const editPracticeLocationSlice = createSlice({
  name: 'apiEditPracticeLocation',
  initialState: {
    data: {} as PracticeLocationResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataEditPracticeLocation: (state) => {
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
      .addCase(postApiDataEditPracticeLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataEditPracticeLocation.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataEditPracticeLocation.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearDataEditPracticeLocation} = editPracticeLocationSlice.actions
export default editPracticeLocationSlice.reducer
