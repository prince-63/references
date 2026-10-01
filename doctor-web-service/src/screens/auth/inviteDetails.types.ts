export interface InviteDetails {
  first_name: string
  last_name: string | null
  email: string
  country_code: string | null
  mobile_no: string | null
  organization_id: number
  organization_name: string
  organization_profile_url: string
  invitation_role: string
  salutation: string
  invitation_code: string
  invited_at: string
  last_invitation_at: string
  status: 'EXPIRED' | 'PENDING' | 'ACCEPTED'
  profile_url: string
  invitation_id: number
  registration_type: 'EXISTING_USER' | 'NEW_USER_INVITED'
  expires_at: string
  accepted_at: string
  doctor_id: number
  credential_type: 'GOOGLE_TOKEN' | 'APPLE_TOKEN' | 'PASSWORD' | 'NONE'
  brand: string
}
