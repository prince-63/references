import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_CUSTOMER_PATIENT_PROFILE,
  URL_CUSTOMER_PATIENT_PROFILE_PLANNING_STEPS,
  URL_VSP_PATIENT_DETAILS,
  URL_VSP_PATIENT_STEPPER,
} from 'redux/Endpoints/apiEndpoints'
import {
  PatientPayload,
  PLANNING_STEPS,
  PlanningStepper,
} from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/types/customerPatientProfile'
import {PatientTaskDetails} from '../workflow/workflow.slice'

export const getCustomerPatientProfile = createAsyncThunk(
  'api/getCustomerPatientProfile',
  async (params: {patient_id: number; doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_CUSTOMER_PATIENT_PROFILE, HttpMethod.POST, params)
      const patientData = response.data
      const orders_list = patientData?.order_id
        ? [...(patientData?.archived_order_ids || []), patientData?.order_id]
        : patientData?.archived_order_ids || []
      return {
        response: patientData,
        active_order_id: patientData?.order_id,
        orderList: orders_list,
        chatId: patientData?.chat_ids?.[0] ?? null,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getVspPatientProfile = createAsyncThunk(
  'api/getVspPatientProfile',
  async (params: {patient_id: number; doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_VSP_PATIENT_DETAILS, HttpMethod.POST, params)
      const patientData = response.data
      const orders_list = patientData?.order_id
        ? Array.from(new Set([...(patientData?.archived_order_ids || []), patientData?.order_id]))
        : patientData?.archived_order_ids || []

      return {
        response: patientData,
        active_order_id: patientData?.order_id,
        orderList: orders_list,
        chatId: patientData?.chat_ids?.[0] ?? null,
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getPatientPlanningStepper = createAsyncThunk(
  'api/getPatientPlanningStepper',
  async (
    params: {patient_id: number; doctor_id: number; order_id: string | null},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_CUSTOMER_PATIENT_PROFILE_PLANNING_STEPS,
        HttpMethod.POST,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getVspPatientPlanningStepper = createAsyncThunk(
  'api/getVspPatientPlanningStepper',
  async (params: {order_id: string | null}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_VSP_PATIENT_STEPPER + `${params.order_id ?? null}/status/get`,
        HttpMethod.GET,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

const CustomerPatientProfileSlice = createSlice({
  name: 'CustomerPatientProfile',
  initialState: {
    loadingPatient: false,
    patientData: {} as PatientPayload,
    active_order_id: null as string | null,
    orderList: [] as string[],
    planning_stepper: {} as PlanningStepper | null,
    loadingSteps: false,
    vspPatientData: {} as PatientPayload,

    vsp_stepper: {} as {
      order_id: string
      order_status: string | null
    } | null,
    loadingVspStatus: false,
    vspStepperRequestOrderId: null as string | null,
    selectedOrderId: null as string | null,
    kanbanCardDetails: null as PatientTaskDetails | null,
    activePlanningStep: 'ORDER_DETAILS' as PLANNING_STEPS,
    chatId: null as number | null,
  },
  reducers: {
    setKanbanCardDetails: (state, action) => {
      state.kanbanCardDetails = action.payload
    },
    setVspPatientOrderStatus: (state, action) => {
      state.vsp_stepper = {
        order_id: state.vsp_stepper?.order_id ?? state.active_order_id ?? '',
        order_status: action.payload,
      }
    },
    setActiveOrderId: (state, action) => {
      state.active_order_id = action.payload
    },
    setSelectedOrderId: (state, action) => {
      state.selectedOrderId = action.payload
    },
    setActivePlanningStep: (state, action) => {
      state.activePlanningStep = action.payload
    },
    resetCustomerPatientState: (state) => {
      state.active_order_id = null
      state.orderList = []
      state.planning_stepper = null
      state.vsp_stepper = null
      state.vspStepperRequestOrderId = null
      state.selectedOrderId = null
      state.patientData = {} as PatientPayload
      state.chatId = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCustomerPatientProfile.pending, (state) => {
      state.loadingPatient = true
    })
    builder.addCase(getCustomerPatientProfile.fulfilled, (state, action) => {
      state.loadingPatient = false
      state.patientData = action.payload.response
      state.chatId = action.payload.chatId
      state.active_order_id = action.payload.active_order_id
      state.selectedOrderId = action.payload.active_order_id
      state.orderList = action.payload.orderList
    })
    builder.addCase(getCustomerPatientProfile.rejected, (state) => {
      state.loadingPatient = false
    })

    builder.addCase(getVspPatientProfile.pending, (state) => {
      state.loadingPatient = true
    })
    builder.addCase(getVspPatientProfile.fulfilled, (state, action) => {
      state.loadingPatient = false
      state.patientData = action.payload.response
      state.chatId = action.payload.chatId
      state.active_order_id = action.payload.active_order_id
      state.orderList = action.payload.orderList
      state.selectedOrderId = action.payload.active_order_id
    })
    builder.addCase(getVspPatientProfile.rejected, (state) => {
      state.loadingPatient = false
    })

    builder.addCase(getPatientPlanningStepper.pending, (state) => {
      state.loadingSteps = true
    })
    builder.addCase(getPatientPlanningStepper.fulfilled, (state, action) => {
      state.loadingSteps = false
      state.planning_stepper = action.payload
    })
    builder.addCase(getPatientPlanningStepper.rejected, (state) => {
      state.loadingSteps = false
    })

    builder.addCase(getVspPatientPlanningStepper.pending, (state, action) => {
      state.loadingVspStatus = true
      state.vspStepperRequestOrderId = action.meta.arg.order_id ?? null
    })
    builder.addCase(getVspPatientPlanningStepper.fulfilled, (state, action) => {
      if ((action.meta.arg.order_id ?? null) !== state.vspStepperRequestOrderId) return
      state.loadingVspStatus = false
      state.vsp_stepper = action.payload
    })
    builder.addCase(getVspPatientPlanningStepper.rejected, (state, action) => {
      if ((action.meta.arg.order_id ?? null) !== state.vspStepperRequestOrderId) return
      state.loadingVspStatus = false
      state.vsp_stepper = null
    })
  },
})

export const {
  setActiveOrderId,
  setSelectedOrderId,
  setActivePlanningStep,
  resetCustomerPatientState,
  setKanbanCardDetails,
  setVspPatientOrderStatus,
} = CustomerPatientProfileSlice.actions
export default CustomerPatientProfileSlice.reducer
