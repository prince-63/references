import HttpMethod from '@constants/httpMethods.constants'
import subscriptionsConstants from '@constants/subscriptions.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ADD_OR_EDIT_PRACTICES,
  URL_DATA_MIGRATION_API,
  URL_DATA_MIGRATION_COUNTS,
  URL_DEACTIVATE_USER_LINK,
  URL_DELETE_ACCOUNT,
  URL_GET_ACCOUNT_DETAILS,
  URL_GET_BILLING_DETAILS,
  URL_GET_PROFILE_DETAILS,
  URL_LIST_PRACTICES,
  URL_MARK_PROFILE_AS_DEFAULT,
  URL_POST_ACCOUNT_DETAILS,
  URL_POST_BILLING_DETAILS,
  URL_UPGRADE_RENEWAL_SUBSCRIPTION,
} from 'redux/Endpoints/apiEndpoints'
import {
  RequestInvitation,
  ResponseCustomerList,
} from 'screens/Customers/CustomerList/types/customerList.types'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import {IAccountDetails, IBillingDetails, IProfileDetails} from 'screens/settings/settings.types'
import {MigrationJobStatus} from 'screens/settings/Storage/Storage'
export const getAccountData = createAsyncThunk(
  'api/getAccountData',
  async (
    params: {doctorId: number; organizationId: number; profileId: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_GET_ACCOUNT_DETAILS + `${params.profileId}/${params.organizationId}/${params.doctorId}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const getBillingData = createAsyncThunk(
  'api/getBillingData',
  async (
    params: {doctorId: number; organizationId: number; profileId: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_GET_BILLING_DETAILS + `${params.profileId}/${params.organizationId}/${params.doctorId}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const getProfileManagementData = createAsyncThunk(
  'api/getProfileManagementData',
  async (params: {doctorId: number; organizationId: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GET_PROFILE_DETAILS + `${params.doctorId}/${params.organizationId}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const updateAccountData = createAsyncThunk(
  'api/updateAccountData',
  async (
    params: {
      data: {
        details: Partial<IAccountDetails> & {
          doctor_id: number
          file_action_profile: string
          file_action_display: string
        }
      } & {
        profile_picture: File | null
        display_picture: File | null
      }
    },
    {rejectWithValue}
  ) => {
    try {
      const formData = new FormData()
      if (params.data.profile_picture) {
        formData.append('profileImage', params.data.profile_picture)
      }

      formData.append('details', JSON.stringify(params.data.details))

      const response = await apiHelper(URL_POST_ACCOUNT_DETAILS, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const updateBillingData = createAsyncThunk(
  'api/updateBillingData',
  async (
    params: {
      data: {details: IBillingDetails & {doctor_id: number; file_action: string}} & {
        image: File | null
        company_brand_name_profile: File | null
      }
    },
    {rejectWithValue}
  ) => {
    try {
      const formData = new FormData()
      if (params.data.image) {
        formData.append('image', params.data.image)
      }
      if (params.data.company_brand_name_profile) {
        formData.append('company_image_profile', params.data.company_brand_name_profile)
      }
      formData.append('details', JSON.stringify(params.data.details))
      const response = await apiHelper(URL_POST_BILLING_DETAILS, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export const markProfileAsDefault = createAsyncThunk(
  'api/markProfileAsDefault',
  async (
    params: {
      data: {profile_id: number; doctor_id: number; organization_id: number}
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_MARK_PROFILE_AS_DEFAULT,
        HttpMethod.POST,
        params.data,
        false
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const requestAccountDelete = createAsyncThunk(
  'api/requestAccountDelete',
  async (
    params: {
      data: {profile_id: number}
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_DELETE_ACCOUNT, HttpMethod.POST, params.data, false)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)
export interface IRequestUpgradeRenewalRequest {
  doctor_id: number
  user_name: string
  user_email: string
  country_code: string
  mobile: string
  current_plan_name: keyof typeof subscriptionsConstants
  current_plan_start_date: string
  current_plan_end_date: string
  request_type: string
  new_plan_name: string | null
  notes: string | null
}

export interface RequestInvitationList {
  doctor_id: string
  page_number: number
  page_size: number
  invitation_roles: string[]
  sort_order: string
  invitation_status: string
}

export const upgradeRenewalRequest = createAsyncThunk(
  'api/upgradeRenewalRequest',
  async (params: IRequestUpgradeRenewalRequest, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_UPGRADE_RENEWAL_SUBSCRIPTION, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const addOrEditUsers = createAsyncThunk(
  'api/getAddOrEditUsers',
  async (params: RequestInvitation, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_OR_EDIT_PRACTICES, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const deactivateUserLink = createAsyncThunk(
  'api/deactivateUserLink',
  async (params: {invitation_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_DEACTIVATE_USER_LINK, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getUsersList = createAsyncThunk(
  'api/getUsersList',
  async (params: RequestInvitationList, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_LIST_PRACTICES, HttpMethod.POST, params)
      const adminUser = response.data.doctor_invitation_details_list.filter(
        (User: Invitation) => User.admin
      )
      const otherUser = response.data.doctor_invitation_details_list.filter(
        (User: Invitation) => !User.admin
      )
      const sortedUserList = [...adminUser, ...otherUser]
      const UserList: ResponseCustomerList = {
        doctor_invitation_details_list: sortedUserList,
        pagination: response.data.pagination,
      }
      return UserList
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const startDataMigrationProgress = createAsyncThunk(
  'api/startDataMigrationProgress',
  async (params: {profile_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_DATA_MIGRATION_API + params.profile_id,
        HttpMethod.POST,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

export const getMigrationFilesCount = createAsyncThunk(
  'api/getMigrationFilesCount',
  async (params: {profileId?: string | null}, {rejectWithValue}) => {
    try {
      const profileId = params.profileId ?? params.profileId ?? null
      const response = await apiHelper(
        URL_DATA_MIGRATION_COUNTS + profileId,
        HttpMethod.POST,
        params
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    loadingAccountData: false,
    loadingBillingData: false,
    loadingProfileManagementData: false,
    loadingRequestAccountDeleteData: false,
    account: {} as IAccountDetails,
    billing: {} as IBillingDetails,
    profiles: [] as IProfileDetails[],
    loadingUpdateBillingData: false,

    loadingAddingEditUser: false,
    dataAddingEditUser: {} as Invitation,
    dataEditUser: {} as Invitation,
    loadingUserList: false,
    dataUserList: {
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
    loadingGetCounts: false,
    dataMigrationCountsData: {} as MigrationJobStatus,
  },
  reducers: {
    setDataEditUser: (state, action) => {
      state.dataEditUser = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAccountData.pending, (state) => {
      state.loadingAccountData = true
    })
    builder.addCase(getAccountData.fulfilled, (state, action) => {
      state.loadingAccountData = false
      state.account = action.payload
    })
    builder.addCase(getAccountData.rejected, (state) => {
      state.loadingAccountData = false
    })
    builder.addCase(getBillingData.pending, (state) => {
      state.loadingBillingData = true
    })
    builder.addCase(updateBillingData.pending, (state) => {
      state.loadingUpdateBillingData = true
    })
    builder.addCase(updateBillingData.rejected, (state) => {
      state.loadingUpdateBillingData = false
    })
    builder.addCase(updateBillingData.fulfilled, (state) => {
      state.loadingUpdateBillingData = false
    })
    builder.addCase(getBillingData.fulfilled, (state, action) => {
      state.loadingBillingData = false
      state.billing = action.payload
    })
    builder.addCase(getBillingData.rejected, (state) => {
      state.loadingBillingData = false
    })
    builder.addCase(getProfileManagementData.pending, (state) => {
      state.loadingProfileManagementData = true
    })
    builder.addCase(getProfileManagementData.fulfilled, (state, action) => {
      state.loadingProfileManagementData = false
      state.profiles = action.payload
    })
    builder.addCase(getProfileManagementData.rejected, (state) => {
      state.loadingProfileManagementData = false
    })

    builder.addCase(getUsersList.pending, (state) => {
      state.loadingUserList = true
    })
    builder.addCase(getUsersList.fulfilled, (state, action) => {
      state.loadingUserList = false
      state.dataUserList = action.payload
    })
    builder.addCase(getUsersList.rejected, (state) => {
      state.loadingUserList = false
    })
    builder.addCase(requestAccountDelete.pending, (state) => {
      state.loadingRequestAccountDeleteData = true
    })
    builder.addCase(requestAccountDelete.fulfilled, (state, action) => {
      state.loadingRequestAccountDeleteData = false
      state.profiles = action.payload
    })
    builder.addCase(requestAccountDelete.rejected, (state) => {
      state.loadingRequestAccountDeleteData = false
    })

    builder.addCase(getMigrationFilesCount.pending, (state) => {
      state.loadingGetCounts = true
    })
    builder.addCase(getMigrationFilesCount.fulfilled, (state, action) => {
      state.loadingGetCounts = false
      state.dataMigrationCountsData = action.payload
    })
    builder.addCase(getMigrationFilesCount.rejected, (state) => {
      state.loadingGetCounts = false
    })
  },
})
export const {setDataEditUser} = settingsSlice.actions
export default settingsSlice.reducer
