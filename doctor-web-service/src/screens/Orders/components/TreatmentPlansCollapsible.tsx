import {Collapse} from 'antd'
import userOrderDetails from '../hooks/userOrderDetails'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_PLUS_PRIMARY} from 'utils/SvgConstants'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import TreatmentPlanCard from 'screens/Patients/LeadsProfile/main/treatment/clearAligners/components/TreatmentPlanCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {orderDetailsPanelStyles} from '../constants'
import ExpandIcon from 'components/atom/SVG/ExpandIcon'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import {useNavigate} from 'react-router-dom'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import orderStatusConstants from '@constants/orderStatus.constants'
import shouldShowRequestStlFilesSection from 'screens/Patients/LeadsProfile/main/treatment/clearAligners/helpers/shouldShowRequestStlFilesSection'
import CreateTreatmentPlanModal from './CreateTreatmentPlanModal'
import {useState} from 'react'
import {setTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {setOpenOverOrderLimit} from 'redux/Slices/AppSlice/Labs/labs.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import clsx from 'clsx'
import getColorPalette from 'utils/getColorPalette'
import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'

const TreatmentPlansCollapsible = () => {
  const {dispatchAction} = useDispatchAction()
  const {isOrganization, isDesignLabUser, isCustomer, isVendor, isEnterprisePlanUser} =
    useAllUserPlan()

  const {order} = userOrderDetails()
  const allowCreateTreatmentPlan = !order?.is_purchase_order
  const navigate = useNavigate()
  const treatmentPlans = order?.treatment_plan_responses
  const patientId = order?.patient_details?.id
  const lastTreatmentIsCompleted = order?.status === orderStatusConstants.COMPLETED
  const [open, setOpen] = useState(false)
  const {permissionChecks} = useFeatureAccess()
  const createPlanPermission =
    permissionChecks?.treatmentPlanManagement?.createSavePlanAsDraft?.isAddable
  const handleCreateTreatmentPlan = () => {
    if (isOrganization) {
      setOpen(true)
      return
    }
    dispatchAction(setTreatmentPlan({}))
    navigate(
      `/leads-profile/${patientId}/treatment/new/setupTreatmentPlan?order_id=${order?.order_id}`
    )
  }
  const {subscriptionData} = useSelector((state: RootState) => state.subscription)
  const isNotAccessible =
    subscriptionData.total_orders <= subscriptionData.used_orders && (isDesignLabUser || isVendor)
  const orderSubscriptionsAlerts = getSubscriptionAlerts({subscriptionData})
  const canCreateTreatmentPlan =
    allowCreateTreatmentPlan &&
    (order?.status === orderStatusConstants.ORDERED ||
      order?.status === orderStatusConstants.RE_PLAN ||
      order?.status === orderStatusConstants.IN_PROGRESS)

  const hasDraftTreatmentPlans =
    allowCreateTreatmentPlan &&
    treatmentPlans?.every(
      (item) => item.initiator_status === treatmentPlanStatusConstants.IN_PROGRESS
    )

  const renderTreatmentPlans = () => (
    <div className='flex flex-col gap-2'>
      <When isTrue={hasDraftTreatmentPlans}>
        <InfoCard
          className='bg-orangeSupport text-orange flex md:!justify-between !justify-start  border border-orange'
          titleClassName='!text-black font-semibold text-base'
          title='Finalize and send treatment plans'
          content='You have draft treatment plans. Finalize them and send them for approval.'
          showButton={false}
          infoIconColor='#BE8901'
        />
      </When>
      <div className='flex flex-col gap-4 '>
        {treatmentPlans?.map((treatmentPlan, index, treatmentPlanList) => {
          const showRequestStlFilesSection = shouldShowRequestStlFilesSection({
            treatmentPlanList,
            treatmentPlan,
            isCustomer,
          })
          return (
            <div key={index}>
              <TreatmentPlanCard
                treatmentPlan={treatmentPlan}
                patientIdFromOrder={patientId}
                showRequestStlFilesSection={showRequestStlFilesSection}
              />
              {treatmentPlan.treatment_status === treatmentPlanStatusConstants.ACTIVE && (
                <hr className='mt-3' />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderNoTreatmentPlans = () => (
    <>
      <When
        isTrue={
          canCreateTreatmentPlan &&
          !hasValue(order?.purchase_order_details) &&
          (isOrganization || isEnterprisePlanUser)
        }
      >
        <InfoCard
          className='border border-primaryColor bg-primarySupport text-sm font-normal'
          titleClassName='text-black text-base font-semibold'
          title='Forward case to Planning Lab'
          content='Clone the order details and forward the case to your planning lab to receive a custom treatment plan.'
          showButton={true}
          buttonText='Prepare case'
          onClick={handleCreateTreatmentPlan}
        />
      </When>
      <When
        isTrue={
          hasValue(order?.purchase_order_details) && !order?.is_purchase_order && isOrganization
        }
      >
        {order?.purchase_order_details?.status !== orderStatusConstants.NEED_MORE_INFO &&
          order?.purchase_order_details?.status !== orderStatusConstants.CANCELLED && (
            <InfoCard
              className='border border-primaryColor bg-primarySupport text-sm font-normal'
              titleClassName='text-textColor text-xs font-semibold'
              title={'PURCHASE ORDER STATUS'}
              content={
                <div>
                  <p className='text-base text-black font-semibold'>
                    {!hasValue(order?.purchase_order_treatment_plan_ids_count) ||
                    order?.purchase_order_treatment_plan_ids_count === 0
                      ? 'In progress'
                      : `${order?.purchase_order_treatment_plan_ids_count} treatment plans received`}
                  </p>
                  <p className='text-textColor text-sm font-normal'>
                    {!hasValue(order?.purchase_order_treatment_plan_ids_count) ||
                    order?.purchase_order_treatment_plan_ids_count === 0
                      ? 'We will notify you once the organization takes action on the order.'
                      : `Clone them from the purchase order and send them for approval.`}
                  </p>
                </div>
              }
              showButton={true}
              buttonText='View order'
              onClick={() => {
                navigate(`/orders/${order?.purchase_order_details?.order_id}`)
              }}
              buttonClassName={'text-white bg-primaryColor'}
              iconColor='white'
              ButtonIcon={CaretRightIcon}
              Icon={ClipBoardIcon}
            />
          )}
        {order?.purchase_order_details?.status === orderStatusConstants.NEED_MORE_INFO && (
          <InfoCard
            className='border border-secondaryColor bg-secondarySupport text-sm font-normal'
            titleClassName='text-textColor text-xs font-semibold'
            title={'PURCHASE ORDER STATUS'}
            content={
              <div>
                <p className='text-base text-black font-semibold'>Need more information</p>
                <p className='text-textColor text-sm font-normal'>
                  More information requested. Please review remarks and update the order
                  details.{' '}
                </p>
              </div>
            }
            showButton={true}
            buttonText='View details'
            onClick={() => {
              navigate(`/orders/${order?.purchase_order_details?.order_id}`)
            }}
            buttonClassName={'bg-secondaryColor text-white border-none '}
            infoIconColor={getColorPalette().secondaryColor}
            iconColor={getColorPalette().white}
            ButtonIcon={CaretRightIcon}
            Icon={ClipBoardIcon}
          />
        )}
        {order?.purchase_order_details?.status === orderStatusConstants.CANCELLED && (
          <InfoCard
            className='border border-red bg-redSupport text-sm font-normal'
            titleClassName='text-textColor text-xs font-semibold'
            title={'PURCHASE ORDER STATUS'}
            content={
              <div>
                <p className='text-base text-black font-semibold'>Order cancelled</p>
                <p className='text-textColor text-sm font-normal'>
                  The purchase order was cancelled. You can view the remarks or create a new order.
                </p>
              </div>
            }
            showButton={true}
            buttonText='View remarks'
            onClick={() => {
              navigate(`/orders/${order?.purchase_order_details?.order_id}`)
            }}
            buttonClassName={'text-red bg-redSupport border-red'}
            infoIconColor='#F45045'
            iconColor='#F45045'
            ButtonIcon={CaretRightIcon}
            Icon={ClipBoardIcon}
          />
        )}
      </When>

      <div className='flex flex-col gap-2 items-center justify-center text-textColor border border-mediumGray rounded-lg py-10  text-base mt-2'>
        <div className='p-3 rounded-full w-fit h-fit bg-lightGray'>
          <ClipBoardIcon width='32' height='32' />
        </div>
        <p className='text-center'>No treatment plans created yet</p>
      </div>
    </>
  )
  const hasPermissionToCreatePlan =
    canCreateTreatmentPlan && !lastTreatmentIsCompleted && createPlanPermission

  return (
    <div className='p-4'>
      <Collapse
        defaultActiveKey={['1']}
        bordered={false}
        style={{
          padding: 0,
          backgroundColor: 'transparent',
        }}
        items={[
          {
            key: '1',
            label: (
              <div className='text-lg font-semibold flex flex-col gap-1'>
                <p>Treatment plans </p>
                {hasPermissionToCreatePlan && (
                  <button
                    className={clsx(
                      'w-full md:w-fit  md:hidden flex justify-center items-center gap-2 border px-3 py-2 rounded-lg font-semibold',
                      order?.status === orderStatusConstants.NEED_MORE_INFO
                        ? 'bg-grayDisabled border-textColor text-textColor'
                        : 'bg-primarySupport border-primaryColor text-primaryColor'
                    )}
                    type='button'
                    disabled={order?.status === orderStatusConstants.NEED_MORE_INFO}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isNotAccessible) {
                        dispatchAction(setOpenOverOrderLimit(true))
                        return
                      }
                      handleCreateTreatmentPlan()
                    }}
                  >
                    <CommonSVG svg={SVG_PLUS_PRIMARY} width='16' height='16' />
                    Create treatment plan
                  </button>
                )}
              </div>
            ),
            children: (
              <>
                <When isTrue={hasValue(treatmentPlans)}>{renderTreatmentPlans()}</When>
                <When isTrue={!hasValue(treatmentPlans)}>{renderNoTreatmentPlans()}</When>
              </>
            ),
            forceRender: true,
            styles: {
              ...orderDetailsPanelStyles,
              header: {
                ...orderDetailsPanelStyles.header,
                borderBottom: '1px solid #E5E5E5',
                paddingBottom: 12,
                alignItems: 'start',
              },
              body: {
                ...orderDetailsPanelStyles.body,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 12,
                paddingBottom: 0,
              },
            },
            extra: (
              <When isTrue={hasPermissionToCreatePlan && !orderSubscriptionsAlerts.order.error}>
                <button
                  className='w-full md:w-fit hidden md:flex justify-center items-center gap-2 bg-primarySupport border border-primaryColor text-primaryColor px-3 py-2 rounded-lg font-semibold '
                  type='button'
                  onClick={handleCreateTreatmentPlan}
                >
                  <CommonSVG svg={SVG_PLUS_PRIMARY} width='16' height='16' />
                  Create treatment plan
                </button>
              </When>
            ),
          },
        ]}
        expandIcon={({isActive}) => (
          <div className='h-full '>
            <ExpandIcon {...{isActive}} />
          </div>
        )}
        expandIconPosition='start'
      />
      <When isTrue={allowCreateTreatmentPlan}>
        <CreateTreatmentPlanModal {...{patientId, open, setOpen, orderId: order?.order_id}} />
      </When>
    </div>
  )
}

export default TreatmentPlansCollapsible
