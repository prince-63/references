import subscriptionModulesConstants from '@constants/subscriptionModules.constants'
import subscriptionsConstants from '@constants/subscriptions.constants'
import subscriptionStatusConstants from '@constants/subscriptionStatus.constants'

export interface PlanMetadata {
  next_billing_at: string
  current_term_start: string
  current_term_end: string
  status: 'ACTIVE'
  plan_name: keyof typeof subscriptionsConstants
  plan_type: 'TRIAL' | 'MONTHLY' | 'ANNUALLY'
  trial_plan: boolean
  request_deletion: boolean
}

export interface ISubscriptionDetails {
  id: number
  total_patients: number
  total_storage_gb: number
  used_storage_gb: number
  total_used_patients: number
  total_orders: number
  used_orders: number
  used_manufacturings: number
  total_users: number
  used_users: number
  brand: null | string
  has_plan_started_consent: boolean
  profile_id: number
  is_has_done_practice: boolean
  plan_metadata: PlanMetadata
  admin: boolean
  is_lab_staff_deactivated: boolean
  is_plan_upgraded: boolean
  is_gdrive_platform_enabled: boolean
  is_gdrive_platform_authenticated: boolean
  gdrive_migration_status: 'PENDING' | 'STARTED' | 'COMPLETED' | 'FAILED' | 'IN_PROGRESS'
}

// export interface ISubscription {
//   total_patients: number
//   total_storage_gb: number
//   used_storage_gb: number
//   total_used_patients: number
//   trial_plan_started?: boolean
//   is_subscription_extended?: boolean
//   trial_about_to_expire?: boolean
//   profile_id: number
//   plan_upgrade_flags: PlanUpgradeFlags
//   plan_metadata: {
//     trial_plan: boolean
//     next_billing_at: string
//     current_term_start: string
//     current_term_end: string
//     status: string
//     plan_name: keyof typeof subscriptionsConstants
//     plan_type: 'MONTHLY' | 'ANNUALLY' | 'TRIAL'
//   }
// }

export interface CurrentPlanDetails {
  plan_name: string
  next_billing_at: string
  status: keyof typeof subscriptionStatusConstants
  current_term_end: string
  plan_type: string
  amount: number
  object: string
  item_type: string
  quantity: number
  unit_price: number
  free_quantity: number
  current_term_start: string
}
export interface PlanUpgradeFlags {
  storage: boolean
  patients: boolean
  dashboard: boolean
}

export type SubscriptionModule = keyof typeof subscriptionModulesConstants
