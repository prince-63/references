import caseTypes from '@constants/caseTypes'
import deliveryPreferenceTypeSelectConstants from '@constants/deliveryPreferenceTypeSelect.constants'
import serviceTypesConstants from '@constants/serviceTypes.constants'
import useCreateOrder from '@hooks/useCreateOrder'
import useDispatchAction from '@hooks/useDispatchAction'
import serviceTypeOptionList from '@staticData/serviceTypeOptionList'
import getActiveProfile from '@utils/getActiveProfile'
import {Spin} from 'antd'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import Page from 'components/page/Page'
import Spinner from 'components/spinner/Spinner'
import {AuthContext} from 'context/AuthContext'
import dayjs from 'dayjs'
import {Formik} from 'formik'
import {useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {setOrderId} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {nextStep, setIsLabSelected} from 'redux/Slices/AppSlice/orders/orders.slice'
import {
  getEnabledProductList,
  resetPlanningProductSelection,
  setPlanningProductSelected,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {RootState} from 'redux/store'
import {ProductCard} from 'screens/Kanban/components/ProductCard'
import Footer from 'screens/Orders/components/Footer'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import {OrderDetailsValidationSchema} from 'screens/Orders/Steps/validations/OrderDetails.validations'
import {safeParseInt} from 'utils/ConstFunctions'

const OrderDetailsStep = () => {
  const {profileId, userId, organizationId} = useContext(AuthContext)
  const {orderId} = useParams<{orderId: string}>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const activeProfileUpdated = getActiveProfile(doctorData!.profiles, safeParseInt(profileId))
  const {order, loadingOrder} = userOrderDetails(true)
  const orderDetails = order?.order_details
  const {dispatchAction} = useDispatchAction()
  const {handleCreateOrder} = useCreateOrder()
  const {patientId} = location.state || {}
  const {enabledProductList, enabledLoadingProduct, planningProductSelected} = useSelector(
    (state: RootState) => state.productionSetup
  )
  const {data: patientDetailsResponse} = useSelector(
    (state: RootState) => state.apiGetLeadsProfileDetails
  )

  const assignedPractice = patientDetailsResponse?.patient_details?.assigned_practice
  const payloadForPracticeProducts = useMemo(() => {
    return {
      customer_profile_id: safeParseInt(profileId),
      owner_organization_id: safeParseInt(activeProfileUpdated?.organization_id),
      owner_profile_id: safeParseInt(activeProfileUpdated?.owner_profile_id),
    }
  }, [profileId, activeProfileUpdated])

  const labNameOptions = [
    {
      label: activeProfileUpdated?.owner_organization_name ?? '',
      value: activeProfileUpdated?.owner_profile_id,
      lab_organization_id: activeProfileUpdated?.organization_id,
      lab_doctor_id: activeProfileUpdated?.owner_doctor_id,
    },
  ]

  const handleCreateOrderCall = async () => {
    const payload = {
      order_details: {
        lab_id: safeParseInt(profileId),
        lab_organization_id: safeParseInt(organizationId),
        lab_doctor_id: safeParseInt(userId),
        order_type: 'PLANNING_ORDER',
        due_by: null,
        delivery_preference: 'IN_BATCHES',
        target_user_details: {
          profile_id: safeParseInt(planningProductSelected?.profile_id),
          organization_id: safeParseInt(planningProductSelected?.organization_id),
          doctor_id: safeParseInt(planningProductSelected?.doctor_id),
        },
      },
      status: 'DRAFT',
      doctor_id: userId,
      current_step: 1,
      organization_id: safeParseInt(organizationId),
      profile_id: safeParseInt(profileId),
      service_products: !!planningProductSelected && planningProductSelected,
      case_type: caseTypes.OUTSOURCED_PLANNING_ORDER,
      practice_doctor_id: safeParseInt(assignedPractice?.practice_doctor_id),
      practice_profile_id: safeParseInt(assignedPractice?.practice_profile_id),
      practice_organization_id: safeParseInt(assignedPractice?.practice_organization_id),
      patient_id: patientDetailsResponse?.patient_details?.id,
      service_product_id: !!planningProductSelected && planningProductSelected?.id,
    }
    const response = await handleCreateOrder({
      orderPayload: payload,
      product: planningProductSelected,
      assignedCustomer: assignedPractice,
    })

    const refinementParam = searchParams.get('refinement') === 'true' ? '?refinement=true' : ''
    navigate(`/customer/create-order/${response.order_id}${refinementParam}`, {
      state: {patientId: patientDetailsResponse?.patient_details?.id},
    })
    dispatchAction(resetPlanningProductSelection())
    dispatchAction(nextStep())
  }

  const getInitialValues = () => {
    if (orderDetails) {
      return {
        lab_id: orderDetails.target_user_details?.profile_id,
        lab_doctor_id: orderDetails.target_user_details?.doctor_id,
        lab_organization_id: orderDetails.target_user_details?.organization_id,
        order_type: orderDetails.order_type,
        due_by: orderDetails.due_by ? dayjs(orderDetails.due_by) : null,
        delivery_preference:
          order?.delivery_preference ?? deliveryPreferenceTypeSelectConstants.IN_BATCHES,
      }
    }
    return {
      lab_id: activeProfileUpdated?.owner_profile_id,
      lab_organization_id: activeProfileUpdated?.organization_id,
      lab_doctor_id: activeProfileUpdated?.owner_doctor_id,
      order_type: serviceTypesConstants.PLANNING_ORDER,
      due_by: null,
      delivery_preference: deliveryPreferenceTypeSelectConstants.IN_BATCHES,
    }
  }

  useEffect(() => {
    if (!patientDetailsResponse) {
      const postData = {
        patient_id: safeParseInt(patientId),
        doctor_id: safeParseInt(userId),
      }
      dispatchAction(getLeadsProfileDetails(postData) as any)
    }
  }, [patientDetailsResponse])

  useEffect(() => {
    dispatchAction(getEnabledProductList(payloadForPracticeProducts))
  }, [payloadForPracticeProducts])

  const products = useMemo(() => {
    return enabledProductList?.filter((prod) => prod.product_type !== 'MANUFACTURING_SERVICE')
  }, [enabledProductList])

  return (
    <Page title='Order details' loading={loadingOrder}>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={OrderDetailsValidationSchema}
        enableReinitialize
        onSubmit={async () => {
          dispatchAction(setOrderId({orderFileId: orderId}))
          if (planningProductSelected) {
            handleCreateOrderCall()
          } else {
            ErrorToast('Please select a product to proceed')
          }
        }}
      >
        {(formik) => {
          return (
            <>
              <div className='flex flex-col gap-3 md:w-3/5 mb-4'>
                <FormikSelectList
                  {...{
                    name: 'lab_id',
                    showSearch: true,
                    disabled: true,
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
              <Spin indicator={<Spinner loading />} spinning={enabledLoadingProduct}>
                <label className='text-base font-medium text-textColor'>
                  Product details <span className='text-red ml-1'>*</span>
                </label>
                <div className='flex flex-wrap gap-4 rounded-lg my-2'>
                  {products &&
                    products?.map((product) => {
                      const productKey = (product as any)?.id ?? (product as any)?.product_id
                      return (
                        <ProductCard
                          key={`VENDOR-${productKey}`}
                          product={product}
                          selected={planningProductSelected?.id ?? 0}
                          size='compact'
                          setSelected={() => {
                            dispatchAction(setPlanningProductSelected(product))
                          }}
                        />
                      )
                    })}
                </div>
              </Spin>
              <Footer
                onNext={() => {
                  formik.handleSubmit()
                }}
                disableNext={!formik.isValid || !planningProductSelected}
                loadingNext={formik.isSubmitting}
              />
            </>
          )
        }}
      </Formik>
    </Page>
  )
}

export default OrderDetailsStep
