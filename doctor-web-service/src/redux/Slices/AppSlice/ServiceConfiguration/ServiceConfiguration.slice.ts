import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_GET_SERVICE_CONFIGURATION,
  URL_GET_SERVICE_ENABLE_DISABLE,
} from 'redux/Endpoints/apiEndpoints'

export enum ServiceConfigurationItemName {
  ALIGNERS_PLANNING_MANUFACTURING = 'ALIGNERS(PLANNING + MANUFACTURING)',
  MANUFACTURING = 'MANUFACTURING',
  PLANNING = 'PLANNING',
  VSP_PLANNING = 'VSP PLANNING',
  BRACES_ADD_ON = 'BRACES ADD-ON',
  PAYMENT_AND_BILLING = 'PAYMENT AND BILLING',
}

export interface ServiceConfigurationItem {
  id: number | null
  item_name: ServiceConfigurationItemName
  display_order: number | null
  is_active: boolean
}
export interface ServiceConfigurationResponseData {
  id: number | null
  profile_id: number | null
  enabled_items: ServiceConfigurationItem[]
  disabled_items: ServiceConfigurationItem[]
}

export interface ServiceConfigurationResponse {
  data: ServiceConfigurationResponseData
  serviceConfig: ServiceConfiguration
}
export interface ServiceConfiguration {
  ALIGNER_PLANNING_MANUFACTURING: boolean
  MANUFACTURING: boolean
  PLANNING: boolean
  VSP_PLANNING: boolean
  BRACES_ADD_ON: boolean
  PAYMENT_AND_BILLING: boolean
}

export interface ServiceConfigurationState {
  data: ServiceConfigurationResponseData
  loading: boolean
  error: string | null
  serviceConfig: ServiceConfiguration
}

const createInitialState = (): ServiceConfigurationState => ({
  data: {
    id: null,
    profile_id: null,
    enabled_items: [],
    disabled_items: [],
  },
  serviceConfig: {
    ALIGNER_PLANNING_MANUFACTURING: false,
    MANUFACTURING: false,
    PLANNING: false,
    VSP_PLANNING: false,
    BRACES_ADD_ON: false,
    PAYMENT_AND_BILLING: false,
  },
  loading: false,
  error: null,
})

export const getServiceConfiguration = createAsyncThunk<
  ServiceConfigurationResponse,
  {profileId: number},
  {rejectValue: string}
>('serviceConfiguration/get', async ({profileId}, {rejectWithValue}) => {
  try {
    const response = await apiHelper(`${URL_GET_SERVICE_CONFIGURATION}${profileId}`, HttpMethod.GET)
    const data = response?.data ?? {}

    // ✅ Map Enabled Items
    const enabledItems: ServiceConfigurationItem[] = Array.isArray(data.enabled_items)
      ? data.enabled_items.map((item: ServiceConfigurationItem) => ({
          id: typeof item?.id === 'number' ? item.id : null,
          item_name:
            (typeof item?.item_name === 'string'
              ? (item.item_name as ServiceConfigurationItemName)
              : null) ?? ServiceConfigurationItemName.PLANNING,
          display_order: typeof item?.display_order === 'number' ? item.display_order : null,
          is_active: Boolean(item?.is_active),
        }))
      : []

    // ✅ Map Disabled Items
    const disabledItems: ServiceConfigurationItem[] = Array.isArray(data.disabled_items)
      ? data.disabled_items.map((item: ServiceConfigurationItem) => ({
          id: typeof item?.id === 'number' ? item.id : null,
          item_name:
            (typeof item?.item_name === 'string'
              ? (item.item_name as ServiceConfigurationItemName)
              : null) ?? ServiceConfigurationItemName.PLANNING,
          display_order: typeof item?.display_order === 'number' ? item.display_order : null,
          is_active: false,
        }))
      : []

    // ✅ Create Service Data
    const serviceData = {
      id: typeof data.id === 'number' ? data.id : null,
      profile_id: typeof data.profile_id === 'number' ? data.profile_id : null,
      enabled_items: enabledItems,
      disabled_items: disabledItems,
    }

    // ✅ Default Config (everything false)
    const serviceConfig: ServiceConfiguration = {
      ALIGNER_PLANNING_MANUFACTURING: false,
      MANUFACTURING: false,
      PLANNING: false,
      VSP_PLANNING: false,
      BRACES_ADD_ON: false,
      PAYMENT_AND_BILLING: false,
    }

    // ✅ Set enabled items to true
    enabledItems.forEach((item) => {
      if (item.item_name && item.is_active) {
        if (item.item_name === 'ALIGNERS(PLANNING + MANUFACTURING)') {
          serviceConfig.ALIGNER_PLANNING_MANUFACTURING = true
        } else if (item.item_name === 'VSP PLANNING') {
          serviceConfig.VSP_PLANNING = true
        } else if (item.item_name === 'BRACES ADD-ON') {
          serviceConfig.BRACES_ADD_ON = true
        } else if (item.item_name === 'PAYMENT AND BILLING') {
          serviceConfig.PAYMENT_AND_BILLING = true
        } else {
          serviceConfig[item.item_name] = true
        }
      }
    })

    // ✅ Optional: Ensure disabled items are false (safety)
    disabledItems.forEach((item) => {
      if (item.item_name === 'ALIGNERS(PLANNING + MANUFACTURING)') {
        serviceConfig.ALIGNER_PLANNING_MANUFACTURING = true
      } else if (item.item_name === 'VSP PLANNING') {
        serviceConfig.VSP_PLANNING = false
      } else if (item.item_name === 'BRACES ADD-ON') {
        serviceConfig.BRACES_ADD_ON = true
      } else if (item.item_name === 'PAYMENT AND BILLING') {
        serviceConfig.PAYMENT_AND_BILLING = true
      } else {
        serviceConfig[item.item_name] = false
      }
    })

    // ✅ Return final response
    return {data: serviceData, serviceConfig}
  } catch (error: any) {
    const errorCode =
      error?.response?.data?.error_code ?? error?.message ?? 'SERVICE_CONFIGURATION_ERROR'
    return rejectWithValue(errorCode)
  }
},
{
  condition: (arg, {getState}) => {
    const state = getState() as any
    if (state.serviceConfiguration?.loading) {
      return false
    }
  },
})

export const postEnableDisableService = createAsyncThunk(
  'api/postEnableDisableService',
  async (params: {is_active: boolean; config_id: number; profileId: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GET_SERVICE_ENABLE_DISABLE + `${params.is_active ? 'disable' : 'enable'}`,
        HttpMethod.POST,
        {
          profile_id: params.profileId,
          service_item_ids: [params.config_id],
        }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const serviceConfigurationSlice = createSlice({
  name: 'serviceConfiguration',
  initialState: createInitialState(),
  reducers: {
    resetServiceConfiguration: () => ({
      ...createInitialState(),
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(getServiceConfiguration.pending, (state) => {
      state.loading = true
      state.error = null
    })

    builder.addCase(getServiceConfiguration.fulfilled, (state, action) => {
      const responseData = action.payload
      state.loading = false
      state.data = responseData?.data
      state.serviceConfig = responseData?.serviceConfig
      state.error = null
    })

    builder.addCase(getServiceConfiguration.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? action.error.message ?? 'SERVICE_CONFIGURATION_ERROR'
    })
  },
})

export const {resetServiceConfiguration} = serviceConfigurationSlice.actions
export default serviceConfigurationSlice.reducer
