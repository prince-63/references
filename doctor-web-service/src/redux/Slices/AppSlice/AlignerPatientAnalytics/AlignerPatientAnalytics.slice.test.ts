import reducer, {
  getAlignerAnalyticsCountsData,
  getAlignerPatientAnalyticsList,
  getPatientListAll,
  setIsAlignerUpdates,
  setOpenRemindDrawer,
  setPatientsList,
  setRemindAll,
  setSelectedFilter,
} from './AlignerPatientAnalytics.slice'
import apiHelper from '@utils/apiHelper'

jest.mock('@utils/apiHelper')
const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>

describe('AlignerPatientAnalytics slice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('reducers update flags and lists', () => {
    let state = reducer(undefined, {type: 'init'})

    state = reducer(state, setIsAlignerUpdates(true))
    expect(state.isAlignerUpdates).toBe(true)

    state = reducer(state, setSelectedFilter('NEED_ATTENTION' as any))
    expect(state.selectedFilter).toBe('NEED_ATTENTION')

    state = reducer(state, setRemindAll(true))
    expect(state.isRemindAll).toBe(true)

    state = reducer(state, setOpenRemindDrawer(true))
    expect(state.openRemindDrawer).toBe(true)

    state = reducer(state, setPatientsList([{patient_id: 1} as any]))
    expect(state.patientsList).toEqual([{patient_id: 1}])
  })

  it('handles analytics list fulfilment and rejection', () => {
    const stateAfterFulfilled = reducer(undefined, {
      type: getAlignerPatientAnalyticsList.fulfilled.type,
      payload: {rows: []},
    })
    expect(stateAfterFulfilled.dataList).toEqual({rows: []})
    expect(stateAfterFulfilled.loadingList).toBe(false)

    const stateAfterRejected = reducer(undefined, {
      type: getAlignerPatientAnalyticsList.rejected.type,
    })
    expect(stateAfterRejected.loadingList).toBe(false)
  })

  it('maps patient list all to label/value', () => {
    const state = reducer(undefined, {
      type: getPatientListAll.fulfilled.type,
      payload: [
        {label: 'Alice', value: 1},
        {label: 'Bob', value: 2},
      ],
    })

    expect(state.dataAllList).toEqual([
      {label: 'Alice', value: 1},
      {label: 'Bob', value: 2},
    ])
    expect(state.loadingAllList).toBe(false)
  })

  it('handles counts data fulfilment and rejection', () => {
    const countsPayload = {patient_compliance: {on_track: 1}} as any
    const fulfilledState = reducer(undefined, {
      type: getAlignerAnalyticsCountsData.fulfilled.type,
      payload: countsPayload,
    })
    expect(fulfilledState.dataCounts).toBe(countsPayload)
    expect(fulfilledState.loadingCounts).toBe(false)

    const rejectedState = reducer(undefined, {type: getAlignerAnalyticsCountsData.rejected.type})
    expect(rejectedState.loadingCounts).toBe(false)
  })

  it('getPatientListAll thunk maps list and returns payload', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: [{patient_id: 10, patient_full_name: 'Zoe'}]})

    const thunk = getPatientListAll({doctor_id: 1, filter: null})
    const dispatch = jest.fn()

    const result = await thunk(dispatch, () => ({}) as any, undefined)

    expect(result.type).toBe(getPatientListAll.fulfilled.type)
    expect(result.payload).toEqual([{label: 'Zoe', value: 10}])
    expect(mockedApiHelper).toHaveBeenCalled()
  })

  it('getPatientListAll thunk rejects with error code on failure', async () => {
    mockedApiHelper.mockRejectedValueOnce({response: {data: {error_code: 'E001'}}})

    const thunk = getPatientListAll({doctor_id: 1, filter: null})
    const dispatch = jest.fn()

    const result = await thunk(dispatch, () => ({}) as any, undefined)

    expect(result.type).toBe(getPatientListAll.rejected.type)
    expect(result.payload).toBe('E001')
  })
})
