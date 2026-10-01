import reducer, {applyFilterSort, postApiDataProductionSlice} from './production.slice'

describe('production.slice', () => {
  const baseState = reducer(undefined, {type: 'init'})

  const sampleOrders = [
    {
      id: 1,
      patient: {first_name: 'Alice', last_name: 'Zephyr'},
      reminders: [],
      aligner_journey: {brand: 'BrandA'},
      aligners_with_status: {},
    },
    {
      id: 2,
      patient: {first_name: 'Bob', last_name: 'Young'},
      reminders: [],
      aligner_journey: {brand: 'BrandB'},
      aligners_with_status: {},
    },
  ] as any

  it('initializes with defaults and handles pending state', () => {
    expect(baseState.productionOrders).toBeNull()
    expect(baseState.loading).toBe(false)

    const pending = reducer(
      baseState,
      postApiDataProductionSlice.pending('req', {doctorId: 1, status: ''} as any)
    )
    expect(pending.loading).toBe(true)
    expect(pending.error).toBeNull()
  })

  it('stores production orders on success', () => {
    const payload = {orders: sampleOrders, pagination: {page_number: 1}}
    const fulfilled = reducer(
      {...baseState, loading: true},
      postApiDataProductionSlice.fulfilled(payload as any, 'req', {doctorId: 1, status: ''} as any)
    )
    expect(fulfilled.loading).toBe(false)
    expect(fulfilled.productionOrders).toEqual(payload)
    expect(fulfilled.filteredOrders).toEqual(sampleOrders)
  })

  it('captures errors on failure', () => {
    const rejected = reducer(
      {...baseState, loading: true},
      postApiDataProductionSlice.rejected(
        'err' as any,
        'req',
        {doctorId: 1, status: ''} as any,
        'bad request'
      )
    )
    expect(rejected.loading).toBe(false)
    expect(rejected.error).toBe('bad request')
  })

  it('filters orders by brand via applyFilterSort', () => {
    const stateWithOrders = {
      ...baseState,
      productionOrders: {orders: sampleOrders},
      filteredOrders: null,
      filterCount: 0,
    }

    const filtered = reducer(
      stateWithOrders,
      applyFilterSort({
        alignerBrands: ['BrandB'],
        reminderSet: '',
        reminderSort: '',
        startDateSort: '',
        dueDateSort: '',
        status: 'TODO' as any,
      })
    )

    expect(filtered.filterCount).toBe(1)
    expect(filtered.filteredOrders?.length).toBe(1)
    expect(filtered.filteredOrders?.[0].aligner_journey.brand).toBe('BrandB')
  })
})
