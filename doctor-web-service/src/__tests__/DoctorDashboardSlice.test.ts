import HttpMethod from '@constants/httpMethods.constants'
import reducer, {
  enterpriseLabStaffCounts,
  getDashboardCounts,
  getDashboardNewDetails,
  getStarterPlanUserDashboardDetails,
  getVendorDashboardCounts,
  postDismissEvent,
  postPendingPatientList,
  postThingsToDoPatientList,
  postUpcomingAlignersChangePatientList,
} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import apiHelper from '@utils/apiHelper'
import {
  URL_DASHBOARD_COUNTS_LIST,
  URL_DASHBOARD_DATA,
  URL_DASHBOARD_DISMISS_EVENT,
  URL_DASHBOARD_NEW_DATA,
  URL_DASHBOARD_ORDER_COUNTS_LIST,
  URL_DASHBOARD_PENDING_PATIENTS,
  URL_DASHBOARD_THINGS_TO_DO_PATIENTS,
  URL_DASHBOARD_UPCOMING_ALIGNER,
  URL_PRACTICE_DASHBOARD_DATA,
} from 'redux/Endpoints/apiEndpoints'

jest.mock('@utils/apiHelper', () => jest.fn())

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const baseThunkArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

const setMockStorage = () => {
  const store: Record<string, string> = {}
  const storage = {
    getItem: jest.fn((key: string) => (key in store ? store[key] : null)),
    setItem: jest.fn((key: string, val: string) => {
      store[key] = val
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((k) => delete store[k])
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
  }
  Object.defineProperty(window, 'localStorage', {value: storage, writable: true})
  return storage
}

const initial = reducer(undefined, {type: '@@init'})

describe('DoctorDashboardSlice thunks', () => {
  let storage: Storage & {getItem: jest.Mock; setItem: jest.Mock}
  beforeEach(() => {
    storage = setMockStorage()
    storage.setItem('organizationId', '11')
    storage.setItem('profileId', '22')
    mockedApiHelper.mockReset()
    baseThunkArgs.dispatch.mockReset()
    baseThunkArgs.getState.mockReset()
  })

  it('fetches dashboard counts with org/profile headers', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {count: 1}} as any)
    const result = await getDashboardCounts({doctor_id: 5})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_DASHBOARD_COUNTS_LIST}5/11/22`,
      HttpMethod.GET
    )
    expect(result.payload).toEqual({count: 1})

    const pending = reducer(initial, getDashboardCounts.pending('id', {doctor_id: 5} as any))
    expect(pending.loadingCounts).toBe(true)
    const fulfilled = reducer(
      initial,
      getDashboardCounts.fulfilled({x: 1} as any, 'id', {doctor_id: 5} as any)
    )
    expect(fulfilled.countsData).toEqual({x: 1} as any)
  })

  it('posts pending patients and tracks errors', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {patients: []}} as any)
    await postPendingPatientList({doctor_id: 7})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_DASHBOARD_PENDING_PATIENTS, HttpMethod.POST, {
      doctor_id: 7,
    })
    const pending = reducer(initial, postPendingPatientList.pending('id', {doctor_id: 7} as any))
    expect(pending.loadingPendingPatients).toBe(true)
    const fulfilled = reducer(
      initial,
      postPendingPatientList.fulfilled({foo: 'bar'} as any, 'id', {doctor_id: 7} as any)
    )
    expect(fulfilled.dataPendingPatients).toEqual({foo: 'bar'} as any)
  })

  it('posts things-to-do patients with org id in query', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {actions: []}} as any)
    await postThingsToDoPatientList({doctor_id: 9, is_active: true})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_DASHBOARD_THINGS_TO_DO_PATIENTS}?is_active=true&doctor_id=9&organization_id=11`,
      HttpMethod.POST,
      {doctor_id: 9, is_active: true}
    )
  })

  it('dismisses events', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {ok: true}} as any)
    await postDismissEvent({actions_ids: [1, 2]})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_DASHBOARD_DISMISS_EVENT, HttpMethod.POST, {
      actions_ids: [1, 2],
    })
  })

  it('fetches upcoming aligner changes with org id', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {upcoming: []}} as any)
    await postUpcomingAlignersChangePatientList({doctor_id: 3})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_DASHBOARD_UPCOMING_ALIGNER}3/11`,
      HttpMethod.GET,
      {doctor_id: 3}
    )
  })

  it('fetches vendor dashboard counts', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {vendor: true}} as any)
    await getVendorDashboardCounts({doctor_id: 4})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_DASHBOARD_ORDER_COUNTS_LIST}4&organizationId=11&profileId=22`,
      HttpMethod.GET
    )
  })

  it('loads dashboard details and starter plan dashboards', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {dashboard_details: {a: 1}}} as any)
    const newDash = await getDashboardNewDetails({doctor_id: 1, roles: ['DOC'], plan_name: 'p'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_DASHBOARD_NEW_DATA, HttpMethod.POST, {
      doctor_id: 1,
      roles: ['DOC'],
      plan_name: 'p',
    })
    expect(newDash.payload).toEqual({dashboard_details: {a: 1}})

    mockedApiHelper.mockResolvedValueOnce({data: {dashboard_details: {b: 2}}} as any)
    const starter = await getStarterPlanUserDashboardDetails({
      doctor_id: 1,
      roles: ['DOC'],
      plan_name: 'starter',
    })(baseThunkArgs.dispatch, baseThunkArgs.getState, baseThunkArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_DASHBOARD_DATA, HttpMethod.POST, {
      doctor_id: 1,
      roles: ['DOC'],
      plan_name: 'starter',
    })
    expect(starter.payload).toEqual({dashboard_details: {b: 2}})

    const pendingNew = reducer(initial, getDashboardNewDetails.pending('id', {} as any))
    expect(pendingNew.loadingNewDashboard).toBe(true)
    const fulfilledNew = reducer(
      initial,
      getDashboardNewDetails.fulfilled({dashboard_details: {x: 9}} as any, 'id', {} as any)
    )
    expect(fulfilledNew.newDashboard).toEqual({x: 9})
    const fulfilledStarter = reducer(
      initial,
      getStarterPlanUserDashboardDetails.fulfilled(
        {dashboard_details: {y: 7}} as any,
        'id',
        {} as any
      )
    )
    expect(fulfilledStarter.dashboard).toEqual({y: 7})
  })

  it('fetches enterprise lab staff counts', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {lab: true}} as any)
    await enterpriseLabStaffCounts({doctor_id: 10, role: 'LAB_STAFF'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(URL_PRACTICE_DASHBOARD_DATA, HttpMethod.POST, {
      doctor_id: 10,
      role: 'LAB_STAFF',
    })

    const pending = reducer(initial, enterpriseLabStaffCounts.pending('id', {doctor_id: 10} as any))
    expect(pending.loadingEnterpriseLabStaffCounts).toBe(true)
    const fulfilled = reducer(
      initial,
      enterpriseLabStaffCounts.fulfilled({ok: true} as any, 'id', {doctor_id: 10} as any)
    )
    expect(fulfilled.enterpriseLabStaffCountsData).toEqual({ok: true})
  })
})
