import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_GET_PRODUCT,
  URL_GET_PRODUCTION_DATA,
  URL_MULTI_SELECT_STATUS,
  URL_NEW_WORKFLOW,
} from 'redux/Endpoints/apiEndpoints'
import {
  AlignerProductionPayload,
  AlignerProductionResponse,
  countsData,
  PayloadStatusChange,
} from 'screens/AlignerProduction/types/alignerProduction.types'

import {optionType} from 'types/optionType'
import {safeParseInt} from 'utils/ConstFunctions'

export const getAllProductOptionList = createAsyncThunk(
  'api/getAllProductOptionList',
  async (
    params: {
      owner_profile_id: number
      vendor_profile_ids: number[]
      product_type: 'ALIGNER' | 'SERVICE'
      search: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_PRODUCT, HttpMethod.POST, params)
      const productList = response.data

      const mergedProducts = [...productList.owner_products, ...productList.vendor_products].map(
        (product) => ({
          label: product.product_name,
          value: product.id,
        })
      )
      return mergedProducts
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getAlignerProductionData = createAsyncThunk(
  'api/getAlignerProductionData',
  async (params: AlignerProductionPayload, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_GET_PRODUCTION_DATA, HttpMethod.POST, params)
      const data: AlignerProductionResponse = response.data
      const countsData = response?.data?.label_counts
      return {countsData: countsData, data: data}
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const changeMultiStatus = createAsyncThunk(
  'api/changeMultiStatus',
  async (params: PayloadStatusChange, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_MULTI_SELECT_STATUS, HttpMethod.PUT, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getStatusList = createAsyncThunk(
  'api/getStatusList',
  async (
    params: {
      kanban_name: string
      kanban_header_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_NEW_WORKFLOW, HttpMethod.POST, params)
      const data = response.data[0]

      const optionList =
        data?.statuses?.map((status: {name: string; id: number}) => ({
          label: status?.name,
          value: safeParseInt(status?.id),
        })) ?? []

      return {optionList, workflowId: data?.id ?? null}
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

const initialState = {
  allProductList: [] as optionType[],
  loadingAllProductList: false,

  allAlignerData: {} as AlignerProductionResponse,
  loadingAllAlignerData: false,
  countsStatusData: [] as countsData[],

  statusList: [] as optionType[],
  loadingStatus: false,
  workflowId: null as number | null,
}

const KanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(getAllProductOptionList.pending, (state) => {
        state.loadingAllProductList = true
      })
      .addCase(getAllProductOptionList.fulfilled, (state, action) => {
        state.loadingAllProductList = false
        state.allProductList = action.payload
      })
      .addCase(getAllProductOptionList.rejected, (state) => {
        state.loadingAllProductList = false
      })

      .addCase(getAlignerProductionData.pending, (state) => {
        state.loadingAllAlignerData = true
      })
      .addCase(getAlignerProductionData.fulfilled, (state, action) => {
        state.loadingAllAlignerData = false
        // always update the main data
        state.allAlignerData = action.payload.data

        // Only update countsStatusData when there is no label filter in the request
        // action.meta.arg contains the original params passed to the thunk
        const filterBy = (action as any)?.meta?.arg?.filter_by_label_name
        if (filterBy == null) {
          state.countsStatusData = action.payload.countsData
        }
      })
      .addCase(getAlignerProductionData.rejected, (state) => {
        state.loadingAllAlignerData = false
      })

      .addCase(getStatusList.pending, (state) => {
        state.loadingStatus = true
      })
      .addCase(getStatusList.fulfilled, (state, action) => {
        state.loadingStatus = false
        state.workflowId = action.payload.workflowId
        state.statusList = action.payload.optionList
      })
      .addCase(getStatusList.rejected, (state) => {
        state.loadingStatus = false
      })
  },
})

export const {} = KanbanSlice.actions
export default KanbanSlice.reducer
