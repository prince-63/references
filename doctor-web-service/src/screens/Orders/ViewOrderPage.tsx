import Page from 'components/page/Page'
import OrderLeftPanel from './components/OrderLeftPanel'
import OrderMainPage from './components/OrderMainPage'
import userOrderDetails from './hooks/userOrderDetails'
import OrderStatusSteps from './components/OrderStatusSteps'
import {useContext, useEffect, useState} from 'react'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  clearOrder,
  getActiveUsers,
  needMoreInfo,
  updateCurrentStep,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import {AuthContext} from 'context/AuthContext'
import {Divider} from 'antd'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import When from 'components/when/When'
import OrderStatusTag from './components/OrderStatusTag'
import {Select} from 'antd'
import {getOrderDetails, updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getManufacturingListDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import NeedMoreInfo from './components/NeedMoreInfo'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import CancelOrder from './components/CancelOrder'
import InfoCardWithDropdown from 'components/instruction/InfoCardWithDropdown'
import moment from 'moment'
import {useNavigate, useParams} from 'react-router-dom'
import orderStatusConstants from '@constants/orderStatus.constants'
import InfoIcon from 'assets/icons/InfoIcon'
import CrossIcon from 'assets/icons/CrossIcon'
import getColorPalette from 'utils/getColorPalette'
import InfoCard from 'components/instruction/InfoCard'
import useAllUserPlan from '@hooks/useAllUserPlan'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import InfoCardWithContainer from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCardWithContainer'

const ViewOrderPage = () => {
  const {loadingOrder, order} = userOrderDetails(true, true)
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {orderId} = useParams()
  const {order: orders} = useSelector((state: RootState) => state.orders)
  const patientData = orders.patient_details
  const {activeUsers} = useSelector((state: RootState) => state.orders)
  const {
    isDesignLabUser,
    isVendor,
    isEnterprisePlanUser,
    isAlignerCompanyOrg,
    isPractice,
    isCustomer,
  } = useAllUserPlan()
  const isPurchaseOrder = order?.is_purchase_order
  const is_customer_order = order?.is_customer_order
  const isShowManufacturingStatus =
    (isPractice && !is_customer_order) ||
    (isAlignerCompanyOrg && !isPurchaseOrder && !is_customer_order)

  const [assigningUser, setAssigningUser] = useState(false)

  const latestTreatmentPlan = order?.treatment_plan_responses?.[0] ?? null
  const treatmentCompletedRemarks = latestTreatmentPlan?.treatment_plan_completed_remarks ?? ''

  const activeTreatmentId =
    order &&
    order?.treatment_plan_responses?.find(
      (treatment: AllTreatmentPlanListItem) =>
        treatment.treatment_status === 'ACTIVE' || treatment.treatment_status === 'COMPLETE'
    )?.aligner_treatment_id

  const queryActiveUsers = async (query: string) => {
    await dispatchAction(
      getActiveUsers({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: query,
          doctor_id: safeParseInt(userId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['LAB_STAFF', 'INTERNAL_USER'],
        },
      })
    )
  }
  useEffect(() => {
    queryActiveUsers('')
    return () => {
      dispatchAction(clearOrder())
    }
  }, [])

  useEffect(() => {
    if (hasValue(orders)) {
      if (!hasValue(activeTreatmentId) && activeTreatmentId === 0) return

      dispatchAction(
        getManufacturingListDetails({
          patient_id: safeParseInt(patientData.id),
          treatment_plan_id: safeParseInt(activeTreatmentId),
        })
      )
    }
  }, [orders])
  const order_status =
    order?.status === 'COMPLETED'
      ? order?.manufacturing_status === 'DELIVERED' &&
        order?.unprocessed_aligner_details?.total_aligners === 0
        ? 'MANUFACTURING_COMPLETED'
        : order?.manufacturing_status
      : order?.status

  const getNeedMoreInfoOrCancelOrder = () => {
    return (
      <div className='flex flex-col gap-3 mb-4 md:mt-0 mt-3'>
        <When isTrue={order?.status === orderStatusConstants.NEED_MORE_INFO}>
          {isPractice || isCustomer || (isAlignerCompanyOrg && order?.is_purchase_order) ? (
            <InfoCardWithDropdown
              title={`Need more information on ${moment(order?.need_more_info_updated_on).format(
                'DD-MMM-YYYY'
              )}`}
              subTitle='To continue, please review the feedback and update the order with the requested details.'
              text={order?.need_more_info_remark ?? ''}
              bgColor='#E9F3FA'
              color='#0095FF'
              buttonText='Edit order'
              onClick={() => {
                dispatchAction(updateCurrentStep(1))
                navigate(`/orders/create-order/${order?.order_id}`)
              }}
            />
          ) : (
            <InfoCardWithDropdown
              title={`Need more information on ${moment(order?.need_more_info_updated_on).format(
                'DD-MMM-YYYY'
              )}`}
              text={order?.need_more_info_remark ?? ''}
              bgColor='#E9F3FA'
              color='#0095FF'
            />
          )}
        </When>
        <When isTrue={order?.status === orderStatusConstants.CANCELLED}>
          {(isPractice || isCustomer) && (
            <InfoCard
              title={'What next? Create new order'}
              subTitle={
                'Create a new order to continue with the treatment process for the patient.'
              }
              color={getColorPalette().secondaryColor}
              className='bg-secondarySupport border-secondaryColor'
              classNameButton='bg-secondaryColor text-white '
              buttonText='Create order'
              hideIcon={true}
              onClick={() => {
                navigate('/orders/create-order', {
                  state: {
                    patientId: order?.patient_details?.id,
                  },
                })
              }}
            />
          )}
          <InfoCardWithDropdown
            title={`This order was cancelled on ${moment(order?.cancelled_on).format(
              'DD-MMM-YYYY'
            )}`}
            text={order?.cancel_order_remark ?? ''}
            bgColor='#FEF4F4'
            color='#F45045'
          />
        </When>
        <When isTrue={order?.is_need_more_info_updated}>
          <div className='flex justify-between md:items-center border border-secondaryColor bg-secondarySupport px-4 py-2 rounded-lg'>
            <div className='flex gap-2 md:items-center'>
              <InfoIcon width='20' height='20' color={getColorPalette().secondaryColor} />
              <div className='text-sm font-medium'>
                {isPractice || isCustomer || (isAlignerCompanyOrg && order?.is_purchase_order)
                  ? 'Updated order details as requested. Reviewing and processing order should resume shortly.'
                  : 'Updated order details as requested. Please review the changes and proceed with processing.'}
              </div>
            </div>
            <div
              onClick={() => {
                const payload = {
                  order_id: order?.order_id ?? '',
                  order_status: orderStatusConstants.ORDERED,
                  is_need_more_info_updated: false,
                  need_more_info: null,
                }
                dispatchAction(needMoreInfo(payload))
                  .unwrap()
                  .then(() => {
                    dispatchAction(
                      getOrderDetails({
                        doctor_id: safeParseInt(userId),
                        order_id: orderId ?? '',
                        retrieve_treatment_plan: true,
                      })
                    )
                  })
              }}
            >
              <CrossIcon />
            </div>
          </div>
        </When>
      </div>
    )
  }

  useEffect(() => {
    if (orders?.is_new_order) {
      dispatchAction(
        updateOrder({
          is_new_order: false,
          order_id: orderId,
          doctor_id: safeParseInt(userId),
        })
      )
    }
  }, [orders])

  return (
    <Page
      loading={loadingOrder}
      showBackButton
      backNavigationRoute={order?.is_customer_order ? '/orders' : '/aligner-orders'}
    >
      <When
        isTrue={
          order?.treatment_plan_responses &&
          order?.treatment_plan_responses.length > 0 &&
          order?.treatment_plan_responses[0]?.treatment_status ===
            treatmentPlanStatusConstants.COMPLETE
        }
      >
        <InfoCardWithContainer
          title='Treatment plan Completed'
          className='flex md:!justify-between !justify-start border !border-[#0095ff]'
          titleClassName='!text-black font-semibold'
          topSectionClassName='bg-[#E9f3fa]'
          subtitle='This treatment was marked as completed. You may continue processing if required.'
          infoIconColor='#0095ff'
          remarksClassName='!bg-transparent'
          remarks={treatmentCompletedRemarks}
        />
      </When>
      <NeedMoreInfo />
      <CancelOrder />
      {orders?.is_new_order && (
        <div className='sm:hidden h-5 p-1 bg-[#be8901] rounded justify-center items-center gap-2 inline-flex w-[90px]'>
          <div className='text-white text-xs font-semibold uppercase leading-none tracking-wide'>
            New order
          </div>
        </div>
      )}
      <div className='flex items-center gap-2 '>
        {hasValue(patientData?.profile_picture_url) ? (
          <Image
            className='min-w-11 min-h-11 w-11 h-11 max-w-11 max-h-11 object-cover rounded-full'
            src={patientData.profile_picture_url ?? ''}
          />
        ) : (
          <DefaultImage letter={patientData?.first_name.charAt(0)} />
        )}
        <div className='flex flex-col'>
          <div className='flex flex-row items-center gap-2'>
            <p className='font-semibold text-2xl'>
              <div className='text-xl text-black font-bold  truncate ...'>
                {patientData?.first_name} {patientData?.last_name}'s Case
              </div>
            </p>
            {orders?.is_new_order && (
              <div className='hidden sm:inline-flex h-5 p-1 bg-[#be8901] rounded justify-center items-center gap-2'>
                <div className='text-white text-xs font-semibold uppercase leading-none tracking-wide'>
                  New order
                </div>
              </div>
            )}
          </div>
          <div className='flex flex-row items-center text-base font-medium text-textColor'>
            <span>{!order?.is_purchase_order ? 'Case received from' : 'Case sent to'}&nbsp;</span>
            <span className='text-black'>
              <When isTrue={(!isDesignLabUser || isEnterprisePlanUser) && !isVendor}>
                {order?.is_purchase_order
                  ? order?.order_details?.target_user_details?.lab_name
                  : order?.is_customer_order
                    ? order?.order_owner_name
                    : order?.patient_details?.assigned_practice?.name}
              </When>
              <When isTrue={(!isEnterprisePlanUser && isDesignLabUser) || isVendor}>
                {order?.order_owner_name}
              </When>
            </span>
          </div>
        </div>
      </div>
      <div className='sm:hidden'>
        {(isPractice || isAlignerCompanyOrg) && isShowManufacturingStatus ? (
          <OrderStatusTag
            status={order_status ?? ''}
            className='w-full py-2 !justify-start text-start'
            isShowManufacturingStatus={true}
          />
        ) : (
          <OrderStatusTag status={order?.status ?? ''} isShowManufacturingStatus={false} />
        )}
      </div>
      <When isTrue={isDesignLabUser || isVendor}>
        <div className='sm:hidden'>
          <When isTrue={isDesignLabUser || isVendor}>
            <Select
              options={activeUsers}
              showSearch={true}
              disabled={
                assigningUser ||
                order?.status === orderStatusConstants.CANCELLED ||
                order?.status === orderStatusConstants.NEED_MORE_INFO
              }
              loading={assigningUser}
              className='w-full'
              onClick={(e) => e.stopPropagation()}
              value={activeUsers.find((user) => user.value === order?.assigned_lab_user_id)}
              placeholder='Select user'
              dropdownRender={(menu) => (
                <div>
                  <div className='text-textColor uppercase p-2 text-xs'>Assign user</div>
                  {menu}
                </div>
              )}
              onChange={async (value) => {
                setAssigningUser(true)
                dispatchAction(
                  updateOrder({
                    order_id: orders?.order_id,
                    doctor_id: safeParseInt(orders?.doctor_id),

                    assigned_user_details: {
                      assigned_user_name:
                        activeUsers.find((activeUser) => activeUser.value === safeParseInt(value))
                          ?.label ?? '',
                      assigned_user_profile_id: safeParseInt(value),
                    },
                    status: orders?.status === 'ORDERED' ? 'IN_PROGRESS' : orders?.status,
                  })
                )
                  .unwrap()
                  .then(async () => {
                    if (!orders?.order_id) return
                    dispatchAction(
                      getOrderDetails({
                        doctor_id: safeParseInt(userId),
                        order_id: orders?.order_id,
                        retrieve_treatment_plan: true,
                        updateLoadingState: false,
                      })
                    )
                      .unwrap()
                      .then(() => {
                        setAssigningUser(false)
                      })
                  })
              }}
            />
          </When>
        </div>
      </When>
      <Divider className='my-0' />
      <div>
        <div className='sm:hidden flex flex-col'>
          <OrderLeftPanel />
          {order?.status !== orderStatusConstants.CANCELLED && (
            <div className='overflow-x-auto hiddenScrollbar my-4'>
              <OrderStatusSteps
                {...{
                  order,
                }}
              />
            </div>
          )}
          {getNeedMoreInfoOrCancelOrder()}
          <OrderMainPage />
        </div>

        <div className='hidden sm:block'>
          {order?.status !== orderStatusConstants.CANCELLED && (
            <div className='overflow-x-auto hiddenScrollbar my-4'>
              <OrderStatusSteps
                {...{
                  order,
                }}
              />
            </div>
          )}

          <div className='flex flex-row gap-4 flex-1 px-3 pb-3'>
            <div className='w-full flex flex-col gap-3'>
              {getNeedMoreInfoOrCancelOrder()}
              <OrderMainPage />
            </div>
            <OrderLeftPanel />
          </div>
        </div>
      </div>
    </Page>
  )
}

export default ViewOrderPage
