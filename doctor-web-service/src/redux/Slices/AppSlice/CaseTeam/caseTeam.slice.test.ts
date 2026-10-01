import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import {URL_CREATE_CASE_TEAM} from 'redux/Endpoints/apiEndpoints'
import reducer, {createCaseTeam, getCaseTeams, resetCreateCaseTeamState} from './caseTeam.slice'

const mockStorage: Record<string, string | null> = {}

jest.mock('@utils/apiHelper', () => jest.fn())
jest.mock('utils/storage', () => ({
  getStorageType: () => ({
    getItem: (key: string) => mockStorage[key] ?? null,
  }),
}))

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>

describe('caseTeam.slice', () => {
  const baseArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

  beforeEach(() => {
    mockedApiHelper.mockReset()
    Object.keys(mockStorage).forEach((key) => {
      delete mockStorage[key]
    })
  })

  it('initializes defaults and resets create state', () => {
    const initialState = reducer(undefined, {type: 'init'})
    expect(initialState.createCaseTeamLoading).toBe(false)
    expect(initialState.createCaseTeamError).toBeNull()
    expect(initialState.createdCaseTeam).toBeNull()
    expect(initialState.getCaseTeamsLoading).toBe(false)
    expect(initialState.getCaseTeamsError).toBeNull()
    expect(initialState.caseTeamsData).toBeNull()

    const dirtyState = reducer(
      initialState,
      createCaseTeam.fulfilled({id: 1} as any, 'req', {
        team_name: 'Team',
        member_user_profile_ids: [1],
      })
    )

    const resetState = reducer(dirtyState, resetCreateCaseTeamState())
    expect(resetState.createCaseTeamLoading).toBe(false)
    expect(resetState.createCaseTeamError).toBeNull()
    expect(resetState.createdCaseTeam).toBeNull()
    expect(resetState.getCaseTeamsLoading).toBe(false)
    expect(resetState.getCaseTeamsError).toBeNull()
    expect(resetState.caseTeamsData).toBeNull()
  })

  it('handles pending, fulfilled and rejected reducer states', () => {
    const pendingState = reducer(
      undefined,
      createCaseTeam.pending('req', {
        team_name: 'Team',
        member_user_profile_ids: [1],
      })
    )
    expect(pendingState.createCaseTeamLoading).toBe(true)
    expect(pendingState.createCaseTeamError).toBeNull()

    const fulfilledState = reducer(
      pendingState,
      createCaseTeam.fulfilled(
        {
          id: 1,
          team_name: 'Planning Team',
          description: 'desc',
          is_active: true,
          member_count: 2,
          created_at: '2026-02-17T12:43:05.211430606+05:30',
          created_by: {} as any,
          members: [],
        },
        'req',
        {
          team_name: 'Planning Team',
          member_user_profile_ids: [1, 2],
        }
      )
    )
    expect(fulfilledState.createCaseTeamLoading).toBe(false)
    expect(fulfilledState.createdCaseTeam?.team_name).toBe('Planning Team')

    const rejectedState = reducer(
      pendingState,
      createCaseTeam.rejected(
        null as any,
        'req',
        {
          team_name: 'Planning Team',
          member_user_profile_ids: [1, 2],
        },
        {message: 'failed to create'}
      )
    )
    expect(rejectedState.createCaseTeamLoading).toBe(false)
    expect(rejectedState.createCaseTeamError).toBe('failed to create')
  })

  it('creates case team successfully using storage fallback ids', async () => {
    mockStorage.profileId = '2052'
    mockStorage.userId = '1935'
    mockStorage.organizationId = '1546'

    mockedApiHelper.mockResolvedValueOnce({
      data: {
        id: 1,
        team_name: 'Planning Team',
      },
    } as any)

    const result = await createCaseTeam({
      team_name: 'Planning Team',
      description: 'desc',
      member_user_profile_ids: [2658, 2651],
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(result.type).toMatch(/fulfilled$/)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_CREATE_CASE_TEAM,
      HttpMethod.POST,
      {
        team_name: 'Planning Team',
        description: 'desc',
        member_user_profile_ids: [2658, 2651],
        profile_id: 2052,
        doctor_id: 1935,
        organization_id: 1546,
      },
      true,
      {
        headers: {
          accept: 'application/hal+json',
          'User-Id': '1935',
          'user-type': 'DOCTOR',
          'Profile-id': '2052',
          'Organization-id': '1546',
        },
      }
    )
  })

  it('fetches case teams successfully using storage fallback ids', async () => {
    mockStorage.profileId = '2052'
    mockStorage.userId = '1935'
    mockStorage.organizationId = '1546'

    mockedApiHelper.mockResolvedValueOnce({
      data: {
        teams: [],
        pagination_details: {
          page_number: 0,
          page_size: 20,
          total_patients: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false,
        },
      },
    } as any)

    const result = await getCaseTeams(undefined)(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(result.type).toMatch(/fulfilled$/)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_CREATE_CASE_TEAM}?profile_id=2052&page=0&size=20`,
      HttpMethod.GET,
      undefined,
      true,
      {
        headers: {
          accept: 'application/hal+json',
          'User-Id': '1935',
          'user-type': 'DOCTOR',
          'Profile-id': '2052',
          'Organization-id': '1546',
        },
      }
    )
  })

  it('handles getCaseTeams reducer states', () => {
    const pendingState = reducer(undefined, getCaseTeams.pending('req', undefined))
    expect(pendingState.getCaseTeamsLoading).toBe(true)
    expect(pendingState.getCaseTeamsError).toBeNull()

    const fulfilledState = reducer(
      pendingState,
      getCaseTeams.fulfilled(
        {
          teams: [],
          pagination_details: {
            page_number: 0,
            page_size: 20,
            total_patients: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false,
          },
        },
        'req',
        undefined
      )
    )
    expect(fulfilledState.getCaseTeamsLoading).toBe(false)
    expect(fulfilledState.caseTeamsData?.pagination_details.page_size).toBe(20)

    const rejectedState = reducer(
      pendingState,
      getCaseTeams.rejected(null as any, 'req', undefined, {message: 'failed to fetch'})
    )
    expect(rejectedState.getCaseTeamsLoading).toBe(false)
    expect(rejectedState.getCaseTeamsError).toBe('failed to fetch')
  })

  it('rejects when team_name is empty', async () => {
    const result = await createCaseTeam({
      team_name: '  ',
      member_user_profile_ids: [1],
      profile_id: 2052,
      doctor_id: 1935,
      organization_id: 1546,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(result.type).toMatch(/rejected$/)
    expect(result.payload).toBe('team_name is required')
    expect(mockedApiHelper).not.toHaveBeenCalled()
  })

  it('rejects when members are missing', async () => {
    const result = await createCaseTeam({
      team_name: 'Planning Team',
      member_user_profile_ids: [],
      profile_id: 2052,
      doctor_id: 1935,
      organization_id: 1546,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(result.type).toMatch(/rejected$/)
    expect(result.payload).toBe('member_user_profile_ids is required')
    expect(mockedApiHelper).not.toHaveBeenCalled()
  })

  it('rejects when context ids are unavailable in payload and storage', async () => {
    const result = await createCaseTeam({
      team_name: 'Planning Team',
      member_user_profile_ids: [2658],
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(result.type).toMatch(/rejected$/)
    expect(result.payload).toBe('profile_id is required')
    expect(mockedApiHelper).not.toHaveBeenCalled()
  })

  it('rejects getCaseTeams when context ids are unavailable in payload and storage', async () => {
    const result = await getCaseTeams({
      page: 0,
      size: 20,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(result.type).toMatch(/rejected$/)
    expect(result.payload).toBe('profile_id is required')
    expect(mockedApiHelper).not.toHaveBeenCalled()
  })
})
