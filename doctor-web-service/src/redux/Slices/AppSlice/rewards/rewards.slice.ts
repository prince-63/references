import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import apiHelper, {getOrgName, getToken} from '@utils/apiHelper'
import {getStorageType} from 'utils/storage'
import HttpMethod from '@constants/httpMethods.constants'
import {
  DailyReward,
  Milestone,
  RewardProduct,
  Promotion,
  RewardsConfigurationState,
  UpdateDailyRewardPayload,
  CreateProductPayload,
  UpdateProductPayload,
} from 'screens/settings/rewardsConfiguration/rewards.types'
import {
  URL_REWARDS_DAILY,
  URL_REWARDS_DAILY_UPDATE,
  URL_REWARDS_PRODUCTS,
  URL_REWARDS_PROMOTIONS,
  URL_REWARDS_PROMOTIONS_CREATE,
  URL_REWARDS_PROMOTIONS_GET_ALL,
  URL_REWARDS_TASK_TOGGLE,
  URL_REWARDS_DASHBOARD,
  URL_REWARDS_PATIENT_WALLET_ALL,
  URL_REWARDS_ORDERS_ALL,
  URL_REWARDS_ORDERS_APPROVE,
  URL_REWARDS_ORDERS_REJECT,
  URL_REWARDS_PROMOTIONS_CLAIMS,
  URL_REWARDS_PROMOTIONS_VERIFY,
} from 'redux/Endpoints/apiEndpoints'

// Initial State
const initialState: RewardsConfigurationState = {
  dailyRewards: [],
  milestones: [],
  products: [],
  promotions: [],
  stats: null,
  patientWallets: [],
  walletPagination: null,
  rewardOrders: [],
  orderPagination: null,
  loading: false,
  promotionClaims: [],
  promotionClaimsPagination: null,
  error: null,
}

