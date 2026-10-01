import manufacturingConstants from '@constants/manufacturing.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import clsx from 'clsx'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import {useContext, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  setIsOpenDeliverFromPackageModal,
  setIsVspKanbanMovement,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {postCompleteManufacturing} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {RootState} from 'redux/store'
import {useManufacturingDetails} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import {safeParseInt} from 'utils/ConstFunctions'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import {PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import hasValue from 'utils/hasValue'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {getVspProductionId, updateVspProductionStatus} from './helpers/vspKanbanMovement'

const schema = Yup.object().shape({
  // Accept Dayjs OR string and ensure it’s a valid date
  delivery_date: Yup.mixed()
    .required('Delivery date is required')
    .test('is-valid-date', 'Select a valid date', (value) => {
      if (!value) return false
      // FormikDatePicker usually gives Dayjs. Accept string too.
      if (dayjs.isDayjs(value)) return value.isValid()
      return dayjs(value as any).isValid()
    }),
})

type MoveToDeliverFromPackageStateProps = {
  onSuccess?: () => void
}

const MoveToDeliverFromPackageState = ({onSuccess}: MoveToDeliverFromPackageStateProps) => {
  const {dispatchAction} = useDispatchAction()
  const {latest_manufacturing_data} = useManufacturingDetails({})
  const {isOpenDeliverFromPackageModal, cardDetails, dynamicWorkflowStatusId, isVspKanbanMovement} =
    useSelector((state: RootState) => state.kanban)
  const {workFlowData} = useSelector((state: RootState) => state.workFlow)
  const {userId} = useContext(AuthContext)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const {getAllTask} = useSelector((state: RootState) => state.workFlow)

  const normalizedAllTaskList = useMemo<PatientTaskDetails[]>(() => {
    if (!getAllTask) return []
    return getAllTask
  }, [getAllTask])

  const packagedSubTasks = useMemo(() => {
    if (!normalizedAllTaskList.length) return []
    return normalizedAllTaskList.filter(
      (task) =>
        task.parent_task_id &&
        task.manufacturing_batch_response?.latest_batch_manufacturing_status === 'SHIPPED'
    )
  }, [normalizedAllTaskList])

  const manufacturingId = useMemo<number | null>(() => {
    if (!packagedSubTasks.length) return null
    const subTask = packagedSubTasks.find((task) =>
      hasValue(task.manufacturing_sub_task_response?.manufacturing_id)
    )
    return subTask?.manufacturing_sub_task_response?.manufacturing_id ?? null
  }, [packagedSubTasks])

  const deliveredStatusId = useMemo(() => {
    const workflowName = (cardDetails?.workflow_name || '').trim().toLowerCase()
    const workflow =
      workFlowData?.find(
        (wf) =>
          wf?.name?.toLowerCase() === workflowName || wf?.label?.toLowerCase() === workflowName
      ) ??
      workFlowData?.find((wf) =>
        Array.isArray(wf?.statuses)
          ? wf.statuses.some(
              (st) =>
                st?.name?.toLowerCase() === 'delivered' ||
                st?.label_name?.toLowerCase() === 'delivered'
            )
          : false
      )

    const status = workflow?.statuses?.find(
      (st) =>
        st?.name?.toLowerCase() === 'delivered' || st?.label_name?.toLowerCase() === 'delivered'
    )
    return status?.id ?? null
  }, [cardDetails?.workflow_name, workFlowData])

  return (
    <Formik
      initialValues={{
        delivery_date: null as any, // Dayjs | null
      }}
      validationSchema={schema}
      onSubmit={async (values, {setSubmitting}) => {
        try {
          const refreshBoard = () =>
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
            ).unwrap()

          const targetStatusId = deliveredStatusId ?? dynamicWorkflowStatusId

          // VSP movement
          if (serviceConfig?.VSP_PLANNING && isVspKanbanMovement) {
            const productionId = await getVspProductionId({
              orderId: cardDetails?.order_id,
              patientId: cardDetails?.patient_id,
              doctorId: userId,
            })

            if (!productionId) {
              ErrorToast('Unable to find production details for this case.')
              return
            }

            dispatchAction(setIsOpenDeliverFromPackageModal(false))
            await updateVspProductionStatus(productionId, 'DELIVERED')

            await refreshBoard()
            onSuccess?.()
            return
          }

          // compute manufacturing id safely
          const manufacturing_id =
            latest_manufacturing_data?.manufacturing_batch_id ??
            cardDetails?.manufacturing_batch_id ??
            manufacturingId

          if (!manufacturing_id) {
            // Nothing to do if we can’t identify the batch
            return
          }

          const delivery = dayjs.isDayjs(values.delivery_date)
            ? values.delivery_date
            : dayjs(values.delivery_date)

          const payload = {
            patient_id: safeParseInt(cardDetails?.patient_id),
            delivery_date: delivery.format('YYYY-MM-DD'),
            status: manufacturingConstants.DELIVERED,
            manufacturing_id,
            is_show_mark_as_received: true,
          }
          dispatchAction(setIsOpenDeliverFromPackageModal(false))

          await dispatchAction(postCompleteManufacturing(payload as any)).unwrap()
          if (
            targetStatusId &&
            userId &&
            cardDetails?.id &&
            cardDetails?.patient_id &&
            cardDetails?.workflow_id
          ) {
            await dispatchAction(
              moveTaskCard({
                task_id: safeParseInt(cardDetails.id),
                doctor_id: safeParseInt(userId),
                workflow_status_id: targetStatusId,
                patient_id: safeParseInt(cardDetails.patient_id),
                workflow_id: safeParseInt(cardDetails.workflow_id),
                is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
              })
            ).unwrap()
          }

          await refreshBoard()

          onSuccess?.()
        } finally {
          dispatchAction(setIsVspKanbanMovement(false))
          setSubmitting(false)
        }
      }}
    >
      {(formik) => {
        const {isSubmitting} = formik
        return (
          <Modal
            closable={false}
            destroyOnClose
            open={isOpenDeliverFromPackageModal}
            className={clsx('md:w-[566px] h-full w-full')}
            maskClosable={false}
            width={566}
            footer={
              <div className={clsx('flex gap-2 px-5 pb-5 items-center justify-center')}>
                <button
                  className={clsx(
                    'w-full text-primaryColor border border-primaryColor py-3 px-6 rounded-lg'
                  )}
                  type='button'
                  onClick={() => {
                    dispatchAction(setIsOpenDeliverFromPackageModal(false))
                    if (serviceConfig?.VSP_PLANNING && isVspKanbanMovement) {
                      dispatchAction(setIsVspKanbanMovement(false))
                      refreshBoard()
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
                  className={clsx(
                    'w-full text-white bg-primaryColor py-3 px-6 rounded-lg',
                    isSubmitting && 'opacity-60 cursor-not-allowed'
                  )}
                  // This submits the <form> below
                  type='submit'
                  disabled={isSubmitting}
                  onClick={() => formik.handleSubmit()}
                >
                  {isSubmitting ? 'Saving…' : 'Confirm'}
                </button>
              </div>
            }
          >
            <form onSubmit={formik.handleSubmit}>
              <div className='flex flex-col p-5'>
                <div className={clsx('md:text-2xl text-xl font-semibold self-center')}>
                  Confirm Delivery
                </div>
                <div className={clsx('md:text-base text-base self-center mb-4')}>
                  Confirm the delivery date for this batch.
                </div>

                <div className='flex flex-col gap-3'>
                  <FormikDatePicker
                    name='delivery_date'
                    label='Delivered on'
                    required
                    placeholder='DD-MM-YYYY'
                    format='DD-MM-YYYY'
                    // Prevent future dates
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </div>
              </div>
            </form>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default MoveToDeliverFromPackageState
