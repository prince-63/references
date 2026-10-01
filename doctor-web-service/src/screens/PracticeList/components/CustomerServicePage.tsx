import React, {useState, useContext, useEffect, useMemo} from 'react'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import CustomerAlignerPanel from './CustomerAlignerPanel'
import Page from 'components/page/Page'
import {SearchOutlined} from '@ant-design/icons'
import {
  getCustomerProductsV2,
  toggleCustomerServiceProduct,
} from 'redux/Slices/UISlices/services.slice'
import {useLocation, useParams} from 'react-router-dom'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import useAllUserPlan from '@hooks/useAllUserPlan'
import RestrictDisabledProductModal from 'screens/settings/services/components/RestrictDisabledProductModal'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'

type CustomerServicePageProps = {
  readMode?: boolean
}

const CustomerServicePage: React.FC<CustomerServicePageProps> = ({readMode = false}) => {
  const {profileId, organizationId} = useContext(AuthContext)
  const {customerId} = useParams<{customerId: string}>()
  const {dispatchAction} = useDispatchAction()
  const [search, setSearch] = useState('')
  const {customerProducts, loadingCustomerProducts} = useSelector(
    (state: RootState) => state.uiServices
  )
  const [, setShowAddProduct] = useState(false)
  const [assignmentLoadingId, setAssignmentLoadingId] = useState<number | null>(null)
  const [localProducts, setLocalProducts] = useState<Product[]>([])
  const [showRestrictModal, setShowRestrictModal] = useState(false)
  const {isPractice} = useAllUserPlan()
  const customerProfileId = isPractice ? safeParseInt(profileId) : safeParseInt(customerId)
  const location = useLocation()
  const isCustomerProfile = location.pathname.includes('practice-profile')

  useEffect(() => {
    if (!customerProfileId || !profileId || !organizationId) return
    dispatchAction(
      getCustomerProductsV2({
        owner_organization_id: safeParseInt(organizationId),
        owner_profile_id: isCustomerProfile ? safeParseInt(profileId) : safeParseInt(customerId),
        customer_profile_id: customerProfileId,
        service_product_for_user: isCustomerProfile ? 'OWNER' : 'CUSTOMER',
        enabled_product: true,
      })
    )
  }, [customerProfileId, dispatchAction, organizationId, profileId])

  useEffect(() => {
    setLocalProducts(Array.isArray(customerProducts) ? customerProducts : [])
  }, [customerProducts])

  const productsList = useMemo(() => {
    const list = Array.isArray(localProducts) ? localProducts : []
    const normalized = list.map((prod: any) => ({
      ...prod,
      is_assigned: !(prod?.is_disabled_for_customer ?? false),
      product_category_name: prod?.category?.name ?? prod?.product_category_name,
    }))
    if (!search.trim()) return normalized
    const term = search.trim().toLowerCase()
    return normalized.filter((prod: any) =>
      String(prod?.product_name ?? '')
        .toLowerCase()
        .includes(term)
    )
  }, [localProducts, search])

  const handleToggleAssignment = (product: Product & {is_assigned?: boolean}) => {
    if (readMode) return
    if (!customerProfileId || !profileId || !organizationId) {
      ErrorToast('Missing required identifiers to update assignment.')
      return
    }

    const ownerProfileId = safeParseInt(profileId)
    const orgId = safeParseInt(organizationId)
    const productId = safeParseInt((product as any)?.id ?? (product as any)?.product_id)
    if (!productId) {
      ErrorToast('Missing product identifier.')
      return
    }
    const isDisabledForCustomer =
      (product as any)?.is_disabled_for_customer ?? (product as any)?.isDisabledForCustomer ?? false

    setAssignmentLoadingId(productId)
    dispatchAction(
      toggleCustomerServiceProduct({
        action: isDisabledForCustomer ? 'enable' : 'disable',
        owner_organization_id: orgId,
        owner_profile_id: ownerProfileId,
        customer_profile_id: customerProfileId,
        service_product_id: productId,
      })
    )
      .unwrap()
      .then(() => {
        setLocalProducts((prev) =>
          (Array.isArray(prev) ? prev : []).map((prod: any) =>
            safeParseInt(prod?.id ?? prod?.product_id) === productId
              ? {...prod, is_disabled_for_customer: !isDisabledForCustomer}
              : prod
          )
        )
      })
      .catch((error: string) => {
        if (error === 'AE0001') {
          setShowRestrictModal(true)
          return
        }
      })
      .finally(() => {
        setAssignmentLoadingId(null)
      })
  }

  return (
    <div className='px-4 sm:px-6'>
      {/* Heading */}
      <h2 className='text-2xl md:text-3xl font-semibold'>Products and Services</h2>

      <div className='mt-5'>
        {/* Search input */}
        <div className='mb-4 mt-4 relative'>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search by product name'
            className='w-full rounded-md border border-gray-300 pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primaryColor focus:border-primaryColor'
          />
          <SearchOutlined className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400' />
        </div>

        {/* Content */}
        <Page loading={loadingCustomerProducts}>
          <div className='mt-4 space-y-6'>
            {productsList && productsList?.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 sm:py-20 text-center'>
                <div className='w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                  <div className='text-2xl sm:text-3xl text-gray-400'>🗂️</div>
                </div>
                <div className='text-base sm:text-lg font-semibold text-textColor mb-2'>
                  No Manufacturing Products added
                </div>
                <div className='text-sm text-gray-500 mb-2 max-w-md px-4'>
                  There are no products added yet. Add a new product to get started.
                </div>
              </div>
            ) : (
              <CustomerAlignerPanel
                listData={productsList}
                setShowAddProduct={setShowAddProduct}
                onToggleAssignment={handleToggleAssignment}
                assignmentLoadingId={assignmentLoadingId}
                readMode={readMode}
              />
            )}
          </div>
        </Page>
      </div>
      {showRestrictModal && <RestrictDisabledProductModal setClose={setShowRestrictModal} />}
    </div>
  )
}

export default CustomerServicePage
