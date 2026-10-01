import {useContext, useEffect, useState} from 'react'
import Page from 'components/page/Page'
import Footer from '../components/Footer'
import {Formik} from 'formik'
import useDispatchAction from '@hooks/useDispatchAction'
import serviceTypesConstants from '@constants/serviceTypes.constants'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import serviceTypeOptionList from '@staticData/serviceTypeOptionList'
import {OrderDetailsValidationSchema} from './validations/OrderDetails.validations'
import {getVendorsList, nextStep, setIsLabSelected} from 'redux/Slices/AppSlice/orders/orders.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import deliveryPreferenceTypeSelectConstants from '@constants/deliveryPreferenceTypeSelect.constants'
import {setOrderId} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {ProductCard} from 'screens/Kanban/components/ProductCard'
import {Product} from 'screens/settings/services/components/types'
import {AuthContext} from 'context/AuthContext'
import {getProductList} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import caseTypes from '@constants/caseTypes'
import useCreateOrder from '@hooks/useCreateOrder'
import {useNavigate} from 'react-router-dom'
import ErrorToast from 'components/modal/Alert/ErrorToast'

const OrderDetailsForPlanningOrder = () => {
  const {dispatchAction} = useDispatchAction()
  const {profileId, userId, organizationId} = useContext(AuthContext)
  const {productList, loadingProduct} = useSelector((state: RootState) => state.productionSetup)
  const {loadingActiveVendors, orderPatientDetails} = useSelector(
    (state: RootState) => state.orders
  )
  const [selected, setSelected] = useState<Product | null>(null)
  const {handleCreateOrder} = useCreateOrder()
  const navigate = useNavigate()

  useEffect(() => {
    dispatchAction(
      getVendorsList({
        doctor_id: safeParseInt(userId),
        isInternalUserToShow: true,
      })
    )

    dispatchAction(
      getProductList({
        owner_profile_id: safeParseInt(profileId),
        vendor_profile_ids: [orderPatientDetails?.receiver_profile_id],
        product_type: 'SERVICE',
        search: '',
      })
    )
  }, [dispatchAction, userId, profileId])

  const getInitialValues = () => {
    if (orderPatientDetails) {
      return {
        lab_id: orderPatientDetails?.receiver_profile_id,
        lab_doctor_id: orderPatientDetails?.receiver_doctor_id,
        lab_organization_id: orderPatientDetails?.receiver_org_id,
        order_type: serviceTypesConstants.PLANNING_ORDER,
        due_by: null,
        delivery_preference: deliveryPreferenceTypeSelectConstants.IN_BATCHES,
      }
    }
    return {
      lab_id: null,
      lab_doctor_id: null,
      lab_organization_id: null,
      order_type: serviceTypesConstants.PLANNING_ORDER,
      due_by: null,
      delivery_preference: deliveryPreferenceTypeSelectConstants.IN_BATCHES,
    }
  }

  const handleVendorProductSelect = (product: Product) => {
    setSelected(product)
  }

  return (
    <Page title='Order details' loading={loadingActiveVendors}>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={OrderDetailsValidationSchema}
        enableReinitialize
        onSubmit={async () => {
          if (!selected && !orderPatientDetails) return
          const payload = {
            patient_details: orderPatientDetails,
            order_details: {
              lab_id: safeParseInt(profileId),
              lab_organization_id: safeParseInt(organizationId),
              lab_doctor_id: safeParseInt(userId),
              order_type: 'PLANNING_ORDER',
              due_by: null,
              delivery_preference: 'IN_BATCHES',
              target_user_details: {
                profile_id: safeParseInt(selected?.profile_id),
                organization_id: safeParseInt(selected?.organization_id),
                doctor_id: safeParseInt(selected?.doctor_id),
              },
            },
            status: 'DRAFT',
            patient_id: orderPatientDetails?.id,
            doctor_id: userId,
            current_step: 1,
            organization_id: safeParseInt(organizationId),
            profile_id: safeParseInt(profileId),
            service_products: selected,
            case_type: caseTypes.OUTSOURCED_PLANNING_ORDER,
            practice_doctor_id: safeParseInt(userId),
            practice_profile_id: safeParseInt(profileId),
            practice_organization_id: safeParseInt(organizationId),
          }

          try {
            const response = await handleCreateOrder({
              orderPayload: payload,
              product: selected,
              assignedCustomer: orderPatientDetails,
            })
            if (!response?.order_id) {
              ErrorToast('Failed to create order. Please try again.')
              return
            }

            navigate(`${response.order_id}?orderType=planning`)
            dispatchAction(setOrderId({orderFileId: response.order_id}))
            dispatchAction(nextStep())
          } catch {
            ErrorToast('Failed to create order. Please try again.')
          }
        }}
      >
        {(formik) => {
          const defaultLabOption = {
            label: orderPatientDetails?.receiver_name ?? '',
            value: orderPatientDetails?.receiver_profile_id,
            lab_organization_id: orderPatientDetails?.receiver_org_id,
            lab_doctor_id: orderPatientDetails?.receiver_doctor_id,
          }

          return (
            <>
              <div className='flex flex-col gap-3 md:w-3/5'>
                <FormikSelectList
                  {...{
                    name: 'lab_id',
                    showSearch: true,
                    disabled: true,
                    items: [defaultLabOption],
                    required: true,
                    label: 'Lab name',
                    onChangeSuccess: (value) => {
                      dispatchAction(setIsLabSelected(true))
                      formik.setFieldValue('lab_organization_id', value.lab_organization_id)
                      formik.setFieldValue('lab_doctor_id', value.lab_doctor_id)
                    },
                  }}
                />

                <FormikSelectList
                  {...{
                    name: 'order_type',
                    showSearch: true,
                    disabled: true,
                    items: serviceTypeOptionList,
                    onChangeMapperFunc: String,
                    required: true,
                    label: 'Service',
                  }}
                />
              </div>
              <Page loading={loadingProduct}>
                <div className='flex flex-wrap gap-4 rounded-lg my-3'>
                  {productList?.vendor_products &&
                    productList?.vendor_products?.map((product) => {
                      const productKey = (product as any)?.id ?? (product as any)?.product_id
                      return (
                        <ProductCard
                          key={`VENDOR-${productKey}`}
                          product={product}
                          variant='VENDOR'
                          selected={selected?.id ?? 0}
                          setSelected={(id, selectedProduct) => {
                            handleVendorProductSelect(selectedProduct)
                          }}
                        />
                      )
                    })}
                </div>
                {productList?.vendor_products?.length === 0 && !loadingProduct && (
                  <div className='flex flex-col items-center justify-center py-10 text-sm text-gray-500'>
                    No products found
                  </div>
                )}
              </Page>
              <Footer
                {...{
                  onNext: () => {
                    formik.handleSubmit()
                  },
                }}
              />
            </>
          )
        }}
      </Formik>
    </Page>
  )
}

export default OrderDetailsForPlanningOrder
