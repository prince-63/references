import HttpMethod from '@constants/httpMethods.constants'
import {PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import {
  URL_GET_SUBSCRIPTION,
  URL_REQUEST_EXTENSION,
  URL_UPDATE_SUBSCRIPTION_FLAGS,
  URL_UPGRADE_PLAN,
} from 'redux/Endpoints/apiEndpoints'
import {getStorageType} from 'utils/storage'

export const updateSubscriptionFlags = createAsyncThunk(
  'api/updateSubscriptionFlags',
  async (
    updateSubscriptionFlagsPayload: {
      doctor_id: number
      patient_upgraded?: boolean
      storage_update?: boolean
      dashboard_card_viewed?: boolean
      trial_plan_started?: boolean
      trial_about_to_expire?: boolean
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_UPDATE_SUBSCRIPTION_FLAGS}`,
        HttpMethod.POST,
        updateSubscriptionFlagsPayload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const requestForExtension = createAsyncThunk(
  'api/requestForExtension',
  async (requestForExtensionPayload: ISubscriptionDetails, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_REQUEST_EXTENSION}`,
        HttpMethod.POST,
        requestForExtensionPayload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getSubscriptionDetails = createAsyncThunk(
  'api/getSubscriptionDetails',
  async (
    getSubscriptionDetailsParams: {
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const profileId = getStorageType().getItem('profileId')
        ? Number(getStorageType().getItem('profileId'))
        : null
      const response = await apiHelper(
        `${URL_GET_SUBSCRIPTION}${getSubscriptionDetailsParams.doctor_id}/${profileId}`,
        HttpMethod.GET,
        getSubscriptionDetailsParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.subscription?.loadingDataSubscriptionData) {
        return false
      }
      // Prevent sequential duplicate calls within 5 seconds
      const lastFetched = state.subscription?.lastFetchedAt
      if (lastFetched && Date.now() - lastFetched < 5000) {
        return false
      }
    },
  }
)

export const planUpgrade = createAsyncThunk(
  'api/planUpgrade',
  async (
    getSubscriptionUpgradeParams: {
      user_profile_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const profileId = getStorageType().getItem('profileId')
        ? Number(getStorageType().getItem('profileId'))
        : null
      const response = await apiHelper(`${URL_UPGRADE_PLAN}${profileId}`, HttpMethod.GET, null)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const Subscription = createSlice({
  name: 'subscription',
  initialState: {
    loadingSubscriptionData: false,
    requestingForExtension: false,
    planUpgradeData: false,
    subscriptionData: {} as ISubscriptionDetails,
    loadingDataSubscriptionData: false,
    lastFetchedAt: null as number | null,
  },
  reducers: {
    setRequestDeletionFlag: (state, action: PayloadAction<boolean>) => {
      state.subscriptionData = {
        ...state.subscriptionData,
        plan_metadata: {
          ...(state.subscriptionData?.plan_metadata ?? {}),
          request_deletion: action.payload,
        },
      } as ISubscriptionDetails
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestForExtension.pending, (state) => {
        state.requestingForExtension = true
      })

      .addCase(requestForExtension.fulfilled, (state) => {
        state.requestingForExtension = false
      })

      .addCase(getSubscriptionDetails.pending, (state) => {
        state.loadingDataSubscriptionData = true
      })

      .addCase(getSubscriptionDetails.fulfilled, (state, action) => {
        state.loadingDataSubscriptionData = false
        state.subscriptionData = action.payload
        state.lastFetchedAt = Date.now()
      })
      .addCase(planUpgrade.pending, (state) => {
        state.planUpgradeData = true
      })

      .addCase(planUpgrade.fulfilled, (state) => {
        state.planUpgradeData = false
      })
  },
})

export const {setRequestDeletionFlag} = Subscription.actions

export default Subscription.reducer
