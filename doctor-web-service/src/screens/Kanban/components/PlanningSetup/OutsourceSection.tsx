import {useContext, useEffect, useMemo, useState} from 'react'
import LabelTitle from 'components/atom/Labels/LabelTitle'
import Page from 'components/page/Page'
import {ProductCard} from '../ProductCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getEnabledProductList,
  getProductList,
  setPlanningProductSelected,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {AuthContext} from 'context/AuthContext'
import DropdownPrimary from 'components/atom/Dropdown/DropdownPrimary'
import {safeParseInt} from 'utils/ConstFunctions'
import getActiveProfile from '@utils/getActiveProfile'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {useLocation} from 'react-router-dom'

const OutsourceSection = () => {
  const {profileId, userId, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {isPractice, isEnterprisePlanUser} = useAllUserPlan()
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const assignedVendorId = data?.patient_details?.lab_profile_id
  const assignedVendorOrgId = data?.patient_details?.lab_org_id
  const activeProfileUpdated = getActiveProfile(doctorData!.profiles, safeParseInt(profileId))
  const {loadingActiveVendors, activeVendorsList} = useSelector((state: RootState) => state.orders)

  const getDefaultVendor = useMemo(() => {
    if (isEnterprisePlanUser) {
      return safeParseInt(profileId)
    } else if (isPractice) {
      return safeParseInt(assignedVendorId)
    }
    return null
  }, [isEnterprisePlanUser, isPractice, assignedVendorId])

  const [selectedVendor, setSelectedVendor] = useState<number | null>(getDefaultVendor)

  const {search} = useLocation()
  const params = new URLSearchParams(search)
  const isPurchaseOrder = params.get('orderType') === 'purchase-order'

  const {
    enabledProductList,
    enabledLoadingProduct,
    loadingProduct,
    planningProductSelected,
    productList,
  } = useSelector((state: RootState) => state.productionSetup)

  const defaultEnterpriseLabOption = {
    label:
      activeProfileUpdated?.organization_name ??
      activeProfileUpdated?.first_name + (activeProfileUpdated?.last_name ?? ''),
    value: safeParseInt(profileId),
    lab_organization_id: organizationId,
    lab_doctor_id: userId,
  }

  useEffect(() => {
    dispatchAction(
      getProductList({
        owner_profile_id: profileId,
        vendor_profile_ids: [],
        product_type: 'ALIGNER',
      } as any)
    )
  }, [])

  const payloadForPracticeProducts = useMemo(() => {
    return {
      customer_profile_id: safeParseInt(profileId),
      owner_organization_id: safeParseInt(assignedVendorOrgId),
      owner_profile_id: safeParseInt(assignedVendorId),
    }
  }, [profileId, assignedVendorOrgId, assignedVendorId])

  useEffect(() => {
    if (payloadForPracticeProducts && !isPurchaseOrder && isPractice) {
      setSelectedVendor(payloadForPracticeProducts?.owner_profile_id)
      dispatchAction(getEnabledProductList(payloadForPracticeProducts))
    }
  }, [payloadForPracticeProducts])

  const products = useMemo(() => {
    return isEnterprisePlanUser && !isPurchaseOrder
      ? productList?.owner_products
      : enabledProductList?.filter((prod) => prod.product_type !== 'MANUFACTURING_SERVICE')
  }, [enabledProductList, isEnterprisePlanUser, isPurchaseOrder, productList])

  const vendorsList = useMemo(() => {
    if (isEnterprisePlanUser && !isPurchaseOrder) {
      return [defaultEnterpriseLabOption]
    } else {
      return activeVendorsList
    }
  }, [isPractice, isEnterprisePlanUser, defaultEnterpriseLabOption, activeVendorsList])

  return (
    <Page loading={loadingActiveVendors}>
      <div className='flex flex-col gap-4'>
        <div>
          <div className='w-full md:w-1/3'>
            <LabelTitle
              required
              className='mt-4 font-figtree font-semibold text-[18px] leading-[26px] tracking-[-0.01em] not-italic text-black'
              title='Select Lab Partner for products'
            />
          </div>
          <DropdownPrimary
            name='planning-assignee'
            options={
              vendorsList?.filter((lab) => !lab?.enabled_items?.includes('MANUFACTURING')) ?? []
            }
            value={selectedVendor}
            onChange={(selectedUser) => {
              setSelectedVendor(safeParseInt(selectedUser?.value))
              dispatchAction(
                getEnabledProductList({
                  customer_profile_id: safeParseInt(profileId),
                  owner_organization_id: safeParseInt(selectedUser?.lab_organization_id),
                  owner_profile_id: safeParseInt(selectedUser?.value),
                })
              )
            }}
            placeholder={'Assign Planning case'}
            isSearchable
            isClearable={false}
            isDisabled={
              loadingActiveVendors || (isEnterprisePlanUser && !isPurchaseOrder) || isPractice
            }
          />
        </div>
        <Spin indicator={<Spinner loading />} spinning={enabledLoadingProduct || loadingProduct}>
          <div className='flex flex-wrap gap-4 rounded-lg my-3'>
            {products &&
              products?.map((product) => {
                const productKey = (product as any)?.id ?? (product as any)?.product_id
                return (
                  <ProductCard
                    key={`VENDOR-${productKey}`}
                    product={product}
                    selected={planningProductSelected?.id ?? 0}
                    setSelected={() => {
                      dispatchAction(setPlanningProductSelected(product))
                    }}
                  />
                )
              })}
          </div>
        </Spin>
        {products?.length === 0 && !loadingProduct && (
          <div className='flex flex-col items-center justify-center py-10 text-sm text-gray-500'>
            No products found
          </div>
        )}
      </div>{' '}
    </Page>
  )
}

export default OutsourceSection
