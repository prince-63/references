// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_COUNTRY_CODE_LIST} from '../../Endpoints/apiEndpoints'
import apiHelper from '../../../@utils/apiHelper'
import HttpMethod from '../../../@constants/httpMethods.constants'

interface ApiResponse {
  data: any
}
interface countryCodeObject {
  name: string
  iso2: string
  phone_code: string
}

export const postApiDataCountryCodes = createAsyncThunk('api/postDataCountryCodes', async () => {
  try {
    const response = await apiHelper(URL_COUNTRY_CODE_LIST, HttpMethod.GET)
    // return response.data
    return response.data.map((country: countryCodeObject) => country.phone_code)
  } catch (error: any) {
    return error.response?.data?.status
  }
})

const countryCodesSlice = createSlice({
  name: 'apiForgetPasswordOtpSent',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataCountryCodes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataCountryCodes.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataCountryCodes.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default countryCodesSlice.reducer
