import {CheckCircleFilled} from '@ant-design/icons'
import {StepsProps} from 'antd'
import {IGettingStartedSteps} from '../types/GettingStarted.types'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getGettingStartedStepDetails,
  updateCurrentStepGettingStarted,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'

export const getStepItems = ({
  gettingStartedStepData,
}: {
  gettingStartedStepData: IGettingStartedSteps
}): StepsProps['items'] => {
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const stepLabels = ['Assessment', 'In Planning', 'Manufacturing', 'In Transit', 'Starting Soon']
  const getStep = (key: string) => {
    switch (key) {
      case 'ASSESSMENT':
        return 0
      case 'PLANNING':
        return 1
      case 'IN_MANUFACTURING':
        return 2
      case 'IN_TRANSIT':
        return 3
      case 'STARTING_SOON':
        return 4
      default:
        return 0
    }
  }
  const currentIndex = getStep(gettingStartedStepData.current_step) ?? 0
  const getStepValue = (key: number) => {
    switch (key) {
      case 0:
        return 'ASSESSMENT'
      case 1:
        return 'PLANNING'
      case 2:
        return 'IN_MANUFACTURING'
      case 3:
        return 'IN_TRANSIT'
      case 4:
        return 'STARTING_SOON'
      default:
        return 'ASSESSMENT'
    }
  }

  return stepLabels.map((title, index) => {
    const isCompleted = index < currentIndex
    const isActive = index === currentIndex
    const isDisabled = index > currentIndex

    return {
      title: (
        <div
          onClick={() => {
            if (currentIndex === index) {
              dispatchAction(
                getGettingStartedStepDetails({
                  patient_id: safeParseInt(patientId),
                  filter_by_step: getStepValue(index),
                })
              )
              dispatchAction(updateCurrentStepGettingStarted(index))
            }
          }}
          style={{cursor: 'pointer '}}
        >
          {title}
        </div>
      ),
      status: isCompleted ? 'finish' : isActive ? 'process' : 'wait',
      icon: isCompleted ? (
        <CheckCircleFilled
          style={{
            color: '#00B383',
            fontSize: 25,
            width: 25,
            height: 25,
          }}
        />
      ) : undefined,
      disabled: isDisabled,
    }
  })
}
