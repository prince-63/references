import practiceSortingConstants from '@constants/practiceSorting.constants'
import rolesConstants from '@constants/roles.constants'
import practicesFilterNavItems from '@staticData/practicesFilterNavItems'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'

export type practicesNavTabs = (typeof practicesFilterNavItems)[number]['value']

export type practicesNavListFilter = Record<practicesNavTabs, boolean>

export type optionTypePractices = {value: keyof typeof practiceSortingConstants; label: string}

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

export interface RequestInvitationList {
  doctor_id: string
  profile_id: string
  organization_id: string
  invitation_status: 'PENDING' | 'ACCEPTED'
  page_number: number
  page_size?: number
  search: string | null
  sort_order: keyof typeof practiceSortingConstants
  invitation_roles: string[]
}

export interface PaginationPractices {
  page_number: number // The current page number
  page_size: number // Number of items per page
  total_patients: number // Total number of patients
  total_pages: number // Total number of pages
  has_next: boolean // Whether there is a next page
  has_previous: boolean // Whether there is a previous page
  active_invitation_count: number
  pending_invitation_count: number
}

export interface ResponsePracticeList {
  doctor_invitation_details_list: Invitation[]
  pagination: PaginationPractices
}
