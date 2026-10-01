import useDispatchAction from '@hooks/useDispatchAction'
import {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useParams, useSearchParams, useLocation} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import {getVspOrderById} from 'redux/Slices/AppSlice/VSP/orders.slice'
import {RootState} from 'redux/store'

export const useVspOrder = (getFreshData: boolean = true) => {
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const orderIdFromSearchParams = searchParams.get('order_id')
  const patientIdFromSearchParams = searchParams.get('patient_id')
  const {orderId: orderIdFromParams} = useParams<{orderId: string}>()
  const orderId = orderIdFromParams || orderIdFromSearchParams
  const location = useLocation()
  const statePatientId = (location.state as {patientId?: number | string} | null)?.patientId
  const resolvedPatientId =
    safeParseInt(statePatientId) || safeParseInt(patientIdFromSearchParams) || undefined

  const {vspOrderDetails, getVspOrderByIdLoading, getVspOrderByIdError} = useSelector(
    (state: RootState) => state.vspOrders
  )

  useEffect(() => {
    if (!getFreshData) return
    if (!orderId) return

    dispatchAction(
      getVspOrderById({
        order_id: orderId,
      })
    )
  }, [getFreshData, orderId])

  return {
    vspOrderDetails: getFreshData ? (!orderId ? null : vspOrderDetails) : vspOrderDetails,
    loadingVspOrder: getVspOrderByIdLoading,
    vspOrderError: getVspOrderByIdError,
    orderId,
    patientId: resolvedPatientId,
  }
}
