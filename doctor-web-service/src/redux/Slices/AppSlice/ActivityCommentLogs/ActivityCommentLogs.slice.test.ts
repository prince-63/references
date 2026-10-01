import reducer, {
  getActivityCommentLogs,
  resetActivityCommentLogs,
} from './ActivityCommentLogs.slice'
import apiHelper from '@utils/apiHelper'

jest.mock('@utils/apiHelper')
const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>

const samplePayload = {
  content: [{type: 'COMMENT', title: 't1'}],
  pageable: {sort: [], offset: 0, page_number: 0, page_size: 10, paged: true, unpaged: false},
  total_elements: 1,
  total_pages: 1,
  last: true,
  size: 10,
  number: 0,
  sort: [],
  number_of_elements: 1,
  first: true,
  empty: false,
} as any

describe('ActivityCommentLogs slice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets loading flags based on page number when pending', () => {
    const baseState = reducer(undefined, {type: 'init'})

    const firstPage = reducer(baseState, {
      type: getActivityCommentLogs.pending.type,
      meta: {arg: {page_number: 0}},
    })
    expect(firstPage.loading).toBe(true)
    expect(firstPage.loadingMore).toBe(false)
    expect(firstPage.error).toBeNull()

    const nextPage = reducer(baseState, {
      type: getActivityCommentLogs.pending.type,
      meta: {arg: {page_number: 2}},
    })
    expect(nextPage.loading).toBe(false)
    expect(nextPage.loadingMore).toBe(true)
  })

  it('replaces content on first page fulfilment', () => {
    const state = reducer(undefined, {
      type: getActivityCommentLogs.fulfilled.type,
      payload: samplePayload,
      meta: {arg: {page_number: 0}},
    })

    expect(state.data.content).toEqual(samplePayload.content)
    expect(state.loading).toBe(false)
    expect(state.loadingMore).toBe(false)
    expect(state.page).toBe(0)
    expect(state.hasMore).toBe(false)
  })

  it('merges content on load more fulfilment', () => {
    const initial = reducer(undefined, {
      type: getActivityCommentLogs.fulfilled.type,
      payload: {...samplePayload, content: [{type: 'COMMENT', title: 'existing'}], last: false},
      meta: {arg: {page_number: 0}},
    })

    const state = reducer(initial, {
      type: getActivityCommentLogs.fulfilled.type,
      payload: {...samplePayload, content: [{type: 'COMMENT', title: 'new'}], last: true},
      meta: {arg: {page_number: 1}},
    })

    expect(state.data.content).toEqual([
      {type: 'COMMENT', title: 'existing'},
      {type: 'COMMENT', title: 'new'},
    ])
    expect(state.page).toBe(1)
    expect(state.hasMore).toBe(false)
    expect(state.loading).toBe(false)
    expect(state.loadingMore).toBe(false)
  })

  it('handles rejected state with error message', () => {
    const state = reducer(undefined, {
      type: getActivityCommentLogs.rejected.type,
      payload: 'E001',
    })

    expect(state.loading).toBe(false)
    expect(state.loadingMore).toBe(false)
    expect(state.error).toBe('E001')
  })

  it('resets to initial state with resetActivityCommentLogs', () => {
    const dirtyState = reducer(undefined, {
      type: getActivityCommentLogs.fulfilled.type,
      payload: samplePayload,
    })

    const resetState = reducer(dirtyState, resetActivityCommentLogs())
    expect(resetState).toEqual(reducer(undefined, {type: 'init'}))
  })

  it('getActivityCommentLogs thunk returns data on success', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: samplePayload})

    const thunk = getActivityCommentLogs({patient_id: 123})
    const dispatch = jest.fn()

    const result = await thunk(dispatch, () => ({}) as any, undefined)

    expect(result.type).toBe(getActivityCommentLogs.fulfilled.type)
    expect(result.payload).toBe(samplePayload)
    expect(mockedApiHelper).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
      patient_id: 123,
    })
  })

  it('getActivityCommentLogs thunk returns reject value on failure', async () => {
    mockedApiHelper.mockRejectedValueOnce({response: {data: {error_code: 'ERR'}}})

    const thunk = getActivityCommentLogs({patient_id: 123})
    const dispatch = jest.fn()

    const result = await thunk(dispatch, () => ({}) as any, undefined)

    expect(result.type).toBe(getActivityCommentLogs.rejected.type)
    expect(result.payload).toBe('ERR')
  })
})
