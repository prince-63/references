import React, {useState, useContext, useEffect} from 'react'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {getVendorsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getProductList} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {RootState} from 'redux/store'
import AddProductForm from './components/AddProductForm'
import AlignerPanel from './components/AlignerPanel'
import Page from 'components/page/Page'
import {SearchOutlined} from '@ant-design/icons'
import {
  getServiceConfiguration,
  ServiceConfiguration,
} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import {getCategoryList} from 'redux/Slices/UISlices/services.slice'

export const getActiveTab = (serviceConfig: ServiceConfiguration) => {
  if (serviceConfig?.VSP_PLANNING) return 'ALIGNER'
  if (serviceConfig?.ALIGNER_PLANNING_MANUFACTURING) return 'ALIGNER'
  if (serviceConfig?.PLANNING) return 'SERVICE'
  if (serviceConfig?.MANUFACTURING) return 'MANUFACTURING_SERVICE'
}
const ServicesPage: React.FC = () => {
  const {profileId, userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {activeVendorsList} = useSelector((state: RootState) => state.orders)
  const [search, setSearch] = useState('')
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const [activeTab, setActiveTab] = useState<'ALIGNER' | 'SERVICE' | 'MANUFACTURING_SERVICE'>(
    getActiveTab(serviceConfig) ?? 'ALIGNER'
  )
  const {productList, loadingProduct} = useSelector((state: RootState) => state.productionSetup)
  const [showAddProduct, setShowAddProduct] = useState(false)

  useEffect(() => {
    setActiveTab(getActiveTab(serviceConfig) ?? 'ALIGNER')
  }, [serviceConfig])

  useEffect(() => {
    onSearch({product_type: activeTab})
  }, [activeTab])

  useEffect(() => {
    dispatchAction(
      getVendorsList({
        doctor_id: safeParseInt(userId),
        withoutOwnDoctor: true,
      })
    )
    onSearch({product_type: activeTab})
    dispatchAction(
      getCategoryList({
        profile_id: safeParseInt(profileId),
      })
    )
  }, [userId])

  const onSearch = (params: {
    search?: string
    product_type?: 'ALIGNER' | 'SERVICE' | 'MANUFACTURING_SERVICE'
  }) => {
    const {search: searchParam, product_type: productTypeParam} = params
    const nextSearch = searchParam !== undefined ? searchParam : search
    const nextProductType = productTypeParam ?? activeTab

    if (searchParam !== undefined) setSearch(searchParam)
    if (productTypeParam !== undefined) setActiveTab(productTypeParam)
    if (!profileId) return
    dispatchAction(
      getProductList({
        owner_profile_id: safeParseInt(profileId),
        vendor_profile_ids: activeVendorsList.map((vendor) => safeParseInt(vendor.value)) ?? [],
        product_type: nextProductType,
        search: nextSearch,
        showAll: true,
      })
    )
  }

  const filteredListData: Product[] = productList?.owner_products ?? []

  useEffect(() => {
    if (!profileId) return
    dispatchAction(getServiceConfiguration({profileId: safeParseInt(profileId)}))
  }, [profileId])

  return (
    <div className='px-4 sm:px-6'>
      {showAddProduct && (
        <AddProductForm
          refreshData={onSearch}
          setShowAddProduct={setShowAddProduct}
          showAddProduct={showAddProduct}
        />
      )}

      {/* Heading */}
      <h2 className='text-2xl md:text-3xl font-semibold'>Products and Services</h2>
      <p className='text-gray-600 mt-2 text-sm md:text-base'>
        Configure products and services for in-house and outsourced workflows.
      </p>

      <div className='mt-5'>
        {/* Tabs – scrollable on small screens */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          {!serviceConfig?.VSP_PLANNING && (
            <nav className='-mb-px flex gap-6 overflow-x-auto whitespace-nowrap pb-1'>
              {(() => {
                const tabs = [
                  {
                    id: 'ALIGNER',
                    label: 'Aligner',
                    disabled: !serviceConfig?.ALIGNER_PLANNING_MANUFACTURING,
                  },
                  {
                    id: 'SERVICE',
                    label: 'Planning',
                    disabled: !serviceConfig?.PLANNING,
                  },
                  {
                    id: 'MANUFACTURING_SERVICE',
                    label: 'Manufacturing',
                    disabled: !serviceConfig?.MANUFACTURING,
                  },
                ] as {
                  id: 'MANUFACTURING_SERVICE' | 'ALIGNER' | 'SERVICE'
                  label: string
                  disabled?: boolean
                }[]
                return tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.disabled) return
                      setSearch('')
                      onSearch({product_type: tab.id, search: ''})
                    }}
                    className={`py-2 px-1 border-b-2 font-semibold text-base ${
                      activeTab === tab.id
                        ? 'border-primaryColor text-primaryColor'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))
              })()}
            </nav>
          )}
          <button
            onClick={() => setShowAddProduct(true)}
            className='md:w-fit w-full px-3 sm:px-4 py-2 bg-primaryColor text-white rounded-md font-medium text-sm sm:text-base'
          >
            Add Product
          </button>
        </div>

        {/* Search input */}
        <div className='my-4 relative'>
          <input
            value={search}
            onChange={(e) => onSearch({search: e.target.value})}
            placeholder='Search by product name'
            className='w-full rounded-md border border-gray-300 pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primaryColor focus:border-primaryColor'
          />
          <SearchOutlined className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400' />
        </div>

        {/* Content */}
        <Page loading={loadingProduct}>
          <div className='mt-4 space-y-6'>
            <AlignerPanel listData={filteredListData} setShowAddProduct={setShowAddProduct} />
          </div>
        </Page>
      </div>
    </div>
  )
}

export default ServicesPage
