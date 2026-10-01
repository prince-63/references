import customerFilterConstants from '@constants/customerFilter.constants'
import practiceSortingConstants from '@constants/practiceSorting.constants'
import rolesConstants from '@constants/roles.constants'
import customersFilterNavItems from '@staticData/customersFilterNavItems'
import {IProfileRole} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'

export type customersNavTabs = (typeof customersFilterNavItems)[number]['value']

export type customersNavListFilter = Record<customersNavTabs, boolean>

export type optionTypeCustomers = {value: keyof typeof practiceSortingConstants; label: string}

export interface RequestInvitation {
  organization_id?: number
  profile_id?: number
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
  invited_user_profile_id?: number | null
  is_tracking_enabled?: boolean
  is_stl_file_view_enabled?: boolean
  is_print_file_view_enabled?: boolean
  is_scan_file_view_enabled?: boolean
}

export interface RequestInvitationList {
  payload: {
    doctor_id: string
    invitation_status: keyof typeof customerFilterConstants
    page_number: number
    page_size: number
    search: string | null
    sort_order: keyof typeof practiceSortingConstants
  }
  roles: IProfileRole[]
}

export interface PaginationCustomers {
  page_number: number // The current page number
  page_size: number // Number of items per page
  total_patients: number // Total number of patients
  total_pages: number // Total number of pages
  has_next: boolean // Whether there is a next page
  has_previous: boolean // Whether there is a previous page
  active_invitation_count: number
  pending_invitation_count: number
}

export interface ResponseCustomerList {
  doctor_invitation_details_list: Invitation[]
  pagination: PaginationCustomers
}
