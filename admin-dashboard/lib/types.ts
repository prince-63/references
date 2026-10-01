export interface UserProfile {
  user_id: number;
  display_name: string;
  email: string;
  mobile_no: string;
  user_status: string;
  profile_id: number;
  profile_type: string;
  profile_status: string;
  organization_id: number;
  organization_brand_name: string;
  is_tracking_enabled: boolean;
  is_stl_file_view_enabled: boolean;
  is_admin: boolean;
  is_plan_upgraded: boolean;
  subscription_id: number | null;
  total_patients: number | null;
  total_orders: number | null;
  total_storage_gb: number | null;
  total_users: number | null;
  is_demo_completed: boolean | null;
  isgdrive_platform_enabled: boolean | null;
  is_whats_app_messaging_enabled: boolean | null;
  plan_status: string | null;
  plan_name: string | null;
  plan_type: string | null;
  is_trial_plan: boolean | null;
  current_term_start: string | null;
  next_billing_at: string | null;
  current_term_end: string | null;
  service_config_id: number | null;
  service_items: ServiceItem[] | string;
  service_products?: ServiceProduct[] | string;
  patients_used?: number;
  orders_used?: number;
  users_used?: number;
  storage_used_mb?: number;
}

export interface ServiceItem {
  service_item_id: number;
  item_name: string;
  display_order: number;
}

export interface AllServiceItem {
  id: number;
  item_name: string;
  is_active: boolean;
  display_order: number;
}

export interface ServiceProduct {
  id: number;
  product_name: string | null;
  product_type: string | null;
  product_description: string | null;
  product_image: string | null;
  is_default: boolean | null;
  is_product_enabled: boolean | null;
  product_category_id: number | null;
  category_name: string | null;
  category_type: string | null;
  product_metadata: unknown;
}

export type SortOrder = 'asc' | 'desc';

export type DashboardSortField =
  | 'profile_id'
  | 'display_name'
  | 'email'
  | 'mobile_no'
  | 'profile_type'
  | 'is_demo_completed'
  | 'isgdrive_platform_enabled'
  | 'is_whats_app_messaging_enabled'
  | 'current_term_start'
  | 'next_billing_at';

export interface DashboardResponse {
  data: UserProfile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SubscriptionUsesResponse {
  patients_used: number;
  orders_used: number;
  users_used: number;
  storage_used_mb: number;
}

export interface UpdatePayload {
  profile_id: number;
  subscription_id?: number;
  updates: {
    is_tracking_enabled?: boolean;
    is_stl_file_view_enabled?: boolean;
    is_demo_completed?: boolean;
    isgdrive_platform_enabled?: boolean;
    is_whats_app_messaging_enabled?: boolean;
    total_patients?: number;
    total_orders?: number;
    total_storage_gb?: number;
    total_users?: number;
    requested_for_deactivation?: boolean;
    g_drive_migration_status?: string;
    isgdrive_platform_authenticated?: boolean;
    plan_status?: string;
    plan_name?: string;
    plan_type?: string;
    is_plan_upgraded?: boolean;
    is_trial_plan?: boolean;
    next_billing_at?: string;
    current_term_end?: string;
    current_term_start?: string;
    service_items?: number[];
  };
}

export interface ServiceProductsChangeSet {
  productsToAdd: string[];
  productsToDelete: number[];
}

export type DashboardFormUpdates = Partial<UpdatePayload['updates']> & {
  service_items?: number[];
  service_products?: ServiceProductsChangeSet;
};

export type SignupUserType = 'DOCTOR';

export interface SignupDeviceInfoDetails {
  fingerprint: number;
  brand: string;
  device_type: string;
  model_name: string;
  ip: string;
  mac: string;
}

export interface AddUserSignupRequest {
  environment: string;
  org_name: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country_code: string;
  salutation: string;
  role: string;
  user_type?: SignupUserType;
  user_consent?: boolean;
  mobile_no?: string | null;
  organization_id?: number | null;
  profile_id?: number | null;
  doctor_id?: number | null;
  device_info_details?: SignupDeviceInfoDetails;
}

export interface SignupApiResponseStage {
  sr_no: number;
  stage_type: string;
  status: string;
}

export interface SignupApiResponse {
  user_id: number | null;
  user_type: string;
  email: string;
  mobile_no: string | null;
  first_name: string | null;
  last_name: string | null;
  country_code: string | null;
  salutation: string | null;
  token: string | null;
  token_expire_at: string | null;
  stages: SignupApiResponseStage[];
  status: string;
  skip_registration: boolean;
  redirect_url: string | null;
  sso_token: string | null;
  auth_id: number;
}

export interface DoctorProfileDefaultProfile {
  subrole_id: number;
  subrole_name: string;
  profile_id: number;
  organization_id: number;
  organization_name: string;
}

export interface DoctorProfileResponse {
  doctor_id: number;
  email: string;
  first_name: string;
  last_name: string;
  country_code: string;
  mobile_no: string | null;
  salutation: string;
  profile_id: number;
  organization_id: number;
  default_profile: DoctorProfileDefaultProfile;
}

export interface RolePermission {
  module_id: number;
  module_name: string;
  permissions: string[];
}

export interface RolePermissionsResponse {
  subrole_id: number;
  subrole_name: string;
  role_permissions: RolePermission[];
}

export interface SubscriptionDetailsResponse {
  subscription_id: number;
  doctor_id: number;
  profile_id: number;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface BillingSetupResponse {
  billing_id: number;
  doctor_id: number;
  profile_id: number;
  company_name: string;
  status: string;
}
