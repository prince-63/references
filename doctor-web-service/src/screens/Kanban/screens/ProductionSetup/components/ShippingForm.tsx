import {Formik} from 'formik'
import useDispatchAction from '@hooks/useDispatchAction'
import {getDefaultShipmentAddress, getOrderDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getCustomerId, safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import React, {useContext, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import SectionCard from './SectionCard'
import {Layers2} from 'lucide-react'
import {validationSchema} from 'screens/Orders/Steps/ShippingDetails/config'
import {
  addShippingDetails,
  attachShippingDetails,
  setShipping,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {RootState} from 'redux/store'
import {Button} from 'antd'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {IOrder} from 'screens/Orders/orders.types'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ShippingAddressFields from 'components/shipping/ShippingAddressFields'

const ShippingForm = () => {
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const {isAdmin} = useAllUserPlan()
  const {patientId, treatmentId} = useParams()
  const {profileId, userId} = useContext(AuthContext)
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {order: orderFromState} = userOrderDetails()
  const {shipping} = useSelector((state: RootState) => state.productionSetup)
  const order = React.useMemo(() => {
    if (!orderFromState || !Object.keys(orderFromState).length) return null

    const orderPatientId = safeParseInt(
      orderFromState?.patient_details?.id ?? (orderFromState as any)?.patient_id
    )
    const currentPatientId = safeParseInt(patientId ?? treatmentPlan?.patient_id)
    if (orderPatientId && currentPatientId && orderPatientId !== currentPatientId) return null

    if (
      treatmentPlan?.order_id &&
      orderFromState?.order_id &&
      String(treatmentPlan.order_id) !== String(orderFromState.order_id)
    ) {
      return null
    }

    return orderFromState
  }, [orderFromState, patientId, treatmentPlan?.order_id, treatmentPlan?.patient_id])
  const hasShipping = React.useMemo(() => {
    const s: any = shipping
    if (!s || typeof s !== 'object') return false
    if (s.shipping_id) return true
    // Consider it present only if at least one meaningful field exists
    const keys = ['name', 'address_line', 'country', 'state', 'city', 'pincode']
    return keys.some((k) => !!s?.[k])
  }, [shipping])

  return (
    <Formik
      initialValues={{
        addressed_to: '',
        mobile_number: '',
        name: '',
        address_line: '',
        country: '',
        state: '',
        city: '',
        pincode: '',
        default: false,
      }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        if (!order) return
        const payload = {
          ...values,
          default: false,
          profile_id: safeParseInt(profileId),
          treatement_plan_id: treatmentId,
          customer_profile_id: getCustomerId({
            order: order,
            profileId: safeParseInt(profileId),
            isAdmin: isAdmin,
          }),
        }

        await dispatchAction(addShippingDetails(payload))
          .unwrap()
          .then((res: any) => {
            dispatchAction(
              setShipping({
                addressed_to: res.addressed_to,
                mobile_number: res.mobile_number,
                name: res.name,
                address_line: res.address_line,
                country: res.country,
                state: res.state,
                city: res.city,
                pincode: res.pincode,
                default: res.default,
              })
            )
            dispatchAction(
              attachShippingDetails({
                treatment_plan_id: safeParseInt(treatmentId),
                shipping_id: res.shipping_id,
              })
            )
              .unwrap()
              .then(() => {
                dispatchAction(
                  getTreatmentPlan({
                    aligner_treatment_id: String(treatmentId),
                  })
                )
              })
              .catch(() => {})
            SuccessToast('Shipping details added successfully')
          })
      }}
    >
      {(formik) => {
        useEffect(() => {
          let isCurrent = true

          if (treatmentPlan?.order_id) {
            dispatchAction(
              getOrderDetails({
                order_id: String(treatmentPlan?.order_id),
                doctor_id: safeParseInt(userId),
              })
            )
              .unwrap()
              .then((result: {data: IOrder}) => {
                if (!isCurrent) return
                const res = result.data?.shipping_details
                formik.setFieldValue('addressed_to', res?.addressed_to)
                formik.setFieldValue('mobile_number', res?.mobile_number)
                formik.setFieldValue('name', res?.name)
                formik.setFieldValue('address_line', res?.address_line)
                formik.setFieldValue('country', res?.country)
                formik.setFieldValue('state', res?.state)
                formik.setFieldValue('city', res?.city)
                formik.setFieldValue('pincode', res?.pincode)
              })
          } else if (order) {
            dispatchAction(
              getDefaultShipmentAddress({
                profileId: safeParseInt(profileId),
                customerId: getCustomerId({
                  order: order,
                  profileId: safeParseInt(profileId),
                  isAdmin: isAdmin,
                }),
              })
            )
              .unwrap()
              .then((res: any) => {
                if (!isCurrent) return
                formik.setFieldValue('addressed_to', res?.addressed_to)
                formik.setFieldValue('mobile_number', res?.mobile_number)
                formik.setFieldValue('name', res?.name)
                formik.setFieldValue('address_line', res?.address_line)
                formik.setFieldValue('country', res?.country)
                formik.setFieldValue('state', res?.state)
                formik.setFieldValue('city', res?.city)
                formik.setFieldValue('pincode', res?.pincode)
              })
          }
          return () => {
            isCurrent = false
          }
        }, [treatmentPlan])

        return (
          <SectionCard
            id='shipping-batch'
            icon={<Layers2 className='h-5 w-5' />}
            title='Shipping Address'
            subtitle='Add shipping details for the order'
          >
            {hasShipping ? (
              <div className='flex flex-col gap-1 text-sm text-textColor'>
                <div className='font-normal'>{shipping?.addressed_to}</div>
                <div className='font-normal'>{shipping?.name}</div>
                <div className='font-medium'>{shipping?.mobile_number}</div>
                <div className='font-normal'>{shipping?.address_line}</div>
                <div className='font-normal'>
                  {shipping?.city},{shipping?.state}
                </div>
                <div className='font-normal'>{shipping?.country}</div>
                <div className='font-normal'>{shipping?.pincode}</div>
              </div>
            ) : (
              <div>
                <div className='flex flex-col gap-4'>
                  <ShippingAddressFields formik={formik} dispatch={dispatch} />
                  <div className='flex justify-end'>
                    <Button className='w-24 ' type='primary' onClick={() => formik.handleSubmit()}>
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        )
      }}
    </Formik>
  )
}

export default ShippingForm
