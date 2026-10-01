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
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {
  getManufacturingListDetails,
  postCompleteManufacturing,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import {useParams} from 'react-router-dom'

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

const MoveToDeliverFromPackageStateTask = ({onSuccess}: MoveToDeliverFromPackageStateProps) => {
  const {dispatchAction} = useDispatchAction()
  const {isOpenDeliverFromPackageModal, cardDetails, dynamicWorkflowStatusId} = useSelector(
    (state: RootState) => state.kanban
  )
  const {newWorkFlowData} = useSelector((state: RootState) => state.workFlow)
  const {patientId} = useParams<{patientId: string}>()
  const {userId} = useContext(AuthContext)
  const {
    productionInHouseTask,
    productionOutSourceTask,
    manufacturingPlanId,
    manufacturingBatchId,
  } = useSelector((state: RootState) => state.workFlow)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const deliveredStatusId = useMemo<number | null>(() => {
    const workflow = (newWorkFlowData ?? []).find((wf) =>
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
  }, [newWorkFlowData])

  const toValidId = (value: unknown) => {
    const parsed = safeParseInt(value)
    return parsed > 0 ? parsed : null
  }

  const targetTaskId =
    toValidId(productionInHouseTask?.id) ?? toValidId(productionOutSourceTask?.id)
  const targetPatientId =
    toValidId(productionInHouseTask?.patient_id) ?? toValidId(productionOutSourceTask?.patient_id)
  const targetWorkflowId =
    toValidId(productionInHouseTask?.workflow_id) ?? toValidId(productionOutSourceTask?.workflow_id)
  const targetWorkflowName =
    productionInHouseTask?.workflow_name ?? productionOutSourceTask?.workflow_name
  const targetStatusId = deliveredStatusId ?? safeParseInt(dynamicWorkflowStatusId)

  return (
    <Formik
      initialValues={{
        delivery_date: null as any, // Dayjs | null
      }}
      validationSchema={schema}
      onSubmit={async (values, {setSubmitting}) => {
        try {
          // compute manufacturing id safely
          const manufacturing_id = manufacturingBatchId

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

          await dispatchAction(postCompleteManufacturing(payload as any)).unwrap()

          if (!!targetStatusId && !!targetTaskId && !!targetPatientId && targetWorkflowId) {
            await dispatchAction(
              moveTaskCard({
                task_id: targetTaskId,
                doctor_id: safeParseInt(userId),
                workflow_status_id: targetStatusId,
                patient_id: targetPatientId,
                workflow_id: targetWorkflowId,
                is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
              })
            ).unwrap()
          }

          // Refresh board just like MarkAllAsDelivered
          await dispatchAction(
            getPatientTaskTrackerFiltered({
              doctor_id: safeParseInt(userId),
              order_type: 'ALIGNER',
              workflow_name: targetWorkflowName,
              page_number: 0,
              page_size: 10,
               sort:'UPDATED_ON',
               "order": "DESC"
            })
          ).unwrap()

          if (manufacturingPlanId && patientId) {
            await dispatchAction(
              getManufacturingListDetails({
                patient_id: safeParseInt(patientId),
                treatment_plan_id: manufacturingPlanId,
              })
            )
          }

          // Close the modal
          dispatchAction(setIsOpenDeliverFromPackageModal(false))
          onSuccess?.()
        } finally {
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

export default MoveToDeliverFromPackageStateTask
