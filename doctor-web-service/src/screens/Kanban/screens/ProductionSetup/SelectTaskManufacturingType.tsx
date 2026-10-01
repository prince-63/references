import {useContext, useEffect, useState} from 'react'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {getVendorsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getProductList,
  setProductSelected,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import Page from 'components/page/Page'
import FormWrapper from 'components/formWrapper/FormWrapper'
import {useNavigate, useParams} from 'react-router-dom'
import InputSearch from 'components/atom/Inputs/InputSearch'
import {ProductCard} from 'screens/Kanban/components/ProductCard'

export type Product = {
  id: number
  product_type: 'ALIGNER' | 'SERVICE' | 'MANUFACTURING_SERVICE'
  product_name: string
  product_description: string
  product_image: string | null
  product_category_id: number
  product_category_name: string
  profile_id: number
  is_default: boolean
  created_at: string
  updated_at: string
  is_last_used: boolean
  added_by_user_name: string
  organization_id: number
  is_product_enabled: boolean
  doctor_id: number
  org_brand_name: string | null
}

const SelectTaskManufacturingType = () => {
  const {patientId, treatmentId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {profileId, userId} = useContext(AuthContext)
  const {loadingProduct, productList, productType} = useSelector(
    (state: RootState) => state.productionSetup
  )
  const {activeVendorsList} = useSelector((state: RootState) => state.orders)
  const {cardDetails} = useSelector((state: RootState) => state.kanban)
  const [filter, setFilter] = useState<'ALL' | 'IN_HOUSE' | 'OUTSOURCE'>('ALL')
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    if (!cardDetails?.id) {
      navigate(`/aligner-orders?workFlow=planning-in-house`)
    }
    dispatchAction(
      getVendorsList({
        doctor_id: safeParseInt(userId),
        withoutOwnDoctor: true,
      })
    )
    getProduct({})
  }, [])

  const getProduct = ({search = ''}: {search?: string}) => {
    dispatchAction(
      getProductList({
        owner_profile_id: safeParseInt(profileId),
        vendor_profile_ids: activeVendorsList.map((vendor) => safeParseInt(vendor.value)) ?? [],
        product_type: 'SERVICE',
        search: search,
      })
    )
  }

  const callHandleSubmit = () => {
    dispatchAction(
      setProductSelected(
        productType === 'IN_HOUSE'
          ? productList?.owner_products?.find((product) => product.id === selected)
          : productList?.vendor_products.find((product) => product.id === selected)
      )
    )

    navigate(`/production-setup/${patientId}/${treatmentId}`, {replace: true})
  }

  // removed invalid effect that called undefined functions/variables

  // helper to derive products to show based on current filter
  const productsToShow = () => {
    if (!productList) return []
    switch (filter) {
      case 'ALL':
        return [...(productList.owner_products ?? []), ...(productList.vendor_products ?? [])]
      case 'IN_HOUSE':
        return productList.owner_products ?? []
      case 'OUTSOURCE':
        return productList.vendor_products ?? []
      default:
        return []
    }
  }

  return (
    <FormWrapper
      title={'Production Setup'}
      subTitle='Confirm how you want to manufacture this case.'
      buttonText='Next'
      isDisabled={!selected}
      onClickCancel={() => {
        navigate(-1)
      }}
      onClickSave={() => {
        callHandleSubmit()
      }}
    >
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === 'ALL' ? 'bg-white border-gray-300' : 'bg-gray-50 border-transparent'
            }`}
          >
            All
          </button>
          <button
            type='button'
            onClick={() => setFilter('IN_HOUSE')}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === 'IN_HOUSE' ? 'bg-white border-gray-300' : 'bg-gray-50 border-transparent'
            }`}
          >
            Show only In-House
          </button>
          <button
            type='button'
            onClick={() => setFilter('OUTSOURCE')}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === 'OUTSOURCE' ? 'bg-white border-gray-300' : 'bg-gray-50 border-transparent'
            }`}
          >
            Show only Outsourced
          </button>
        </div>
        {/* Search replicated from Patients page */}
        <div className='w-full md:w-1/3'>
          <InputSearch
            placeholder='Search Product'
            className='h-8'
            onChange={(e: any) => getProduct({search: e.target.value})}
          />
        </div>
      </div>

      <Page loading={loadingProduct}>
        {productsToShow().length > 0 ? (
          <div className='flex flex-wrap gap-4 rounded-lg  my-3'>
            {productsToShow().map((p: any) => (
              <ProductCard
                selected={selected ?? 0}
                setSelected={setSelected}
                key={`PRODUCT-${p.id}`}
                product={p}
                variant={p.profile_id === safeParseInt(profileId) ? 'SELF' : 'VENDOR'}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <div className='text-3xl text-gray-400'>🗂️</div>
            </div>
            <div className='text-lg font-semibold text-textColor mb-2'>No Products present</div>
            <div className='text-sm text-gray-500 mb-4 text-center max-w-xl'>
              There are no products yet. Add a new product to get started.
            </div>
          </div>
        )}
      </Page>
    </FormWrapper>
  )
}

export default SelectTaskManufacturingType
