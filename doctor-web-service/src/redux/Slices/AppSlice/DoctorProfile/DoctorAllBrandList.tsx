// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_ALL_BRAND_LIST} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import {optionType} from '../../../../types/optionType'

interface ApiPostData {
  data: any
}

export const postApiDataDoctorAllBrandList = createAsyncThunk(
  'api/postDataDoctorAllBrandList',
  async (postDataDoctorAllBrandList: ApiPostData, {rejectWithValue}) => {
    const {doctor_id} = postDataDoctorAllBrandList.data
    try {
      const response = await apiHelper(URL_ALL_BRAND_LIST + doctor_id, HttpMethod.GET)

      const brandList = response.data.map((element: any) => ({
        value: element.brand_id,
        label: element.brand_name,
      }))

      return brandList
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const DoctorAllBrandListSlice = createSlice({
  name: 'apiDoctorAllBrandList',
  initialState: {
    data: null as optionType[] | null,
    error: null as string | null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataDoctorAllBrandList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataDoctorAllBrandList.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(postApiDataDoctorAllBrandList.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default DoctorAllBrandListSlice.reducer
