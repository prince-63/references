import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_UPDATE_SERVICE_TOGGLE,
  URL_GET_SERVICE_PERMISSIONS,
  URL_ADD_SERVICE_PRODUCT,
  URL_GET_CATEGORY_LIST,
  URL_GET_PRODUCT_LIST,
  URL_DELETE_PRODUCT_ITEM,
  URL_EDIT_SERVICE_PRODUCT,
  URL_ASSIGN_SERVICE_PRODUCT,
  URL_GET_CUSTOMER_PRODUCTS,
  URL_GET_CUSTOMER_PRODUCTS_V2,
  URL_REMOVE_ASSIGNED_SERVICE_PRODUCT,
  URL_TOGGLE_SERVICE_PRODUCT,
} from 'redux/Endpoints/apiEndpoints'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import {getStorageType} from 'utils/storage'

type ServicesState = {
  services: Record<string, boolean>
  loading: boolean
  data: Record<string, boolean>

  loadingAddProduct: boolean
  categoryList: {value: string; label: string; name: string}[]
  loadingCategoryList: boolean

  loadingProductList: boolean
  productList: Product[]

  editingProductData: Product | null
  assigningServiceProduct: boolean
  customerProducts: Product[]
  loadingCustomerProducts: boolean
  removingAssignedServiceProduct: boolean
}

