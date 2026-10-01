import orderStatusConstants from '@constants/orderStatus.constants'
import {StepProps} from 'antd'
import {IOrder} from 'screens/Orders/orders.types'
import hasValue from 'utils/hasValue'
import {getCreateOrderSteps} from '../components/CreateCustomerOrderSteps'

const getStatus = (order: IOrder | null, stepId: number, currentStep: number) => {
  const isCurrentStep = stepId === currentStep

  const getStatusByValue = (value: boolean | undefined) =>
    isCurrentStep ? 'process' : value ? 'finish' : 'wait'

  switch (stepId) {
    case 0:
      return getStatusByValue(hasValue(order?.order_details))
    case 1:
      return getStatusByValue(hasValue(order?.case_record_id))
    case 2:
      return getStatusByValue(hasValue(order?.prescription_details))
    case 3:
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
      return !hasValue(order?.order_details) || !isLabSelected
    case 2:
      return !hasValue(order?.prescription_details) || !isLabSelected
    case 3:
      return !hasValue(order?.prescription_details) || !isLabSelected
    case 4:
      return
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
}: {
  order: IOrder | null
  isEditOrder?: boolean
  currentStep: number
  isLabSelected?: boolean
  isPractice?: boolean
  steps?: StepProps[]
}): StepProps[] => {
  const stepsToShow = steps ?? getCreateOrderSteps()

  return stepsToShow.map((step) => ({
    ...step,
    disabled: isDisabled(order, isEditOrder, step.id, isLabSelected),
    status: getStatus(order, step.id, currentStep),
  }))
}
