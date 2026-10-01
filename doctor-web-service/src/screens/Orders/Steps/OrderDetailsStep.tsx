import React, {useEffect, useMemo} from 'react'
import Page from 'components/page/Page'
import FooterRedesigned from '../components/FooterRedesigned'
import {Formik} from 'formik'
import useDispatchAction from '@hooks/useDispatchAction'
import serviceTypesConstants from '@constants/serviceTypes.constants'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import useActiveProfile from '@hooks/useActiveProfile'
import serviceTypeOptionList from '@staticData/serviceTypeOptionList'
import dayjs from 'dayjs'
import {OrderDetailsValidationSchema} from './validations/OrderDetails.validations'
import {nextStep, setIsLabSelected} from 'redux/Slices/AppSlice/orders/orders.slice'
import userOrderDetails from '../hooks/userOrderDetails'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useLocation, useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import getActiveProfile from '@utils/getActiveProfile'
import deliveryPreferenceTypeSelectConstants from '@constants/deliveryPreferenceTypeSelect.constants'
import {setOrderId} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {ProductCard} from 'screens/Kanban/components/ProductCard'
import {getCustomerProducts} from 'redux/Slices/UISlices/services.slice'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import StepCard from '../components/StepCard'
import {ClipboardList, Package} from 'lucide-react'

const OrderDetailsStep = () => {
  const {dispatchAction} = useDispatchAction()
  const {activeProfile, profileId} = useActiveProfile()
  const {isOrganization, isCustomer, isGrowthPlanUser, isEnterprisePlanUser, isPractice} =
    useAllUserPlan()
  const {order, loadingOrder} = userOrderDetails()
  const mappedProductId = useMemo(
    () =>
      safeParseInt(
        order?.service_products?.product_service_id ??
          (order as any)?.service_products?.product_id ??
          order?.service_products?.id
      ),
    [order]
  )
  const {orderId} = useParams<{orderId: string}>()
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const activeProfileUpdated = getActiveProfile(doctorData!.profiles, safeParseInt(profileId))
  const {activeVendorsList, loadingActiveVendors} = useSelector((state: RootState) => state.orders)
  const {loadingCustomerProducts} = useSelector((state: RootState) => state.uiServices)

  const {state} = useLocation()

  useEffect(() => {
    if (!profileId) return
    dispatchAction(getCustomerProducts({profileId: safeParseInt(profileId)}))
  }, [dispatchAction, profileId])

  const orderDetails = order?.order_details

  const selectedCustomerProduct: Product | null = order?.service_products ?? null

  const derivedOrderType = useMemo(() => {
    const productData = selectedCustomerProduct ?? (order?.service_products as any)
    if (
      productData?.product_type === 'SERVICE' &&
      productData?.product_category_name?.toUpperCase() === 'PLANNING'
    ) {
      return serviceTypesConstants.PLANNING_ORDER
    }
    return orderDetails?.order_type
  }, [order?.service_products, orderDetails?.order_type, selectedCustomerProduct])

  const getInitialValues = () => {
    if (orderDetails) {
      return {
        lab_id: orderDetails.target_user_details?.profile_id,
        lab_doctor_id: orderDetails.target_user_details?.doctor_id,
        lab_organization_id: orderDetails.target_user_details?.organization_id,
        order_type:
          derivedOrderType ?? orderDetails.order_type ?? serviceTypesConstants.ALIGNER_ORDER,
        due_by: orderDetails.due_by ? dayjs(orderDetails.due_by) : null,
        delivery_preference:
          order?.delivery_preference ?? deliveryPreferenceTypeSelectConstants.IN_BATCHES,
      }
    }
    return {
      lab_id: isOrganization ? null : activeProfile?.owner_profile_id,
      lab_organization_id: isOrganization ? null : activeProfile?.organization_id,
      lab_doctor_id: isOrganization ? null : activeProfile?.owner_doctor_id,
      order_type: derivedOrderType ?? serviceTypesConstants.ALIGNER_ORDER,
      due_by: null,
      delivery_preference: deliveryPreferenceTypeSelectConstants.IN_BATCHES,
    }
  }
  const defaultLabOption = {
    label: activeProfileUpdated?.owner_organization_name ?? '',
    value: activeProfileUpdated?.owner_profile_id,
    lab_organization_id: activeProfileUpdated?.organization_id,
    lab_doctor_id: activeProfileUpdated?.owner_doctor_id,
  }
  const growthPlanLabOption =
    (isEnterprisePlanUser || isGrowthPlanUser || isPractice) && orderDetails?.target_user_details
      ? {
          label: orderDetails.target_user_details.lab_name ?? defaultLabOption.label,
          value: orderDetails.target_user_details.profile_id ?? defaultLabOption.value,
          lab_organization_id:
            orderDetails.target_user_details.organization_id ??
            defaultLabOption.lab_organization_id,
          lab_doctor_id:
            orderDetails.target_user_details.doctor_id ?? defaultLabOption.lab_doctor_id,
        }
      : defaultLabOption
  const labNameOptions =
    isGrowthPlanUser || isEnterprisePlanUser || isCustomer || isPractice
      ? [growthPlanLabOption]
      : activeVendorsList

  return (
    <Page title='' loading={loadingOrder || loadingActiveVendors} containerClassName='min-h-full'>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={OrderDetailsValidationSchema}
        enableReinitialize
        onSubmit={async () => {
          dispatchAction(setOrderId({orderFileId: orderId}))

          dispatchAction(nextStep())
        }}
      >
        {(formik) => {
          return (
            <>
              <StepCard
                title='Order Details'
                subtitle='Configure your order settings'
                icon={<ClipboardList className='w-5 h-5' />}
                className='md:w-4/5 lg:w-3/5'
              >
                <div className='flex flex-col gap-4'>
                  <FormikSelectList
                    {...{
                      name: 'lab_id',
                      showSearch: true,
                      disabled: state?.isClone || isCustomer ? false : true,
                      items: labNameOptions,
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
              </StepCard>

              {mappedProductId ? (
                <StepCard
                  title='Selected Product'
                  icon={<Package className='w-5 h-5' />}
                  className='md:w-4/5 lg:w-3/5 mt-4'
                >
                  {loadingCustomerProducts ? (
                    <div className='text-sm text-textColor py-4'>Loading product...</div>
                  ) : selectedCustomerProduct ? (
                    <div className='pointer-events-none'>
                      <ProductCard
                        product={selectedCustomerProduct}
                        variant='VENDOR'
                        selected={mappedProductId}
                        setSelected={() => {}}
                        size='compact'
                      />
                    </div>
                  ) : (
                    <div className='text-sm text-textColor py-4'>
                      We couldn&apos;t find this product in your catalog.
                    </div>
                  )}
                </StepCard>
              ) : null}
              <FooterRedesigned
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

export default OrderDetailsStep
