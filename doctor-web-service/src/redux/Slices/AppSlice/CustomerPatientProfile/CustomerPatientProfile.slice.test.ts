import reducer, {
  getVspPatientPlanningStepper,
  setVspPatientOrderStatus,
} from './CustomerPatientProfile.slice'

describe('CustomerPatientProfile slice reducer', () => {
  const baseState = reducer(undefined, {type: '@@INIT'})

  it('updates the VSP order status locally for immediate UI refresh', () => {
    const seeded = {
      ...baseState,
      active_order_id: 'ORDER-1',
      vsp_stepper: {
        order_id: 'ORDER-1',
        order_status: 'APPROVED',
      },
    }

    const updated = reducer(seeded, setVspPatientOrderStatus('COMPLETED'))

    expect(updated.vsp_stepper).toEqual({
      order_id: 'ORDER-1',
      order_status: 'COMPLETED',
    })
  })

  it('stores the latest VSP stepper payload from the API', () => {
    const payload = {
      order_id: 'ORDER-2',
      order_status: 'COMPLETED',
    }

    const pendingState = reducer(
      baseState,
      getVspPatientPlanningStepper.pending('req', {order_id: 'ORDER-2'})
    )

    const updated = reducer(
      pendingState,
      getVspPatientPlanningStepper.fulfilled(payload, 'req', {order_id: 'ORDER-2'})
    )

    expect(updated.loadingVspStatus).toBe(false)
    expect(updated.vsp_stepper).toEqual(payload)
  })

  it('ignores stale VSP stepper responses from older requests', () => {
    const seededState = {
      ...baseState,
      vsp_stepper: {
        order_id: 'ORDER-2',
        order_status: 'COMPLETED',
      },
    }

    const pendingLatestState = reducer(
      reducer(seededState, getVspPatientPlanningStepper.pending('req-1', {order_id: 'ORDER-1'})),
      getVspPatientPlanningStepper.pending('req-2', {order_id: 'ORDER-2'})
    )

    const updated = reducer(
      pendingLatestState,
      getVspPatientPlanningStepper.fulfilled(
        {
          order_id: 'ORDER-1',
          order_status: 'DRAFT',
        },
        'req-1',
        {order_id: 'ORDER-1'}
      )
    )

    expect(updated.loadingVspStatus).toBe(true)
    expect(updated.vsp_stepper).toEqual({
      order_id: 'ORDER-2',
      order_status: 'COMPLETED',
    })
  })
})
