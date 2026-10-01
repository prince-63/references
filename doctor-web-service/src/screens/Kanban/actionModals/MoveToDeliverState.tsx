import manufacturingConstants from '@constants/manufacturing.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import {useSelector} from 'react-redux'
import {postCompleteManufacturing} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  setIsOpenDeliveredOrderModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'

const MoveToDeliverState = () => {
  const {dispatchAction} = useDispatchAction()
  const {isOpenDeliveredOrderModal, cardDetails} = useSelector((state: RootState) => state.kanban)
  const {userId} = useContext(AuthContext)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const MarkAllAsDelivered = () => {
    dispatchAction(setIsOpenDeliveredOrderModal(false))

    const payload = {
      patient_id: safeParseInt(cardDetails?.patient_id),
      delivery_date: moment().format('YYYY-MM-DD'),
      status: manufacturingConstants.DELIVERED,
      manufacturing_id: cardDetails?.manufacturing_batch_id,
      is_show_mark_as_received: true,
    }

    dispatchAction(postCompleteManufacturing(payload as any))
      .unwrap()
      .finally(() => () => {
        dispatchAction(setIsOpenDeliveredOrderModal(false))
      })
      .unwrap()
      .then(() => {
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
  }

  return (
    <Modal
      closable={false}
      destroyOnClose={true}
      open={isOpenDeliveredOrderModal}
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
              dispatchAction(setIsOpenDeliveredOrderModal(false))
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
            Go back
          </button>
          <button
            className={clsx('w-full text-white bg-primaryColor py-3 px-6 rounded-lg')}
            type='button'
            onClick={() => {
              MarkAllAsDelivered()
            }}
          >
            Mark as received
          </button>
        </div>
      }
    >
      <div className='flex flex-col items-center justify-center gap-4 p-5'>
        <div className={clsx('md:text-2xl text-xl font-semibold')}>Mark as received?</div>
        <div className={clsx('text-textColor font-normal')}>
          This is an irreversible action. Are you sure you want to continue?{' '}
        </div>
      </div>
    </Modal>
  )
}

export default MoveToDeliverState
