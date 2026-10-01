import reducer, {
  resetOrderFilters,
  setIsLabSelected,
  setIsShowCancelOrderModal,
  setIsShowNeedMoreInfoModal,
} from './orders.slice'
import {getActiveUsers, getOrderDetails, getOrderDetailsList} from './orders.slice'

describe('orders slice reducers', () => {
  const initialState = reducer(undefined, {type: '@@INIT'})

  it('resets order filters to defaults', () => {
    const dirty = {
      ...initialState,
      orderFilters: {filterByOrderStatus: 'X', filterByDueBy: 'Y', filterByAssignedUser: 'Z'},
    }
    const next = reducer(dirty, resetOrderFilters())
    expect(next.orderFilters).toEqual({
      filterByOrderStatus: 'ALL',
      filterByDueBy: 'ALL',
      filterByAssignedUser: 'ALL',
    })
  })

  it('resets unprocessed order filters', () => {
    const dirty = {
      ...initialState,
      orderUnprocessedFilters: {selected_customer: 'c', filterDueBy: 'X'},
    }
    const action = {type: 'orders/resetUnprocessedOrderFilters'}
    const next = reducer(dirty, action as any)
    expect(next.orderUnprocessedFilters).toEqual({selected_customer: null, filterDueBy: 'ALL'})
  })

  it('tracks loading for order details based on updateLoadingState flag', () => {
    const pending = getOrderDetails.pending('req', {
      doctor_id: 1,
      order_id: '1',
      updateLoadingState: true,
    } as any)
    const stateAfterPending = reducer(initialState, pending)
    expect(stateAfterPending.loadingOrder).toBe(true)

    const fulfilled = getOrderDetails.fulfilled(
      {data: {id: 1}, updateLoadingState: false} as any,
      'req',
      {updateLoadingState: false} as any
    )
    const stateAfterFulfilled = reducer(stateAfterPending, fulfilled)
    expect(stateAfterFulfilled.loadingOrder).toBe(true)
    expect(stateAfterFulfilled.order).toEqual({id: 1})
  })

  it('sets active users and clears loading flags', () => {
    const pending = getActiveUsers.pending('req', {data: {}} as any)
    const afterPending = reducer(initialState, pending)
    expect(afterPending.loadingActiveUsers).toBe(true)

    const fulfilled = getActiveUsers.fulfilled([{value: 1, label: 'Clinic'}] as any, 'req', {
      data: {},
    } as any)
    const afterFulfilled = reducer(afterPending, fulfilled)
    expect(afterFulfilled.loadingActiveUsers).toBe(false)
    expect(afterFulfilled.activeUsers).toEqual([{value: 1, label: 'Clinic'}])
  })

  it('respects updateLoadingState=false for order list loading', () => {
    const pending = getOrderDetailsList.pending('req', {updateLoadingState: false} as any)
    const afterPending = reducer(initialState, pending)
    expect(afterPending.loadingOrderList).toBe(false)

    const fulfilled = getOrderDetailsList.fulfilled(
      {
        data: {order_details: ['x'], pagination_details: {}} as any,
        updateLoadingState: false,
      } as any,
      'req',
      {updateLoadingState: false} as any
    )
    const afterFulfilled = reducer(afterPending, fulfilled)
    expect(afterFulfilled.loadingOrderList).toBe(false)
    expect(afterFulfilled.orderList.order_details).toEqual(['x'])
  })

  it('toggles simple flags', () => {
    const withLab = reducer(initialState, setIsLabSelected(true))
    const withCancel = reducer(withLab, setIsShowCancelOrderModal(true))
    const withNeedMoreInfo = reducer(withCancel, setIsShowNeedMoreInfoModal(true))
    expect(withNeedMoreInfo.isLabSelected).toBe(true)
    expect(withNeedMoreInfo.isShowCancelOrderModal).toBe(true)
    expect(withNeedMoreInfo.isShowNeedMoreInfoModal).toBe(true)
  })
})
