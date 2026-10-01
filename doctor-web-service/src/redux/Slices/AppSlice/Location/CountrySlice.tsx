// apiSlice.ts

import {createSlice, createAsyncThunk, isRejectedWithValue} from '@reduxjs/toolkit'
import {URL_COUNTRY_FETCH} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

export const postApiDataCountrySlice = createAsyncThunk(
  'api/postDataCountrySlice',
  async () => {
    try {
      const response = await apiHelper(URL_COUNTRY_FETCH, HttpMethod.GET)
      const list: any = []
      response.data.forEach((element: any) => {
        list.push({label: element, value: element})
      })
      return list
    } catch (error: any) {
      console.error(error.response?.data)
      return isRejectedWithValue(error.response?.data?.message)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.apiCountry?.loading || (state.apiCountry?.data && state.apiCountry.data.length > 0)) {
        return false
      }
    },
  }
)

const CountrySlice = createSlice({
  name: 'apiCountrySlice',
  initialState: {
    data: null as [] | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataCountry: (state) => {
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
      .addCase(postApiDataCountrySlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataCountrySlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataCountrySlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataCountry} = CountrySlice.actions
export default CountrySlice.reducer
