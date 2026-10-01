import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_GET_PRODUCT,
  URL_GET_PRODUCTION_DATA,
  URL_MULTI_SELECT_STATUS,
  URL_NEW_WORKFLOW,
  URL_UPDATE_INFO_STATUS,
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
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.alignerProduction?.loadingAllAlignerData) {
        return false
      }
    },
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
        data?.statuses?.map((status: {label_name: string; id: number}) => ({
          label: status?.label_name,
          value: safeParseInt(status?.id),
        })) ?? []

      // Extract statusMeta (label_name, color, position) for ordering and coloring in UI
      const statusMeta =
        data?.statuses?.map((st: any) => ({
          label_name: (st?.label_name || st?.label_name || '').toString(),
          color: st?.color || '#999999',
          position: typeof st?.position === 'number' ? st.position : 0,
        })) ?? []

      return {optionList, workflowId: data?.id ?? null, statusMeta}
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const updateInfoDataList = createAsyncThunk(
  'api/getAlignerProductionData',
  async (
    params: {
      flag_id: number
      profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_UPDATE_INFO_STATUS, HttpMethod.PUT, params)
      return response.data
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

  // Workflow status metadata to align order and colors of header cards
  statusMeta: [] as {label_name: string; color: string; position: number}[],

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
        state.statusList = (action.payload.optionList || []).map((opt: optionType) => ({
          ...opt,
          label: typeof opt.label === 'string' ? opt.label.toUpperCase() : opt.label,
        }))
        // Store status metadata sorted by position for UI ordering and colors
        state.statusMeta = (action.payload.statusMeta || [])
          .filter((s: any) => !!s?.label_name)
          .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
      })
      .addCase(getStatusList.rejected, (state) => {
        state.loadingStatus = false
      })
  },
})

export const {} = KanbanSlice.actions
export default KanbanSlice.reducer