export const getRewardOrders = createAsyncThunk(
  'rewards/getRewardOrders',
  async (
    params: {
      profile_id: number
      status: string | null
      search_text: string | null
      page: number
      size: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_REWARDS_ORDERS_ALL, HttpMethod.POST, {
        profile_id: params.profile_id,
        status: params.status,
        search_text: params.search_text,
        page: params.page,
        size: params.size,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const approveRewardOrder = createAsyncThunk(
  'rewards/approveRewardOrder',
  async (
    params: {profile_id: number; reward_order_id: number; notes: string},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_REWARDS_ORDERS_APPROVE, HttpMethod.POST, {
        profile_id: params.profile_id,
        reward_order_id: params.reward_order_id,
        notes: params.notes,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const rejectRewardOrder = createAsyncThunk(
  'rewards/rejectRewardOrder',
  async (
    params: {profile_id: number; reward_order_id: number; reason: string},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_REWARDS_ORDERS_REJECT, HttpMethod.POST, {
        profile_id: params.profile_id,
        reward_order_id: params.reward_order_id,
        reason: params.reason,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

// ============== DASHBOARD ==============

export const getRewardsDashboard = createAsyncThunk(
  'rewards/getRewardsDashboard',
  async (params: {doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_REWARDS_DASHBOARD, HttpMethod.POST, {
        profile_id: params.doctor_id,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const getPatientWalletList = createAsyncThunk(
  'rewards/getPatientWalletList',
  async (
    params: {user_profile_id: number; search_text: string; page: number; size: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_REWARDS_PATIENT_WALLET_ALL, HttpMethod.POST, {
        user_profile_id: params.user_profile_id,
        search_text: params.search_text,
        page: params.page,
        size: params.size,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

// ============== DAILY REWARDS ==============

export const getRewardTasks = createAsyncThunk(
  'rewards/getRewardTasks',
  async (_: void, {rejectWithValue}) => {
    try {
      const url = `${URL_REWARDS_DAILY}`

      const storage = getStorageType()

      const userId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const token = storage.getItem('userToken')
      const organizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const profileId = storage.getItem('profileId') ? Number(storage.getItem('profileId')) : null

      const response = await apiHelper(url, HttpMethod.GET, undefined, true, {
        headers: {
          accept: 'application/hal+json',

          // common headers (same as apiHelper)
          Authorization: `Bearer ${token}`,
          'User-Id': String(userId),
          'User-Type': 'DOCTOR',
          organization_id: String(organizationId),
          profile_id: String(profileId),
          'X-Organization-Name': getOrgName(),
          'X-Organization-Token': getToken(),

          // endpoint-specific headers (match curl)
          profileId: String(profileId),
          'Profile-id': String(profileId),
          'Organization-id': String(organizationId),
          'user-type': 'DOCTOR',
        },
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message)
    }
  }
)
export const toggleTaskStatus = createAsyncThunk(
  'rewards/toggleTaskStatus',
  async (params: {taskId: number; doctor_id: number; enabled: boolean}, {rejectWithValue}) => {
    try {
      const storage = getStorageType()

      const userId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const token = storage.getItem('userToken')
      const organizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const profileId = storage.getItem('profileId') ? Number(storage.getItem('profileId')) : null

      if (!userId || !token || !organizationId || !profileId) {
        return rejectWithValue({
          message: 'Missing required auth/context values in storage',
          userId,
          hasToken: Boolean(token),
          organizationId,
          profileId,
        })
      }

      const url = `${URL_REWARDS_TASK_TOGGLE(params.taskId)}?enabled=${params.enabled}`

      await apiHelper(url, HttpMethod.PATCH, undefined, true, {
        headers: {
          // --- exactly as curl ---
          accept: 'application/hal+json',
          profileId: String(profileId),
          Authorization: `Bearer ${token}`,
          'X-Organization-Name': getOrgName(),
          'X-Organization-Token': getToken(),
          'user-type': 'DOCTOR',
          'User-Id': String(userId),
          'Profile-id': String(profileId),
          'Organization-id': String(organizationId),

          // --- keep apiHelper equivalents too ---
          'User-Type': 'DOCTOR',
          organization_id: String(organizationId),
          profile_id: String(profileId),
        },
      })

      return {taskId: params.taskId, enabled: params.enabled}
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message)
    }
  }
)

export const updateDailyReward = createAsyncThunk(
  'rewards/updateDailyReward',
  async (params: UpdateDailyRewardPayload, {rejectWithValue}) => {
    try {
      const payload = {
        task_id: params.id,
        profile_id: params.doctor_id,
        task_name: params.task_name,
        task_description: params.description || params.task_name,
        coin_reward: params.coins,
        requires_verification: params.is_enabled !== undefined ? params.is_enabled : true,
        display_order: 0,
      }
      const response = await apiHelper(URL_REWARDS_DAILY_UPDATE, HttpMethod.PUT, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

// ============== PRODUCTS ==============

export const getRewardProducts = createAsyncThunk(
  'rewards/getRewardProducts',
  async (_: void, {rejectWithValue}) => {
    try {
      const url = `${URL_REWARDS_PRODUCTS}`

      const storage = getStorageType()

      const userId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const token = storage.getItem('userToken')
      const organizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const profileId = storage.getItem('profileId') ? Number(storage.getItem('profileId')) : null

      const response = await apiHelper(url, HttpMethod.GET, undefined, true, {
        headers: {
          accept: 'application/hal+json',

          // common headers (same as apiHelper)
          Authorization: `Bearer ${token}`,
          'User-Id': String(userId),
          'User-Type': 'DOCTOR',
          organization_id: String(organizationId),
          profile_id: String(profileId),
          'X-Organization-Name': getOrgName(),
          'X-Organization-Token': getToken(),

          // endpoint-specific (keep consistent with rewards service expectations)
          profileId: String(profileId),
          'Profile-id': String(profileId),
          'Organization-id': String(organizationId),
          'user-type': 'DOCTOR',
        },
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message)
    }
  }
)

export const createRewardProduct = createAsyncThunk(
  'rewards/createRewardProduct',
  async (params: CreateProductPayload, {rejectWithValue}) => {
    try {
      // Create details JSON object matching API specification
      const details: any = {
        product_name: params.name,
        product_description: params.description,
        category: params.category || 'ALIGNER_CARE_KIT',
        coin_cost: params.coins_required,
        monetary_value: params.monetary_value || params.coins_required,
        inventory_count: 100,
        terms_and_conditions: params.terms_and_conditions || '',
        display_order: params.display_order || 0,
        is_featured: params.is_featured || false,
        low_stock_threshold: params.low_stock_threshold || 10,
        profile_id: params.doctor_id,
      }

      // Create FormData with only the photo
      const formData = new FormData()
      if (params.image) {
        formData.append('photo', params.image)
      }

      // Encode details as query parameter
      const detailsParam = encodeURIComponent(JSON.stringify(details))
      const url = `${URL_REWARDS_PRODUCTS}/?details=${detailsParam}`

      const response = await apiHelper(url, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const updateRewardProduct = createAsyncThunk(
  'rewards/updateRewardProduct',
  async (params: UpdateProductPayload, {rejectWithValue}) => {
    try {
      // Create details JSON object with all required fields
      const details: any = {
        product_id: params.product_id,
        profile_id: params.doctor_id,
      }

      if (params.name) details.product_name = params.name
      if (params.description) details.product_description = params.description
      if (params.coins_required !== undefined) details.coin_cost = params.coins_required
      if (params.monetary_value !== undefined) details.monetary_value = params.monetary_value
      if (params.terms_and_conditions !== undefined)
        details.terms_and_conditions = params.terms_and_conditions
      if (params.display_order !== undefined) details.display_order = params.display_order
      if (params.is_featured !== undefined) details.is_featured = params.is_featured
      if (params.low_stock_threshold !== undefined)
        details.low_stock_threshold = params.low_stock_threshold

      if (params.is_available !== undefined) {
        details.status = params.is_available ? 'IN_STOCK' : 'OUT_OF_STOCK'
      }

      // Create FormData with the photo
      const formData = new FormData()
      if (params.image) {
        formData.append('photo', params.image)
      }

      // Encode details as query parameter
      const detailsParam = encodeURIComponent(JSON.stringify(details))
      // Base URL with trailing slash, details as query param
      const url = `${URL_REWARDS_PRODUCTS}/?details=${detailsParam}`

      const response = await apiHelper(url, HttpMethod.PUT, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const deleteRewardProduct = createAsyncThunk(
  'rewards/deleteRewardProduct',
  async (params: {id: number; doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_REWARDS_PRODUCTS}/${params.id}?doctor_id=${params.doctor_id}`,
        HttpMethod.DELETE
      )
      return {id: params.id, ...response.data}
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

// ============== PROMOTIONS ==============

export const getPromotions = createAsyncThunk(
  'rewards/getPromotions',
  async (_: void, {rejectWithValue}) => {
    try {
      const url = `${URL_REWARDS_PROMOTIONS_GET_ALL}?status=ACTIVE`

      const storage = getStorageType()

      const userId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const token = storage.getItem('userToken')
      const organizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const profileId = storage.getItem('profileId') ? Number(storage.getItem('profileId')) : null

      if (!userId || !token || !organizationId || !profileId) {
        return rejectWithValue({
          message: 'Missing required auth/context values in storage',
          userId,
          hasToken: Boolean(token),
          organizationId,
          profileId,
        })
      }

      const response = await apiHelper(url, HttpMethod.GET, undefined, true, {
        headers: {
          // --- exactly as curl ---
          accept: 'application/hal+json',
          Authorization: `Bearer ${token}`,
          'X-Organization-Name': getOrgName(),
          'X-Organization-Token': getToken(),
          'User-Id': String(userId),
          'user-type': 'DOCTOR',
          organization_id: String(organizationId),
          profile_id: String(profileId),
          userProfileId: String(profileId),
        },
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message)
    }
  }
)

export const createPromotion = createAsyncThunk(
  'rewards/createPromotion',
  async (params: any, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_REWARDS_PROMOTIONS_CREATE, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const deletePromotion = createAsyncThunk(
  'rewards/deletePromotion',
  async (params: {id: number; doctor_id: number}, {rejectWithValue}) => {
    try {
      const storage = getStorageType()

      const userId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const token = storage.getItem('userToken')
      const organizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const profileId = storage.getItem('profileId') ? Number(storage.getItem('profileId')) : null

      if (!userId || !token || !organizationId || !profileId) {
        return rejectWithValue({
          message: 'Missing required auth/context values in storage',
          userId,
          hasToken: Boolean(token),
          organizationId,
          profileId,
        })
      }

      const url = `${URL_REWARDS_PROMOTIONS}${params.id}/end`

      const response = await apiHelper(url, HttpMethod.PATCH, undefined, true, {
        headers: {
          // --- exactly as curl ---
          accept: 'application/hal+json',
          'X-User-Profile-Id': String(profileId),
          Authorization: `Bearer ${token}`,
          'X-Organization-Name': getOrgName(),
          'X-Organization-Token': getToken(),
          'user-type': 'DOCTOR',
          'User-Id': String(userId),
          'Profile-id': String(profileId),
          'Organization-id': String(organizationId),

          // --- keep apiHelper equivalents too ---
          'User-Type': 'DOCTOR',
          organization_id: String(organizationId),
          profile_id: String(profileId),
        },
      })

      return {id: params.id, ...response.data}
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message)
    }
  }
)

export const getPromotionClaims = createAsyncThunk(
  'rewards/getPromotionClaims',
  async (
    params: {
      profile_id: number
      status: string | null
      search: string | null
      page: number
      size: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_REWARDS_PROMOTIONS_CLAIMS, HttpMethod.POST, {
        profile_id: params.profile_id,
        status: params.status,
        search: params.search,
        page: params.page,
        size: params.size,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const verifyPromotionClaim = createAsyncThunk(
  'rewards/verifyPromotionClaim',
  async (
    params: {
      user_profile_id: number
      redemption_id: number
      approved: boolean
      notes?: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_REWARDS_PROMOTIONS_VERIFY, HttpMethod.POST, {
        redemption_id: params.redemption_id,
        user_profile_id: params.user_profile_id,
        approved: params.approved,
        notes: params.notes || '',
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearRewardsError: (state) => {
      state.error = null
    },
    setDailyRewards: (state, action: PayloadAction<DailyReward[]>) => {
      state.dailyRewards = action.payload
    },
    setMilestones: (state, action: PayloadAction<Milestone[]>) => {
      state.milestones = action.payload
    },
    setProducts: (state, action: PayloadAction<RewardProduct[]>) => {
      state.products = action.payload
    },
    setPromotions: (state, action: PayloadAction<Promotion[]>) => {
      state.promotions = action.payload
    },
  },
  extraReducers: (builder) => {
    // Daily Rewards
    builder
      .addCase(getRewardTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRewardTasks.fulfilled, (state, action) => {
        state.loading = false
        state.dailyRewards = action.payload?.daily_tasks || []
        state.milestones = action.payload?.milestones || []
      })
      .addCase(getRewardTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateDailyReward.pending, (state) => {
        state.loading = true
      })
      .addCase(updateDailyReward.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.daily_reward) {
          const index = state.dailyRewards.findIndex((r) => r.id === action.payload.daily_reward.id)
          if (index !== -1) {
            state.dailyRewards[index] = action.payload.daily_reward
          }
        }
      })
      .addCase(updateDailyReward.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(toggleTaskStatus.pending, (state) => {
        state.loading = true
      })
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        state.loading = false
        // Update daily rewards if found
        const dailyIndex = state.dailyRewards.findIndex((r) => r.id === action.payload.taskId)
        if (dailyIndex !== -1) {
          state.dailyRewards[dailyIndex].is_enabled = action.payload.enabled
        }

        // Update milestones if found
        const milestoneIndex = state.milestones.findIndex((r) => r.id === action.payload.taskId)
        if (milestoneIndex !== -1) {
          state.milestones[milestoneIndex].is_enabled = action.payload.enabled
        }
      })
      .addCase(toggleTaskStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Products
    builder
      .addCase(getRewardProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRewardProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload?.products || []
      })
      .addCase(getRewardProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createRewardProduct.pending, (state) => {
        state.loading = true
      })
      .addCase(createRewardProduct.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.product) {
          state.products.push(action.payload.product)
        }
      })
      .addCase(createRewardProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateRewardProduct.pending, (state) => {
        state.loading = true
      })
      .addCase(updateRewardProduct.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.product) {
          const index = state.products.findIndex((p) => p.id === action.payload.product.id)
          if (index !== -1) {
            state.products[index] = action.payload.product
          }
        }
      })
      .addCase(updateRewardProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(deleteRewardProduct.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteRewardProduct.fulfilled, (state, action) => {
        state.loading = false
        state.products = state.products.filter((p) => p.id !== action.payload.id)
      })
      .addCase(deleteRewardProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Promotions
    builder
      .addCase(getPromotions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPromotions.fulfilled, (state, action) => {
        state.loading = false
        state.promotions = action.payload?.promotions || []
      })
      .addCase(getPromotions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createPromotion.pending, (state) => {
        state.loading = true
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.promotion) {
          state.promotions.push(action.payload.promotion)
        }
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(deletePromotion.pending, (state) => {
        state.loading = true
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.loading = false
        state.promotions = state.promotions.filter((p) => p.id !== action.payload.id)
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Promotion Claims
    builder
      .addCase(getPromotionClaims.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPromotionClaims.fulfilled, (state, action) => {
        state.loading = false
        state.promotionClaims = action.payload?.claims || []
        state.promotionClaimsPagination = action.payload?.pagination_details || null
      })
      .addCase(getPromotionClaims.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(verifyPromotionClaim.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyPromotionClaim.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(verifyPromotionClaim.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Dashboard
    builder
      .addCase(getRewardsDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRewardsDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload || null
      })
      .addCase(getRewardsDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Patient Wallets
    builder
      .addCase(getPatientWalletList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPatientWalletList.fulfilled, (state, action) => {
        state.loading = false
        state.patientWallets = action.payload?.patients || []
        state.walletPagination = action.payload?.pagination_details || null
      })
      .addCase(getPatientWalletList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Reward Orders
    builder
      .addCase(getRewardOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRewardOrders.fulfilled, (state, action) => {
        state.loading = false
        state.rewardOrders = action.payload?.orders || []
        state.orderPagination = action.payload?.pagination_details || null
      })
      .addCase(getRewardOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Approve/Reject Order
    builder
      .addCase(approveRewardOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approveRewardOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(approveRewardOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(rejectRewardOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectRewardOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(rejectRewardOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {clearRewardsError, setDailyRewards, setMilestones, setProducts, setPromotions} =
  rewardsSlice.actions
export default rewardsSlice.reducer
