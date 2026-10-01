import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {Modal} from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import When from 'components/when/When'
import PlanStatusTag from 'screens/PatientDetailsOverview.tsx/helpers/PlanStatusTag'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {safeParseInt} from 'utils/ConstFunctions'
import {getNewTreatmentList, moveTaskCard} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {
  createTreatmentPlan,
  getTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {NeedMoreInfoModalContext} from './MoveToNeedMoreInfoModal'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

type Plan = {
  id: string | number
  title: string
  version: string
  created: string
  stages: number
  upperSeries: string
  lowerSeries: string
  duration: string
  status?: string
  approver_status?: string
  initiator_status?: string
}

type MoveToRevisionModalProps = {
  open: boolean
  context: NeedMoreInfoModalContext | null
  onClose: () => void
  onSubmitted?: (context?: NeedMoreInfoModalContext | null) => void
  onSuccess?: () => void
}

const MoveToRevisionModal = ({
  open,
  context,
  onClose,
  onSubmitted,
  onSuccess,
}: MoveToRevisionModalProps) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {isOrganization, isPractice, isCustomer} = useAllUserPlan()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  useEffect(() => {
    if (!open || !context) return
    setSelectedPlanId(null)
    setComment('')
    fetchPlans()
  }, [open, context])

  const fetchPlans = async () => {
    if (!context) return
    try {
      setLoadingPlans(true)
      const response = await dispatchAction(
        getNewTreatmentList({
          patient_id: safeParseInt(context.patientId),
          doctor_id: safeParseInt(userId),
          treatment_subtype: 'ALIGNERS',
          order_id: null,
        } as any)
      ).unwrap()
      const list = Array.isArray(response?.plans_list) ? response.plans_list : []
      setPlans(
        list.map((plan: any) => ({
          id: plan.plan_id ?? plan.id ?? plan.uuid ?? Math.random(),
          title: plan.treatment_plan_tag_name ?? plan.title ?? plan.name ?? 'Treatment Plan',
          version: plan.version ?? plan.plan_version ?? 'v.01',
          created: plan.created_date ?? plan.created ?? plan.created_at ?? '-',
          stages: plan.stages ?? 0,
          upperSeries: plan.upper_aligner_series ?? plan.upper_series ?? plan.upperSeries ?? '-',
          lowerSeries: plan.lower_aligner_series ?? plan.lower_series ?? plan.lowerSeries ?? '-',
          duration: plan.duration ?? (plan.wear_days ? `${plan.wear_days} days per stage` : '-'),
          status: plan.status,
          approver_status: plan.approver_status,
          initiator_status: plan.initiator_status,
        }))
      )
    } catch (error) {
      setPlans([])
    } finally {
      setLoadingPlans(false)
    }
  }

  const filteredPlans = useMemo(() => {
    if (!plans.length) return []
    return plans.filter((plan) => {
      const pendingStatuses = new Set([
        treatmentPlanStatusConstants.PENDING_APPROVAL,
        treatmentPlanStatusConstants.ACTIVE,
        treatmentPlanStatusConstants.APPROVED,
        treatmentPlanStatusConstants.COMPLETE,
        treatmentPlanStatusConstants.IN_PROGRESS,
        treatmentPlanStatusConstants.PAUSED,
        treatmentPlanStatusConstants.SENT_FOR_APPROVAL,
        treatmentPlanStatusConstants.RE_PLAN,
      ])
      return (
        pendingStatuses.has(plan.status as any) ||
        pendingStatuses.has(plan.approver_status as any) ||
        pendingStatuses.has(plan.initiator_status as any)
      )
    })
  }, [plans])

  const normalizePendingStatus = (status?: keyof typeof treatmentPlanStatusConstants) => {
    if (!status) return undefined
    return status === 'IN_PROGRESS' ? 'DRAFT' : status
  }

  const resolvePlanStatus = useCallback(
    (plan: Plan) => {
      const treatmentStatus = (plan.status || (plan as any)?.treatment_status) as
        | keyof typeof treatmentPlanStatusConstants
        | undefined
      const approverStatus = plan.approver_status as
        | keyof typeof treatmentPlanStatusConstants
        | undefined
      const initiatorStatus = plan.initiator_status as
        | keyof typeof treatmentPlanStatusConstants
        | undefined

      if (!treatmentStatus) return undefined

      if (treatmentStatus !== treatmentPlanStatusConstants.DRAFT) {
        return treatmentStatus
      }

      if (!isPractice && !isCustomer && !isOrganization) {
        return normalizePendingStatus(initiatorStatus) ?? treatmentPlanStatusConstants.DRAFT
      }

      return normalizePendingStatus(approverStatus) ?? treatmentPlanStatusConstants.DRAFT
    },
    [isOrganization, isPractice, isCustomer]
  )

  const handleSubmit = async () => {
    if (!context || !selectedPlanId || !comment.trim()) return
    try {
      setSubmitting(true)
      const treatmentPlan = await dispatchAction(
        getTreatmentPlan({aligner_treatment_id: selectedPlanId.toString()})
      ).unwrap()

      const {
        aligner_details_meta_data,
        filesToSave,
        otherFilesToSave,
        video_files_to_save,
        treatment_plan_id,
        treatment_plan_tag_name,
        production_lab_details,
        days_to_wear_each_aligner,
        recommended_hours_to_wear_aligners,
        treatment_planning_software,
        treatment_planning_link,
        remarks,
        doctor_id,
        patient_id,
        order_id,
        is_video_display_patient: video_display_to_patient,
        is_link_display_patient: link_display_patient,
      } = treatmentPlan || {}

      await dispatchAction(
        createTreatmentPlan({
          details: {
            aligner_treatment_details: aligner_details_meta_data,
            treatment_plan_id,
            treatment_sub_type: 'ALIGNERS',
            treatment_plan_tag_name,
            production_lab_details,
            days_to_wear_each_aligner,
            recommended_hours_to_wear_aligners,
            treatment_planning_software,
            treatment_planning_link,
            remarks,
            doctor_id,
            patient_id,
            status: treatmentPlanStatusConstants.DRAFT,
            video_display_to_patient,
            link_display_patient,
            approved_by_patient_at: null,
            order_id,
            initiator_status: treatmentPlanStatusConstants.RE_PLAN,
            approver_status: treatmentPlanStatusConstants.RE_PLAN,
            order_status_changed_at: new Date().toISOString(),
            treatment_plan_metadata: {
              replan_reason: comment.trim(),
              replan_requested_on: new Date().toISOString(),
            },
          },
          other_files: otherFilesToSave,
          files: filesToSave,
          video_files: video_files_to_save ?? {},
        })
      ).unwrap()

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

      SuccessToast('Request moved to revision.')
      onSuccess?.()
      onSubmitted?.(context)
      onClose()
    } catch (error: any) {
      const message =
        error?.message || error?.response?.data?.message || 'Failed to submit revision request.'
      ErrorToast(message)
    } finally {
      setSubmitting(false)
    }
  }

  const bodyContent = () => {
    if (loadingPlans) {
      return <div className='py-6 text-center text-gray-500'>Fetching plans...</div>
    }

    if (!filteredPlans.length) {
      return (
        <div className='rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500'>
          No plans available to send for revision.
        </div>
      )
    }

    return (
      <div className='mt-4 flex-1 space-y-3 overflow-y-auto pr-1'>
        {filteredPlans.map((plan) => {
          const treatmentStatus = resolvePlanStatus(
            plan
          ) as keyof typeof treatmentPlanStatusConstants
          const isRePlan =
            treatmentStatus === 'RE_PLAN' ||
            plan.approver_status === treatmentPlanStatusConstants.RE_PLAN ||
            plan.initiator_status === treatmentPlanStatusConstants.RE_PLAN

          return (
            <button
              key={plan.id}
              type='button'
              onClick={() => !isRePlan && setSelectedPlanId(plan.id)}
              className={clsx(
                'w-full rounded-2xl border p-4 text-left shadow-sm transition',
                selectedPlanId === plan.id
                  ? 'border-primaryColor bg-primaryColor/5'
                  : 'border-gray-200 hover:border-gray-300',
                isRePlan && 'cursor-not-allowed opacity-60 hover:border-gray-200'
              )}
            >
              <div className='flex items-start gap-3'>
                <span
                  className={clsx(
                    'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border',
                    isRePlan
                      ? 'border-gray-300 bg-gray-100'
                      : selectedPlanId === plan.id
                        ? 'border-primaryColor bg-primaryColor text-white'
                        : 'border-gray-300 bg-white'
                  )}
                >
                  {selectedPlanId === plan.id && !isRePlan ? (
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
                    <div className='font-semibold text-gray-900'>{plan.title}</div>
                    <div className='text-gray-500'>{plan.version}</div>
                    <div className='ml-auto'>
                      <PlanStatusTag treatmentStatus={treatmentStatus} />
                    </div>
                  </div>

                  <dl className='mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700 sm:grid-cols-2'>
                    <div className='flex gap-2'>
                      <dt className='text-gray-500'>Created:</dt>
                      <dd>{moment(plan.created).format('DD-MMM-YYYY')}</dd>
                    </div>
                    <div className='flex gap-2'>
                      <dt className='text-gray-500'>Stages:</dt>
                      <dd>{plan.stages}</dd>
                    </div>

                    <When isTrue={plan.upperSeries !== '0-0'}>
                      <div className='flex gap-2 sm:col-span-2'>
                        <dt className='text-gray-500'>Upper Aligner Series:</dt>
                        <dd>{plan.upperSeries}</dd>
                      </div>
                    </When>

                    <When isTrue={plan.lowerSeries !== '0-0'}>
                      <div className='flex gap-2 sm:col-span-2'>
                        <dt className='text-gray-500'>Lower Aligner Series:</dt>
                        <dd>{plan.lowerSeries}</dd>
                      </div>
                    </When>
                  </dl>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <Modal
      destroyOnClose
      centered
      maskClosable={false}
      closable
      open={open}
      onCancel={onClose}
      width={640}
      footer={null}
    >
      <div className='flex max-h-[70vh] flex-col gap-6'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>Send Plan for Revision</h2>
          <p className='text-sm text-gray-500'>
            Select a plan and share why this case needs changes before moving forward.
          </p>
        </div>

        {bodyContent()}

        <div className='flex flex-col gap-3'>
          <div>
            <label className='mb-2 block text-sm font-medium text-black text-start'>
              Comment <span className='text-red-500'>*</span>
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={
                selectedPlanId
                  ? 'Add your comment here...'
                  : 'Select a plan above to add a comment...'
              }
              rows={3}
              disabled={!selectedPlanId}
              className={clsx(
                'w-full resize-y rounded-xl border bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0',
                !selectedPlanId
                  ? 'border-gray-200 opacity-60 cursor-not-allowed'
                  : 'border-gray-300'
              )}
            />
          </div>
          <div className='flex items-center justify-end gap-3'>
            <button
              type='button'
              className='rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={!selectedPlanId || !comment.trim() || submitting}
              className='bg-primaryColor inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow disabled:cursor-not-allowed disabled:opacity-50'
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default MoveToRevisionModal
