import reducer, {
  setEditingProductData,
  setServices,
  updateServiceFlag,
  updateServiceToggle,
  getServicePermissions,
  getCategoryList,
  getServiceProduct,
  getCustomerProducts,
  assignServiceProduct,
  removeAssignedServiceProduct,
} from './services.slice'

describe('services.slice reducer', () => {
  const baseState = reducer(undefined, {type: 'init'})

  it('returns the initial state shape', () => {
    expect(baseState.loading).toBe(false)
    expect(baseState.services.outsourced_aligners).toBe(true)
    expect(baseState.editingProductData).toBeNull()
  })

  it('sets product draft data and updates services map', () => {
    const product = {id: 7, product_name: 'Basic'} as any
    const withDraft = reducer(baseState, setEditingProductData(product))
    expect(withDraft.editingProductData).toEqual(product)

    const newServices = {planning: false} as any
    const replaced = reducer(withDraft, setServices(newServices))
    expect(replaced.services).toEqual(newServices)

    const toggled = reducer(baseState, updateServiceFlag({key: 'planning', value: false}))
    expect(toggled.services.planning).toBe(false)
    expect(toggled.services.outsourced_aligners).toBe(true)
  })

  it('handles service permissions lifecycle', () => {
    const pending = reducer(baseState, getServicePermissions.pending('req', {profile_id: 1}))
    expect(pending.loading).toBe(true)

    const payload = {planning: true}
    const fulfilled = reducer(
      pending,
      getServicePermissions.fulfilled(payload as any, 'req', {profile_id: 1} as any)
    )
    expect(fulfilled.loading).toBe(false)
    expect(fulfilled.data).toEqual(payload)
  })

  it('updates category list and product list flags', () => {
    const categories = [{value: 1, label: 'Aligner', category_type: 'SERVICE' as const}]
    const catState = reducer(
      baseState,
      getCategoryList.fulfilled(categories as any, 'req', {profile_id: 1} as any)
    )
    expect(catState.categoryList).toEqual(categories)
    expect(catState.loadingCategoryList).toBe(false)

    const pendingProducts = reducer(
      baseState,
      getServiceProduct.pending('req', {product_type: null, profile_id: 2} as any)
    )
    expect(pendingProducts.loadingProductList).toBe(true)

    const productList = [{product_name: 'X'}] as any
    const withProducts = reducer(
      pendingProducts,
      getServiceProduct.fulfilled(productList, 'req', {product_type: null, profile_id: 2} as any)
    )
    expect(withProducts.loadingProductList).toBe(false)
    expect(withProducts.productList).toEqual(productList)
  })

  it('tracks customer products loading and assignment toggles', () => {
    const pendingCustomers = reducer(
      baseState,
      getCustomerProducts.pending('req', {profileId: 9} as any)
    )
    expect(pendingCustomers.loadingCustomerProducts).toBe(true)

    const products = [{id: 9}] as any
    const fulfilled = reducer(
      pendingCustomers,
      getCustomerProducts.fulfilled(products, 'req', {profileId: 9} as any)
    )
    expect(fulfilled.customerProducts).toEqual(products)
    expect(fulfilled.loadingCustomerProducts).toBe(false)

    const assigning = reducer(baseState, assignServiceProduct.pending('req', {} as any))
    expect(assigning.assigningServiceProduct).toBe(true)
    const afterAssignError = reducer(
      assigning,
      assignServiceProduct.rejected('err' as any, 'req', {} as any)
    )
    expect(afterAssignError.assigningServiceProduct).toBe(false)

    const removing = reducer(
      baseState,
      removeAssignedServiceProduct.pending('req', {assigneeId: 1, ownerId: 2, productId: 3} as any)
    )
    expect(removing.removingAssignedServiceProduct).toBe(true)
    const removed = reducer(
      removing,
      removeAssignedServiceProduct.fulfilled({}, 'req', {
        assigneeId: 1,
        ownerId: 2,
        productId: 3,
      } as any)
    )
    expect(removed.removingAssignedServiceProduct).toBe(false)
  })

  it('sets loading flag for service toggle pending and clears on rejection', () => {
    const pending = reducer(
      baseState,
      updateServiceToggle.pending('req', {key: 'offer_planning', value: false} as any)
    )
    expect(pending.loading).toBe(true)

    const rejected = reducer(
      pending,
      updateServiceToggle.rejected('err' as any, 'req', {
        key: 'offer_planning',
        value: false,
      } as any)
    )
    expect(rejected.loading).toBe(false)
  })
})
