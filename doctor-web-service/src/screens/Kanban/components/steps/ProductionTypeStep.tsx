import React, {useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import InputSearch from 'components/atom/Inputs/InputSearch'
import Page from 'components/page/Page'
import {ProductCard} from 'screens/Kanban/components/ProductCard'
import {isAlignersPlanningAndManufacturing, safeParseInt} from 'utils/ConstFunctions'
import {
  getProductList,
  setProductSelected,
  setProductType,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import moment from 'moment'
import {useNavigate, useParams} from 'react-router-dom'
import {getNewTreatmentList} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useActiveProfile from '@hooks/useActiveProfile'
import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import {getIndividualTask} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'

const ProductionTypeStep = ({prevSelectedProduct}: {prevSelectedProduct: Product | null}) => {
  const {dispatchAction} = useDispatchAction()
  const {profileId, userId} = useContext(AuthContext)
  const {patientId, treatmentId} = useParams()
  const {activeProfile} = useActiveProfile()
  const navigate = useNavigate()
  const {isPractice, isGrowthPlanUser} = useAllUserPlan()
  const {activeVendorsList} = useSelector((s: RootState) => s.orders)
  const {productList, loadingProduct} = useSelector((s: RootState) => s.productionSetup)
  const {plansList, loadingPlansList} = useSelector((s: RootState) => s.kanban)
  const [searchValue, setSearchValue] = useState('')
  const [productMode, setProductMode] = useState(
    isPractice
      ? 'OUTSOURCE'
      : isGrowthPlanUser
        ? prevSelectedProduct
          ? 'OUTSOURCE'
          : 'IN_HOUSE'
        : 'IN_HOUSE'
  )

  const [productListType, setProductListType] = useState<'ALIGNER' | 'MANUFACTURING_SERVICE'>(
    productMode === 'IN_HOUSE' ? 'ALIGNER' : 'MANUFACTURING_SERVICE'
  )
  const [ownerSelectedProductId, setOwnerSelectedProductId] = useState<number | null>(
    prevSelectedProduct ? prevSelectedProduct.id : null
  )
  const [vendorSelectedProductId, setVendorSelectedProductId] = useState<number | null>(
    prevSelectedProduct ? prevSelectedProduct.id : null
  )
  const {loadingWorkFlow} = useSelector((state: RootState) => state.workFlow)
  const {data: patientDetailsResponse} = useSelector(
    (state: RootState) => state.apiGetLeadsProfileDetails
  )

  const ownerProducts: Product[] = useMemo(
    () => (productList?.owner_products || []).filter(isAlignersPlanningAndManufacturing),
    [productList?.owner_products]
  )

  const vendorProducts: Product[] = useMemo(
    () => productList?.vendor_products || [],
    [productList?.vendor_products]
  )

  const selectedProductId = useMemo(() => {
    if (!prevSelectedProduct) return 0
    if (typeof prevSelectedProduct === 'string') {
      try {
        const parsed = JSON.parse(prevSelectedProduct)
        return safeParseInt(parsed?.id ?? parsed?.product_service_id)
      } catch {
        return 0
      }
    }
    return safeParseInt(
      (prevSelectedProduct as any)?.id ?? (prevSelectedProduct as any)?.product_service_id
    )
  }, [prevSelectedProduct])

  const effectiveSelectedProduct = useMemo(() => {
    if (!selectedProductId) return null
    const selected =
      ownerProducts.find((product) => product.id === selectedProductId) ||
      vendorProducts.find((product) => product.id === selectedProductId) ||
      null
    if (!selected) {
      return typeof prevSelectedProduct === 'object' ? prevSelectedProduct : null
    }
    if (typeof prevSelectedProduct !== 'object' || !prevSelectedProduct) return selected
    return {
      ...selected,
      product_name: prevSelectedProduct.product_name ?? selected.product_name,
      product_type: prevSelectedProduct.product_type ?? selected.product_type,
      product_description: prevSelectedProduct.product_description ?? selected.product_description,
      product_image: prevSelectedProduct.product_image ?? selected.product_image,
    }
  }, [selectedProductId, ownerProducts, vendorProducts, prevSelectedProduct])

  const baseProducts: Product[] = useMemo(
    () => (productMode === 'IN_HOUSE' ? ownerProducts : vendorProducts),
    [productMode, ownerProducts, vendorProducts]
  )

  const shouldAllowInHouseForGrowth = useMemo(
    () => isGrowthPlanUser && !effectiveSelectedProduct,
    [effectiveSelectedProduct, isGrowthPlanUser]
  )

  const shouldShowSelectionControls = !effectiveSelectedProduct || isGrowthPlanUser

  useEffect(() => {
    if (!patientId) return
    dispatchAction(
      getNewTreatmentList({
        patient_id: safeParseInt(patientId),
        doctor_id: safeParseInt(userId),
        treatment_subtype: 'ALIGNERS',
        order_id: null,
      }) as any
    )

    dispatchAction(
      getIndividualTask({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
      })
    )
  }, [patientId])

  useEffect(() => {
    if (!effectiveSelectedProduct) return
    if (isGrowthPlanUser) return
    const isOwnerProduct = ownerProducts.some(
      (product) => product.id === effectiveSelectedProduct.id
    )
    const isVendorProduct = vendorProducts.some(
      (product) => product.id === effectiveSelectedProduct.id
    )

    if (isOwnerProduct && !isPractice) {
      setProductMode('IN_HOUSE')
      setOwnerSelectedProductId(effectiveSelectedProduct.id)
      setVendorSelectedProductId(null)
    } else if (isVendorProduct || isPractice) {
      setProductMode('OUTSOURCE')
      setVendorSelectedProductId(effectiveSelectedProduct.id)
      setOwnerSelectedProductId(null)
    } else {
      setProductMode('IN_HOUSE')
      setOwnerSelectedProductId(effectiveSelectedProduct.id)
      setVendorSelectedProductId(null)
    }
  }, [effectiveSelectedProduct, ownerProducts, vendorProducts])

  useEffect(() => {
    if (!shouldAllowInHouseForGrowth) return
    setProductMode('IN_HOUSE')
    setProductListType('ALIGNER')
    onSearchProducts({search: '', product_type: 'ALIGNER'})
  }, [shouldAllowInHouseForGrowth])

  useEffect(() => {
    if (!isGrowthPlanUser) return
    if (!effectiveSelectedProduct) return
    if (productMode === 'OUTSOURCE') return
    setProductMode('OUTSOURCE')
    setProductListType('MANUFACTURING_SERVICE')
    onSearchProducts({search: '', product_type: 'MANUFACTURING_SERVICE'})
  }, [effectiveSelectedProduct, isGrowthPlanUser, productMode])

  const onSearchProducts = ({
    search = searchValue,
    product_type = 'ALIGNER',
  }: {
    search?: string
    product_type?: 'ALIGNER' | 'SERVICE' | 'MANUFACTURING_SERVICE'
  }) => {
    if (!profileId) return
    dispatchAction(
      getProductList({
        owner_profile_id: safeParseInt(isPractice ? activeProfile?.owner_profile_id : profileId),
        vendor_profile_ids: (activeVendorsList || []).map((vendor) => safeParseInt(vendor.value)),
        product_type: product_type,
        search: search,
      })
    )
  }

  useEffect(() => {
    if (!prevSelectedProduct || isGrowthPlanUser || isPractice) {
      onSearchProducts({
        product_type: productListType,
      })
    }
  }, [prevSelectedProduct, isGrowthPlanUser, productListType])

  return (
    <Spin
      indicator={<Spinner loading />}
      spinning={loadingProduct || loadingPlansList || loadingWorkFlow}
    >
      <div className='flex flex-col gap-6  pb-[70px] md:pb-0'>
        {/* Case Overview */}
        <div className='rounded-lg border border-mediumGray bg-white p-4'>
          <div className=' font-semibold '>Case Overview</div>

          <div className='flex md:flex-row flex-col md:gap-10 gap-4'>
            <div>
              <div className='text-sm font-medium text-textColor'>Order ID</div>
              <div className='font-normal'>
                {patientDetailsResponse?.getting_started_details?.order_id
                  ? `#${patientDetailsResponse.getting_started_details.order_id}`
                  : '-'}
              </div>
            </div>
            <div>
              <div className='text-sm font-medium text-textColor'>Patient Name</div>
              <div className='font-normal'>
                {patientDetailsResponse?.patient_details?.full_name || '-'}
              </div>
            </div>
            <div>
              <div className='text-sm font-medium text-textColor'>Patient ID</div>
              <div className='font-normal'>
                {patientDetailsResponse?.patient_details?.customer_mapped_id
                  ? `P${patientDetailsResponse?.patient_details?.customer_mapped_id}`
                  : '-'}
              </div>
            </div>
          </div>
        </div>
        <div className='rounded-lg border border-mediumGray bg-white p-4'>
          <div className=' font-semibold '>Finalized Plan Detail</div>
          <div className='text-sm text-textColor mb-3'>
            Select one approved treatment plan to proceed.
          </div>
          <div className='max-h-[50vh] overflow-y-auto space-y-3'>
            {plansList?.plans_list
              .filter(
                (plan) =>
                  String(plan.initiator_status || plan.approver_status).toUpperCase() ===
                    'APPROVED' && !plan.is_treatment_plan_created_on_cloned_order
              )
              .map((plan) => {
                const isSelected = String(plan.plan_id) === String(treatmentId)
                return (
                  <button
                    key={plan.plan_id}
                    type='button'
                    onClick={() => {
                      if (!patientId) return
                      if (!isSelected)
                        navigate(`/production-setup-stepper/${patientId}/${plan.plan_id}`)
                    }}
                    className={`w-full rounded-lg border p-4 text-left shadow-sm transition ${
                      isSelected ? 'border-primaryColor ' : 'border-gray-200'
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      <input
                        type='radio'
                        checked={isSelected}
                        readOnly
                        className='mt-1 h-5 w-5 rounded-full border-gray-300 text-primaryColor focus:ring-0'
                      />
                      <div className='flex-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <div className='font-semibold text-gray-900'>
                            {plan.treatment_plan_tag_name ?? plan?.treatment_plan_name}
                          </div>
                          <div className='text-gray-500'>{plan.version}</div>
                          <div className='ml-auto'>
                            <span className='whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200'>
                              Approved
                            </span>
                          </div>
                        </div>

                        <dl className='mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700 sm:grid-cols-2'>
                          <div className='flex gap-2'>
                            <dt className='text-gray-500'>Created:</dt>
                            <dd>
                              {plan.created_date
                                ? moment(plan.created_date).format('DD-MMM-YYYY')
                                : '-'}
                            </dd>
                          </div>
                          <div className='flex gap-2'>
                            <dt className='text-gray-500'>Stages:</dt>
                            <dd>{plan.stages}</dd>
                          </div>
                          {plan.upper_aligner_series && plan.upper_aligner_series !== '0-0' && (
                            <div className='flex gap-2 sm:col-span-2'>
                              <dt className='text-gray-500'>Upper Aligner Series:</dt>
                              <dd>{plan.upper_aligner_series}</dd>
                            </div>
                          )}
                          {plan.lower_aligner_series && plan.lower_aligner_series !== '0-0' && (
                            <div className='flex gap-2 sm:col-span-2'>
                              <dt className='text-gray-500'>Lower Aligner Series:</dt>
                              <dd>{plan.lower_aligner_series}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </button>
                )
              })}

            {(!plansList?.plans_list || !plansList?.plans_list?.length) && (
              <div className='rounded-xl border border-gray-200 p-4 text-sm text-gray-600'>
                No approved plans available.
              </div>
            )}
          </div>
        </div>
        {effectiveSelectedProduct && (
          <div className=' flex flex-col gap-4 rounded-lg border border-mediumGray bg-white p-4'>
            <div className=' font-semibold '>Selected Product</div>
            <Page loading={loadingProduct}>
              <div className='flex flex-wrap gap-4'>
                <ProductCard
                  key={`SELECTED-${effectiveSelectedProduct.id}`}
                  product={effectiveSelectedProduct}
                  variant={
                    safeParseInt((effectiveSelectedProduct as any)?.profile_id) ===
                    safeParseInt(profileId)
                      ? 'SELF'
                      : 'VENDOR'
                  }
                  selected={safeParseInt(
                    (effectiveSelectedProduct as any)?.id ??
                      (effectiveSelectedProduct as any)?.product_service_id
                  )}
                  setSelected={() => {}}
                />
              </div>
            </Page>
          </div>
        )}
        {/* Select Production Type */}
        {shouldShowSelectionControls && (
          <div className=' flex flex-col gap-4 rounded-lg border border-mediumGray bg-white p-4'>
            <div className=' font-semibold '>Select Production Type</div>
            <div className='text-sm text-neutral-600 mb-3'>
              Choose where production will take place and review the associated product.
            </div>
            <RadioGroupIcon
              options={
                isPractice
                  ? [{label: 'Outsource', value: 'OUTSOURCE'}]
                  : isGrowthPlanUser && !shouldAllowInHouseForGrowth
                    ? [{label: 'Outsource', value: 'OUTSOURCE'}]
                    : [
                        {label: 'In-House', value: 'IN_HOUSE'},
                        {label: 'Outsource', value: 'OUTSOURCE'},
                      ]
              }
              onOptionChange={(option) => {
                setProductMode(option as any)
                setProductListType(option === 'IN_HOUSE' ? 'ALIGNER' : 'MANUFACTURING_SERVICE')
                onSearchProducts({
                  search: '',
                  product_type: option === 'IN_HOUSE' ? 'ALIGNER' : 'MANUFACTURING_SERVICE',
                })
              }}
              selectedOption={productMode}
              label=''
              className='text-center rounded-md md:rounded-lg sm:px-4 text-base !h-12 !px-4'
            />
            {productMode === 'IN_HOUSE' && (
              <InputSearch
                placeholder='Search Product'
                className='h-8'
                value={searchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value
                  setSearchValue(val)
                  onSearchProducts({search: val, product_type: productListType})
                }}
              />
            )}
            {productMode === 'OUTSOURCE' && (
              <InputSearch
                placeholder='Search Product'
                className='h-8'
                value={searchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value
                  setSearchValue(val)
                  onSearchProducts({search: val, product_type: productListType})
                }}
              />
            )}
            {productMode === 'IN_HOUSE' ? (
              <Page loading={loadingProduct}>
                <div className='flex flex-wrap gap-4'>
                  {baseProducts.map((p: Product) => (
                    <ProductCard
                      key={`OWNER-${p.id}`}
                      product={p}
                      variant={
                        safeParseInt(p.profile_id) === safeParseInt(profileId) ? 'SELF' : 'VENDOR'
                      }
                      selected={ownerSelectedProductId ?? 0}
                      setSelected={(id, _product) => {
                        dispatchAction(setProductSelected(_product))
                        dispatchAction(setProductType('IN_HOUSE'))
                        setOwnerSelectedProductId(id)
                        setVendorSelectedProductId(null)
                      }}
                    />
                  ))}
                </div>
              </Page>
            ) : (
              <Page loading={loadingProduct}>
                <div className='flex flex-wrap gap-4'>
                  {baseProducts.length > 0 ? (
                    baseProducts.map((p: Product) => (
                      <ProductCard
                        key={`VENDOR-${p.id}`}
                        product={p}
                        variant={'VENDOR'}
                        selected={vendorSelectedProductId ?? 0}
                        setSelected={(id, _product) => {
                          dispatchAction(setProductSelected(_product))
                          dispatchAction(setProductType('OUTSOURCE'))
                          setVendorSelectedProductId(id)
                          setOwnerSelectedProductId(null)
                        }}
                      />
                    ))
                  ) : (
                    <div className='flex w-full justify-center items-center py-10 text-sm text-neutral-500'>
                      No vendor products found.
                    </div>
                  )}
                </div>
              </Page>
            )}
          </div>
        )}
      </div>
    </Spin>
  )
}

export default ProductionTypeStep
