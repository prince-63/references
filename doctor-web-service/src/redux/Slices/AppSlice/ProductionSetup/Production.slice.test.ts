import HttpMethod from '@constants/httpMethods.constants'
import reducer, {
  addShippingDetails,
  assignServiceProduct,
  attachShippingDetails,
  getProductList,
  getTaskList,
  moveTaskCard,
  setClearProductionSetupData,
  setInstructions,
  setManufacturingData,
  setProductSelected,
  setProductType,
  setShipping,
  updateProductEnabledState,
  updateShippingDetails,
} from './Production.slice'
import apiHelper from '@utils/apiHelper'

jest.mock('@utils/apiHelper', () => jest.fn())

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const baseArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

beforeEach(() => {
  mockedApiHelper.mockReset()
  baseArgs.dispatch.mockReset()
  baseArgs.getState.mockReset()
})

describe('ProductionSetup slice reducers', () => {
  it('initializes with defaults', () => {
    const state = reducer(undefined, {type: 'init'})
    expect(state.productType).toBe('IN_HOUSE')
    expect(state.loadingProduct).toBe(false)
    expect(state.productSelected).toBeNull()
  })

  it('updates basic fields', () => {
    const state = reducer(undefined, setProductType('OUTSOURCE'))
    expect(state.productType).toBe('OUTSOURCE')

    const selectedState = reducer(undefined, setProductSelected({id: 1} as any))
    expect(selectedState.productSelected?.id).toBe(1)

    const instructionsState = reducer(undefined, setInstructions('pack carefully'))
    expect(instructionsState.instructions).toBe('pack carefully')

    const manufacturingState = reducer(
      undefined,
      setManufacturingData({batchType: 'IMMEDIATE', upper_start: 1} as any)
    )
    expect(manufacturingState.manufacturingData.batchType).toBe('IMMEDIATE')

    const shippingState = reducer(
      undefined,
      setShipping({name: 'Dr', address_line: '123', default: true} as any)
    )
    expect(shippingState.shipping?.name).toBe('Dr')
  })

  it('clears production setup data', () => {
    const populatedState = reducer(
      {
        ...reducer(undefined, {type: 'init'}),
        productType: 'OUTSOURCE',
        productSelected: {id: 2} as any,
        instructions: 'note',
        manufacturingData: {batchType: 'IMMEDIATE'} as any,
        shipping: {name: 'Dr'} as any,
        loadingProduct: true,
      },
      setClearProductionSetupData()
    )

    expect(populatedState.productSelected).toBeNull()
    expect(populatedState.productType).toBe('IN_HOUSE')
    expect(populatedState.instructions).toBe('')
    expect(populatedState.shipping).toBeNull()
    expect(populatedState.loadingProduct).toBe(false)
    expect(populatedState.manufacturingData.batchType).toBe('IN_BATCHES')
  })

  it('updates enabled state across owner and vendor lists', () => {
    const base = reducer(undefined, {type: 'init'})
    const withProducts = {
      ...base,
      productList: {
        owner_products: [{id: 1, is_product_enabled: false} as any],
        vendor_products: [{id: 2, is_product_enabled: true} as any],
      },
    }

    const ownerState = reducer(
      withProducts,
      updateProductEnabledState({productId: 1, isEnabled: true})
    )
    expect(ownerState.productList.owner_products?.[0].is_product_enabled).toBe(true)

    const vendorState = reducer(
      withProducts,
      updateProductEnabledState({productId: 2, isEnabled: false})
    )
    expect(vendorState.productList.vendor_products?.[0].is_product_enabled).toBe(false)
  })
})

