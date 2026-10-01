import orderStatusConstants from '@constants/orderStatus.constants'
import {StepProps} from 'antd'
import {getCreateOrderSteps} from 'screens/Orders/components/CreateOrderSteps'
import {IOrder} from 'screens/Orders/orders.types'
import hasValue from 'utils/hasValue'

const getStatus = (order: IOrder | null, stepId: number, currentStep: number) => {
  const isCurrentStep = stepId === currentStep

  const getStatusByValue = (value: boolean | undefined) =>
    isCurrentStep ? 'process' : value ? 'finish' : 'wait'

  switch (stepId) {
    case 0:
      return getStatusByValue(hasValue(order?.patient_details))
    case 1:
      return getStatusByValue(hasValue(order?.order_details))
    case 2:
      return getStatusByValue(hasValue(order?.case_record_id))
    case 3:
      return getStatusByValue(hasValue(order?.prescription_details))
    case 4:
      return getStatusByValue(hasValue(order?.shipping_details))
    case 5:
      return isCurrentStep ? 'process' : 'wait'
    default:
      return isCurrentStep ? 'process' : 'wait'
  }
}

const isDisabled = (
  order: IOrder | null,
  isEditOrder: boolean | undefined,
  stepId: number,
  isLabSelected: boolean
) => {
  switch (stepId) {
    case 0:
      return order?.status === orderStatusConstants.NEED_MORE_INFO || hasValue(order?.order_details)
    case 1:
      return isEditOrder ? false : !hasValue(order?.patient_details)
    case 2:
    case 3:
      return !hasValue(order?.order_details) || !isLabSelected
    case 4: // This case will only be reached when isOrganization is false
      return !hasValue(order?.prescription_details) || !isLabSelected
    case 5: // Review and send step (previously 5, now 4 when shipping is removed)
      return !hasValue(order?.prescription_details) || !isLabSelected
    default:
      return false
  }
}

export default ({
  order,
  isEditOrder,
  currentStep,
  isLabSelected = false,
  steps,
  isPlanningOrder,
}: {
  order: IOrder | null
  isEditOrder?: boolean
  currentStep: number
  isLabSelected?: boolean
  isPractice?: boolean
  steps?: StepProps[]
  isPlanningOrder: boolean
}): StepProps[] => {
  const stepsToShow = steps ?? getCreateOrderSteps({isPlanningOrder: isPlanningOrder})

  return stepsToShow.map((step) => ({
    ...step,
    disabled: isDisabled(order, isEditOrder, step.id, isLabSelected),
    status: getStatus(order, step.id, currentStep),
  }))
}
