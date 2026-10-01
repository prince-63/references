import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ACCESS_CONTROL_USER_LIST,
  URL_ADD_CUSTOM_ROLE,
  URL_ALIGNER_PATIENT_ANALYTICS_COUNT,
  URL_AUDIT_LOGS,
  URL_EDIT_CUSTOM_ROLE,
  URL_GET_KANBAN_TASK_LIST,
  URL_GET_PERMISSION_DETAILS,
  URL_INVITATION_COUNTS_BY_ROLES,
  URL_INVITE_USERS,
  URL_ROLES_OPTION_LIST,
} from 'redux/Endpoints/apiEndpoints'
import {
  Module,
  optionTypeAccessControl,
  PermissionSubModule,
  RequestAddCustomerRole,
  RequestAddUser,
  RequestAuditLogList,
  RequestEditCustomerRole,
  RequestList,
  RowDataUserList,
  Sub_Role_Data,
} from 'screens/AccessControl/AccessControlList/types/accessControlList.types'
import {optionType} from 'types/optionType'
import {getRole} from 'utils/ConstFunctions'
import {getStorageType} from 'utils/storage'
import type {RootState} from 'redux/store'

const VSP_PLANNING_VISIBLE_ROLE_NAMES = new Set(['SUPER_ADMIN', 'ADMIN'])

const getFilteredRolesForPermissionView = (
  roles: Sub_Role_Data[],
  isVspPlanningEnabled: boolean
) => {
  if (isVspPlanningEnabled) {
    return roles.filter(({name}) => VSP_PLANNING_VISIBLE_ROLE_NAMES.has(name))
  }

  return roles
}

