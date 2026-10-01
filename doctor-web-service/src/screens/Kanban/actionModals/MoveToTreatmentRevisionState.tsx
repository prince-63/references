import {useContext, useEffect, useMemo, useState} from 'react'
import {Modal} from 'antd'
import clsx from 'clsx'
import {useDispatch, useSelector} from 'react-redux'
import type {RootState} from 'redux/store'
import {
  getNewTreatmentList,
  getPatientTaskTrackerFiltered,
  moveTaskCard,
  setIsOpenTreatmentRevisionModal,
  WorkflowStatus,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {AuthContext} from 'context/AuthContext'
import moment from 'moment'
import When from 'components/when/When'
import useDispatchAction from '@hooks/useDispatchAction'
import PlanStatusTag from 'screens/PatientDetailsOverview.tsx/helpers/PlanStatusTag'
import {getPlanStatus} from '@utils/getPlanStatus'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {
  createTreatmentPlan,
  getTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {WorkflowDefinition} from 'redux/Slices/AppSlice/workflow/workflow.slice'

// ---- Helpers & Types ----
export type Plan = {
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
  treatment_plan_name?: string
}

const safeParseInt = (v: unknown): number | undefined => {
  const n = parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) ? n : undefined
}

type AnyFunc = (...args: any[]) => any

export default function SelectPlansForRevisionModal() {
  const dispatch = useDispatch() as AnyFunc
  const {isOpenTreatmentRevisionModal: open, cardDetails} = useSelector(
    (s: RootState) => (s as any).kanban ?? {}
  )
  const {userId} = useContext(AuthContext)
  const {plansList} = useSelector((state: RootState) => state.kanban)
  const {dispatchAction} = useDispatchAction()
  const {dynamicWorkflowStatusId} = useSelector((state: RootState) => state.kanban)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  // single selection + one bottom comment
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [comment, setComment] = useState('')

  const {newWorkFlowData} = useSelector((state: RootState) => state.workFlow)

  const statuses = useMemo<WorkflowStatus[]>(() => {
    const wf: WorkflowDefinition | null = Array.isArray(newWorkFlowData)
      ? (newWorkFlowData[0] ?? null)
      : (newWorkFlowData ?? null)
    return Array.isArray(wf?.statuses) ? wf.statuses : []
  }, [newWorkFlowData])

  const InReviewId = useMemo<number | null>(() => {
    const match = statuses.find((s: any) => {
      const name = String(s?.name ?? '').trim()

      return name === 'In Revision'
    })
    return match?.id ?? null
  }, [statuses])

  useEffect(() => {
    if (!open) return
    const payload = {
      patient_id: safeParseInt(cardDetails?.patient_id),
      doctor_id: safeParseInt(userId),
      treatment_subtype: 'ALIGNERS',
      order_id: null,
    } as any
    dispatch(getNewTreatmentList(payload as any))
  }, [open, cardDetails?.patient_id])

  const allPlans: Plan[] = useMemo(() => {
    const list = plansList?.plans_list ?? []
    if (!list.length) return []
    return list.map((p: any) => ({
      id: p.plan_id ?? p.id ?? p.uuid ?? Math.random(),
      title: p.treatment_plan_tag_name ?? p.title ?? p.name ?? 'Treatment Plan',
      version: p.version ?? p.plan_version ?? 'v.01',
      created: p.created_date ?? p.created ?? p.created_at ?? '-',
      stages: p.stages ?? 0,
      upperSeries: p.upper_aligner_series ?? p.upper_series ?? p.upperSeries ?? '-',
      lowerSeries: p.lower_aligner_series ?? p.lower_series ?? p.lowerSeries ?? '-',
      duration: p.duration ?? (p.wear_days ? `${p.wear_days} days per stage` : '-'),
      status: p.status,
      approver_status: p.approver_status,
      initiator_status: p.initiator_status,
    }))
  }, [plansList])

  const plans = useMemo(
    () =>
      allPlans.filter((p) => {
        const pending =
          treatmentPlanStatusConstants.PENDING_APPROVAL ||
          treatmentPlanStatusConstants.ACTIVE ||
          treatmentPlanStatusConstants.APPROVED ||
          treatmentPlanStatusConstants.COMPLETE ||
          treatmentPlanStatusConstants.IN_PROGRESS ||
          treatmentPlanStatusConstants.PAUSED ||
          treatmentPlanStatusConstants.SENT_FOR_APPROVAL ||
          treatmentPlanStatusConstants.RE_PLAN
        return (
          p.status === pending || p.approver_status === pending || p.initiator_status === pending
        )
      }),
    [allPlans]
  )
  const handleClose = () => {
    dispatch(setIsOpenTreatmentRevisionModal(false))
  }

  const submitForSelectedPlan = async () => {
    if (!selectedId) return
    const text = comment.trim()
    if (!text) return

    const treatmentPlan: ITreatmentPlan = await dispatchAction(
      getTreatmentPlan({aligner_treatment_id: selectedId.toString()})
    ).unwrap()

    const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
      treatmentPlan

    await dispatchAction(
      createTreatmentPlan({
        details: {
          aligner_treatment_details: aligner_details_meta_data,
          treatment_plan_id: treatmentPlan?.treatment_plan_id,
          treatment_sub_type: treatmentTypeMain.ALIGNERS,
          treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
          production_lab_details: treatmentPlan.production_lab_details,
          days_to_wear_each_aligner: treatmentPlan.days_to_wear_each_aligner,
          recommended_hours_to_wear_aligners: treatmentPlan.recommended_hours_to_wear_aligners,
          treatment_planning_software: treatmentPlan.treatment_planning_software,
          treatment_planning_link: treatmentPlan.treatment_planning_link,
          remarks: treatmentPlan.remarks,
          doctor_id: treatmentPlan.doctor_id,
          patient_id: treatmentPlan.patient_id,
          status: treatmentPlanStatusConstants.DRAFT,
          video_display_to_patient: treatmentPlan.is_video_display_patient,
          link_display_patient: treatmentPlan.is_link_display_patient,
          approved_by_patient_at: null,
          order_id: treatmentPlan?.order_id,
          initiator_status: treatmentPlanStatusConstants.RE_PLAN,
          approver_status: treatmentPlanStatusConstants.RE_PLAN,
          order_status_changed_at: new Date().toISOString(),
          treatment_plan_metadata: {
            replan_reason: text,
            replan_requested_on: new Date().toISOString(),
          },
        },
        other_files: otherFilesToSave,
        files: filesToSave,
        video_files: video_files_to_save ?? {},
      })
    ).unwrap()

    SuccessToast('Comment added successfully')
    dispatch(setIsOpenTreatmentRevisionModal(false))

    const targetStatusId = InReviewId ?? safeParseInt(dynamicWorkflowStatusId)
    if (!targetStatusId) return
    await dispatchAction(
      moveTaskCard({
        task_id: safeParseInt(cardDetails?.id) ?? 0,
        doctor_id: safeParseInt(userId) ?? 0,
        workflow_status_id: targetStatusId,
        patient_id: safeParseInt(cardDetails?.patient_id) ?? 0,
        workflow_id: safeParseInt(cardDetails?.workflow_id) ?? 0,
        is_vsp_task_moving: serviceConfig?.VSP_PLANNING ? true : false,
      })
    ).unwrap()
    await dispatchAction(
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

  return (
    <Modal
      closable
      onCancel={handleClose}
      destroyOnClose
      centered
      open={!!open}
      className={clsx('md:w-[640px] w-full')}
      maskClosable={false}
      width={640}
      // keep the comment box + CTAs in footer so they never scroll
      footer={
        <footer className='w-full'>
          <div className='rounded-xl border border-gray-200 bg-gray-50 p-3 flex flex-col gap-3'>
            <div>
              <label className='mb-2 block text-sm font-medium text-black text-start '>
                Comment <span className='text-red-500'>*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  selectedId
                    ? 'Add your comment here...'
                    : 'Select a plan above to add a comment...'
                }
                rows={3}
                disabled={!selectedId}
                className={clsx(
                  'w-full resize-y rounded-xl border bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0',
                  !selectedId ? 'border-gray-200 opacity-60 cursor-not-allowed' : 'border-gray-300'
                )}
              />
            </div>

            {/* Buttons next (bottom) */}
            <div className='flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={handleClose}
                className='rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={submitForSelectedPlan}
                disabled={!selectedId || !comment.trim().length}
                className='bg-primaryColor inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow disabled:cursor-not-allowed disabled:opacity-50'
              >
                Submit
              </button>
            </div>
          </div>
        </footer>
      }
    >
      {/* Body: fixed height; only plans scroll */}
      <div className='flex max-h-[70vh] flex-col'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-xl font-semibold text-gray-900'>Select Treatment Plan</h2>
          <p className='text-sm text-gray-500'>Select a plan to send back for revision.</p>
        </div>

        {/* Scrollable list area */}
        <div className='mt-4 flex-1 space-y-4 overflow-y-auto pr-1'>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedId === plan.id}
              onSelect={() => setSelectedId(plan.id)}
            />
          ))}

          {!plans.length && (
            <div className='rounded-xl border border-gray-200 p-4 text-sm text-gray-600'>
              No plans found.
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

/* ---------- Card ---------- */

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan
  selected: boolean
  onSelect: () => void
}) {
  // Keep hooks unconditionally here
  const treatmentStatus = getPlanStatus({
    treatmentPlan: plan as any,
  }) as keyof typeof treatmentPlanStatusConstants

  const isRePlan =
    treatmentStatus === 'RE_PLAN' ||
    plan.status === treatmentPlanStatusConstants.RE_PLAN ||
    plan.approver_status === treatmentPlanStatusConstants.RE_PLAN ||
    plan.initiator_status === treatmentPlanStatusConstants.RE_PLAN

  return (
    <button
      type='button'
      onClick={() => !isRePlan && onSelect()}
      aria-disabled={isRePlan}
      className={clsx(
        'w-full rounded-2xl border p-4 text-left shadow-sm transition',
        selected
          ? 'border-primaryColor  ring-primaryColor/40 bg-primaryColor/5'
          : 'border-gray-200 hover:border-gray-300',
        isRePlan && 'cursor-not-allowed opacity-60 hover:border-gray-200'
      )}
    >
      <div className='flex items-start gap-3'>
        {/* radio-like square indicator */}
        <span
          aria-checked={selected}
          role='radio'
          className={clsx(
            'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border',
            isRePlan
              ? 'border-gray-300 bg-gray-100'
              : selected
                ? 'border-primaryColor bg-primaryColor text-white'
                : 'border-gray-300 bg-white'
          )}
        >
          {selected && !isRePlan ? (
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
}
