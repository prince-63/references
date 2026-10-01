import HttpMethod from '@constants/httpMethods.constants'
import rolesConstants from '@constants/roles.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ACCEPT_INVITE,
  URL_ADD_OR_EDIT_PRACTICES,
  URL_LIST_PRACTICES,
  URL_REJECT_INVITE,
} from 'redux/Endpoints/apiEndpoints'
import {
  Invitation,
  RequestAcceptInvitation,
  RequestInvitation,
  RequestInvitationList,
  ResponseLabList,
} from 'screens/Labs/LabList/types/labs.types'
import {optionType} from 'types/optionType'

export const addOrEditLabs = createAsyncThunk(
  'api/getAddOrEditLabs',
  async (params: RequestInvitation, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_OR_EDIT_PRACTICES, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const acceptRequest = createAsyncThunk(
  'api/acceptRequest',
  async (params: RequestAcceptInvitation, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ACCEPT_INVITE, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const rejectRequest = createAsyncThunk(
  'api/rejectRequest',
  async (params: {invitation_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_REJECT_INVITE, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getLabsList = createAsyncThunk(
  'api/getLabsList',
  async (params: RequestInvitationList, {rejectWithValue}) => {
    try {
      const isCustomer = params.roles.some((role) => role.name === rolesConstants.CUSTOMER)
      const isPractice = params.isPractice
      const response = await apiHelper(URL_LIST_PRACTICES, HttpMethod.POST, {
        ...params.payload,
        invitation_roles: isCustomer ? [] : [rolesConstants.VENDOR],
        inviter_owner_roles: [
          rolesConstants.IN_OFFICE_MANUFACTURER,
          rolesConstants.ALIGNER_COMPANY_OR_LAB,
          rolesConstants.ENTERPRISE_COMPANY_LAB,
        ],
        receivers_invitation_roles: isPractice
          ? [
              rolesConstants.VENDOR,
              rolesConstants.CONSULTING_ORTHODONTIST,
              'ENTERPRISE_CUSTOMER',
              'GROWTH_CUSTOMER',
              'PRACTICE_CUSTOMER',
            ]
          : [rolesConstants.VENDOR, 'ENTERPRISE_CUSTOMER', 'GROWTH_CUSTOMER'],
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

const labsSlice = createSlice({
  name: 'labs',
  initialState: {
    loadingAddingEditLab: false,
    dataAddingEditLab: {} as Invitation,
    dataEditLab: {} as Invitation,
    openModalAddingEditSuccessLab: false,
    openModalInviteLab: false,
    activeLabs: [] as optionType[],
    loadingActiveLabs: false,
    loadingLabList: false,
    dataLabList: {
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
    } as ResponseLabList,
    openAcceptModal: false,
    openRejectModal: false,
    selectedLab: {} as Invitation,
    openOverOrderLimit: false,
    invitationCounts: {
      active: 0,
      pending: 0,
    },
  },
  reducers: {
    setLabListEmpty: (state, action) => {
      state.dataLabList = action.payload
    },
    setDataEditLab: (state, action) => {
      state.dataEditLab = action.payload
    },
    setDataAddingEditLab: (state, action) => {
      state.dataAddingEditLab = action.payload
    },
    setOpenModalAddingEditSuccessLab: (state, action) => {
      state.openModalAddingEditSuccessLab = action.payload
    },
    setOpenModalInviteLab: (state, action) => {
      state.openModalInviteLab = action.payload
    },

    setOpenAcceptModal: (state, action) => {
      state.openAcceptModal = action.payload
    },
    setOpenRejectModal: (state, action) => {
      state.openRejectModal = action.payload
    },
    setSelectedLab: (state, action) => {
      state.selectedLab = action.payload
    },
    setOpenOverOrderLimit: (state, action) => {
      state.openOverOrderLimit = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addOrEditLabs.pending, (state) => {
      state.loadingAddingEditLab = true
    })
    builder.addCase(addOrEditLabs.fulfilled, (state, action) => {
      state.loadingAddingEditLab = false
      state.dataAddingEditLab = action.payload
    })
    builder.addCase(addOrEditLabs.rejected, (state) => {
      state.loadingAddingEditLab = false
    })

    builder.addCase(getLabsList.pending, (state) => {
      state.loadingLabList = true
    })
    builder.addCase(getLabsList.fulfilled, (state, action) => {
      state.loadingLabList = false
      state.dataLabList = action.payload
      const requestedStatus = action.meta?.arg?.payload?.invitation_status
      const activeCount = action.payload?.pagination?.active_invitation_count
      const pendingCount = action.payload?.pagination?.pending_invitation_count

      if (requestedStatus === 'PENDING') {
        state.invitationCounts = {
          active: state.invitationCounts.active,
          pending: pendingCount ?? state.invitationCounts.pending,
        }
      } else if (requestedStatus === 'ACCEPTED') {
        state.invitationCounts = {
          active: activeCount ?? state.invitationCounts.active,
          pending: pendingCount ?? state.invitationCounts.pending,
        }
      } else {
        state.invitationCounts = {
          active: activeCount ?? state.invitationCounts.active,
          pending: pendingCount ?? state.invitationCounts.pending,
        }
      }
    })
    builder.addCase(getLabsList.rejected, (state) => {
      state.loadingLabList = false
    })
  },
})
export const {
  setDataEditLab,
  setDataAddingEditLab,
  setOpenModalAddingEditSuccessLab,
  setOpenModalInviteLab,
  setOpenAcceptModal,
  setOpenRejectModal,
  setSelectedLab,
  setOpenOverOrderLimit,
  setLabListEmpty,
} = labsSlice.actions

export default labsSlice.reducer
