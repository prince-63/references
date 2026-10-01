// apiSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  URL_GET_DOCTOR_PROFILE,
  URL_GETTING_STARTED,
  URL_SKIP_GETTING_STARTED_STEP,
} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import rolesConstants from '@constants/roles.constants'
import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import brandNamesConstants from '@constants/brandNames.constants'
import {getStorageType} from 'utils/storage'
export type Permission = 'ADD' | 'EDIT' | 'VIEW' | 'DELETE'

export interface SubModule {
  id: number
  name: string
  description?: string | null
  permissions?: Permission[]
}

export interface Module {
  id: number
  name: string
  description?: string | null
  sub_modules: SubModule[]
}

const emptyDoctorProfile: ApiResponseDoctorProfile = {
  id: 0,
  first_name: '',
  last_name: '',
  middle_name: null,
  address: '',
  city: '',
  email: '',
  mobile: '',
  country_name: '',
  doctor_id: 0,
  active: false,
  visible: false,
  description: '',
  dci_number: null,
  dob: null,
  dental_council_name: null,
  phone_verified: false,
  email_verified: false,
  new_active_patient_count: 0,
  total_patient: 0,
  total_new_patient: 0,
  practice_location: 0,
  doctor_profile: '',
  specialization: null,
  practice_location_name: null,
  is_on_board_screen_visited: false,
  state: '',
  country_code: '',
  uuid: '',
  dr_to_display: false,
  profiles: [],
  subscriptions: [],
  total_customers: 0,
  default_profile: {
    profile_id: 0,
    organization_id: 0,
    doctor_id: 0,
    profile_type: 'OWNER',
    status: 'ACTIVE',
    display_name: '',
    display_picture: '',
    organization_name: '',
    owner_organization_name: null,
    owner_profile_id: null,
    owner_doctor_id: null,
    roles: [
      {
        name: '',
        description: '',
        allowed_features: [
          {
            feature_name: '',
            feature_description: '',
            permission_name: '',
            permission_description: '',
          },
        ],
      },
    ],
    subrole_id: null,
    profile_picture_id: null,
    first_name: '',
    last_name: '',
    org_name: 'SMILEZY',
  },
}
export interface ApiResponseDoctorProfile {
  id: number
  first_name: string
  last_name: string
  middle_name: any
  address: string
  city: string
  email: string
  mobile: string
  country_name: string
  doctor_id: number
  active: boolean
  visible: boolean
  description: string
  dci_number: any
  dob: any
  dental_council_name: any
  phone_verified: boolean
  email_verified: boolean
  new_active_patient_count: number
  total_patient: number
  total_new_patient: number
  practice_location: number
  doctor_profile: string
  specialization: any
  practice_location_name: any
  is_on_board_screen_visited: boolean
  state: string
  country_code: string
  uuid: string
  dr_to_display: boolean
  profiles: IDoctorProfileDetails[]
  subscriptions: ISubscriptionDetails[]
  total_customers: number
  default_profile: Default_Profile
}

interface AllowedFeature {
  feature_name: string
  feature_description: string
  permission_name: string
  permission_description: string
}

interface Role {
  name: string
  description: string
  allowed_features: AllowedFeature[]
}

interface Default_Profile {
  profile_id: number
  organization_id: number
  doctor_id: number
  profile_type: string
  status: string
  display_name: string
  display_picture: string
  organization_name: string
  owner_organization_name: string | null
  owner_profile_id: number | null
  owner_doctor_id: number | null
  roles: Role[]
  subrole_id: number | null
  first_name: string
  last_name: string
  org_name: keyof typeof brandNamesConstants
  profile_picture_id: number | null
}

export interface IProfileRole {
  name: keyof typeof rolesConstants
  description: string
}
export interface IDoctorProfileDetails {
  salutation: string
  first_name: string
  last_name: string
  profile_id: number
  organization_id: number
  owner_profile_id: number
  owner_doctor_id: number
  doctor_id: number
  profile_type: 'OWNER' | 'INVITED'
  status: string
  profile_picture: string | null
  profile_picture_id: number | null
  organization_name: string | null
  owner_organization_name: string | null
  // display_name: string
  roles: IProfileRole[]
  brand_name_added: boolean
  display_name_added: boolean
  subrole_id: number
  is_customer_tracking_enabled?: boolean | null
  org_name: keyof typeof brandNamesConstants
  subrole_name?: string | null
}

export interface doctorPostData {
  doctor_id: number
}

export interface GettingStarted {
  patient_added: boolean
  practice_location_added: boolean
  user_added: boolean
  customer_added: boolean
  brand_details_added: boolean
  company_details_added: boolean
}

export const getApiDataDoctorProfile = createAsyncThunk(
  'api/postDataDoctorProfileGet',
  async (postDataDoctorProfileGet: doctorPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GET_DOCTOR_PROFILE + postDataDoctorProfileGet.doctor_id,
        HttpMethod.GET
      )

      return {...response.data}
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const skipGettingStartedStep = createAsyncThunk(
  'api/skipGettingStartedStep',
  async (
    skipGettingStartedStepParam: {getting_started_enum: string; doctor_id: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_SKIP_GETTING_STARTED_STEP,
        HttpMethod.POST,
        skipGettingStartedStepParam
      )

      return {...response.data}
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getGettingStarted = createAsyncThunk(
  'api/getGettingStarted',
  async (
    data: {
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GETTING_STARTED, HttpMethod.POST, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const DoctorProfileGetSlice = createSlice({
  name: 'apiDoctorProfileGet',
  initialState: {
    doctorData: emptyDoctorProfile as ApiResponseDoctorProfile,
    error: null as string | null,
    loading: false,
    gettingStartedData: {} as GettingStarted,
    gettingStartedLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getApiDataDoctorProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getApiDataDoctorProfile.fulfilled, (state, action) => {
        state.loading = false
        state.doctorData = action.payload
        // Persist doctor profile locally for quick reloads
        try {
          getStorageType().setItem('userDetail', JSON.stringify(action.payload))
        } catch (error) {
          console.error('Failed to persist doctor profile', error)
        }
      })
      .addCase(getApiDataDoctorProfile.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(getGettingStarted.pending, (state) => {
        state.gettingStartedLoading = true
      })
      .addCase(getGettingStarted.fulfilled, (state, action) => {
        state.gettingStartedLoading = false
        state.gettingStartedData = action.payload
      })
      .addCase(getGettingStarted.rejected, (state) => {
        state.gettingStartedLoading = false
      })
  },
})

export default DoctorProfileGetSlice.reducer