describe('ProductionSetup extra reducers', () => {
  it('handles product list lifecycle', () => {
    const pendingState = reducer(
      undefined,
      getProductList.pending('req', {
        owner_profile_id: 1,
        vendor_profile_ids: [],
        product_type: 'ALIGNER',
        search: '',
      })
    )
    expect(pendingState.loadingProduct).toBe(true)

    const fulfilledState = reducer(
      pendingState,
      getProductList.fulfilled({owner_products: [], vendor_products: []} as any, 'req', {
        owner_profile_id: 1,
        vendor_profile_ids: [],
        product_type: 'ALIGNER',
        search: '',
      })
    )
    expect(fulfilledState.loadingProduct).toBe(false)
    expect(fulfilledState.productList.owner_products).toEqual([])

    const rejectedState = reducer(
      pendingState,
      getProductList.rejected(null as any, 'req', {
        owner_profile_id: 1,
        vendor_profile_ids: [],
        product_type: 'ALIGNER',
        search: '',
      })
    )
    expect(rejectedState.loadingProduct).toBe(false)
  })

  it('handles assign service product lifecycle', () => {
    const pendingState = reducer(
      undefined,
      assignServiceProduct.pending('req', {
        product_id: 1,
        owner_profile_id: 2,
        assignee_profile_id: 3,
      })
    )
    expect(pendingState.assigningServiceProduct).toBe(true)

    const doneState = reducer(
      pendingState,
      assignServiceProduct.fulfilled('ok' as any, 'req', {
        product_id: 1,
        owner_profile_id: 2,
        assignee_profile_id: 3,
      })
    )
    expect(doneState.assigningServiceProduct).toBe(false)

    const rejectedState = reducer(
      pendingState,
      assignServiceProduct.rejected(null as any, 'req', {
        product_id: 1,
        owner_profile_id: 2,
        assignee_profile_id: 3,
      })
    )
    expect(rejectedState.assigningServiceProduct).toBe(false)
  })
})

describe('ProductionSetup thunks', () => {
  it('fetches task list', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {tasks: []}})

    const result = await getTaskList({order_type: 'TYPE', doctor_id: 1, workflow_name: 'WF'})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )

    expect(mockedApiHelper).toHaveBeenCalledWith(expect.any(String), HttpMethod.POST, {
      order_type: 'TYPE',
      doctor_id: 1,
      workflow_name: 'WF',
    })
    expect(result.payload).toEqual({tasks: []})
  })

  it('assigns service product and returns rejectWithValue payload on error', async () => {
    mockedApiHelper.mockRejectedValueOnce({response: {data: {error_code: 'E1'}}})

    const result = await assignServiceProduct({
      product_id: 1,
      owner_profile_id: 2,
      assignee_profile_id: 3,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(result.type).toMatch(/rejected$/)
    expect(result.payload).toBe('E1')
  })

  it('moves task card and surfaces errors', async () => {
    mockedApiHelper.mockRejectedValueOnce({response: {data: {error_code: 'MOVE_ERR'}}})

    const result = await moveTaskCard({
      task_id: 1,
      doctor_id: 1,
      workflow_status_id: 2,
      patient_id: 3,
      workflow_id: 4,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(result.payload).toBe('MOVE_ERR')
  })

  it('gets product list respecting showAll flag', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {owner_products: [], vendor_products: []}})

    const result = await getProductList({
      owner_profile_id: 1,
      vendor_profile_ids: [],
      product_type: 'SERVICE',
      search: 'foo',
      showAll: true,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(expect.any(String), HttpMethod.POST, {
      owner_profile_id: 1,
      vendor_profile_ids: [],
      product_type: 'SERVICE',
      search: 'foo',
      showAll: true,
      is_product_enabled: null,
    })
    expect(result.payload).toEqual({owner_products: [], vendor_products: []})
  })

  it('adds and attaches shipping details', async () => {
    mockedApiHelper
      .mockRejectedValueOnce({response: {data: {error_code: 'SHIP_ERR'}}})
      .mockResolvedValueOnce({data: 'attached'})

    const addResult = await addShippingDetails({
      profile_id: 1,
      treatement_plan_id: 't1',
      addressed_to: 'A',
      name: 'N',
      address_line: 'Addr',
      country: 'C',
      state: 'S',
      city: 'City',
      pincode: '123',
      default: false,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(addResult.payload).toBe('SHIP_ERR')

    const attachResult = await attachShippingDetails({treatment_plan_id: 2, shipping_id: 3})(
      baseArgs.dispatch,
      baseArgs.getState,
      baseArgs.extra
    )
    expect(attachResult.payload).toBe('attached')
  })

  it('keeps shipping_id in the update shipping payload', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {saved: true}})

    await updateShippingDetails({
      shipping_id: 4586,
      profile_id: 2052,
      customer_profile_id: 2841,
      treatement_plan_id: undefined,
      addressed_to: 'Williams',
      name: 'U.S. Route 66',
      mobile_number: '',
      address_line: 'U.S. Route 66, Albuquerque, NM, USA',
      country: 'United States',
      state: 'New Mexico',
      city: 'Albuquerque',
      pincode: '400072',
      default: true,
    })(baseArgs.dispatch, baseArgs.getState, baseArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(
      expect.stringContaining('/patient/shipping/v1/4586'),
      HttpMethod.PUT,
      expect.objectContaining({
        shipping_id: 4586,
        profile_id: 2052,
        customer_profile_id: 2841,
      })
    )
  })
})
