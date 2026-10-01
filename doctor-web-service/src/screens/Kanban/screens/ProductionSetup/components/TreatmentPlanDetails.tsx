import {CheckCircle2, ClipboardList, Info} from 'lucide-react'
import SectionCard from './SectionCard'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import formatAligners from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/helpers/formatAligners'
import moment from 'moment'
import When from 'components/when/When'
import {openDocument} from 'utils/ConstFunctions'

const TreatmentPlanDetails = () => {
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)

  type ArchMeta = {
    starts_with?: number
    ends_with?: number
    range?: number[]
  }

  const archCount = (arch?: ArchMeta) => {
    if (!arch) return 0
    const start = Number(arch.starts_with ?? (Array.isArray(arch.range) ? arch.range[0] : NaN))
    const end = Number(
      arch.ends_with ?? (Array.isArray(arch.range) ? arch.range[arch.range.length - 1] : NaN)
    )
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return end - start + 1
    }
    // Fallback: range length if available
    return Array.isArray(arch.range) ? arch.range.length : 0
  }

  const upper = treatmentPlan?.aligner_details_meta_data?.upper_jaw as ArchMeta | undefined
  const lower = treatmentPlan?.aligner_details_meta_data?.lower_jaw as ArchMeta | undefined

  const upperCount = archCount(upper)
  const lowerCount = archCount(lower)
  const totalCount = upperCount + lowerCount

  const formatRangesOrFallback = (arr?: number[]) =>
    Array.isArray(arr) && arr.length
      ? formatAligners(arr).map((range, i) => <p key={i}>{range ?? '-'}</p>)
      : 'Aligner 0-0'

  return (
    <SectionCard
      id='plan-overview'
      icon={<ClipboardList className='h-5 w-5' />}
      title={treatmentPlan?.treatment_plan_name}
      subtitle={treatmentPlan?.remarks || ''}
    >
      <div className='-mx-5 mb-2 block overflow-x-auto px-5 sm:mx-0 sm:mb-0 sm:overflow-visible'>
        <div className='flex gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4'>
          <div className='snap-start shrink-0 sm:shrink'>
            <MetricTile
              label='Total Aligners'
              value={String(totalCount)}
              sub={`U: ${upperCount} · L: ${lowerCount}`}
            />
          </div>
          <When isTrue={lowerCount > 0}>
            <div className='snap-start shrink-0 sm:shrink'>
              <MetricTile
                label='Lower Aligners'
                value={String(lowerCount)}
                sub={formatRangesOrFallback(lower?.range)}
              />
            </div>
          </When>
          <When isTrue={upperCount > 0}>
            <div className='snap-start shrink-0 sm:shrink'>
              <MetricTile
                label='Upper Aligners'
                value={String(upperCount)}
                sub={formatRangesOrFallback(upper?.range)}
              />
            </div>
          </When>
          {/* your other tiles ... */}
        </div>
      </div>

      <div className='mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2'>
        <div className='rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600'>
          {/* <div className='mb-1 font-medium text-neutral-700'>Meta</div> */}
          <div className='flex flex-wrap gap-2'>
            {/* <Pill tone='green'>
              {`V${
                treatmentPlan?.treatment_plan_id != null
                  ? `${treatmentPlan.treatment_plan_id}.0`
                  : '1.0'
              }`}
            </Pill> */}
            <Pill tone='green'>{'APPROVED'}</Pill>
            {/* <Pill tone='purple'>{treatmentPlan?.days_to_wear_each_aligner ?? 0} days</Pill> */}
            <Pill>
              Created:{' '}
              {treatmentPlan?.created_at
                ? moment(treatmentPlan.created_at).format('DD-MMM-YYYY')
                : '-'}
            </Pill>
            <Pill>
              Approved:{' '}
              {treatmentPlan?.updated_at
                ? moment(treatmentPlan.updated_at).format('DD-MMM-YYYY')
                : '-'}
            </Pill>
          </div>
        </div>

        <div className='rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600'>
          <div className='mb-2 flex items-center gap-2 text-neutral-700'>
            <Info className='h-4 w-4' /> Only plan finalized jobs will show below; others continue
            from this screen.
          </div>
          {treatmentPlan?.treatment_planning_link && (
            <a
              className='inline-flex items-center gap-1 text-sm font-medium text-violet-700 hover:underline'
              href='#'
              onClick={(event) => {
                event.preventDefault()
                openDocument(treatmentPlan.treatment_planning_link ?? '', 'Treatment Plan PDF')
              }}
            >
              Web Viewer
            </a>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

export default TreatmentPlanDetails

function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'green' | 'purple'
}) {
  const styles = {
    neutral: 'bg-neutral-100 text-neutral-700',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    purple: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
  } as const
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  )
}

function MetricTile({
  label,
  value,
  sub,
  className = '',
}: {
  label: string
  value: string
  sub?: any
  className?: string
}) {
  return (
    <div
      className={`flex min-w-[10rem] flex-1 items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100'>
        <CheckCircle2 className='h-5 w-5 text-neutral-600' />
      </div>
      <div className='min-w-0'>
        <div className='truncate text-sm text-neutral-500'>{label}</div>
        <div className='truncate text-base font-semibold'>{value}</div>
        {sub && <div className='truncate text-xs text-neutral-400'>{sub}</div>}
      </div>
    </div>
  )
}
