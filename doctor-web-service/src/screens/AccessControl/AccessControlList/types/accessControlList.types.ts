export interface RequestList {
  doctor_id: number
  search: string | null
  status: string
  sub_role_id: number | null
  page_number: number
  page_size: number
}

export interface RequestAuditLogList {
  doctor_id: number
  page_number: number
}

export interface PermissionSubModule {
  id: number
  name: string
  description: string
  permissions: string[] // You can make this more specific if you have fixed permission types like: ('VIEW' | 'EDIT')[]
}

export interface Module {
  id: number
  name: string
  description: string
  sub_modules: PermissionSubModule[]
}

export interface Sub_Role_Data {
  id: number
  plan_id: number
  name: string
  description: string
  sub_role_tag: 'CUSTOM' | string
  modules: Module[]
  cloned_from_sub_role?: number | null
}

export interface AccessControlRolesData {
  id: number
  name: string
  description: string
  sub_roles: Sub_Role_Data[]
}

export interface RequestAddUser {
  doctor_id?: number
  email?: string | null
  first_name?: string
  last_name?: string | null
  display_name?: string | null
  mobile_no?: string | null
  country_code?: string
  salutation?: string
  invitation_id?: number | null
  is_invitation_send?: boolean
  sub_role_id?: number
  status?: string
  invitation_status?: string
  invited_user_profile_id?: number | null
  is_tracking_enabled?: boolean
  is_scan_file_view_enabled?: boolean
  is_stl_file_view_enabled?: boolean
  is_print_file_view_enabled?: boolean
}

export interface RequestDeactivateUser {
  doctor_id: number
  invitation_id: number
  invitation_status: 'DEACTIVATED'
}

export interface PermissionModule {
  id: number
  permissions: string[]
}

export interface RequestAddCustomerRole {
  name: string
  description: string
  sub_role_tag: string
  plan_id: number
  profile_id: number
  clone_from_sub_role_id?: number | null
  sub_modules?:
    | {
        sub_module_id: number
        permissions: string[]
      }[]
    | null
}

export interface RequestEditCustomerRole {
  sub_role_id: number
  name: string
  description: string
  sub_role_tag: string
  plan_id: number
  profile_id: number
  clone_from_sub_role_id?: number | null
  sub_modules?:
    | {
        sub_module_id: number
        permissions: string[]
      }[]
    | null
}

export interface RowDataUserList {
  first_name: string
  last_name: string
  email: string
  mobile_number: string
  profile_image_url: string
  profile_image_id: number | null
  salutation: string
  sub_role_name: string
  invitation_status: 'PENDING' | 'ACCEPTED' | 'DEACTIVATED'
  invitation_id: number
  country_code: string
  sub_role_id: number
  invite_code: string
  profile_id: number | null
}

export interface optionTypeAccessControl {
  label: string
  subLabel: string
  value: number
}

export interface AccessControlInvitationDetails {
  doctor_name: string
  practice_location: string
  doctor_email: string
  doctor_id: number
  invitation_id: number
  doctor_image: string
  first_name: string
  last_name: string
  email: string
  country_code: string
  mobile_no: string
  organization_id: number
  profile_id: number
  organization_name: string
  organization_profile_url: string
  invitation_role: string[] // e.g., ['CONSULTING_ORTHODONTIST']
  salutation: string
  invitation_code: string
  invited_at: string // ISO date string
  last_invitation_at: string
  status: 'PENDING' | 'ACCEPTED' | 'DEACTIVATED' | string // Add more specific statuses if known
  profile_url: string
  registration_type: 'EXISTING_USER' | 'NEW_USER' | string
  expires_at: string
  accepted_at: string
  display_name: string
  role: string
  is_received_invitation: boolean
  credential_type: 'PASSWORD' | 'OTP' | string
  org_name: string
  admin: boolean
}

export interface RowDataAuditLogList {
  id: number
  date_time: string
  user: string
  action: string
  formatted_action: string
  change_description: string
  previous_value: string | null
  new_value: string | null
  role_name: string | null
  permission_name: string | null
  module_name: string | null
  sub_role_id: number | null
  assigned_by_profile_id: number | null
  assigned_to_profile_id: number | null
  assigned_to_user: string
}
