import reducer, {
  changeMultiStatus,
  getAlignerProductionData,
  getAllProductOptionList,
  getStatusList,
} from './AlignerProduction.slice'
import apiHelper from '@utils/apiHelper'

jest.mock('@utils/apiHelper')
const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>

describe('AlignerTracking slice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('merges owner and vendor product lists', async () => {
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

    const result = await thunk(jest.fn(), () => ({}) as any, undefined)

    expect(result.payload).toEqual([
      {label: 'Owner', value: 1},
      {label: 'Vendor', value: 2},
    ])
  })

  it('aligner production data updates counts when no filter', () => {
    const basePayload = {data: {rows: []}, countsData: [{x: 1}]} as any

    const fulfilled = reducer(undefined, {
      type: getAlignerProductionData.fulfilled.type,
      payload: basePayload,
      meta: {arg: {filter_by_label_name: null}},
    })
    expect(fulfilled.allAlignerData).toEqual({rows: []})
    expect(fulfilled.countsStatusData).toEqual([{x: 1}])

    const filtered = reducer(undefined, {
      type: getAlignerProductionData.fulfilled.type,
      payload: basePayload,
      meta: {arg: {filter_by_label_name: 'X'}},
    })
    expect(filtered.countsStatusData).toEqual([])
  })

  it('status list fulfilled stores workflow id and options', () => {
    const payload = {
      optionList: [{label: 'Alpha', value: 1}],
      workflowId: 5,
    }
    const state = reducer(undefined, {type: getStatusList.fulfilled.type, payload})
    expect(state.statusList).toEqual([{label: 'Alpha', value: 1}])
    expect(state.workflowId).toBe(5)
  })

  it('changeMultiStatus thunk returns api data', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {ok: true}})
    const thunk = changeMultiStatus({} as any)
    const result = await thunk(jest.fn(), () => ({}) as any, undefined)
    expect(result.payload).toEqual({ok: true})
  })
})
