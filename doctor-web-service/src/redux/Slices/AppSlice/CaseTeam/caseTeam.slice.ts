import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_CREATE_CASE_TEAM} from 'redux/Endpoints/apiEndpoints'
import {getStorageType} from 'utils/storage'

export interface CreateCaseTeamRequest {
  team_name: string
  description?: string
  member_user_profile_ids: number[]
  profile_id?: number
  doctor_id?: number
  organization_id?: number
}

export interface CaseTeamUser {
  id: number
  user_id: number
  name: string
  email: string
  organization_name: string | null
  profile_picture_url: string | null
  profile_image_id: number | null
  role_name: string | null
}

export interface CreateCaseTeamResponse {
  id: number
  team_name: string
  description: string | null
  is_active: boolean
  member_count: number
  created_at: string
  created_by: CaseTeamUser
  members: CaseTeamUser[]
}

export interface CaseTeamsPaginationDetails {
  page_number: number
  page_size: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface GetCaseTeamsResponse {
  teams: CreateCaseTeamResponse[]
  pagination_details: CaseTeamsPaginationDetails
}

export interface GetCaseTeamsParams {
  profile_id?: number
  page?: number
  size?: number
  doctor_id?: number
  organization_id?: number
}

export interface CaseTeamState {
  createCaseTeamLoading: boolean
  createCaseTeamError: string | null
  createdCaseTeam: CreateCaseTeamResponse | null
  getCaseTeamsLoading: boolean
  getCaseTeamsError: string | null
  caseTeamsData: GetCaseTeamsResponse | null
}

const initialState: CaseTeamState = {
  createCaseTeamLoading: false,
  createCaseTeamError: null,
  createdCaseTeam: null,
  getCaseTeamsLoading: false,
  getCaseTeamsError: null,
  caseTeamsData: null,
}

const getErrorMessage = (error: unknown, fallback: string = 'An error occurred') => {
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as {message?: unknown}).message === 'string') {
      return (error as {message: string}).message
    }
    if (
      'status' in error &&
      typeof (error as {status?: {message?: unknown}}).status?.message === 'string'
    ) {
      return (error as {status: {message: string}}).status.message
    }
  }
  return fallback
}

export const createCaseTeam = createAsyncThunk<
  CreateCaseTeamResponse,
  CreateCaseTeamRequest,
  {rejectValue: unknown}
>(
  'caseTeam/createCaseTeam',
  async (
    {
      team_name,
      description = '',
      member_user_profile_ids,
      profile_id,
      doctor_id,
      organization_id,
    }: CreateCaseTeamRequest,
    {rejectWithValue}
  ) => {
    try {
      const storage = getStorageType()

      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null
      const storedDoctorId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const storedOrganizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null

      const resolvedProfileId = profile_id ?? storedProfileId
      const resolvedDoctorId = doctor_id ?? storedDoctorId
      const resolvedOrganizationId = organization_id ?? storedOrganizationId

      if (!team_name?.trim()) return rejectWithValue('team_name is required')
      if (!Array.isArray(member_user_profile_ids) || member_user_profile_ids.length === 0) {
        return rejectWithValue('member_user_profile_ids is required')
      }
      if (!resolvedProfileId) return rejectWithValue('profile_id is required')
      if (!resolvedDoctorId) return rejectWithValue('doctor_id is required')
      if (!resolvedOrganizationId) return rejectWithValue('organization_id is required')

      const payload = {
        team_name: team_name.trim(),
        description,
        member_user_profile_ids,
        profile_id: resolvedProfileId,
        doctor_id: resolvedDoctorId,
        organization_id: resolvedOrganizationId,
      }

      const response = await apiHelper(URL_CREATE_CASE_TEAM, HttpMethod.POST, payload, true)

      return response.data as CreateCaseTeamResponse
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
    }
  }
)

export const getCaseTeams = createAsyncThunk<
  GetCaseTeamsResponse,
  GetCaseTeamsParams | undefined,
  {rejectValue: unknown}
>('caseTeam/getCaseTeams', async (params, {rejectWithValue}) => {
  try {
    const storage = getStorageType()
    const page = params?.page ?? 0
    const size = params?.size ?? 20
    const storedProfileId = storage.getItem('profileId')
      ? Number(storage.getItem('profileId'))
      : null
    const resolvedProfileId = storedProfileId

    const response = await apiHelper(
      `${URL_CREATE_CASE_TEAM}?profile_id=${resolvedProfileId}&page=${page}&size=${size}`,
      HttpMethod.GET,
      {},
      true
    )

    return response.data as GetCaseTeamsResponse
  } catch (error: any) {
    return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
  }
})

const caseTeamSlice = createSlice({
  name: 'caseTeam',
  initialState,
  reducers: {
    resetCreateCaseTeamState: (state) => {
      state.createCaseTeamLoading = false
      state.createCaseTeamError = null
      state.createdCaseTeam = null
      state.getCaseTeamsLoading = false
      state.getCaseTeamsError = null
      state.caseTeamsData = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCaseTeam.pending, (state) => {
        state.createCaseTeamLoading = true
        state.createCaseTeamError = null
      })
      .addCase(createCaseTeam.fulfilled, (state, action) => {
        state.createCaseTeamLoading = false
        state.createdCaseTeam = action.payload
      })
      .addCase(createCaseTeam.rejected, (state, action) => {
        state.createCaseTeamLoading = false
        state.createCaseTeamError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
      .addCase(getCaseTeams.pending, (state) => {
        state.getCaseTeamsLoading = true
        state.getCaseTeamsError = null
      })
      .addCase(getCaseTeams.fulfilled, (state, action) => {
        state.getCaseTeamsLoading = false
        state.caseTeamsData = action.payload
      })
      .addCase(getCaseTeams.rejected, (state, action) => {
        state.getCaseTeamsLoading = false
        state.getCaseTeamsError = getErrorMessage(
          action.payload,
          action.error?.message ?? 'An error occurred'
        )
      })
  },
})

export const {resetCreateCaseTeamState} = caseTeamSlice.actions
export default caseTeamSlice.reducer
