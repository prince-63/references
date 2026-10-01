export interface InternalUserOption {
  user_profile_id: number
  name: string
  email: string
  role: string | null
}

export interface CaseTeamFormValues {
  team_name: string
  description: string
  selected_internal_users: Record<string, boolean>
}
