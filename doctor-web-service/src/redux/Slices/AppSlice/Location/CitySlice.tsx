// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_CITY_FETCH} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  practice_location_list: any
  size: number
}

interface ApiPostData {
  data: any
}

export const postApiDataCitySlice = createAsyncThunk(
  'api/postDataCitySlice',
  async (postDataCitySlice: ApiPostData, {rejectWithValue}) => {
    try {
      const {country, state} = postDataCitySlice.data
      const response = await apiHelper(
        URL_CITY_FETCH + `?countryName=${country}&stateName=${state}`,
        HttpMethod.GET
      )
      const list: any = []
      response.data.forEach((element: any) => {
        list.push({label: element, value: element})
      })
      return list
    } catch (error: any) {
      console.error(error.response?.data)
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

const CitySlice = createSlice({
  name: 'apiCitySlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataCitySlice: (state) => {
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
      .addCase(postApiDataCitySlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataCitySlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataCitySlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataCitySlice} = CitySlice.actions
export default CitySlice.reducer
