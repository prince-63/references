// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_STATE_FETCH} from '../../../Endpoints/apiEndpoints'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'

interface ApiResponse {
  practice_location_list: any
  size: number
}

interface ApiPostData {
  data: any
}

export const postApiDataStateSlice = createAsyncThunk(
  'api/postDataStateSlice',
  async (postDataStateSlice: ApiPostData, {rejectWithValue}) => {
    try {
      const {country} = postDataStateSlice.data
      const response = await apiHelper(URL_STATE_FETCH + country, HttpMethod.GET)
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

const StateSlice = createSlice({
  name: 'apiStateSlice',
  initialState: {
    data: null as ApiResponse | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    clearDataStateSlice: (state) => {
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
      .addCase(postApiDataStateSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataStateSlice.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataStateSlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {clearDataStateSlice} = StateSlice.actions
export default StateSlice.reducer
