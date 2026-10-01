import {Card, SectionTitle} from '../ProductionSetupReview'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import clsx from 'clsx'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useContext, useEffect, useMemo, useState} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {getCheckListData} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import ChecklistWithProgressView from 'screens/PatientDetailsOverview.tsx/components/ChecklistWithProgressView'
import {AuthContext} from 'context/AuthContext'
import {getOrderDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'

type ShippingAddress = {
  addressed_to?: string | null
  mobile_number?: string | null
  name?: string | null
  address_line?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  pincode?: string | null
}

const hasShippingAddress = (shipping?: ShippingAddress | null) =>
  Boolean(
    shipping &&
      typeof shipping === 'object' &&
      (shipping.addressed_to ||
        shipping.name ||
        shipping.address_line ||
        shipping.city ||
        shipping.state ||
        shipping.country ||
        shipping.pincode)
  )

type Props = {
  /** manufacturing batch id to view */
  id: number
}

const FooterDetailsView: React.FC<Props> = ({id}) => {
  const {isEnterprisePlanUser, isPractice} = useAllUserPlan()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {instructions, productType} = useSelector((state: RootState) => state.productionSetup)
  const treatmentShipping = treatmentPlan?.shipping_details_response as ShippingAddress | null
  const [orderShipping, setOrderShipping] = useState<ShippingAddress | null>(null)
  const getProductionChecklist = useSelector(
    (state: RootState) => (state as any)?.profile?.getProductionChecklist
  )

  useEffect(() => {
    if (id) {
      dispatchAction(getCheckListData({batch_id: id} as any))
    }
  }, [id, dispatchAction])

  const hasTreatmentShipping = hasShippingAddress(treatmentShipping)
  const orderId = treatmentPlan?.order_id

  useEffect(() => {
    if (hasTreatmentShipping || !orderId || !userId) {
      setOrderShipping(null)
      return
    }

    let isMounted = true

    dispatchAction(
      getOrderDetails({
        order_id: String(orderId),
        doctor_id: safeParseInt(userId),
        updateLoadingState: false,
      })
    )
      .unwrap()
      .then((res: {data?: {shipping_details?: ShippingAddress | null}}) => {
        if (isMounted) {
          setOrderShipping(res?.data?.shipping_details ?? null)
        }
      })
      .catch(() => {
        if (isMounted) {
          setOrderShipping(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [dispatchAction, hasTreatmentShipping, orderId, userId])

  const productList = useMemo(
    () => (Array.isArray(getProductionChecklist) ? getProductionChecklist : []),
    [getProductionChecklist]
  )

  const shipping = hasTreatmentShipping ? treatmentShipping : orderShipping
  const hasShipping = hasShippingAddress(shipping)

  const isOutsource = productType === 'OUTSOURCE'

  return (
    <div className={clsx('grid gap-5', isOutsource ? 'md:grid-cols-2 grid-cols-1' : 'grid-cols-1')}>
      <Card className={clsx(!isOutsource && 'md:col-span-2')}>
        <SectionTitle title='Production Instructions' />
        <div className='rounded-lg border bg-white mb-3'>
          {/* Pure VIEW — title/checked from API only */}
          <ChecklistWithProgressView productList={productList} />
        </div>

        <div className='space-y-2'>
          <SectionTitle title='Production Comment' />
          <div className='bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-slate-700'>
            {instructions ? (
              <span className='font-medium text-slate-700'>{instructions}</span>
            ) : (
              <span className='text-slate-400 italic'>No comments added</span>
            )}
          </div>
        </div>
      </Card>

      {(isOutsource || isEnterprisePlanUser || isPractice) && (
        <Card>
          <SectionTitle title='Shipping Address' />
          {hasShipping ? (
            <div className='text-sm text-slate-700 space-y-1'>
              <div className='font-medium'>{shipping?.addressed_to}</div>
              <div className='font-medium'>{shipping?.name}</div>
              <div className='font-medium'>{shipping?.mobile_number}</div>
              <div>{shipping?.address_line}</div>
              <div>{[shipping?.city, shipping?.state].filter(Boolean).join(', ')}</div>
              <div>{shipping?.country}</div>
              <div>{shipping?.pincode}</div>
            </div>
          ) : (
            <div className='text-sm text-slate-500'>No shipping address added.</div>
          )}
        </Card>
      )}
    </div>
  )
}

export default FooterDetailsView
