import {useContext, useEffect, useMemo, useState} from 'react'
import {Modal} from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import When from 'components/when/When'
import PlanStatusTag from 'screens/PatientDetailsOverview.tsx/helpers/PlanStatusTag'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {getNewTreatmentList, moveTaskCard} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {
  createTreatmentPlan,
  getTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {NeedMoreInfoModalContext} from './MoveToNeedMoreInfoModal'
import {useSelector} from 'react-redux'
import {NewPlanData} from 'screens/PatientDetailsOverview.tsx/types/PlanList.types'
import {RootState} from 'redux/store'
import {getPlanStatus} from '@utils/getPlanStatus'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import hasValue from 'utils/hasValue'
import useAllUserPlan from '@hooks/useAllUserPlan'

type MoveToApproveModalProps = {
  open: boolean
  context: NeedMoreInfoModalContext | null
  onClose: () => void
  onSubmitted?: (context?: NeedMoreInfoModalContext | null) => void
  onSuccess?: () => void
}

const MoveToApproveModal = ({
  open,
  context,
  onClose,
  onSubmitted,
  onSuccess,
}: MoveToApproveModalProps) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const {isPractice, isGrowthPlanUser} = useAllUserPlan()
  const {plansList, loadingPlansList} = useSelector((state: RootState) => state.kanban)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const plans: NewPlanData[] = useMemo(
    () =>
      context?.workflowName === 'Plan Outsourced'
        ? plansList?.plans_list?.filter((plan) => {
            const isApprovedPlan =
              plan.status === treatmentPlanStatusConstants.DRAFT ||
              plan.approver_status === treatmentPlanStatusConstants.PENDING_APPROVAL ||
              plan.initiator_status === treatmentPlanStatusConstants.PENDING_APPROVAL
            return (
              (isApprovedPlan && (plan.is_treatment_plan_created_on_cloned_order || isPractice)) ||
              (isApprovedPlan && isGrowthPlanUser)
            )
          })
        : plansList?.plans_list?.filter((plan) => {
            const isApprovedPlan =
              plan.status === treatmentPlanStatusConstants.DRAFT ||
              plan.approver_status === treatmentPlanStatusConstants.PENDING_APPROVAL ||
              plan.initiator_status === treatmentPlanStatusConstants.PENDING_APPROVAL
            return isApprovedPlan && !plan.is_treatment_plan_created_on_cloned_order
          }),
    [plansList, context]
  )

  useEffect(() => {
    if (!open || !context) return
    setSelectedId(null)
    fetchPlans()
  }, [open, context])

  const fetchPlans = async () => {
    if (!context) return
    await dispatchAction(
      getNewTreatmentList({
        patient_id: safeParseInt(context.patientId),
        doctor_id: safeParseInt(userId),
        treatment_subtype: 'ALIGNERS',
        order_id: null,
      } as any)
    )
  }

  const handleSubmit = async () => {
    if (!context || !selectedId) return
    try {
      setSubmitting(true)
      await dispatchAction(getTreatmentPlan({aligner_treatment_id: String(selectedId)}))
        .unwrap()
        .then((treatmentPlan: ITreatmentPlan) => {
          const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
            treatmentPlan
          dispatchAction(
            createTreatmentPlan({
              details: {
                aligner_treatment_details: aligner_details_meta_data,
                treatment_plan_id: treatmentPlan?.treatment_plan_id,
                treatment_sub_type: treatmentTypeMain.ALIGNERS,
                production_lab_details: treatmentPlan.production_lab_details,
                days_to_wear_each_aligner: treatmentPlan.days_to_wear_each_aligner,
                recommended_hours_to_wear_aligners:
                  treatmentPlan.recommended_hours_to_wear_aligners,
                treatment_planning_software: treatmentPlan.treatment_planning_software,
                treatment_planning_link: treatmentPlan.treatment_planning_link,
                remarks: treatmentPlan.remarks,
                doctor_id: treatmentPlan.doctor_id,
                patient_id: treatmentPlan.patient_id,
                status: treatmentPlanStatusConstants.DRAFT,
                video_display_to_patient: treatmentPlan.is_video_display_patient,
                link_display_patient: treatmentPlan.is_link_display_patient,
                approved_by_patient_at: null,
                treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
                approver_status: treatmentPlanStatusConstants.APPROVED,
                initiator_status: treatmentPlanStatusConstants.APPROVED,
                file_ids_to_clone: treatmentPlan.file_ids_to_clone,
                ...(hasValue(treatmentPlan.order_id) && {order_id: treatmentPlan.order_id}),
                order_status_changed_at: new Date().toISOString(),
                treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
              },
              files: filesToSave,
              other_files: otherFilesToSave,
              video_files: video_files_to_save,
              pdf_file: treatmentPlan.pdf_file_to_save,
            })
          )
            .unwrap()
            .then(async () => {
              await dispatchAction(
                moveTaskCard({
                  task_id: safeParseInt(context.taskId),
                  doctor_id: safeParseInt(userId),
                  workflow_status_id: safeParseInt(context.nextStatusId),
                  patient_id: safeParseInt(context.patientId),
                  workflow_id: safeParseInt(context.workflowId),
                  is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
                })
              ).unwrap()

              SuccessToast('Plan approved successfully')
              onSuccess?.()
              onSubmitted?.(context)
              onClose()
            })
        })
    } catch (error: any) {
      const message =
        error?.message || error?.response?.data?.message || 'Failed to approve treatment plan.'
      ErrorToast(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      destroyOnClose
      centered
      maskClosable={false}
      open={open}
      onCancel={onClose}
      width={566}
      footer={
        <div className='flex w-full items-center justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='bg-white inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-black shadow'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={!selectedId || submitting}
            className='bg-primaryColor inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50'
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-gray-900'>Select Treatment Plan</h2>
        <p className='text-sm text-gray-500'>Select plan to mark as approved</p>

        {loadingPlansList ? (
          <div className='py-6 text-center text-gray-500'>Loading plans...</div>
        ) : (
          <div className='max-h-[60vh] overflow-y-auto space-y-4'>
            {(plans ?? []).map((plan: NewPlanData) => (
              <PlanCard
                key={plan.plan_id}
                plan={plan}
                selected={selectedId === plan.plan_id}
                onSelect={() => setSelectedId(plan.plan_id)}
              />
            ))}

            {!plans?.length && (
              <div className='rounded-xl border border-gray-200 p-4 text-sm text-gray-600'>
                No plans are pending approval.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

const PlanCard = ({
  plan,
  selected,
  onSelect,
}: {
  plan: NewPlanData
  selected: boolean
  onSelect: () => void
}) => {
  const treatmentStatus = getPlanStatus({
    treatmentPlan: plan as any,
  }) as keyof typeof treatmentPlanStatusConstants

  return (
    <button
      type='button'
      onClick={onSelect}
      className={clsx(
        'w-full rounded-2xl border p-4 text-left shadow-sm transition',
        selected
          ? 'border-primaryColor ring-primaryColor/40 bg-primaryColor/5'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className='flex items-start gap-3'>
        <span
          aria-checked={selected}
          role='radio'
          className={clsx(
            'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border',
            selected ? 'border-primaryColor bg-primaryColor text-white' : 'border-gray-300 bg-white'
          )}
        >
          {selected ? (
            <svg viewBox='0 0 20 20' className='h-3.5 w-3.5' fill='none'>
              <path
                d='M5 10.5l3 3 7-7'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          ) : null}
        </span>

        <div className='flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='font-semibold text-gray-900'>
              {plan?.treatment_plan_tag_name ?? plan?.treatment_plan_name ?? ''}
            </div>
            <div className='text-gray-500'>{plan.version}</div>
            <div className='ml-auto'>
              <PlanStatusTag treatmentStatus={treatmentStatus} />
            </div>
          </div>

          <dl className='mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700 sm:grid-cols-2'>
            <div className='flex gap-2'>
              <dt className='text-gray-500'>Created:</dt>
              <dd>{moment(plan?.created_date).format('DD-MMM-YYYY')}</dd>
            </div>
            <div className='flex gap-2 sm:col-span-2'>
              <dt className='text-gray-500'>Stages:</dt>
              <dd>{plan.stages}</dd>
            </div>

            <When isTrue={plan.upper_aligner_series !== '0-0'}>
              <div className='flex gap-2 sm:col-span-2'>
                <dt className='text-gray-500'>Upper Aligner Series:</dt>
                <dd>{plan.upper_aligner_series}</dd>
              </div>
            </When>

            <When isTrue={plan.lower_aligner_series !== '0-0'}>
              <div className='flex gap-2 sm:col-span-2'>
                <dt className='text-gray-500'>Lower Aligner Series:</dt>
                <dd>{plan.lower_aligner_series}</dd>
              </div>
            </When>
          </dl>
        </div>
      </div>
    </button>
  )
}

export default MoveToApproveModal
