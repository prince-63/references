// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {URL_GLOBAL_SEARCH} from 'redux/Endpoints/apiEndpoints'
import {
  IPatientDetails,
  IPracticeLocationDetails,
} from 'screens/Dashboard/sidebar/component/globalSearch.interface'

interface ApiPostData {
  query: string
  doctor_id: number | null
}

export interface DoctorInvitation {
  type: 'DOCTOR_INVITATION'
  id: 1698
  first_name: string
  last_name: string
  email: string
  role: 'CONSULTING_ORTHODONTIST' | 'INTERNAL_USER'
  status: 'ACCEPTED'
  invitation_type: 'SENT'
  full_name: string
  profile_image_id: null | number
  profile_picture_url: string | null
}

export const getSearchResults = createAsyncThunk(
  'api/getSearchResults',
  async (postDataToGetSearchResults: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GLOBAL_SEARCH,
        HttpMethod.POST,
        postDataToGetSearchResults
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const GlobalSearch = createSlice({
  name: 'GlobalSearch',
  initialState: {
    searchResults: [] as (IPatientDetails | IPracticeLocationDetails | DoctorInvitation)[],
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearSearchResults(state) {
      state.searchResults = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        state.loading = false
        state.searchResults = action.payload
      })
      .addCase(getSearchResults.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {clearSearchResults} = GlobalSearch.actions
export default GlobalSearch.reducer
