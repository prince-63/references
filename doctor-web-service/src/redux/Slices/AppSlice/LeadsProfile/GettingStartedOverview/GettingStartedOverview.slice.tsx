import HttpMethod from '@constants/httpMethods.constants'
import manufacturingConstants from '@constants/manufacturing.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ADD_SHIPPING,
  URL_COMPLETE_MANUFACTURING,
  URL_CREATE_MANUFACTURING,
  URL_GET_MANUFACTURING,
  URL_GET_MANUFACTURING_LIST,
  URL_GETTING_STARTED_OVERVIEW,
  URL_UPDATE_MANUFACTURING,
} from 'redux/Endpoints/apiEndpoints'
import {
  DeliveryPreference,
  IGettingStartedSteps,
  IManufacturing,
  IManufacturingList,
  ManufacturingStatus,
} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import {getStorageType} from 'utils/storage'

export interface UpdateManufacturingBatchRequest {
  status?: ManufacturingStatus
  manufacturing_id: number
  shipping_date?: string
  tentative_delivery_date?: string
  tracking_number?: string
  tracking_link?: string
  delivery_date?: string
  completion_date?: string
  notes?: string
  is_current?: boolean
  upper_aligner_start?: number | null
  upper_aligner_end?: number | null
  lower_aligner_start?: number | null
  lower_aligner_end?: number | null
  total_aligners?: number
  start_date?: string
  is_aligners_updated?: boolean
  batch_type: DeliveryPreference
}

