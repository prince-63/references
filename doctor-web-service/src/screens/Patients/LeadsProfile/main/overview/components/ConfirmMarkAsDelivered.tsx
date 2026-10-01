import manufacturingConstants from '@constants/manufacturing.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import {useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {
  getManufacturingListDetails,
  postCompleteManufacturing,
  setOpenConfirmMarkAsDeliveredModal,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

const ConfirmMarkAsDelivered = ({
  openModal,
  refreshData,
}: {
  openModal: boolean
  refreshData: () => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId: id} = useParams()
  const {order} = useSelector((state: RootState) => state.orders)
  const patientId = order?.patient_details?.id ?? id
  const {manufacturingListData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const {getAllTask} = useSelector((state: RootState) => state.workFlow)
  const normalizedAllTaskList = useMemo<PatientTaskDetails[]>(() => {
    if (!getAllTask) return []
    return getAllTask
  }, [getAllTask])

  const parentTasks = useMemo(() => {
    if (!normalizedAllTaskList.length) return []
    return normalizedAllTaskList.filter((task) => !task.parent_task_id)
  }, [normalizedAllTaskList])

  const treatmentPlanId = useMemo(() => {
    if (!parentTasks.length) return null
    return parentTasks[0]?.manufacturing_batch_response?.treatment_plan_id ?? null
  }, [parentTasks])

  useEffect(() => {
    if (!openModal) return
    if (!hasValue(treatmentPlanId) || !hasValue(patientId)) return
    dispatchAction(
      getManufacturingListDetails({
        patient_id: safeParseInt(patientId),
        treatment_plan_id: safeParseInt(treatmentPlanId),
      })
    )
  }, [dispatchAction, openModal, patientId, treatmentPlanId])

  const manufacturingList = manufacturingListData?.processed_manufacturing

  const planData = manufacturingList && manufacturingList[manufacturingList?.length - 1]

  const MarkAllAsDelivered = () => {
    const payload = {
      patient_id: safeParseInt(patientId),
      delivery_date: moment().format('YYYY-MM-DD'),
      status: manufacturingConstants.DELIVERED,
      manufacturing_id: planData?.manufacturing_batch_id,
      is_show_mark_as_received: true,
    }

    dispatchAction(postCompleteManufacturing(payload))
      .unwrap()
      .then(() => {
        dispatchAction(setOpenConfirmMarkAsDeliveredModal(false))
        refreshData()
      })
  }

  return (
    <Modal
      closable={false}
      destroyOnClose={true}
      open={openModal}
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
              dispatchAction(setOpenConfirmMarkAsDeliveredModal(false))
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

export default ConfirmMarkAsDelivered
