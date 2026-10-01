import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ADD_SHIPPING_DETAILS,
  URL_ASSIGN_SERVICE_PRODUCT,
  URL_GET_ENABLED_PRODUCT,
  URL_GET_KANBAN_TASK_LIST,
  URL_GET_PRODUCT,
  URL_MOVE_TASK_CARD,
  URL_POST_ATTACH_SHIPPING,
  URL_POST_DEFAULT_ADDRESS,
} from 'redux/Endpoints/apiEndpoints'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import {DeliveryType} from 'screens/Patients/LeadsProfile/main/overview/components/StartManufacturingModal'

export const getTaskList = createAsyncThunk(
  'api/getTaskList',
  async (
    params: {
      order_type: string
      doctor_id: number
      workflow_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_KANBAN_TASK_LIST, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const assignServiceProduct = createAsyncThunk(
  'api/assignServiceProduct',
  async (
    params: {
      product_id: number
      owner_profile_id: number
      assignee_profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_ASSIGN_SERVICE_PRODUCT, HttpMethod.POST, params, false)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code || error.response?.data)
    }
  }
)

export const moveTaskCard = createAsyncThunk(
  'api/moveTaskCard',
  async (
    params: {
      task_id: number
      doctor_id: number
      workflow_status_id: number
      patient_id: number
      workflow_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_MOVE_TASK_CARD, HttpMethod.PUT, params)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getProductList = createAsyncThunk(
  'api/getProductList',
  async (
    params: {
      owner_profile_id: number
      vendor_profile_ids: number[]
      product_type: 'ALIGNER' | 'SERVICE' | 'MANUFACTURING_SERVICE'
      search: string
      showAll?: boolean
    },
    {rejectWithValue}
  ) => {
    try {
      const requestParams = {
        ...params,
        is_product_enabled: params.showAll ? null : true,
      }
      const response = await apiHelper(URL_GET_PRODUCT, HttpMethod.POST, requestParams)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getEnabledProductList = createAsyncThunk(
  'api/getEnabledProductList',
  async (
    params: {
      owner_organization_id: number
      owner_profile_id: number
      customer_profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const requestParams = {
        ...params,
        service_product_for_user: 'CUSTOMER',
        enabled_product: true,
      }
      const response = await apiHelper(URL_GET_ENABLED_PRODUCT, HttpMethod.POST, requestParams)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getEnabledProductListOptions = createAsyncThunk(
  'api/getEnabledProductListOptions',
  async (
    params: {
      owner_organization_id: number
      owner_profile_id: number
      customer_profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const requestParams = {
        ...params,
        service_product_for_user: 'CUSTOMER',
        enabled_product: true,
      }
      const response = await apiHelper(URL_GET_ENABLED_PRODUCT, HttpMethod.POST, requestParams)
      const products: Product[] = response.data
      return products
        .filter((p) => p.product_type !== 'MANUFACTURING_SERVICE')
        .map((p) => ({
          value: p.id,
          label: p.product_name,
        }))
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const addShippingDetails = createAsyncThunk(
  'api/addShippingDetails',
  async (
    params: {
      profile_id: number
      treatement_plan_id: string | undefined
      addressed_to: string | null
      mobile_number?: string | null
      name: string | null
      address_line: string | null
      country: string | null
      state: string | null
      city: string | null
      pincode: string | null
      default: boolean
      customer_profile_id?: number | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_ADD_SHIPPING_DETAILS, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const updateShippingDetails = createAsyncThunk(
  'api/updateShippingDetails',
  async (
    params: {
      shipping_id: number | string
      profile_id: number
      treatement_plan_id: string | undefined
      addressed_to: string | null
      mobile_number?: string | null
      name: string | null
      address_line: string | null
      country: string | null
      state: string | null
      city: string | null
      pincode: string | null
      default: boolean
      customer_profile_id?: number | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_POST_DEFAULT_ADDRESS}${String(params.shipping_id)}`,
        HttpMethod.PUT,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const attachShippingDetails = createAsyncThunk(
  'api/attachShippingDetails',
  async (
    params: {
      treatment_plan_id: number
      shipping_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_POST_ATTACH_SHIPPING, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

const initialState = {
  productList: {} as {
    owner_products: Product[]
    vendor_products: Product[]
  },
  ownerProducts: [] as Product[],
  loadingProduct: false,
  enabledProductList: [] as Product[],
  enabledLoadingProduct: false,
  enabledProductOptions: [] as {value: number; label: string}[],
  enabledProductOptionsLoading: false,
  assigningServiceProduct: false,
  planningProductType: 'IN_HOUSE' as 'IN_HOUSE' | 'OUTSOURCE',
  productType: 'IN_HOUSE' as 'IN_HOUSE' | 'OUTSOURCE',
  productSelected: null as Product | null,
  planningProductSelected: null as Product | null,
  manufacturingProductSelected: null as Product | null,
  planningAssigneeSelected: null as number | null,
  instructions: '' as string,
  loadingShipping: false,
  shipping: {} as {
    addressed_to: string
    mobile_number?: string
    name: string
    address_line: string
    country: string
    state: string
    city: string
    pincode: string
    default: boolean
    shipping_id?: number
  } | null,
  manufacturingData: {
    batchType: 'IN_BATCHES' as DeliveryType,
    upper_start: null as null | number,
    upper_end: null as null | number,
    lower_start: null as null | number,
    lower_end: null as null | number,
    total: null as null | number,
  } as {
    batchType: DeliveryType
    upper_start: null | number
    upper_end: null | number
    lower_start: null | number
    lower_end: null | number
    total: null | number
  },
  clearProductionSetupData: {
    productType: 'IN_HOUSE',
    loadingProduct: false,
    productSelected: null as Product | null,
    instructions: '' as string,
    manufacturingData: {
      batchType: 'IN_BATCHES' as string,
      upper_start: null as null | number,
      upper_end: null as null | number,
      lower_start: null as null | number,
      lower_end: null as null | number,
      total: null as null | number,
    },
  },
}

const ProductionSetupSlice = createSlice({
  name: 'productionSetup',
  initialState,
  reducers: {
    setProductType(state, action) {
      state.productType = action.payload
    },
    setPlanningProductSelected(state, action) {
      state.planningProductSelected = action.payload
    },
    setManufacturingProductSelected(state, action) {
      state.manufacturingProductSelected = action.payload
    },
    setPlanningAssigneeSelected(state, action) {
      state.planningAssigneeSelected = action.payload
    },
    setProductSelected(state, action) {
      state.productSelected = action.payload
    },
    resetProductList(state) {
      state.productList = {...initialState.productList}
    },

    setInstructions(state, action) {
      state.instructions = action.payload
    },

    setManufacturingData(state, action) {
      state.manufacturingData = action.payload
    },

    resetManufacturingData(state) {
      state.manufacturingData = {...initialState.manufacturingData}
    },

    setShipping(state, action) {
      state.shipping = action.payload
    },
    setPlanningProductType(state, action) {
      state.planningProductType = action.payload
    },

    resetPlanningProductSelection(state) {
      state.planningProductSelected = null
      state.planningAssigneeSelected = null
      state.manufacturingProductSelected = null
      state.enabledProductList = []
      state.planningProductType = 'IN_HOUSE'
    },

    setClearProductionSetupData(state) {
      state.loadingProduct = false
      state.productType = 'IN_HOUSE'
      state.productSelected = null
      state.instructions = ''
      state.manufacturingData = {
        batchType: 'IN_BATCHES',
        upper_start: null,
        upper_end: null,
        lower_start: null,
        lower_end: null,
        total: null,
      }
      state.shipping = null
    },
    updateProductEnabledState(
      state,
      action: PayloadAction<{productId: number; isEnabled: boolean}>
    ) {
      const {productId, isEnabled} = action.payload
      const updateList = (list?: Product[]) => {
        if (!Array.isArray(list)) return
        const target = list.find((product) => product.id === productId)
        if (target) {
          target.is_product_enabled = isEnabled
        }
      }

      updateList(state.productList?.owner_products)
      updateList(state.productList?.vendor_products)
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getProductList.pending, (state) => {
        state.loadingProduct = true
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.loadingProduct = false
        state.productList = action.payload

        state.ownerProducts =
          action.payload?.vendor_products && action.payload.vendor_products.length > 0
            ? action.payload.vendor_products
            : action.payload.owner_products
      })
      .addCase(getProductList.rejected, (state) => {
        state.loadingProduct = false
      })
      .addCase(getEnabledProductList.pending, (state) => {
        state.enabledLoadingProduct = true
      })
      .addCase(getEnabledProductList.fulfilled, (state, action) => {
        state.enabledLoadingProduct = false
        state.enabledProductList = action.payload
      })
      .addCase(getEnabledProductList.rejected, (state) => {
        state.enabledLoadingProduct = false
      })
      .addCase(getEnabledProductListOptions.pending, (state) => {
        state.enabledProductOptionsLoading = true
      })
      .addCase(getEnabledProductListOptions.fulfilled, (state, action) => {
        state.enabledProductOptionsLoading = false
        state.enabledProductOptions = action.payload
      })
      .addCase(getEnabledProductListOptions.rejected, (state) => {
        state.enabledProductOptionsLoading = false
      })
    builder
      .addCase(assignServiceProduct.pending, (state) => {
        state.assigningServiceProduct = true
      })
      .addCase(assignServiceProduct.fulfilled, (state) => {
        state.assigningServiceProduct = false
      })
      .addCase(assignServiceProduct.rejected, (state) => {
        state.assigningServiceProduct = false
      })
  },
})

export const {
  setProductType,
  setProductSelected,
  resetProductList,
  setInstructions,
  setManufacturingData,
  resetManufacturingData,
  setClearProductionSetupData,
  setShipping,
  updateProductEnabledState,
  setPlanningProductSelected,
  setPlanningAssigneeSelected,
  resetPlanningProductSelection,
  setManufacturingProductSelected,
  setPlanningProductType,
} = ProductionSetupSlice.actions
export default ProductionSetupSlice.reducer
