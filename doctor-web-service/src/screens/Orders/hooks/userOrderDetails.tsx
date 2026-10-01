import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useParams, useSearchParams} from 'react-router-dom'
import {getOrderDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'

const userOrderDetails = (getFreshData: boolean = false, retrieveTreatmentPlan?: boolean) => {
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()

  const orderIdFromSearchParams = searchParams.get('order_id')
  const {orderId: orderIdFromParams} = useParams<{orderId: string}>()
  const {order, loadingOrder} = useSelector((state: RootState) => state.orders)

  const {userId} = useContext(AuthContext)
  const orderId = orderIdFromParams || orderIdFromSearchParams

  useEffect(() => {
    if (!getFreshData) return
    if (!orderId) return

    dispatchAction(
      getOrderDetails({
        doctor_id: safeParseInt(userId),
        order_id: orderId,
        ...(retrieveTreatmentPlan && {retrieve_treatment_plan: retrieveTreatmentPlan}),
      })
    )
  }, [orderId])

  return {loadingOrder, order: getFreshData ? (!orderId ? null : order) : order}
}

export default userOrderDetails
