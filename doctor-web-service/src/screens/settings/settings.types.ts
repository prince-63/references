import settingsPaths from '@staticData/settings.paths'

export type settingsNavTabs = (typeof settingsPaths)[number]
export type settingsNavListItem = settingsNavTabs['value']
export type settingsNavListFilter = Record<settingsNavTabs['value'], boolean>

export interface IAccountDetails {
  first_name: string
  last_name: string | null
  mobile_no: string | null
  email: string
  country_code: string
  display_name: string | null
  profile_picture?: string | null
  profile_picture_id?: number | null
  display_picture?: string | null
  salutation: string
  profile_id: number
  organization_id: number
}

export interface IBillingDetails {
  billing_id: number | null
  doctor_id: number
  organization_id: number
  profile_id: number
  company_legal_name: string | null
  address_line1: string | null
  address_line2: string | null
  country: string | null
  state: string | null
  city: string | null
  pincode: string | null
  company_tax_id: string | null
  currency: string | null
  file_action: string | null
  file_brand_action: string | null
  company_display_name: string | null
  company_brand_name: string | null
  company_image_url?: string | null
  company_brand_profile_picture?: string | null
  company_image_id?: number | null
  company_brand_profile_picture_id?: number | null
  plan_name?: string
  profile_type?: 'INVITED' | 'OWNER'
}

export interface IProfileDetails {
  organization_id: number
  profile_name: string
  first_name: string
  profile_url: string
  default: boolean
  salutation: string
  updates_count: number
  email: string
  doctor_id: number
  profile_id: number
  profile_image_id?: number | null
}
