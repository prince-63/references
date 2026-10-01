import useActiveProfile from '@hooks/useActiveProfile'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {getProductList} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {RootState} from 'redux/store'
import {ProductCard} from 'screens/Kanban/components/ProductCard'
import {safeParseInt} from 'utils/ConstFunctions'
import Footer from './Footer'
import {
  nextStep,
  OrderPayload,
  setProductSelected,
  setSaveOrderData,
} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import caseTypes from '@constants/caseTypes'
import orderStatusConstants from '@constants/orderStatus.constants'
import hasValue from 'utils/hasValue'

const ExistingCaseProductSelection = () => {
  const {dispatchAction} = useDispatchAction()
  const {profileId, userId, organizationId} = useContext(AuthContext)
  const {isPractice, isGrowthPlanUser} = useAllUserPlan()

  const {activeProfile} = useActiveProfile()
  const {productList, loadingProduct} = useSelector((state: RootState) => state.productionSetup)
  const {savePatientData, saveOrderData} = useSelector((state: RootState) => state.existingCase)
  const {activePractices} = useSelector((state: RootState) => state.practices)
  const assignedPractice = activePractices?.find(
    (practice) =>
      safeParseInt(practice.profile_id) === safeParseInt(savePatientData?.data?.practice_profile_id)
  )

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    saveOrderData?.service_products?.id ?? null
  )

  useEffect(() => {
    dispatchAction(
      getProductList({
        owner_profile_id: safeParseInt(isPractice ? activeProfile?.owner_profile_id : profileId),
        vendor_profile_ids: [],
        product_type: 'ALIGNER',
        search: '',
      } as any)
    )
  }, [])

  return (
    <>
      <Page loading={loadingProduct} containerClassName='pb-28 sm:pb-26 md:pb-24 lg:pb-32'>
        <div className='text-2xl font-semibold'>Product selection</div>

        <div className='flex flex-wrap gap-4 rounded-lg my-3'>
          {productList?.owner_products?.map((product) => (
            <ProductCard
              key={`VENDOR-${product.id}`}
              product={product}
              variant='VENDOR'
              selected={selectedProductId ?? 0}
              setSelected={(id) => setSelectedProductId(id)}
            />
          ))}
        </div>
        {productList?.owner_products?.length === 0 && !loadingProduct && (
          <div className='flex flex-col items-center justify-center py-10 text-sm text-gray-500'>
            No products found
          </div>
        )}
      </Page>
      <Footer
        {...{
          disabled: !hasValue(selectedProductId),
          onNext: () => {
            const product = productList?.owner_products.find((p) => p.id === selectedProductId)
            if (!product) return
            dispatchAction(setProductSelected(product))
            if (isGrowthPlanUser) {
              dispatchAction(nextStep())
              return
            }
            const payload: OrderPayload = {
              order_details: {
                lab_id: safeParseInt(profileId),
                lab_organization_id: safeParseInt(organizationId),
                lab_doctor_id: safeParseInt(userId),
                order_type: 'ALIGNER_ORDER',
                due_by: null,
                delivery_preference: 'IN_BATCHES',
                target_user_details: {
                  profile_id: product?.profile_id,
                  organization_id: product?.organization_id,
                  doctor_id: product?.doctor_id,
                },
              },
              status: orderStatusConstants.ORDERED,
              doctor_id: safeParseInt(userId),
              current_step: 1,
              organization_id: safeParseInt(organizationId),
              profile_id: safeParseInt(profileId),
              service_products: product,
              case_type: caseTypes.OUTSOURCED_PLANNING_ORDER,
              practice_doctor_id: assignedPractice?.doctor_id,
              practice_profile_id: assignedPractice?.profile_id,
              practice_organization_id: assignedPractice?.organization_id,
              prescription_details: null,
              shipping_details: null,
              service_product_id: product?.id,
            }
            dispatchAction(setSaveOrderData(payload))
            dispatchAction(nextStep())
          },
        }}
      />
    </>
  )
}

export default ExistingCaseProductSelection
