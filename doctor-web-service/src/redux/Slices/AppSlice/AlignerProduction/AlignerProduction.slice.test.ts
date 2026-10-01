import reducer, {
  changeMultiStatus,
  getAlignerProductionData,
  getAllProductOptionList,
  getStatusList,
} from './AlignerProduction.slice'
import apiHelper from '@utils/apiHelper'

jest.mock('@utils/apiHelper')
const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>

describe('AlignerProduction slice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('merges owner and vendor product lists in thunk', async () => {
    mockedApiHelper.mockResolvedValueOnce({
      data: {
        owner_products: [{product_name: 'Owner', id: 1}],
        vendor_products: [{product_name: 'Vendor', id: 2}],
      },
    })

    const thunk = getAllProductOptionList({
      owner_profile_id: 1,
      vendor_profile_ids: [],
      product_type: 'ALIGNER',
      search: '',
    })
    const dispatch = jest.fn()

    const result = await thunk(dispatch, () => ({}) as any, undefined)

    expect(result.type).toBe(getAllProductOptionList.fulfilled.type)
    expect(result.payload).toEqual([
      {label: 'Owner', value: 1},
      {label: 'Vendor', value: 2},
    ])
  })

  it('reducer toggles loading and stores product list', () => {
    const pendingState = reducer(undefined, {type: getAllProductOptionList.pending.type})
    expect(pendingState.loadingAllProductList).toBe(true)

    const fulfilledState = reducer(pendingState, {
      type: getAllProductOptionList.fulfilled.type,
      payload: [{label: 'x', value: 1}],
    })
    expect(fulfilledState.loadingAllProductList).toBe(false)
    expect(fulfilledState.allProductList).toEqual([{label: 'x', value: 1}])

    const rejectedState = reducer(pendingState, {type: getAllProductOptionList.rejected.type})
    expect(rejectedState.loadingAllProductList).toBe(false)
  })

  it('handles aligner production data with and without label filter', () => {
    const basePayload = {data: {items: []}, countsData: [{id: 1}]} as any

    const fulfilledState = reducer(undefined, {
      type: getAlignerProductionData.fulfilled.type,
      payload: basePayload,
      meta: {arg: {filter_by_label_name: null}},
    })
    expect(fulfilledState.allAlignerData).toEqual({items: []})
    expect(fulfilledState.countsStatusData).toEqual([{id: 1}])
    expect(fulfilledState.loadingAllAlignerData).toBe(false)

    const filteredState = reducer(undefined, {
      type: getAlignerProductionData.fulfilled.type,
      payload: basePayload,
      meta: {arg: {filter_by_label_name: 'ONLY_ONE'}},
    })
    expect(filteredState.countsStatusData).toEqual([])
    expect(filteredState.allAlignerData).toEqual({items: []})
  })

  it('sets status list and metadata uppercased and sorted', () => {
    const payload = {
      optionList: [
        {label: 'first', value: 1},
        {label: 'second', value: 2},
      ],
      workflowId: 10,
      statusMeta: [
        {label_name: 'B', color: '#222', position: 5},
        {label_name: 'A', color: '#111', position: 1},
      ],
    }

    const state = reducer(undefined, {type: getStatusList.fulfilled.type, payload})

    expect(state.loadingStatus).toBe(false)
    expect(state.workflowId).toBe(10)
    expect(state.statusList).toEqual([
      {label: 'FIRST', value: 1},
      {label: 'SECOND', value: 2},
    ])
    expect(state.statusMeta).toEqual([
      {label_name: 'A', color: '#111', position: 1},
      {label_name: 'B', color: '#222', position: 5},
    ])
  })

  it('changeMultiStatus thunk passes through api response', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {ok: true}})
    const thunk = changeMultiStatus({} as any)
    const result = await thunk(jest.fn(), () => ({}) as any, undefined)
    expect(result.payload).toEqual({ok: true})
    expect(mockedApiHelper).toHaveBeenCalled()
  })
})
