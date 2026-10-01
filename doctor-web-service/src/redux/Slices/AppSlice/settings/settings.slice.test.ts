import reducer, {
  getAccountData,
  getBillingData,
  getMigrationFilesCount,
  getProfileManagementData,
  getUsersList,
  requestAccountDelete,
  setDataEditUser,
  updateBillingData,
} from './settings.slice'

describe('settings.slice', () => {
  const baseState = reducer(undefined, {type: 'init'})

  it('initializes with defaults', () => {
    expect(baseState.loadingAccountData).toBe(false)
    expect(baseState.dataUserList.pagination.page_number).toBe(1)
  })

  it('sets editable user data', () => {
    const payload = {id: 9, name: 'Tester'} as any
    const updated = reducer(baseState, setDataEditUser(payload))
    expect(updated.dataEditUser).toEqual(payload)
  })

  it('handles account and billing fetch cycles', () => {
    const accountPending = reducer(
      baseState,
      getAccountData.pending('req', {doctorId: 1, organizationId: 2, profileId: 3} as any)
    )
    expect(accountPending.loadingAccountData).toBe(true)
    const accountPayload = {name: 'Account'} as any
    const accountDone = reducer(
      accountPending,
      getAccountData.fulfilled(accountPayload, 'req', {
        doctorId: 1,
        organizationId: 2,
        profileId: 3,
      } as any)
    )
    expect(accountDone.loadingAccountData).toBe(false)
    expect(accountDone.account).toEqual(accountPayload)

    const billingPending = reducer(
      baseState,
      getBillingData.pending('req', {doctorId: 1, organizationId: 2, profileId: 3} as any)
    )
    expect(billingPending.loadingBillingData).toBe(true)
    const billingPayload = {address: 'abc'} as any
    const billingDone = reducer(
      billingPending,
      getBillingData.fulfilled(billingPayload, 'req', {
        doctorId: 1,
        organizationId: 2,
        profileId: 3,
      } as any)
    )
    expect(billingDone.billing).toEqual(billingPayload)
    expect(billingDone.loadingBillingData).toBe(false)
  })

  it('tracks billing update lifecycle', () => {
    const pending = reducer(
      baseState,
      updateBillingData.pending('req', {data: {details: {doctor_id: 1, file_action: ''}}} as any)
    )
    expect(pending.loadingUpdateBillingData).toBe(true)

    const fulfilled = reducer(
      pending,
      updateBillingData.fulfilled({}, 'req', {
        data: {details: {doctor_id: 1, file_action: ''}},
      } as any)
    )
    expect(fulfilled.loadingUpdateBillingData).toBe(false)

    const rejected = reducer(
      pending,
      updateBillingData.rejected('err' as any, 'req', {
        data: {details: {doctor_id: 1, file_action: ''}},
      } as any)
    )
    expect(rejected.loadingUpdateBillingData).toBe(false)
  })

  it('stores profile management and user lists', () => {
    const profilePending = reducer(
      baseState,
      getProfileManagementData.pending('req', {doctorId: 1, organizationId: 2} as any)
    )
    expect(profilePending.loadingProfileManagementData).toBe(true)

    const profiles = [{id: 1}] as any
    const profileDone = reducer(
      profilePending,
      getProfileManagementData.fulfilled(profiles, 'req', {doctorId: 1, organizationId: 2} as any)
    )
    expect(profileDone.loadingProfileManagementData).toBe(false)
    expect(profileDone.profiles).toEqual(profiles)

    const userPending = reducer(baseState, getUsersList.pending('req', {} as any))
    expect(userPending.loadingUserList).toBe(true)
    const listPayload = {
      doctor_invitation_details_list: [{id: 1}],
      pagination: {
        page_number: 1,
        page_size: 10,
        total_patients: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
        active_invitation_count: 0,
        pending_invitation_count: 0,
      },
    } as any
    const userDone = reducer(userPending, getUsersList.fulfilled(listPayload, 'req', {} as any))
    expect(userDone.loadingUserList).toBe(false)
    expect(userDone.dataUserList).toEqual(listPayload)
  })

  it('handles account deletion request flow', () => {
    const pending = reducer(
      baseState,
      requestAccountDelete.pending('req', {data: {profile_id: 1}} as any)
    )
    expect(pending.loadingRequestAccountDeleteData).toBe(true)

    const payload = [{id: 1}]
    const done = reducer(
      pending,
      requestAccountDelete.fulfilled(payload as any, 'req', {data: {profile_id: 1}} as any)
    )
    expect(done.loadingRequestAccountDeleteData).toBe(false)
    expect(done.profiles).toEqual(payload)
  })

  it('records migration counts retrieval', () => {
    const pending = reducer(
      baseState,
      getMigrationFilesCount.pending('req', {job_id: 'job'} as any)
    )
    expect(pending.loadingGetCounts).toBe(true)

    const payload = {job_id: 'job', total_files: 2} as any
    const done = reducer(
      pending,
      getMigrationFilesCount.fulfilled(payload, 'req', {job_id: 'job'} as any)
    )
    expect(done.loadingGetCounts).toBe(false)
    expect(done.dataMigrationCountsData).toEqual(payload)
  })
})
