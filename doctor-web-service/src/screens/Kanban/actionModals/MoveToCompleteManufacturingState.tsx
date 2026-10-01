import {Modal} from 'antd'
import clsx from 'clsx'
import {useContext} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getManufacturingListDetails,
  postCompleteManufacturing,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import moment from 'moment'
import {safeParseInt} from 'utils/ConstFunctions'
import manufacturingConstants from '@constants/manufacturing.constants'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  setIsOpenManufacturingCompleteModal,
  setIsVspKanbanMovement,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {AuthContext} from 'context/AuthContext'
import {getTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {getVspProductionId, updateVspProductionStatus} from './helpers/vspKanbanMovement'

type MoveToCompleteManufacturingStateProps = {
  onSuccess?: () => void
}

const MoveToCompleteManufacturingState = ({onSuccess}: MoveToCompleteManufacturingStateProps) => {
  const {dispatchAction} = useDispatchAction()
  const {
    isOpenManufacturingCompleteModal,
    cardDetails,
    dynamicWorkflowStatusId,
    dynamicLabel,
    isVspKanbanMovement,
  } = useSelector((state: RootState) => state.kanban)
  const {userId} = useContext(AuthContext)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const refreshTaskBoard = () => {
    if (!cardDetails?.workflow_name) return Promise.resolve()
    return dispatchAction(
      getPatientTaskTrackerFiltered({
        doctor_id: safeParseInt(userId),
        order_type: 'ALIGNER',
        workflow_name: cardDetails.workflow_name,
        page_number: 0,
        page_size: 10,
         sort:'UPDATED_ON',
         "order": "DESC"
      })
    ).unwrap()
  }

  const moveCardToPackagedState = () => {
    if (
      !dynamicWorkflowStatusId ||
      !cardDetails?.id ||
      !cardDetails?.patient_id ||
      !cardDetails?.workflow_id
    ) {
      return refreshTaskBoard()
    }

    return dispatchAction(
      moveTaskCard({
        task_id: safeParseInt(cardDetails.id),
        doctor_id: safeParseInt(userId),
        workflow_status_id: dynamicWorkflowStatusId,
        patient_id: safeParseInt(cardDetails.patient_id),
        workflow_id: safeParseInt(cardDetails.workflow_id),
        is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
      })
    )
      .unwrap()
      .then(() => {
        refreshTaskBoard()
        onSuccess?.()
      })
  }

  const callCompleteManufacturing = async () => {
    if (!cardDetails) return

    // VSP movement
    if (serviceConfig?.VSP_PLANNING && isVspKanbanMovement) {
      dispatchAction(setIsOpenManufacturingCompleteModal(false))

      try {
        const productionId = await getVspProductionId({
          orderId: cardDetails?.order_id,
          patientId: cardDetails?.patient_id,
          doctorId: userId,
        })

        if (!productionId) {
          ErrorToast('Unable to find production details for this case.')
          return
        }

        await updateVspProductionStatus(productionId, 'PACKAGED')
        await refreshTaskBoard()
        onSuccess?.()
      } finally {
        dispatchAction(setIsVspKanbanMovement(false))
      }
      return
    }

    const payload = {
      patient_id: safeParseInt(cardDetails?.patient_id),
      completion_date: moment().format('YYYY-MM-DD'),
      status: manufacturingConstants.COMPLETED,
      manufacturing_id: cardDetails.manufacturing_batch_id!,
    }
    dispatchAction(setIsOpenManufacturingCompleteModal(false))
    dispatchAction(postCompleteManufacturing(payload as any))
      .unwrap()
      .then(() => {
        dispatchAction(
          getTreatmentPlanList({
            doctor_id: userId ?? '',
            patient_id: String(cardDetails?.id ?? ''),
            treatment_subtype: subTreatmentTypeConstants.ALIGNERS,
          })
        )
          .unwrap()
          .then(() => {
            dispatchAction(
              getManufacturingListDetails({
                patient_id: safeParseInt(cardDetails?.patient_id),
                treatment_plan_id: safeParseInt(
                  cardDetails?.manufacturing_batch_response?.treatment_plan_id
                ),
              })
            )
              .unwrap()
              .then(() => {
                moveCardToPackagedState()
              })
          })
      })
  }
  return (
    <Modal
      closable={false}
      destroyOnClose={true}
      open={isOpenManufacturingCompleteModal}
      className={clsx('md:w-[566px] w-full')}
      maskClosable={false}
      width={566}
      footer={
        <div className={clsx('flex gap-2 px-5 pb-5')}>
          <button
            className={clsx(
              'w-full text-primaryColor border border-primaryColor py-3 px-6 rounded-lg'
            )}
            type='button'
            onClick={() => {
              dispatchAction(setIsOpenManufacturingCompleteModal(false))
              if (serviceConfig?.VSP_PLANNING && isVspKanbanMovement) {
                dispatchAction(setIsVspKanbanMovement(false))
                refreshTaskBoard()
                return
              }
              dispatchAction(setIsVspKanbanMovement(false))
              dispatchAction(
                moveTaskCard({
                  task_id: safeParseInt(cardDetails?.id),
                  doctor_id: safeParseInt(userId),
                  workflow_status_id: safeParseInt(cardDetails?.current_workflow_status_id),
                  patient_id: safeParseInt(cardDetails?.patient_id),
                  workflow_id: safeParseInt(cardDetails?.workflow_id),
                  is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
                })
              )
                .unwrap()
                .then(() => {
                  // Refresh board
                  dispatchAction(
                    getPatientTaskTrackerFiltered({
                      doctor_id: safeParseInt(userId),
                      order_type: 'ALIGNER',
                      workflow_name: cardDetails.workflow_name,
                      page_number: 0,
                      page_size: 10,
                       sort:'UPDATED_ON',
                       "order": "DESC"
                    })
                  )
                })
            }}
          >
            Cancel
          </button>
          <button
            className={clsx('w-full text-white bg-primaryColor py-3 px-6 rounded-lg')}
            type='submit'
            onClick={() => {
              callCompleteManufacturing()
            }}
          >
            Yes{' '}
          </button>
        </div>
      }
    >
      <div className='flex  flex-col gap-3 p-5 items-center '>
        <div className={clsx('md:text-2xl text-xl font-semibold self-center')}>
          {` Move to ${dynamicLabel}?`}
        </div>

        <div className={clsx('text-base text-textColor  text-center self-center')}>
          {`If you continue, all items in this batch will automatically be updated to ${dynamicLabel}, and the
          batch itself will also move to the same status. Do you want to proceed?`}
        </div>
      </div>
    </Modal>
  )
}

export default MoveToCompleteManufacturingState
