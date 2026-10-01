import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'

import {
  URL_ADD_ORDER_TIMELINE_COMMENT,
  URL_CREATE_ORDER,
  URL_GET_LEADS_PROFILE_DETAILS,
  URL_GET_ORDER_DETAILS,
  URL_GET_ORDER_TIMELINE_COMMENTS,
  URL_GET_ORDER_DETAILS_LIST,
  URL_ORDER_STATUS_UPDATE,
  URL_CLONE_ORDER_V2,
  URL_VALIDATE_PATIENT,
  URL_GET_ACTIVE_PRACTICES,
  URL_CLONE_ORDER,
  URL_LIST_PRACTICES,
  URL_ZIP_ORDER,
  URL_GET_UNPROCESSED_ORDER_DETAILS_LIST,
  URL_POST_DEFAULT_ADDRESS,
  URL_GET_DEFAULT_SHIPMENT_ADDRESS,
  URL_NEED_MORE_INFO,
  URL_CANCEL_ORDER,
  URL_CREATE_ORDER_V2,
} from 'redux/Endpoints/apiEndpoints'
import {LeadsPatientData} from '../LeadsProfile/LeadsProfileDetails.slice'
import {
  IOrder,
  IOrderPatientDetails,
  IOrderPostData,
  IRowUnprocessedOrdersDetails,
  PaginationOrders,
  RowOrderDetails,
} from 'screens/Orders/orders.types'
import orderFilterConstants from '@constants/orderFilter.constants'
import {optionType} from 'types/optionType'
import ordersPageFilterBarConstants from '@constants/ordersPageFilterBar.constants'
import rolesConstants from '@constants/roles.constants'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import orderStatusConstants from '@constants/orderStatus.constants'
import {getSalutations, safeParseInt} from 'utils/ConstFunctions'
import {getStorageType} from 'utils/storage'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'