export const addEditAccessControlUser = createAsyncThunk(
  'api/addEditAccessControlUser',
  async (params: RequestAddUser, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_INVITE_USERS, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

// Async Thunks
export const getAccessControlUserList = createAsyncThunk(
  'api/getAccessControlUserList',
  async (params: RequestList, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ACCESS_CONTROL_USER_LIST, HttpMethod.POST, {
        ...params,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.accessControl?.loadingList) {
        return false
      }
    },
  }
)

export const getAuditLogsList = createAsyncThunk(
  'api/getAuditLogsList',
  async (params: RequestAuditLogList, {rejectWithValue}) => {
    try {
      const profileId = getStorageType().getItem('profileId')
        ? Number(getStorageType().getItem('profileId'))
        : null
      const response = await apiHelper(
        URL_AUDIT_LOGS + `?page=${params?.page_number}&size=10&assignedByProfileId=${profileId}`,
        HttpMethod.GET,
        {
          ...params,
          page_size: 10,
        }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getRolesOptionList = createAsyncThunk(
  'api/getRolesOptionList',
  async (
    params: {
      plan_id: number
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_ROLES_OPTION_LIST, HttpMethod.POST, params)

      const data: Sub_Role_Data[] = response.data.sub_roles

      // dropdown list (for UI)
      const list = data
        .filter(({name}) => name !== 'SUPER_ADMIN' && name !== 'Customer (With Tracking)')
        .map(({id, name, description}) => ({
          value: id,
          label: getRole(name),
          subLabel: description,
        }))

      return {list, subRoles: data} // ✅ return both
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getInvitationCountsByRoles = createAsyncThunk(
  'api/getInvitationCountsByRoles',
  async (
    params: {
      doctor_id: number
      organization_id: number
      profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_INVITATION_COUNTS_BY_ROLES, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getRolesList = createAsyncThunk(
  'api/getRolesList',
  async (
    params: {
      plan_id: number
      doctor_id: number
    },
    {rejectWithValue, getState}
  ) => {
    try {
      const response = await apiHelper(URL_ROLES_OPTION_LIST, HttpMethod.POST, params)
      const data: Sub_Role_Data[] = response.data.sub_roles
      const state = getState() as RootState
      const isVspPlanningEnabled = state.serviceConfiguration.serviceConfig?.VSP_PLANNING ?? false
      const filteredRoles = getFilteredRolesForPermissionView(data, isVspPlanningEnabled)
      const defaultList: optionType[] = []
      const customRoleList: optionType[] = []

      filteredRoles.forEach(({id, name, sub_role_tag}) => {
        const roleOption: optionType = {
          value: id,
          label: name,
        }

        if (sub_role_tag === 'DEFAULT') {
          defaultList.push(roleOption)
        } else if (sub_role_tag === 'CUSTOM') {
          customRoleList.push(roleOption)
        }
      })

      return {defaultList, customRoleList}
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const getAlignerAnalyticsCountsData = createAsyncThunk(
  'api/getAlignerAnalyticsCountsData',
  async (params: {doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ALIGNER_PATIENT_ANALYTICS_COUNT, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)

export const addCustomRole = createAsyncThunk(
  'api/addCustomRole',
  async (params: RequestAddCustomerRole, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_CUSTOM_ROLE, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const editCustomRole = createAsyncThunk(
  'api/editCustomRole',
  async (params: RequestEditCustomerRole, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_EDIT_CUSTOM_ROLE, HttpMethod.PUT, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getRolePermissionDetails = createAsyncThunk(
  'api/getRolePermissionDetails',
  async (id: number, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_GET_PERMISSION_DETAILS + id, HttpMethod.GET)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getUsersPermissions = createAsyncThunk(
  'api/getUsersPermissions',
  async (id: number, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_GET_PERMISSION_DETAILS + id, HttpMethod.GET)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const updateAssignee = createAsyncThunk(
  'api/updateAssignee',
  async (params: RequestList, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_GET_KANBAN_TASK_LIST, HttpMethod.PUT, {
        ...params,
        page_size: 10,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error_code)
    }
  }
)
export interface ResponseList {
  users: []
  pagination_details: {
    page_number: number
    page_size: number
    total_patients: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface ResponseAuditLogList {
  audit_logs: []
  pagination: {
    has_next: boolean
    has_previous: boolean
    page_number: number
    page_size: number
    total_pages: number
    total_patients: number
  }
}

export interface InvitationCountsByRoles {
  sent_invitations: Array<{
    direction: string
    sender_role: string
    receiver_role: string
    active_count: number
    pending_count: number
    total_count: number
  }>
  received_invitations: Array<{
    direction: string
    sender_role: string
    receiver_role: string
    active_count: number
    pending_count: number
    total_count: number
  }>
  all_invitations: Array<{
    direction: string
    sender_role: string
    receiver_role: string
    active_count: number
    pending_count: number
    total_count: number
  }>
  total_active_sent: number
  total_pending_sent: number
  total_active_received: number
  total_pending_received: number
  total_active: number
  total_pending: number
}

// Initial State
const initialState = {
  loadingList: false,
  userList: {} as ResponseList,

  loadingAuditLogList: false,
  auditLogList: {} as ResponseAuditLogList,

  loadingRoles: false,
  rolesOptionList: [] as optionTypeAccessControl[],

  loadingRolesList: false,
  rolesList: {} as {defaultList: optionType[]; customRoleList: optionType[]},

  selectedRole: 0,
  selectedStatus: 'ALL',

  loadingAddCustomRole: false,

  dataAddingEditUser: {} as RowDataUserList,
  openSuccessUserAdded: false,

  permissionModule: {
    id: 0,
    name: '',
    description: '',
    sub_role_tag: 'CUSTOM',
    modules: [] as Module[],
    cloned_from_sub_role: null,
  } as Sub_Role_Data,
  loadingPermissionModule: false,

  usersPermissions: {
    id: 0,
    name: '',
    description: '',
    sub_role_tag: 'CUSTOM',
    modules: [] as Module[],
    cloned_from_sub_role: null,
  } as Sub_Role_Data,
  loadingUsersPermissions: false,

  selectedAccessControlRole: null,
  selectedTableAccessControls: [] as PermissionSubModule[],
  selectedSubRoleId: null as null | number,
  editTableAccessControls: [] as PermissionSubModule[],
  editModuleData: null as Sub_Role_Data | null,
  planId: null as null | number,
  invitationCountsByRoles: null as InvitationCountsByRoles | null,
  loadingInvitationCountsByRoles: false,
}

// Slice
const AccessControlSlice = createSlice({
  name: 'AccessControlSlice',
  initialState,
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload
    },
    setAllResetFilter(state, action) {
      state.selectedRole = action.payload
      state.selectedStatus = action.payload
    },
    setOpenSuccessUserAdded: (state, action) => {
      state.openSuccessUserAdded = action.payload
    },
    setDataAddingEditUser: (state, action) => {
      state.dataAddingEditUser = action.payload
    },
    setSelectedAccessControlRole: (state, action) => {
      state.selectedAccessControlRole = action.payload
    },

    setSelectedTableAccessControls: (state, action) => {
      state.selectedTableAccessControls = action.payload
    },
    setEditTableAccessControls: (state, action) => {
      state.editTableAccessControls = action.payload
    },
    setEditModuleData: (state, action) => {
      state.editModuleData = action.payload
    },
    setPlanId: (state, action) => {
      state.planId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(getAccessControlUserList.pending, (state) => {
        state.loadingList = true
      })
      .addCase(getAccessControlUserList.fulfilled, (state, action) => {
        state.userList = action.payload
        state.loadingList = false
      })
      .addCase(getAccessControlUserList.rejected, (state) => {
        state.loadingList = false
      })

      .addCase(getAuditLogsList.fulfilled, (state, action) => {
        state.auditLogList = action.payload
        state.loadingAuditLogList = false
      })
      .addCase(getAuditLogsList.rejected, (state) => {
        state.loadingAuditLogList = false
      })

      // All Patients List
      .addCase(getRolesOptionList.fulfilled, (state, action) => {
        const {list, subRoles} = action.payload
        state.rolesOptionList = list
        const firstRole = subRoles.find((role) => role.name === 'SUPER_ADMIN')
        state.selectedSubRoleId = firstRole?.id ?? null
        state.loadingRoles = false
      })
      .addCase(getRolesOptionList.rejected, (state) => {
        state.loadingRoles = false
      })

      .addCase(getRolesList.fulfilled, (state, action) => {
        state.rolesList = action.payload
        state.loadingRolesList = false
      })
      .addCase(getRolesList.rejected, (state) => {
        state.loadingRolesList = false
      })
      .addCase(getRolesList.pending, (state) => {
        state.loadingRolesList = true
      })
      .addCase(getRolePermissionDetails.fulfilled, (state, action) => {
        state.permissionModule = action.payload
        state.loadingPermissionModule = false
      })
      .addCase(getRolePermissionDetails.pending, (state) => {
        state.loadingPermissionModule = true
      })
      .addCase(getRolePermissionDetails.rejected, (state) => {
        state.loadingPermissionModule = false
      })

      .addCase(getUsersPermissions.fulfilled, (state, action) => {
        state.usersPermissions = action.payload
        state.loadingUsersPermissions = false
      })
      .addCase(getUsersPermissions.pending, (state) => {
        state.loadingUsersPermissions = true
      })
      .addCase(getUsersPermissions.rejected, (state) => {
        state.loadingUsersPermissions = false
      })

      .addCase(addCustomRole.fulfilled, (state) => {
        state.loadingAddCustomRole = false
      })
      .addCase(addCustomRole.pending, (state) => {
        state.loadingAddCustomRole = true
      })
      .addCase(addCustomRole.rejected, (state) => {
        state.loadingAddCustomRole = false
      })

      .addCase(editCustomRole.fulfilled, (state) => {
        state.loadingAddCustomRole = false
      })
      .addCase(editCustomRole.pending, (state) => {
        state.loadingAddCustomRole = true
      })
      .addCase(editCustomRole.rejected, (state) => {
        state.loadingAddCustomRole = false
      })

      .addCase(updateAssignee.fulfilled, (state) => {
        state.loadingAddCustomRole = false
      })
      .addCase(updateAssignee.pending, (state) => {
        state.loadingAddCustomRole = true
      })
      .addCase(updateAssignee.rejected, (state) => {
        state.loadingAddCustomRole = false
      })

      .addCase(getInvitationCountsByRoles.pending, (state) => {
        state.loadingInvitationCountsByRoles = true
      })
      .addCase(getInvitationCountsByRoles.fulfilled, (state, action) => {
        state.loadingInvitationCountsByRoles = false
        state.invitationCountsByRoles = action.payload
      })
      .addCase(getInvitationCountsByRoles.rejected, (state) => {
        state.loadingInvitationCountsByRoles = false
      })
  },
})

// Exports
export const {
  setSelectedRole,
  setSelectedStatus,
  setAllResetFilter,
  setOpenSuccessUserAdded,
  setDataAddingEditUser,
  setSelectedAccessControlRole,
  setSelectedTableAccessControls,
  setEditTableAccessControls,
  setEditModuleData,
  setPlanId,
} = AccessControlSlice.actions

export default AccessControlSlice
