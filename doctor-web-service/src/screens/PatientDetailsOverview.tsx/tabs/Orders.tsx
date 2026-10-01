import useDispatchAction from '@hooks/useDispatchAction'
import {Button, Spin, Tabs} from 'antd'
import {AuthContext} from 'context/AuthContext'
import moment from 'moment'
import {useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {IPatientOrder, PatientOrderList} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {ProductCard} from '../pages/PatientOrderView'
import ClonedIcon from 'assets/icons/ClonedIcon'
import CalendarIcon from 'assets/icons/CalendarIcon'
import EyeIcon from 'assets/icons/EyeIcon'
import CopyIcon from 'assets/icons/CopyIcon'
import 'styles/patient-orders-tabs.css'

export const Orders = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const navigate = useNavigate()
  const {isEnterprisePlanUser} = useAllUserPlan()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {data} = useSelector((state: RootState) => state.leadsProfileDetails)

  useEffect(() => {
    dispatchAction(
      PatientOrderList({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        sort_criteria: {
          type: 'date',
          sort: 'desc',
        },
      })
    )
  }, [])

  const {patientOrderList, loadingPatientOrderList} = useSelector(
    (state: RootState) => state.profile
  )

  const orderFilterList = patientOrderList.filter(
    (o) => o.order_status !== 'ARCHIVED' && o.order_status !== 'DRAFT'
  )

  const pairedOrders = useMemo(() => {
    if (!patientOrderList?.length) return null

    const planning = orderFilterList.find((o) => o.order_type === 'PLANNING_ORDER')
    const aligner = orderFilterList.find((o) => o.order_type === 'ALIGNER_ORDER')

    if (planning && aligner && planning.order_id === aligner.linked_order_id) {
      return {
        sent: planning,
        received: aligner,
      }
    }

    return null
  }, [patientOrderList])

  const patientHasPlan = !data?.getting_started_details?.treatment_enable
  const getOrderViewPath = (order: IPatientOrder) =>
    serviceConfig?.VSP_PLANNING && patientId
      ? `/vsp-profile/${patientId}/case-details?order_id=${order.order_id}`
      : `/view-order/${order.order_id}`

  const renderOrderCard = (order: IPatientOrder, showCloneCTA: boolean) => {
    return (
      <div
        className='cursor-pointer hover:shadow-md transition-shadow duration-200'
        onClick={() => navigate(getOrderViewPath(order))}
        key={order.order_id}
      >
        <div className='border border-mediumGray rounded-xl bg-white overflow-hidden'>
          {/* Header Section */}
          <div className='bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-mediumGray'>
            <div className='flex flex-wrap gap-3 justify-between items-start'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='text-xl font-bold text-neutralBlack'>#{order?.order_id}</span>
                  {order?.is_cloned_order && (
                    <span className='px-2.5 py-1 text-xs font-semibold text-primaryColor bg-primarySupport rounded-full inline-flex items-center gap-1'>
                      <ClonedIcon />
                      Cloned
                    </span>
                  )}
                  <span className='px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full'>
                    {order?.order_type === 'ALIGNER_ORDER' ? 'Aligner Order' : 'Planning Order'}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-1.5 text-sm text-textColor'>
                <CalendarIcon />
                <span className='font-medium'>
                  {moment(order?.order_creation_date).format('DD-MMM-YYYY')}
                </span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className='p-5 bg-white'>
            <ProductCard
              product={order?.service_products ?? undefined}
              product_name={order?.product_name}
              product_image={order?.product_image}
              product_description={order?.product_description}
            />
          </div>

          {/* Action Footer */}
          <div className='px-5 py-4 bg-gray-50 border-t border-mediumGray flex flex-wrap gap-3 items-center'>
            <Button
              type='default'
              onClick={(e) => {
                e.stopPropagation()
                navigate(getOrderViewPath(order))
              }}
              className='px-5 py-2.5 h-auto text-sm font-semibold text-neutralBlack bg-white border-mediumGray hover:!bg-gray-50 hover:!border-gray-400 transition-all'
            >
              <span className='flex items-center gap-2'>
                <EyeIcon />
                View Details
              </span>
            </Button>
            {showCloneCTA &&
              !order?.linked_order_id &&
              isEnterprisePlanUser &&
              patientId &&
              serviceConfig?.ALIGNER_PLANNING_MANUFACTURING &&
              patientHasPlan && (
                <Button
                  type='default'
                  onClick={(event) => {
                    event.stopPropagation()
                    const query = new URLSearchParams({
                      orderType: 'purchase-order',
                      customerOrderId: order?.order_id ?? '',
                    }).toString()
                    navigate(`/planning-setup-stepper/${patientId}?${query}`)
                  }}
                  className='px-5 py-2.5 h-auto text-sm font-semibold text-white bg-primaryColor border-primaryColor hover:!bg-primaryColor hover:!opacity-90 transition-all'
                >
                  <span className='flex items-center gap-2'>
                    <CopyIcon color='white' />
                    Clone Order
                  </span>
                </Button>
              )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Spin spinning={loadingPatientOrderList}>
      <div className=''>
        <div className='text-lg font-semibold mb-4'>Orders</div>

        {(orderFilterList?.length ?? 0) === 0 ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <div className='text-3xl text-gray-400'>🗂️</div>
            </div>
            <div className='text-lg font-semibold text-textColor mb-2'>No Orders present</div>
            <div className='text-sm text-gray-500 mb-4 text-center max-w-xl'>
              There are no orders for this patient yet.
            </div>
          </div>
        ) : pairedOrders ? (
          <Tabs
            className='patient-orders-tabs'
            defaultActiveKey='received'
            tabBarGutter={16}
            size='middle'
            items={[
              {
                key: 'received',
                label: (
                  <div className='patient-orders-tab-label'>
                    <span className='font-semibold text-sm'>Sent</span>
                    <span className='text-xs opacity-75'>To lab</span>
                  </div>
                ),
                children: renderOrderCard(pairedOrders.sent, false),
              },
              {
                key: 'sent',
                label: (
                  <div className='patient-orders-tab-label'>
                    <span className='font-semibold text-sm'>Received</span>
                    <span className='text-xs opacity-75'>From customer</span>
                  </div>
                ),
                children: renderOrderCard(pairedOrders.received, false),
              },
            ]}
          />
        ) : (
          (orderFilterList ?? []).map((order: IPatientOrder) =>
            renderOrderCard(order, !order?.is_cloned_order)
          )
        )}
      </div>
    </Spin>
  )
}
