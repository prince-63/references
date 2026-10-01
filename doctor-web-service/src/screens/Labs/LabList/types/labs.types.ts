import practiceFilterConstants from '@constants/practiceFilter.constants'
import rolesConstants from '@constants/roles.constants'
import practicesFilterNavItems from '@staticData/practicesFilterNavItems'
import {IProfileRole} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'

export type labsNavTabs = (typeof practicesFilterNavItems)[number]['value']

export type labsNavListFilter = Record<labsNavTabs, boolean>

export type optionTypeLabs = {value: keyof typeof practiceFilterConstants; label: string}

export interface Invitation {
  first_name: string
  last_name: string
  email: string
  country_code: string
  mobile_no: string
  admin: boolean
  organization_id: number
  doctor_id: number
  organization_name: string
  organization_profile_url: string
  invitation_role: keyof typeof rolesConstants
  salutation: string
  invitation_code: string
  invited_at: string
  last_invitation_at: string
  display_name: string
  status: 'ACCEPTED' | 'PENDING' | 'DEACTIVATED' | 'REJECTED'
  profile_id: number
  profile_url: string
  profile_image_id: number | null
  invitation_id: number
  registration_type: 'NEW_USER_INVITED' | 'EXISTING_USER'
  expires_at: string
  accepted_at: string | null
  ongoing_order_count: number | null
  is_received_invitation: boolean
  org_name: string
  enabled_items: string[]
  role: keyof typeof rolesConstants
}

export interface RequestInvitation {
  organization_id: number
  profile_id: number
  doctor_id: number
  email: string
  first_name: string
  last_name: string
  mobile_no: string | null
  country_code: string
  salutation: string
  doctor_role: keyof typeof rolesConstants
  invitation_id: number | null
  is_invitation_send: boolean
}

export interface RequestAcceptInvitation {
  email: string
  mobile_no: string
  country_code: string
  first_name: string
  last_name: string
  salutation: string
  registration_type: string
  invitation_code: string
  doctor_id: number
  is_on_board_screen_visited: boolean
  brand: string
}

export interface RequestInvitationList {
  payload: {
    doctor_id: string
    invitation_status: 'PENDING' | 'ACCEPTED' | 'ALL'
    page_number: number
    page_size: number
    search: string | null
    sort_order: 'ADDED_ON_NEWEST_TO_OLDEST'
  }
  roles: IProfileRole[]
  isPractice: boolean
}

export interface PaginationLabs {
  page_number: number // The current page number
  page_size: number // Number of items per page
  total_patients: number // Total number of patients
  total_pages: number // Total number of pages
  has_next: boolean // Whether there is a next page
  has_previous: boolean // Whether there is a previous page
  active_invitation_count: number
  pending_invitation_count: number
}

export interface ResponseLabList {
  doctor_invitation_details_list: Invitation[]
  pagination: PaginationLabs
}