export const updateServiceToggle = createAsyncThunk(
  'api/updateServiceToggle',
  async (
    params: {doctor_id?: number; key: string; value: boolean; profile_id?: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_UPDATE_SERVICE_TOGGLE, HttpMethod.PUT, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getServicePermissions = createAsyncThunk(
  'api/getServicePermissions',
  async (params: {profile_id?: number}, {rejectWithValue}) => {
    const organizationId = getStorageType().getItem('organizationId')
      ? Number(getStorageType().getItem('organizationId'))
      : null
    try {
      const response = await apiHelper(
        URL_GET_SERVICE_PERMISSIONS +
          `profileId=${params.profile_id}&orgId=${organizationId}&archived=false&page=0&size=10&sort=DESC`,
        HttpMethod.GET,
        params
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const addServiceProduct = createAsyncThunk(
  'api/addServiceProduct',
  async (
    params: {
      payload: {
        product_type: string
        product_name: string
        product_category_id: number
        product_description: string
        product_image: null
        is_default: boolean
        profile_id: number
      }
      files: File[] | null
    },
    {rejectWithValue}
  ) => {
    try {
      const formData = new FormData()
      formData.append('request', JSON.stringify(params?.payload))
      if (params?.files && params?.files.length > 0) {
        formData.append('image', params?.files[0])
      }

      const response = await apiHelper(`${URL_ADD_SERVICE_PRODUCT}`, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const editServiceProduct = createAsyncThunk(
  'api/editServiceProduct',
  async (
    params: {
      serviceProductId: number
      payload: {
        product_type: string
        product_name: string
        product_category_id: number
        product_description: string
        product_image: null
        is_default: boolean
        profile_id: number
      }
      files: File[] | null
    },
    {rejectWithValue}
  ) => {
    try {
      const formData = new FormData()
      formData.append('request', JSON.stringify(params?.payload))
      if (params?.files) {
        formData.append('image', params?.files[0])
      }
      const response = await apiHelper(
        URL_EDIT_SERVICE_PRODUCT + params.serviceProductId,
        HttpMethod.PUT,
        formData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getServiceProduct = createAsyncThunk(
  'api/getServiceProduct',
  async (
    params: {
      product_type: string | null
      profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_PRODUCT_LIST}${params.profile_id}/type/${params.product_type}`,
        HttpMethod.GET,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getCategoryList = createAsyncThunk(
  'api/getCategoryList',
  async (params: {profile_id?: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GET_CATEGORY_LIST + params.profile_id,
        HttpMethod.GET,
        params
      )

      return response.data?.map(
        (res: {
          id: number
          name: string
          description: string
          profile_id: number
          is_default: boolean
          category_type: 'SERVICE' | 'PRODUCT'
        }) => ({
          value: res.id,
          label: res.name,
          category_type: res.category_type,
        })
      )
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'api/deleteProduct',
  async (
    params: {
      serviceProductId: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_DELETE_PRODUCT_ITEM}${params.serviceProductId}`,
        HttpMethod.DELETE,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getCustomerProducts = createAsyncThunk(
  'api/getCustomerProducts',
  async (params: {profileId: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_GET_CUSTOMER_PRODUCTS}?profileId=${params.profileId}`,
        HttpMethod.GET
      )

      // API returns shape { products: Product[] }
      return response.data?.products ?? response.data ?? []
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code || error?.response?.data)
    }
  }
)

export const getCustomerProductsV2 = createAsyncThunk(
  'api/getCustomerProductsV2',
  async (
    params: {
      owner_organization_id: number
      owner_profile_id: number
      customer_profile_id: number
      service_product_for_user: 'CUSTOMER' | 'OWNER' | 'VENDOR'
      enabled_product: boolean
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_CUSTOMER_PRODUCTS_V2, HttpMethod.POST, params)
      return response.data?.products ?? response.data ?? []
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code || error?.response?.data)
    }
  }
)

export const removeAssignedServiceProduct = createAsyncThunk(
  'api/removeAssignedServiceProduct',
  async (params: {assigneeId: number; ownerId: number; productId: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_REMOVE_ASSIGNED_SERVICE_PRODUCT}?assigneeId=${params.assigneeId}&ownerId=${params.ownerId}&productId=${params.productId}`,
        HttpMethod.DELETE,
        {}
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code || error?.response?.data)
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
      doctor_id: number
      profile_id: number
      organization_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_ASSIGN_SERVICE_PRODUCT,
        HttpMethod.POST,
        params,
        false // payload already includes profile/org/doctor ids
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code || error?.response?.data)
    }
  }
)

export const toggleCustomerServiceProduct = createAsyncThunk(
  'api/toggleCustomerServiceProduct',
  async (
    params: {
      action: 'enable' | 'disable'
      owner_organization_id: number
      owner_profile_id: number
      customer_profile_id: number
      service_product_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const {action, ...payload} = params
      const response = await apiHelper(
        `${URL_TOGGLE_SERVICE_PRODUCT}/${action}`,
        HttpMethod.POST,
        payload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code || error?.response?.data)
    }
  }
)

const initialState: ServicesState = {
  services: {
    outsourced_aligners: true,
    in_house_aligners: true,
    planning: true,
    manufacturing: true,
    outsource_planning: true,
    outsource_manufacturing: true,
    operations_in_house: true,
    operations_outsource: true,
    offer_planning: true,
    offer_manufacturing: true,
  },
  loading: false,
  data: null as any,
  loadingAddProduct: false,
  categoryList: [] as {value: string; label: string; name: string}[],
  loadingCategoryList: false,

  loadingProductList: false,
  productList: [] as Product[],
  editingProductData: null as Product | null,
  assigningServiceProduct: false,
  customerProducts: [] as Product[],
  loadingCustomerProducts: false,
  removingAssignedServiceProduct: false,
}

const servicesSlice = createSlice({
  name: 'uiServices',
  initialState,
  reducers: {
    setEditingProductData(state, action) {
      state.editingProductData = action.payload
    },
    setServices(state, action: PayloadAction<Record<string, boolean>>) {
      state.services = action.payload
    },
    updateServiceFlag(state, action: PayloadAction<{key: string; value: boolean}>) {
      state.services = {...state.services, [action.payload.key]: action.payload.value}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateServiceToggle.pending, (state) => {
        state.loading = true
      })
      .addCase(updateServiceToggle.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateServiceToggle.rejected, (state) => {
        state.loading = false
      })

      .addCase(getServicePermissions.pending, (state) => {
        state.loading = true
      })
      .addCase(getServicePermissions.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(getServicePermissions.rejected, (state) => {
        state.loading = false
      })

      .addCase(addServiceProduct.pending, (state) => {
        state.loadingAddProduct = true
      })
      .addCase(addServiceProduct.fulfilled, (state) => {
        state.loadingAddProduct = false
      })
      .addCase(addServiceProduct.rejected, (state) => {
        state.loadingAddProduct = false
      })

      .addCase(editServiceProduct.pending, (state) => {
        state.loadingAddProduct = true
      })
      .addCase(editServiceProduct.fulfilled, (state) => {
        state.loadingAddProduct = false
      })
      .addCase(editServiceProduct.rejected, (state) => {
        state.loadingAddProduct = false
      })

      .addCase(getCategoryList.pending, (state) => {
        state.loadingCategoryList = true
      })
      .addCase(getCategoryList.fulfilled, (state, action) => {
        state.loadingCategoryList = false
        state.categoryList = action.payload
      })
      .addCase(getCategoryList.rejected, (state) => {
        state.loadingCategoryList = false
      })

      .addCase(getServiceProduct.pending, (state) => {
        state.loadingProductList = true
      })
      .addCase(getServiceProduct.fulfilled, (state, action) => {
        state.loadingProductList = false
        state.productList = action.payload
      })
      .addCase(getServiceProduct.rejected, (state) => {
        state.loadingProductList = false
      })

      .addCase(getCustomerProducts.pending, (state) => {
        state.loadingCustomerProducts = true
      })
      .addCase(getCustomerProducts.fulfilled, (state, action) => {
        state.loadingCustomerProducts = false
        state.customerProducts = action.payload
      })
      .addCase(getCustomerProducts.rejected, (state) => {
        state.loadingCustomerProducts = false
      })

      .addCase(getCustomerProductsV2.pending, (state) => {
        state.loadingCustomerProducts = true
      })
      .addCase(getCustomerProductsV2.fulfilled, (state, action) => {
        state.loadingCustomerProducts = false
        state.customerProducts = action.payload
      })
      .addCase(getCustomerProductsV2.rejected, (state) => {
        state.loadingCustomerProducts = false
      })

      .addCase(assignServiceProduct.pending, (state) => {
        state.assigningServiceProduct = true
      })
      .addCase(assignServiceProduct.fulfilled, (state) => {
        state.assigningServiceProduct = false
      })
      .addCase(assignServiceProduct.rejected, (state) => {
        state.assigningServiceProduct = false
      })

      .addCase(removeAssignedServiceProduct.pending, (state) => {
        state.removingAssignedServiceProduct = true
      })
      .addCase(removeAssignedServiceProduct.fulfilled, (state) => {
        state.removingAssignedServiceProduct = false
      })
      .addCase(removeAssignedServiceProduct.rejected, (state) => {
        state.removingAssignedServiceProduct = false
      })
  },
})

export const {setServices, updateServiceFlag, setEditingProductData} = servicesSlice.actions
export default servicesSlice.reducer
