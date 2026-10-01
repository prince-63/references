export interface DailyReward {
  id: number
  task_name: string
  description: string
  coin_reward: number
  is_enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface Milestone {
  id: number
  task_name: string
  description: string
  target_coins: number
  coin_reward: number
  is_enabled: boolean
  progress?: number
  created_at?: string
  updated_at?: string
}

export interface RewardProduct {
  id: number
  name: string
  description: string
  coins_required: number
  image_url?: string
  is_available: boolean
  created_at?: string
  updated_at?: string
}

export interface Promotion {
  id: number
  name: string
  description: string
  multiplier: number
  bonus_coins: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface RewardsDashboardStats {
  active_patient: number
  coin_distributed: number
  coin_redeemed: number
  pending_redemptions_count: number
}

export interface PatientWallet {
  patient_id: number
  patient_name: string
  first_name?: string
  last_name?: string
  patient_email: string
  customer_mapped_id: string
  uuid: string
  profile_picture_url: string
  profile_picture_id: number
  coins_earned: number
  coins_used: number
  product_name: string
  order_date: string
}

export interface WalletPagination {
  page_number: number
  page_size: number
  total_activities: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface RewardsConfigurationState {
  dailyRewards: DailyReward[]
  milestones: Milestone[]
  products: RewardProduct[]
  promotions: Promotion[]
  stats: RewardsDashboardStats | null
  patientWallets: PatientWallet[]
  walletPagination: WalletPagination | null
  rewardOrders: RewardOrder[]
  orderPagination: OrderPagination | null
  promotionClaims: PromotionClaim[]
  promotionClaimsPagination: PromotionClaimsPagination | null
  loading: boolean
  error: string | null
}

export interface RewardOrder {
  reward_order_id: number
  order_number: string
  reward_id: number
  product_name: string
  reward_type: string
  coin_value: number
  reward_media_id: number | null
  reward_media_url: string | null
  order_date: string
  status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'REJECTED'
  patient_id: number
  patient_name: string
  profile_picture_id: number | null
  profile_picture_url: string | null
  patient_customer_mapped_id: string | null
}

export interface OrderPagination {
  total_orders: number
  total_pages: number
  current_page: number
  page_size: number
}

export interface CreateDailyRewardPayload {
  doctor_id: number
  task_name: string
  description: string
  coins: number
  is_enabled: boolean
}

export interface UpdateDailyRewardPayload {
  id: number
  doctor_id: number
  task_name?: string
  description?: string
  coins?: number
  is_enabled?: boolean
}

export interface CreateMilestonePayload {
  doctor_id: number
  name: string
  description: string
  target_coins: number
  bonus_coins: number
  is_enabled: boolean
}

export interface UpdateMilestonePayload {
  id: number
  doctor_id: number
  name?: string
  description?: string
  target_coins?: number
  bonus_coins?: number
  is_enabled?: boolean
}

export interface CreateProductPayload {
  doctor_id: number
  name: string
  description: string
  coins_required: number
  category?: string
  monetary_value?: number
  terms_and_conditions?: string
  display_order?: number
  is_featured?: boolean
  low_stock_threshold?: number
  image?: File | null
  is_available: boolean
}

export interface UpdateProductPayload {
  product_id: number
  doctor_id: number
  name?: string
  description?: string
  coins_required?: number
  monetary_value?: number
  terms_and_conditions?: string
  display_order?: number
  is_featured?: boolean
  low_stock_threshold?: number
  image?: File | null
  is_available?: boolean
}

export interface CreatePromotionPayload {
  doctor_id: number
  name: string
  description: string
  multiplier: number
  bonus_coins: number
  start_date: string
  end_date: string
  is_active: boolean
}

export interface UpdatePromotionPayload {
  id: number
  doctor_id: number
  name?: string
  description?: string
  multiplier?: number
  bonus_coins?: number
  start_date?: string
  end_date?: string
  is_active?: boolean
}

export interface PromotionClaim {
  id: number
  patient_id: number
  patient_name: string
  profile_picture_id: number | null
  profile_picture_url: string | null
  patient_customer_mapped_id: string | null
  promotion_name: string
  promotion_type: string
  value: number
  coins_received?: number
  redemption_id: number
  referred_patient_email?: string | null
  referred_patient_name?: string | null
  referred_patient_phone?: string | null
  status: string
  created_at: string
}

export interface PromotionClaimsPagination {
  total_records: number
  total_pages: number
  current_page: number
  page_size: number
}
