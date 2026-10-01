import {Divider} from 'antd'
import TreatmentPlansCollapsible from './TreatmentPlansCollapsible'
import TimeLineCollapsible from './TimeLineCollapsible'
import OrderDetailsCollapsible from './OrderDetailsCollapsible'
import OrderLimitError from 'components/subscription/modals/OrderLimitError'
import ManufacturingCollapsible from './ManufacturingCollapsible'
import When from 'components/when/When'
import userOrderDetails from '../hooks/userOrderDetails'
import AddShippingModal from 'screens/Patients/LeadsProfile/main/overview/components/AddShippingModal'
import CompleteManufacturingModal from 'screens/Patients/LeadsProfile/main/overview/components/CompleteManufacturingModal'
import ConfirmMarkAsDelivered from 'screens/Patients/LeadsProfile/main/overview/components/ConfirmMarkAsDelivered'
import ConfirmShippedModal from 'screens/Patients/LeadsProfile/main/overview/components/ConfirmShippedModal'
import StartManufacturingModal from 'screens/Patients/LeadsProfile/main/overview/components/StartManufacturingModal'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {getOrderDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getActiveTreatmentPlan, safeParseInt} from 'utils/ConstFunctions'
import useAllUserPlan from '@hooks/useAllUserPlan'

const OrderMainPage = () => {
  const {isAlignerCompanyOrg, isPractice} = useAllUserPlan()
  const {order} = userOrderDetails()
  const isPurchaseOrder = order?.is_purchase_order
  const is_customer_order = order?.is_customer_order
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)

  const {
    openModalManufacturing,
    openConfirmShippedModal,
    openShippingDetailsModal,
    openCompleteManufacturingModal,
    openConfirmMarkAsDeliveredModal,
  } = useSelector((state: RootState) => state.GettingStartedOverview)

  const isShowManufacturingStatus =
    (isPractice && !is_customer_order) ||
    (isAlignerCompanyOrg && !isPurchaseOrder && !is_customer_order)

  const activeTreatementData: AllTreatmentPlanListItem | null = getActiveTreatmentPlan(order)
  const treatment_plan_id = activeTreatementData?.aligner_treatment_id

  const refreshData = () => {
    dispatchAction(
      getOrderDetails({
        doctor_id: safeParseInt(userId),
        order_id: order?.order_id ?? '',
        retrieve_treatment_plan: true,
        updateLoadingState: false,
      })
    )
  }

  return (
    <div className='min-w-[75%] border border-mediumGray rounded-md flex flex-col'>
      {openModalManufacturing && (
        <StartManufacturingModal
          openModal={openModalManufacturing}
          treatment_plan_id={treatment_plan_id}
          refreshData={refreshData}
        />
      )}
      <AddShippingModal openModal={openShippingDetailsModal} refreshData={refreshData} />
      <CompleteManufacturingModal
        openModal={openCompleteManufacturingModal}
        refreshData={refreshData}
      />
      <ConfirmShippedModal openModal={openConfirmShippedModal} refreshData={refreshData} />
      <ConfirmMarkAsDelivered
        openModal={openConfirmMarkAsDeliveredModal}
        refreshData={refreshData}
      />
      <OrderLimitError />
      <When isTrue={isShowManufacturingStatus}>
        <ManufacturingCollapsible />
      </When>
      <TreatmentPlansCollapsible />
      <Divider />
      <TimeLineCollapsible />
      <Divider />
      <OrderDetailsCollapsible />
    </div>
  )
}

export default OrderMainPage
