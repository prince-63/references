import HttpMethod from '@constants/httpMethods.constants'
import rolesConstants from '@constants/roles.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_ADD_OR_EDIT_PRACTICES, URL_LIST_PRACTICES} from 'redux/Endpoints/apiEndpoints'
import {
  RequestInvitation,
  RequestInvitationList,
  ResponseCustomerList,
} from 'screens/Customers/CustomerList/types/customerList.types'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'

import {optionType} from 'types/optionType'

export const addOrEditCustomers = createAsyncThunk(
  'api/getAddOrEditCustomers',
  async (params: RequestInvitation, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_OR_EDIT_PRACTICES, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)
export const getCustomersList = createAsyncThunk(
  'api/getCustomersList',
  async (params: RequestInvitationList, {rejectWithValue}) => {
    try {
      const role = params.roles.some(
        (role) =>
          role.name === rolesConstants.COMMERCIAL_ALIGNER_LAB || role.name === rolesConstants.VENDOR
      )

      const response = await apiHelper(URL_LIST_PRACTICES, HttpMethod.POST, {
        ...params.payload,

        invitation_roles: role ? [rolesConstants.CUSTOMER] : [rolesConstants.CUSTOMER],
        inviter_owner_roles: role //from whom request is received owner role
          ? [
              rolesConstants.IN_OFFICE_MANUFACTURER,
              rolesConstants.ALIGNER_COMPANY_OR_LAB,
              rolesConstants.ENTERPRISE_COMPANY_LAB,
              'PRACTICE_CUSTOMER',
            ]
          : [rolesConstants.CUSTOMER],
        receivers_invitation_roles: role ? [rolesConstants.VENDOR] : [rolesConstants.CUSTOMER], //from whom request is received owner role
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getActiveCustomersList = createAsyncThunk(
  'api/getActiveCustomersList',
  async (params: RequestInvitationList, {rejectWithValue}) => {
    try {
      const role = params.roles.some(
        (role) =>
          role.name === rolesConstants.COMMERCIAL_ALIGNER_LAB || role.name === rolesConstants.VENDOR
      )
      const response = await apiHelper(URL_LIST_PRACTICES, HttpMethod.POST, {
        ...params.payload,

        invitation_roles: role ? [rolesConstants.CUSTOMER] : [rolesConstants.CUSTOMER],
        inviter_owner_roles: role //from whom request is received owner role
          ? [
              rolesConstants.IN_OFFICE_MANUFACTURER,
              rolesConstants.ALIGNER_COMPANY_OR_LAB,
              rolesConstants.ENTERPRISE_COMPANY_LAB,
            ]
          : [rolesConstants.CUSTOMER],
        receivers_invitation_roles: role ? [rolesConstants.VENDOR] : [rolesConstants.CUSTOMER], //from whom request is received owner role
      })
      const activeCustomers = response.data?.doctor_invitation_details_list
      return activeCustomers
        .filter((practice: any) => !practice.admin)
        .sort((a: any, b: any) => (b.admin ? 1 : 0) - (a.admin ? 1 : 0))
        .map((practice: any) => ({
          value: String(practice.profile_id),
          label: `${
            practice?.salutation === '' ? '' : `${practice?.salutation}.`
          } ${practice?.first_name} ${practice?.last_name}`,
        }))
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.customers?.loadingActiveCustomerList) {
        return false
      }
      const lastFetched = state.customers?.lastFetchedActiveCustomers
      if (lastFetched && Date.now() - lastFetched < 5000) {
        return false
      }
    },
  }
)

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    loadingAddingEditCustomer: false,
    dataAddingEditCustomer: {} as Invitation,
    dataEditCustomer: {} as Invitation,
    openModalAddingEditSuccessCustomer: false,
    openModalInviteCustomer: false,
    activeCustomers: [] as optionType[],
    loadingActiveCustomers: false,
    loadingCustomerList: false,
    dataCustomerList: {
      doctor_invitation_details_list: [],
      pagination: {
        page_number: 1,
        page_size: 10,
        total_patients: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
        active_invitation_count: 0,
        pending_invitation_count: 0,
      },
    } as ResponseCustomerList,

    loadingActiveCustomerList: false,
    dataActiveCustomerList: [] as optionType[],
    lastFetchedActiveCustomers: undefined as number | undefined,
  },
  reducers: {
    setListEmpty: (state, action) => {
      state.dataCustomerList = action.payload
    },
    setDataEditCustomer: (state, action) => {
      state.dataEditCustomer = action.payload
    },
    setDataAddingEditCustomer: (state, action) => {
      state.dataAddingEditCustomer = action.payload
    },
    setOpenModalAddingEditSuccessCustomer: (state, action) => {
      state.openModalAddingEditSuccessCustomer = action.payload
    },
    setOpenModalInviteCustomer: (state, action) => {
      state.openModalInviteCustomer = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addOrEditCustomers.pending, (state) => {
      state.loadingAddingEditCustomer = true
    })
    builder.addCase(addOrEditCustomers.fulfilled, (state, action) => {
      state.loadingAddingEditCustomer = false
      state.dataAddingEditCustomer = action.payload
    })
    builder.addCase(addOrEditCustomers.rejected, (state) => {
      state.loadingAddingEditCustomer = false
    })

    builder.addCase(getCustomersList.pending, (state) => {
      state.loadingCustomerList = true
    })
    builder.addCase(getCustomersList.fulfilled, (state, action) => {
      state.loadingCustomerList = false
      state.dataCustomerList = action.payload
    })
    builder.addCase(getCustomersList.rejected, (state) => {
      state.loadingCustomerList = false
    })

    builder.addCase(getActiveCustomersList.pending, (state) => {
      state.loadingActiveCustomerList = true
    })
    builder.addCase(getActiveCustomersList.fulfilled, (state, action) => {
      state.loadingActiveCustomerList = false
      state.dataActiveCustomerList = action.payload
      state.lastFetchedActiveCustomers = Date.now()
    })
    builder.addCase(getActiveCustomersList.rejected, (state) => {
      state.loadingActiveCustomerList = false
    })
  },
})
export const {
  setDataEditCustomer,
  setDataAddingEditCustomer,
  setOpenModalAddingEditSuccessCustomer,
  setOpenModalInviteCustomer,
  setListEmpty,
} = customersSlice.actions

export default customersSlice.reducer
