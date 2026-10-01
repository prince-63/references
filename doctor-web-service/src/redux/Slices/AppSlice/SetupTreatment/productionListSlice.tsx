// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_PRODUCTION_LIST} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import hasValue from 'utils/hasValue'
interface ApiPostData {
  doctorId: number
  is_default?: boolean
}
import {getStorageType} from 'utils/storage'

export interface GetPatientsListParams {
  payload: ApiPostData
  signal?: AbortSignal
}

export const getApiDataProductionList = createAsyncThunk(
  'api/getDataProductionList',
  async ({payload, signal}: GetPatientsListParams, {rejectWithValue}) => {
    const organizationId = getStorageType().getItem('organizationId')
      ? Number(getStorageType().getItem('organizationId'))
      : null
    try {
      const response = await apiHelper(
        URL_PRODUCTION_LIST +
          '?doctor_id=' +
          payload.doctorId +
          '&organization_id=' +
          organizationId,
        HttpMethod.GET,
        payload,
        true,
        undefined,
        undefined,
        signal
      )
      const brandList = response.data.labs.map((element: any) => ({
        value: element?.lab_id,
        label: element?.name,
      }))
      return brandList
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getApiDataDefaultBrandName = createAsyncThunk(
  'api/getDataDefaultBrandName',
  async (getDataDefaultBrandName: ApiPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_PRODUCTION_LIST + '?doctor_id=' + getDataDefaultBrandName.doctorId + '&is_default=true',
        HttpMethod.GET,
        getDataDefaultBrandName
      )

      if (hasValue(response.data.labs)) {
        return {
          value: response?.data?.labs[0]?.lab_id,
          label: response?.data?.labs[0]?.name,
        }
      } else {
        return null
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
const productionListSlice = createSlice({
  name: 'apiProductionList',
  initialState: {
    data: [] as [],
    error: null as string | null,
    loading: false,
    dataDefaultBrandName: {} as {label: string; value: number} | null,
    errorDefaultBrandName: null as string | null,
    loadingDefaultBrandName: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getApiDataProductionList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getApiDataProductionList.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(getApiDataProductionList.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(getApiDataDefaultBrandName.pending, (state) => {
        state.loadingDefaultBrandName = true
        state.errorDefaultBrandName = null
      })
      .addCase(getApiDataDefaultBrandName.fulfilled, (state, action) => {
        state.loadingDefaultBrandName = false
        state.dataDefaultBrandName = action.payload
      })
      .addCase(getApiDataDefaultBrandName.rejected, (state, action) => {
        state.loadingDefaultBrandName = false
        state.errorDefaultBrandName =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export default productionListSlice.reducer