export const getGettingStartedStepDetails = createAsyncThunk(
  'api/getGettingStartedStepDetails',
  async (
    apiGetFilesParams: {
      patient_id: number
      filter_by_step:
        | 'ASSESSMENT'
        | 'PLANNING'
        | 'IN_MANUFACTURING'
        | 'IN_TRANSIT'
        | 'STARTING_SOON'
        | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GETTING_STARTED_OVERVIEW}`,
        HttpMethod.POST,
        apiGetFilesParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postCompleteManufacturing = createAsyncThunk(
  'api/postCompleteManufacturing',
  async (
    apiGetFilesParams: {
      patient_id: number
      completion_date?: string
      delivery_date?: string
      status?: keyof typeof manufacturingConstants
      manufacturing_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(`${URL_COMPLETE_MANUFACTURING}`, HttpMethod.PUT, {
        ...apiGetFilesParams,
        shipping_date: null,
        tentative_delivery_date: null,
        tracking_number: null,
        tracking_link: null,
        notes: null,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postManufacturingDetails = createAsyncThunk(
  'api/postManufacturingDetails',
  async (
    apiGetFilesParams: {
      status: string
      patient_id: number
      upper_aligner_start: number | null
      upper_aligner_end: number | null
      lower_aligner_start: number | null
      lower_aligner_end: number | null
      total_aligners: number
      batch_type: 'ALL_ALIGNERS' | 'IN_BATCHES'
      treatment_plan_id: number
      is_next_batch: boolean | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_CREATE_MANUFACTURING}`,
        HttpMethod.POST,
        apiGetFilesParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const putManufacturingDetails = createAsyncThunk(
  'api/putManufacturingDetails',
  async (payload: UpdateManufacturingBatchRequest, {rejectWithValue}) => {
    try {
      const response = await apiHelper(`${URL_UPDATE_MANUFACTURING}`, HttpMethod.PUT, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const getManufacturingDetails = createAsyncThunk(
  'api/getManufacturingDetails',
  async (
    apiGetFilesParams: {
      manufacturing_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_MANUFACTURING}${apiGetFilesParams?.manufacturing_id}`,
        HttpMethod.GET,
        apiGetFilesParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getManufacturingListDetails = createAsyncThunk(
  'api/getManufacturingListDetails',
  async (
    apiGetFilesParams: {
      patient_id: number
      treatment_plan_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_MANUFACTURING_LIST}`,
        HttpMethod.POST,
        apiGetFilesParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
  {
    condition: (apiGetFilesParams, {getState}) => {
      const planId = apiGetFilesParams?.treatment_plan_id
      if (!Number.isFinite(planId)) return true

      const state = getState() as {
        GettingStartedOverview?: {
          loadingManufacturingListByPlan?: Record<number, boolean>
        }
      }

      return !state.GettingStartedOverview?.loadingManufacturingListByPlan?.[planId]
    },
  }
)

export const postShippingDetails = createAsyncThunk(
  'api/postShippingDetails',
  async (
    apiGetFilesParams: {
      details: {
        status: string
        shipping_date: string | null
        manufacturing_id: number | string
        tentative_delivery_date: string
        tracking_number: string
        tracking_link: string
        patient_id: number
      }
      files: File[]
    },
    {rejectWithValue}
  ) => {
    try {
      const userId = getStorageType().getItem('userId')
        ? Number(getStorageType().getItem('userId'))
        : null

      const profileId = getStorageType().getItem('profileId')
        ? Number(getStorageType().getItem('profileId'))
        : null
      const updateManufacturingRequest = {
        ...apiGetFilesParams.details,
        doctor_id: userId,
        profile_id: profileId,
      }
      const formData = new FormData()

      formData.append('updateManufacturingRequest', JSON.stringify(updateManufacturingRequest))

      if (apiGetFilesParams?.files) {
        apiGetFilesParams?.files?.forEach((file) => {
          if (file instanceof File && file.size > 0) {
            formData.append('documents', file)
          }
        })
      }
      const response = await apiHelper(`${URL_ADD_SHIPPING}`, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const GettingStartedOverview = createSlice({
  name: 'GettingStartedOverview',
  initialState: {
    currentStepGettingStarted: 0,
    gettingStartedStepData: {} as IGettingStartedSteps,
    loadingGettingStartedStep: false,
    manufacturingData: {} as IManufacturing,
    loadingManufacturing: false,
    // Key manufacturing list by treatment_plan_id to avoid cross-plan overwrites
    manufacturingListByPlan: {} as Record<number, IManufacturingList>,
    loadingManufacturingListByPlan: {} as Record<number, boolean>,
    // Back-compat fields used by other screens
    manufacturingListData: {} as IManufacturingList,
    loadingManufacturingList: false,
    shippingDetails: {},
    loadingShippingDetails: false,
    openModalManufacturing: false,
    openShippingDetailsModal: false,
    openCompleteManufacturingModal: false,
    openConfirmShippedModal: false,
    openConfirmMarkAsDeliveredModal: false,
  },
  reducers: {
    updateCurrentStepGettingStarted: (state, action) => {
      state.currentStepGettingStarted = action.payload
    },

    setOpenModalManufacturing: (state, action) => {
      state.openModalManufacturing = action.payload
    },
    setOpenShippingDetailsModal: (state, action) => {
      state.openShippingDetailsModal = action.payload
    },
    setOpenCompleteManufacturingModal: (state, action) => {
      state.openCompleteManufacturingModal = action.payload
    },
    setOpenConfirmShippedModal: (state, action) => {
      state.openConfirmShippedModal = action.payload
    },
    setOpenConfirmMarkAsDeliveredModal: (state, action) => {
      state.openConfirmMarkAsDeliveredModal = action.payload
    },
    // Optional payload: pass a treatment_plan_id to clear just that entry; otherwise clear all
    resetManufacturingListData: (state, action) => {
      const planId = action.payload as number | undefined
      if (typeof planId === 'number') {
        delete state.manufacturingListByPlan[planId]
        delete state.loadingManufacturingListByPlan[planId]
      } else {
        state.manufacturingListByPlan = {} as Record<number, IManufacturingList>
        state.loadingManufacturingListByPlan = {} as Record<number, boolean>
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGettingStartedStepDetails.pending, (state) => {
        state.loadingGettingStartedStep = true
      })
      .addCase(getGettingStartedStepDetails.fulfilled, (state, action) => {
        state.loadingGettingStartedStep = false
        state.gettingStartedStepData = action.payload
      })

      .addCase(postManufacturingDetails.pending, (state) => {
        state.loadingManufacturing = true
      })
      .addCase(postManufacturingDetails.fulfilled, (state, action) => {
        state.loadingManufacturing = false
        state.manufacturingData = action.payload
      })
      .addCase(putManufacturingDetails.pending, (state) => {
        state.loadingManufacturing = true
      })
      .addCase(putManufacturingDetails.fulfilled, (state) => {
        state.loadingManufacturing = false
      })
      .addCase(getManufacturingDetails.pending, (state) => {
        state.loadingManufacturing = true
      })

      .addCase(getManufacturingDetails.fulfilled, (state, action) => {
        state.loadingManufacturing = false
        state.manufacturingData = action.payload
      })

      .addCase(getManufacturingListDetails.pending, (state, action) => {
        const planId = (action.meta?.arg as any)?.treatment_plan_id
        if (typeof planId === 'number') state.loadingManufacturingListByPlan[planId] = true
        state.loadingManufacturingList = true
      })
      .addCase(getManufacturingListDetails.fulfilled, (state, action) => {
        const planId = (action.meta?.arg as any)?.treatment_plan_id
        if (typeof planId === 'number') {
          state.loadingManufacturingListByPlan[planId] = false
          state.manufacturingListByPlan[planId] = action.payload
        }
        state.loadingManufacturingList = false
        state.manufacturingListData = action.payload
      })

      .addCase(postShippingDetails.pending, (state) => {
        state.loadingShippingDetails = true
      })
      .addCase(postShippingDetails.fulfilled, (state, action) => {
        state.loadingManufacturing = false
        state.shippingDetails = action.payload
      })
      .addCase(postShippingDetails.rejected, (state) => {
        state.loadingShippingDetails = false
      })
  },
})

export const {
  updateCurrentStepGettingStarted,
  setOpenModalManufacturing,
  setOpenShippingDetailsModal,
  setOpenCompleteManufacturingModal,
  setOpenConfirmShippedModal,
  setOpenConfirmMarkAsDeliveredModal,
  resetManufacturingListData,
} = GettingStartedOverview.actions
export default GettingStartedOverview.reducer
