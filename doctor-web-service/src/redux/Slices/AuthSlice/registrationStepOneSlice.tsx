// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_GET_ORGANIZATION_DETAILS, URL_REGISTRATION_STEP_ONE} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}

interface ApiPostData {
  data: any
}

interface GetOrganizationDetailsPayload {
  email: string
}

export const getOrganizationDetails = createAsyncThunk(
  'api/getOrganizationDetails',
  async ({email}: GetOrganizationDetailsPayload, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_GET_ORGANIZATION_DETAILS}${encodeURIComponent(email)}`,
        HttpMethod.POST,
        '',
        false
      )
      return response.data
    } catch (error: any) {
      console.error(error.response?.data?.error_code)
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const postApiDataRegistrationStepOne = createAsyncThunk(
  'api/postApiDataRegistrationStepOne',
  async (postApiDataRegistrationStepOne: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_REGISTRATION_STEP_ONE,
        HttpMethod.POST,
        postApiDataRegistrationStepOne.data
      )
      return response.data
    } catch (error: any) {
      console.error(error.response?.data?.error_code)
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const registrationStepOneSlice = createSlice({
  name: 'apiRegistrationStepOne',
  initialState: {
    data: null as ApiResponse | null,
    organizationDetails: null as ApiResponse | null,
    error: null as string | null,
    organizationError: null as string | null,
    loading: false,
    organizationLoading: false,
    isRegistered: false,
  },
  reducers: {
    setIsRegistered: (state, action) => {
      state.isRegistered = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrganizationDetails.pending, (state) => {
        state.organizationLoading = true
        state.organizationError = null
      })
      .addCase(getOrganizationDetails.fulfilled, (state, action) => {
        state.organizationLoading = false
        state.organizationDetails = action.payload
      })
      .addCase(getOrganizationDetails.rejected, (state, action) => {
        state.organizationLoading = false
        state.organizationError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(postApiDataRegistrationStepOne.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataRegistrationStepOne.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataRegistrationStepOne.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})
export const {setIsRegistered} = registrationStepOneSlice.actions

export default registrationStepOneSlice.reducer
