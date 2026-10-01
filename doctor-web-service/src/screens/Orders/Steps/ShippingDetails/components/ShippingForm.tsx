import {Formik} from 'formik'
import {validationSchema} from '../config'
import FooterRedesigned from 'screens/Orders/components/FooterRedesigned'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  createOrder,
  getDefaultShipmentAddress,
  nextStep,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import orderStatusConstants from '@constants/orderStatus.constants'
import {getCustomerId, safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import {useNavigate, useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import {useDispatch} from 'react-redux'
import {IShippingDetails} from 'screens/Orders/orders.types'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ShippingAddressFields from 'components/shipping/ShippingAddressFields'

interface ShippingFormProps {
  setLoading: (loading: boolean) => void
}

const ShippingForm = ({setLoading}: ShippingFormProps) => {
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {orderId} = useParams<{orderId: string}>()
  const {order} = userOrderDetails()
  const {profileId, userId} = useContext(AuthContext)
  const {isAdmin} = useAllUserPlan()
  const shipping_details = order?.shipping_details
  const [shippingData, setShippingData] = useState<IShippingDetails | null>(null)

  useEffect(() => {
    if (!order) return
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
      .then((res: IShippingDetails) => {
        setShippingData(res)
      })
  }, [order])

  const defaultShippingData = shipping_details ? shipping_details : shippingData

  return (
    <Formik
      initialValues={{
        addressed_to: defaultShippingData?.addressed_to ?? order?.order_owner_name ?? '',
        name: defaultShippingData?.name ?? '',
        mobile_number: defaultShippingData?.mobile_number ?? '',
        address_line: defaultShippingData?.address_line ?? '',
        country: defaultShippingData?.country ?? '',
        state: defaultShippingData?.state ?? '',
        city: defaultShippingData?.city ?? '',
        pincode: defaultShippingData?.pincode ?? '',
        default: defaultShippingData?.default ?? false,
      }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        if (!order) return
        const payload = {
          ...values,
          default: false,
          profile_id: safeParseInt(profileId),
          customer_profile_id: getCustomerId({
            order: order,
            profileId: safeParseInt(profileId),
            isAdmin: isAdmin,
          }),
        }
        setLoading(true)

        await dispatchAction(
          createOrder({
            shipping_details: payload,
            status:
              order?.status === orderStatusConstants.NEED_MORE_INFO
                ? orderStatusConstants.NEED_MORE_INFO
                : orderStatusConstants.DRAFT,
            order_id: orderId,
            doctor_id: safeParseInt(userId),
            profile_id: safeParseInt(profileId),
            practice_doctor_id: safeParseInt(order?.doctor_id),
            practice_profile_id: safeParseInt(order?.profile_id),
            practice_organization_id: safeParseInt(order?.organization_id),
          })
        )
          .unwrap()
          .then((res: any) => {
            setLoading(false)
            if (!hasValue(orderId)) {
              navigate(`${res.order_id}`)
            }
            dispatchAction(nextStep())
          })
      }}
    >
      {(formik) => {
        useEffect(() => {
          if (!order) return
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
              if (shipping_details) return

              formik.setFieldValue('name', res.name)
              formik.setFieldValue('address_line', res.address_line)
              formik.setFieldValue('mobile_number', res.mobile_number)
              formik.setFieldValue('country', res.country)
              formik.setFieldValue('state', res.state)
              formik.setFieldValue('city', res.city)
              formik.setFieldValue('pincode', res.pincode)
            })
        }, [shipping_details, order])

        return (
          <>
            <ShippingAddressFields formik={formik} dispatch={dispatch} />

            <FooterRedesigned onNext={() => formik.handleSubmit()} />
          </>
        )
      }}
    </Formik>
  )
}

export default ShippingForm
