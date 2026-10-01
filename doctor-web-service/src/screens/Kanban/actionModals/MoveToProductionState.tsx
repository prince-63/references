import React, {useContext, useEffect, useMemo, useState} from 'react'
import {Modal} from 'antd'
import clsx from 'clsx'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import type {RootState} from 'redux/store'
import {
  getNewTreatmentList,
  setIsOpenMoveToProductionStateModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {AuthContext} from 'context/AuthContext'
import moment from 'moment'
import When from 'components/when/When'

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
}

const safeParseInt = (v: unknown): number | undefined => {
  const n = parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) ? n : undefined
}

type AnyFunc = (...args: any[]) => any

export default function SelectPlansForRevisionModal() {
  const dispatch = useDispatch() as AnyFunc
  const navigate = useNavigate()
  const {isOpenMoveToProductionStateModal: open, cardDetails} = useSelector(
    (s: RootState) => (s as any).kanban ?? {}
  )
  const {userId} = useContext(AuthContext)
  const {plansList} = useSelector((state: RootState) => state.kanban)

  // Changed from Set to single value for single selection
  const [selected, setSelected] = useState<string | number | null>(null)

  useEffect(() => {
    if (!open) return
    const payload = {
      patient_id: safeParseInt(cardDetails?.patient_id),
      doctor_id: safeParseInt(userId),
      treatment_subtype: 'ALIGNERS',
      isOnlyApproved: true,
      order_id: null,
    } as any
    dispatch(getNewTreatmentList(payload as any))
  }, [open, dispatch, cardDetails?.patient_id])

  const plans: Plan[] = useMemo(() => {
    const list = plansList?.plans_list ?? []
    if (!Array.isArray(list) || list.length === 0) return []

    // helper: normalize status string
    const norm = (s: any) =>
      String(s ?? '')
        .trim()
        .toUpperCase()

    // keep only "APPROVED"
    const approved = list.filter((p: any) => norm(p.initiator_status ?? p.status) === 'APPROVED')

    return approved.map((p: any) => ({
      id: p.plan_id ?? p.id ?? p.uuid ?? Math.random(),
      title: p.plan_name ?? p.title ?? p.name ?? 'Treatment Plan',
      version: p.version ?? p.plan_version ?? 'v.01',
      created: p.created_date ?? p.created ?? p.created_at ?? '-',
      stages: p.total_stages ?? p.stages ?? 0,
      upperSeries: p.upper_aligner_series ?? p.upper_series ?? p.upperSeries ?? '-',
      lowerSeries: p.lower_aligner_series ?? p.lower_series ?? p.lowerSeries ?? '-',
      duration: p.duration ?? (p.wear_days ? `${p.wear_days} days per stage` : '-'),
      status: norm(p.initiator_status ?? p.status) || 'APPROVED',
    }))
  }, [plansList])

  const handleClose = () => {
    dispatch(setIsOpenMoveToProductionStateModal(false))
    setSelected(null) // Reset selection on close
  }

  const handleConfirm = () => {
    // Check if a plan is selected
    if (!selected) {
      console.error('No plan selected')
      return
    }

    // Navigate directly to unified production stepper
    navigate(`/production-setup-stepper/${cardDetails?.patient_id}/${selected}`)
    handleClose()
  }

  return (
    <Modal
      closable
      onCancel={handleClose}
      destroyOnClose
      centered
      open={!!open}
      className={clsx('md:w-[566px] w-full')}
      maskClosable={false}
      width={566}
      footer={null}
    >
      <div className='flex flex-col gap-4'>
        <h2 className='text-2xl font-bold text-gray-900'>Select Plan</h2>
        <p className='text-sm text-gray-500'>
          This order has multiple plans. Select the plan you want to move to production.
        </p>

        <div className='max-h-[60vh] overflow-y-auto space-y-4'>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selected === plan.id}
              onToggle={() => {
                // Single selection: if clicking the same item, deselect it; otherwise select the new one
                setSelected(selected === plan.id ? null : plan.id)
              }}
            />
          ))}

          {!plans.length && (
            <div className='rounded-xl border border-gray-200 p-4 text-sm text-gray-600'>
              No plans are available for approval.
            </div>
          )}
        </div>
        <div className='mt-2 flex items-center justify-between gap-3'>
          <button
            type='button'
            onClick={handleClose}
            className='h-12 rounded-lg border border-gray-300 px-5 text-base font-medium text-gray-700 hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={!selected} // Disable if no plan selected
            className={clsx(
              'h-12 rounded-lg px-6 text-base font-semibold text-white shadow',
              !selected ? 'bg-gray-300 cursor-not-allowed' : ''
            )}
            style={selected ? {background: 'linear-gradient(90deg, #7C3AED, #6D28D9)'} : {}}
          >
            Confirm {selected ? '(1 selected)' : ''}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Badge({children}: {children: React.ReactNode}) {
  return (
    <span className='whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200'>
      {children}
    </span>
  )
}

function PlanCard({
  plan,
  selected,
  onToggle,
}: {
  plan: Plan
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type='button'
      onClick={onToggle}
      className={clsx(
        'w-full rounded-2xl border p-4 text-left shadow-sm transition',
        selected ? 'border-primaryColor ' : 'border-gray-200'
      )}
    >
      <div className='flex items-start gap-3'>
        <input
          type='checkbox'
          checked={selected}
          onChange={onToggle}
          className='mt-1 h-5 w-5 rounded border-gray-300 text-primaryColor focus:ring-0'
        />
        <div className='flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='font-semibold text-gray-900'>{plan.title}</div>
            <div className='text-gray-500'>{plan.version}</div>
            <div className='ml-auto'>
              <Badge>{plan.status ?? 'APPROVED'}</Badge>
            </div>
          </div>

          <dl className='mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700 sm:grid-cols-2'>
            <div className='flex gap-2'>
              <dt className='text-gray-500'>Created:</dt>
              <dd>{moment(plan.created).format('DD-MM-YYYY')}</dd>
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