export const getSelectedPatientDetails = createAsyncThunk(
  'api/getSelectedPatientDetails',
  async (
    getSelectedPatientDetails: {
      doctor_id: number
      patient_id: number
    },
    {rejectWithValue}
  ) => {
    const {patient_id, doctor_id} = getSelectedPatientDetails
    try {
      const response = await apiHelper(
        URL_GET_LEADS_PROFILE_DETAILS + `?doctorId=${doctor_id}&patientId=${patient_id}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.orders?.loadingPatientDetails) {
        return false
      }
      if (state.orders?.patientDetails?.patient_details?.id === arg.patient_id) {
        return false
      }
    },
  }
)
export const getOrderDetails = createAsyncThunk(
  'api/getOrderDetails',
  async (
    getOrderDetails: {
      doctor_id: number
      order_id: string
      retrieve_treatment_plan?: boolean
      updateLoadingState?: boolean
    },
    {rejectWithValue}
  ) => {
    try {
      const {updateLoadingState, ...rest} = getOrderDetails
      const response = await apiHelper(URL_GET_ORDER_DETAILS, HttpMethod.POST, rest)
      return {data: response.data, updateLoadingState}
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.orders?.loadingOrder) {
        return false
      }
    },
  }
)
export const updateOrder = createAsyncThunk(
  'api/updateOrder',
  async (
    payload: {
      due_by?: string
      doctor_id: number
      order_id?: string
      status?: string
      assigned_user_details?: {
        assigned_user_profile_id: number
        assigned_user_name: string
      }
      is_new_order?: boolean
      treatment_plan_id?: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_ORDER_STATUS_UPDATE, HttpMethod.PUT, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const cloneOrder = createAsyncThunk(
  'api/cloneOrder',
  async (
    payload: {
      doctor_id: number
      customer_order_id: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_CLONE_ORDER, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const cloneOrderV2 = createAsyncThunk(
  'api/cloneOrderV2',
  async (
    payload: {
      customer_order_id: string
      doctor_id: number
      profile_id: number
      organization_id: number
      receiver_doctor_id: number
      receiver_organization_id: number
      receiver_profile_id: number
      sender_profile_id: number
      sender_doctor_id: number
      sender_organization_id: number
      order_type: string
      service_products: null | Product
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_CLONE_ORDER_V2, HttpMethod.POST, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const getActiveUsers = createAsyncThunk(
  'api/getActiveUsers',
  async (
    {
      data,
    }: {
      data: {
        doctor_id: number
        invitation_status: 'ACCEPTED' | 'PENDING'
        search: string
        page_number: number
        page_size: number
        sort_order: 'PRACTICE_NAME_ASC' | 'PRACTICE_NAME_DESC'
        invitation_roles: string[]
      }
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_ACTIVE_PRACTICES, HttpMethod.POST, data)
      const activePractices = response.data?.doctor_invitation_details_list
      const getDisplayName = (
        salutation: string | null | undefined,
        firstName: string | null | undefined,
        lastName: string | null | undefined
      ) => {
        const salutationPart = getSalutations((salutation ?? '').toString()).trim()
        return [salutationPart, firstName, lastName]
          .map((value) => (value ?? '').toString().trim())
          .filter(Boolean)
          .join(' ')
      }

      return activePractices
        .sort((a: any, b: any) => (b.admin ? 1 : 0) - (a.admin ? 1 : 0))
        .map((practice: any) => ({
          value: practice.profile_id,
          label: getDisplayName(practice?.salutation, practice?.first_name, practice?.last_name),
          sub_role: practice?.sub_role_name,
        }))
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.orders?.loadingActiveUsers || state.orders?.activeUsers?.length > 0) {
        return false
      }
    },
  }
)

export const zipOrder = createAsyncThunk(
  'api/zipOrder',
  async (
    data: {
      order_id: string
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_ZIP_ORDER, HttpMethod.POST, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export interface IPayloadOrderList {
  doctor_id: number
  search?: string | null | undefined
  patient_id?: number | null
  updateLoadingState?: boolean
  page_number: number
  is_org_admin: boolean
  sort_criteria: {
    type: string
    sort: string
  }
  filter_by_status?: string | null
  filter_by_due_by?: string | null
  filter_by_assigned_user?: string | null
  order_flow: keyof typeof ordersPageFilterBarConstants
}

export interface IPayloadUnprocessedOrderList {
  customer_id: null | string
  search_term: null | string
  due_by_filter: string | null
  sort_option: string | null
  page: number
  roles: string[]
  case_type?: string
}
export const getOrderDetailsList = createAsyncThunk(
  'api/getOrderList',
  async (param: IPayloadOrderList, {rejectWithValue}) => {
    try {
      const {updateLoadingState, ...rest} = param
      const payloadToSend = {...rest, page_size: 10}

      const response = await apiHelper(URL_GET_ORDER_DETAILS_LIST, HttpMethod.POST, payloadToSend)

      return {data: response.data, updateLoadingState}
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getAlignerOrderDetailsList = createAsyncThunk(
  'api/getAlignerOrderDetailsList',
  async (param: IPayloadOrderList, {rejectWithValue}) => {
    try {
      const {updateLoadingState, ...rest} = param
      const payloadToSend = {...rest, page_size: 10}

      const response = await apiHelper(URL_GET_ORDER_DETAILS_LIST, HttpMethod.POST, payloadToSend)

      return {data: response.data, updateLoadingState}
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getUnprocessedOrderDetailsList = createAsyncThunk(
  'api/getUnprocessedOrderDetailsList',
  async (param: IPayloadUnprocessedOrderList, {rejectWithValue}) => {
    try {
      const payloadToSend = {...param, size: 10}

      const response = await apiHelper(
        URL_GET_UNPROCESSED_ORDER_DETAILS_LIST,
        HttpMethod.POST,
        payloadToSend
      )

      return {data: response.data}
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const validatePatient = createAsyncThunk(
  'api/validatePatient',
  async (validatePatient: {doctor_id: number; patient_email_id: string}, {rejectWithValue}) => {
    const {doctor_id, patient_email_id} = validatePatient
    try {
      const response = await apiHelper(URL_VALIDATE_PATIENT, HttpMethod.POST, {
        doctor_id,
        patient_email_id,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const createOrder = createAsyncThunk(
  'api/createOrder',
  async (order: IOrderPostData, {rejectWithValue, getState}) => {
    const state = getState() as any
    const currentStep = state.orders.currentStep
    try {
      const response = await apiHelper(URL_CREATE_ORDER, HttpMethod.POST, {
        current_step: currentStep,
        ...order,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const createOrderV2 = createAsyncThunk(
  'api/createOrderV2',
  async (order: any, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_CREATE_ORDER_V2, HttpMethod.POST, order)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const addTimeLineComment = createAsyncThunk(
  'api/addTimeLineComment',
  async (
    data: {
      order_id: string
      doctor_id: number
      notes: string
    },
    {rejectWithValue}
  ) => {
    try {
      await apiHelper(URL_ADD_ORDER_TIMELINE_COMMENT, HttpMethod.POST, data)
      const updatedComments = await apiHelper(
        `${URL_GET_ORDER_TIMELINE_COMMENTS}?order_id=${data?.order_id}`,
        HttpMethod.GET
      )
      return updatedComments.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getVendorsList = createAsyncThunk(
  'api/getVendorsList',
  async (
    params: {doctor_id: number; isInternalUserToShow?: boolean; withoutOwnDoctor?: boolean},
    {rejectWithValue}
  ) => {
    try {
      const profileId = getStorageType().getItem('profileId')
        ? Number(getStorageType().getItem('profileId'))
        : null
      const payload = {
        doctor_id: params.doctor_id,
        invitation_status: 'ACCEPTED',
        page_number: 0,
        page_size: 0,
        search: null,
        sort_order: 'ADDED_ON_NEWEST_TO_OLDEST',
        invitation_roles: [rolesConstants.VENDOR],
        inviter_owner_roles: [
          rolesConstants.IN_OFFICE_MANUFACTURER,
          rolesConstants.ALIGNER_COMPANY_OR_LAB,
          rolesConstants.ENTERPRISE_COMPANY_LAB,
        ],
        receivers_invitation_roles: [
          rolesConstants.VENDOR,
          rolesConstants.CONSULTING_ORTHODONTIST,
          'ENTERPRISE_CUSTOMER',
          'GROWTH_CUSTOMER',
          'PRACTICE_CUSTOMER',
        ],
      }
      const response = await apiHelper(URL_LIST_PRACTICES, HttpMethod.POST, payload)
      if (params?.withoutOwnDoctor) {
        return response.data?.doctor_invitation_details_list
          .filter(
            (vendor: Invitation) =>
              safeParseInt(vendor.profile_id) !== safeParseInt(profileId) &&
              vendor?.role === 'ENTERPRISE_COMPANY_LAB'
          )
          .map((vendor: Invitation) => ({
            value: vendor.profile_id,
            label: vendor.org_name ?? vendor?.display_name,
            lab_doctor_id: vendor.doctor_id,
            lab_organization_id: vendor.organization_id,
            enabled_items: vendor.enabled_items,
          }))
      } else {
        return response.data?.doctor_invitation_details_list
          .filter((vendor: Invitation) => vendor?.role === 'ENTERPRISE_COMPANY_LAB')
          .map((vendor: Invitation) => ({
            value: vendor.profile_id,
            label: vendor.org_name ?? vendor?.display_name,
            lab_doctor_id: vendor.doctor_id,
            lab_organization_id: vendor.organization_id,
            enabled_items: vendor.enabled_items,
          }))
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.orders?.loadingActiveVendors) {
        return false
      }
    },
  }
)

export const defaultShipmentAddress = createAsyncThunk(
  'api/defaultShipmentAddress',
  async (payload: {shippingId: number; customerProfileId: number}, {rejectWithValue}) => {
    payload
    try {
      const response = await apiHelper(
        URL_POST_DEFAULT_ADDRESS +
          payload?.shippingId +
          `/make-default?customerProfileId=${payload?.customerProfileId}`,
        HttpMethod.PATCH,
        payload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getDefaultShipmentAddress = createAsyncThunk(
  'api/getDefaultShipmentAddress',
  async (payload: {profileId: number; customerId: number | null}, {rejectWithValue}) => {
    payload
    try {
      const response = await apiHelper(
        `${URL_GET_DEFAULT_SHIPMENT_ADDRESS}${payload?.profileId}?customerProfileId=${payload?.customerId ?? null}`,
        HttpMethod.GET,
        payload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const needMoreInfo = createAsyncThunk(
  'api/needMoreInfo',
  async (
    payload: {
      order_id: string
      order_status?: keyof typeof orderStatusConstants
      is_need_more_info_updated: boolean | null
      need_more_info?: {
        remark: string
      } | null
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_NEED_MORE_INFO, HttpMethod.PUT, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const cancelOrder = createAsyncThunk(
  'api/cancelOrder',
  async (
    payload: {
      order_id: string
      order_status: keyof typeof orderStatusConstants
      cancel_order: {
        remark: string
      }
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_CANCEL_ORDER, HttpMethod.PUT, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const initialState = {
  currentStep: 0,
  patientDetails: {} as LeadsPatientData,
  loadingPatientDetails: false,
  order: {} as IOrder,
  loadingOrder: false,
  updatingOrder: false,
  orderList: {
    order_details: [] as RowOrderDetails[],
    pagination_details: {} as PaginationOrders,
  },
  loadingOrderList: false,

  alignerOrderList: {
    order_details: [] as RowOrderDetails[],
    pagination_details: {} as PaginationOrders,
  },
  loadingAlignerOrderList: false,

  orderUnprocessedList: {
    order_details: [] as IRowUnprocessedOrdersDetails[],
    pagination_details: {} as PaginationOrders,
  },
  loadingUnprocessedOrderList: false,

  validatingPatient: false,
  orderPatientDetails: {} as IOrderPatientDetails,
  creatingOrder: false,
  addingComment: false,
  orderFilters: {
    filterByOrderStatus: 'ALL' as keyof typeof orderFilterConstants,
    filterByDueBy: 'ALL',
    filterByAssignedUser: 'ALL',
  },

  orderUnprocessedFilters: {
    selected_customer: null,
    filterDueBy: 'ALL',
  },
  activeUsers: [] as optionType[],
  loadingActiveUsers: false,
  cloningOrder: false,
  activeVendorsList: [] as any[],
  loadingActiveVendors: false,
  isLabSelected: false,
  loadingZipFile: false,
  zipFileDetails: [] as optionType[],
  isShowNeedMoreInfoModal: false,
  isShowCancelOrderModal: false,
}
const OrdersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    nextStep: (state) => {
      state.currentStep += 1
    },
    resetPatientDetails: (state) => {
      state.patientDetails = {} as LeadsPatientData
    },
    prevStep: (state) => {
      if (state.currentStep === 0) return
      state.currentStep -= 1
    },
    updateCurrentStep: (state, action) => {
      state.currentStep = action.payload
    },
    setOrderPatientDetails: (state, action) => {
      state.orderPatientDetails = action.payload
    },
    clearOrder: (state) => {
      state.order = {} as IOrder
    },
    setOrderFilters: (state, action) => {
      state.orderFilters = {...state.orderFilters, ...action.payload}
    },
    setUnprocessedOrderFilters: (state, action) => {
      state.orderUnprocessedFilters = {...state.orderUnprocessedFilters, ...action.payload}
    },
    setIsLabSelected: (state, action) => {
      state.isLabSelected = action.payload
    },
    resetOrderFilters: (state) => {
      state.orderFilters = {
        filterByOrderStatus: 'ALL',
        filterByDueBy: 'ALL',
        filterByAssignedUser: 'ALL',
      }
    },
    resetUnprocessedOrderFilters: (state) => {
      state.orderUnprocessedFilters = {
        selected_customer: null,
        filterDueBy: 'ALL',
      }
    },
    setIsShowNeedMoreInfoModal: (state, action) => {
      state.isShowNeedMoreInfoModal = action.payload
    },
    setIsShowCancelOrderModal: (state, action) => {
      state.isShowCancelOrderModal = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSelectedPatientDetails.pending, (state) => {
        state.loadingPatientDetails = true
      })
      .addCase(getSelectedPatientDetails.fulfilled, (state, action) => {
        state.loadingPatientDetails = false
        state.patientDetails = action.payload
      })
      .addCase(getSelectedPatientDetails.rejected, (state) => {
        state.loadingPatientDetails = false
      })

      .addCase(getOrderDetails.pending, (state, action) => {
        if (action.meta.arg.updateLoadingState !== false) {
          state.loadingOrder = true
        }
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        if (action.payload.updateLoadingState !== false) {
          state.loadingOrder = false
        }
        state.order = action.payload.data
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.loadingOrder = false
      })

      .addCase(getOrderDetailsList.pending, (state, action) => {
        if (action.meta.arg.updateLoadingState !== false) {
          state.loadingOrderList = true
        }
      })
      .addCase(getOrderDetailsList.fulfilled, (state, action) => {
        if (action.payload.updateLoadingState !== false) {
          state.loadingOrderList = false
        }
        state.orderList = action.payload.data
      })
      .addCase(getOrderDetailsList.rejected, (state) => {
        state.loadingOrderList = false
      })

      .addCase(getAlignerOrderDetailsList.pending, (state, action) => {
        if (action.meta.arg.updateLoadingState !== false) {
          state.loadingAlignerOrderList = true
        }
      })
      .addCase(getAlignerOrderDetailsList.fulfilled, (state, action) => {
        if (action.payload.updateLoadingState !== false) {
          state.loadingAlignerOrderList = false
        }
        state.alignerOrderList = action.payload.data
      })
      .addCase(getAlignerOrderDetailsList.rejected, (state) => {
        state.loadingAlignerOrderList = false
      })

      .addCase(getUnprocessedOrderDetailsList.pending, (state) => {
        state.loadingUnprocessedOrderList = true
      })
      .addCase(getUnprocessedOrderDetailsList.fulfilled, (state, action) => {
        state.loadingUnprocessedOrderList = false
        state.orderUnprocessedList = action.payload.data
      })
      .addCase(getUnprocessedOrderDetailsList.rejected, (state) => {
        state.loadingUnprocessedOrderList = false
      })

      .addCase(validatePatient.pending, (state) => {
        state.validatingPatient = true
      })
      .addCase(validatePatient.fulfilled, (state) => {
        state.validatingPatient = false
      })
      .addCase(validatePatient.rejected, (state) => {
        state.validatingPatient = false
      })

      .addCase(createOrder.pending, (state) => {
        state.creatingOrder = true
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.creatingOrder = false
      })
      .addCase(createOrder.rejected, (state) => {
        state.creatingOrder = false
      })
      .addCase(createOrderV2.pending, (state) => {
        state.creatingOrder = true
      })
      .addCase(createOrderV2.fulfilled, (state) => {
        state.creatingOrder = false
      })
      .addCase(createOrderV2.rejected, (state) => {
        state.creatingOrder = false
      })
      .addCase(addTimeLineComment.pending, (state) => {
        state.addingComment = true
      })
      .addCase(addTimeLineComment.fulfilled, (state, action) => {
        state.addingComment = false
        state.order.comment_details = action.payload
      })
      .addCase(addTimeLineComment.rejected, (state) => {
        state.addingComment = false
      })
      .addCase(getActiveUsers.pending, (state) => {
        state.activeUsers = []
        state.loadingActiveUsers = true
      })
      .addCase(getActiveUsers.fulfilled, (state, action) => {
        state.activeUsers = action.payload
        state.loadingActiveUsers = false
      })
      .addCase(getActiveUsers.rejected, (state) => {
        state.loadingActiveUsers = false
        state.activeUsers = []
      })
      .addCase(updateOrder.pending, (state) => {
        state.updatingOrder = true
      })
      .addCase(updateOrder.fulfilled, (state) => {
        state.updatingOrder = false
      })
      .addCase(updateOrder.rejected, (state) => {
        state.updatingOrder = false
      })
      .addCase(cloneOrder.pending, (state) => {
        state.cloningOrder = true
      })
      .addCase(cloneOrder.fulfilled, (state) => {
        state.cloningOrder = false
      })
      .addCase(cloneOrder.rejected, (state) => {
        state.cloningOrder = false
      })
      .addCase(cloneOrderV2.pending, (state) => {
        state.cloningOrder = true
      })
      .addCase(cloneOrderV2.fulfilled, (state) => {
        state.cloningOrder = false
      })
      .addCase(cloneOrderV2.rejected, (state) => {
        state.cloningOrder = false
      })
      .addCase(getVendorsList.pending, (state) => {
        state.loadingActiveVendors = true
      })
      .addCase(getVendorsList.fulfilled, (state, action) => {
        state.activeVendorsList = action.payload
        state.loadingActiveVendors = false
      })
      .addCase(getVendorsList.rejected, (state) => {
        state.loadingActiveVendors = false
        state.activeVendorsList = []
      })
      .addCase(zipOrder.pending, (state) => {
        state.loadingZipFile = true
      })
      .addCase(zipOrder.fulfilled, (state, action) => {
        state.zipFileDetails = action.payload
        state.loadingZipFile = false
      })
      .addCase(zipOrder.rejected, (state) => {
        state.loadingZipFile = false
        state.zipFileDetails = []
      })
  },
})

export const {
  nextStep,
  prevStep,
  updateCurrentStep,
  setOrderPatientDetails,
  clearOrder,
  setOrderFilters,
  resetOrderFilters,
  setIsLabSelected,
  setUnprocessedOrderFilters,
  resetPatientDetails,
  setIsShowCancelOrderModal,
  setIsShowNeedMoreInfoModal,
} = OrdersSlice.actions
export default OrdersSlice.reducer
