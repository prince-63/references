import HttpMethod from '@constants/httpMethods.constants'
import orderStatusConstants from '@constants/orderStatus.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import apiHelper from '@utils/apiHelper'
import {Modal} from 'antd'
import clsx from 'clsx'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {BASE_APP_PATIENT_URL} from 'redux/Endpoints/apiEndpoints'
import {
  getVspPatientPlanningStepper,
  getVspPatientProfile,
  setVspPatientOrderStatus,
} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  setIsOpenConfirmPlanningDoneModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {getIndividualTask} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'

const ConfirmMoveToPlanningDoneState = () => {
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {isGrowthPlanUser, isPractice} = useAllUserPlan()
  const {isOpenConfirmPlanningDoneModal, cardDetails} = useSelector(
    (state: RootState) => state.kanban
  )
  const {userId, profileId, organizationId} = useContext(AuthContext)

  const {loadingKanBan, dynamicWorkflowStatusId} = useSelector((state: RootState) => state.kanban)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const moveCaseCall = ({workflow_id, goForward}: {workflow_id: number; goForward: boolean}) => {
    dispatchAction(
      moveTaskCard({
        task_id: safeParseInt(cardDetails?.id),
        doctor_id: safeParseInt(userId),
        workflow_status_id: workflow_id,
        patient_id: safeParseInt(cardDetails?.patient_id),
        workflow_id: safeParseInt(cardDetails?.workflow_id),
        is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
      })
    )
      .unwrap()
      .then(() => {
        dispatchAction(setIsOpenConfirmPlanningDoneModal(false))
        if (serviceConfig?.VSP_PLANNING) {
          const payload = {
            patient_id: safeParseInt(cardDetails?.patient_id),
            doctor_id: safeParseInt(userId),
          }
          dispatchAction(getVspPatientProfile(payload))
            .unwrap()
            .then(async (res: {active_order_id?: string | null; orderList?: string[]}) => {
              const targetOrderId = res.active_order_id ?? cardDetails?.order_id ?? null
              if (!targetOrderId) return
              const urlUpdateOrder = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/orders/${targetOrderId}/status?status=${'COMPLETED'}`
              await apiHelper(urlUpdateOrder, HttpMethod.PATCH, {
                profile_id: safeParseInt(profileId),
                organization_id: safeParseInt(organizationId),
              })
              dispatchAction(setVspPatientOrderStatus('COMPLETED'))
              if (targetOrderId) {
                dispatchAction(getVspPatientPlanningStepper({order_id: String(targetOrderId)}))
              }
            })
        }
        if (cardDetails.order_id) {
          dispatchAction(
            updateOrder({
              order_id: String(cardDetails?.order_id),
              status: orderStatusConstants.COMPLETED,
              doctor_id: safeParseInt(userId),
            })
          ).unwrap()
        }
        dispatchAction(
          getIndividualTask({
            doctor_id: safeParseInt(userId),
            patient_id: safeParseInt(cardDetails.patient_id),
            workflow_name: cardDetails.workflow_name,
          } as any)
        )
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
        if (goForward && (isGrowthPlanUser || isPractice) && !serviceConfig?.VSP_PLANNING) {
          navigate(`/production-setup-stepper/${cardDetails?.patient_id}`)
        }
      })
  }
  return (
    <Modal
      closable={false}
      destroyOnClose
      open={isOpenConfirmPlanningDoneModal}
      className={clsx('md:w-[566px] ')}
      maskClosable={false}
      width={566}
      footer={
        <div className={clsx('flex gap-2 px-5 pb-5 items-center justify-center')}>
          <button
            className={clsx(
              'w-full text-primaryColor border border-primaryColor py-3 px-6 rounded-lg'
            )}
            type='button'
            onClick={() =>
              moveCaseCall({
                workflow_id: safeParseInt(cardDetails?.current_workflow_status_id),
                goForward: false,
              })
            }
          >
            Cancel
          </button>

          <button
            className={clsx(
              'w-full text-white bg-primaryColor py-3 px-6 rounded-lg',
              loadingKanBan && 'opacity-60 cursor-not-allowed'
            )}
            type='submit'
            disabled={loadingKanBan}
            onClick={() => {
              if (!dynamicWorkflowStatusId) return
              moveCaseCall({workflow_id: dynamicWorkflowStatusId, goForward: true})
            }}
          >
            {'Confirm'}
          </button>
        </div>
      }
    >
      <div className='flex flex-col p-5'>
        <div className={clsx('md:text-2xl text-xl font-semibold self-center')}>
          Confirm planning completion{' '}
        </div>
        <div className={clsx('md:text-base text-base self-center my-3')}>
          Once moved to this status, you won't be able to move it back to a previous status. Are you
          sure you want to continue?{' '}
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmMoveToPlanningDoneState
