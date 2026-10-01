import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import type {ReactNode} from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Plus,
  TrendingUp,
  Zap,
  Calendar,
} from 'lucide-react'
import Page from 'components/page/Page'

import useDashboard from '@hooks/useDashboard'
import {PlanningPracticeCounts} from 'redux/Slices/AppSlice/DoctorDashboard/dashboardCounts.types'
import {useNavigate} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import useProfileBasePath from '@hooks/useProfileBasePath'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {PatientSummaryDTO} from 'screens/Patients/PatientListV3/types'
import {getStatusConfig} from '@utils/getStatusConfig'
import cn from '@utils/cn'
import {safeParseInt} from 'utils/ConstFunctions'
import moment from 'moment'
import {URL_PATIENTS_LIST_V3_CASES} from 'redux/Endpoints/apiEndpoints'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

/* ─────────────────────────── helpers ─────────────────────────── */

const initials = (fullName: string): string => {
  return fullName.slice(0, 1)
}

const formatRelativeDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = moment(dateStr)
  if (!date.isValid()) return '-'
  const now = moment()
  if (date.isSame(now, 'day')) return 'Today'
  if (date.isSame(now.clone().subtract(1, 'day'), 'day')) return 'Yesterday'
  const diff = now.diff(date, 'days')
  if (diff > 0 && diff <= 30) return `${diff} days ago`
  return date.format('MMM DD, YYYY')
}

/* ─────────────────────── Glowing Dot ─────────────────────── */

const GlowingDot: React.FC<{visible: boolean; color?: string}> = ({
  visible,
  color = 'bg-red-500',
}) => {
  if (!visible) return null
  return (
    <span className='relative ml-1.5 flex h-2.5 w-2.5'>
      <span
        className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
          color
        )}
      />
      <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', color)} />
    </span>
  )
}

/* ─────────────────── Status count card types ─────────────────── */

type CountCardConfig = {
  key: string
  label: string
  description: string
  icon: ReactNode
  iconBg: string
  iconColor: string
  labelColor: string
  cardBg: string
  cardHoverBg: string
  cardBorder: string
  filterStatus: string | null
  showGlow?: boolean
  glowBorder?: boolean
}

const needsActionCards: CountCardConfig[] = [
  {
    key: 'draft',
    label: 'DRAFT',
    description: 'Case created but not submitted',
    icon: <FileText className='w-5 h-5' />,
    iconBg: 'bg-[#EEEDF5]',
    iconColor: 'text-[#6E6B8A]',
    labelColor: 'text-[#4A4862]',
    cardBg: 'bg-[#F8F7FB]',
    cardHoverBg: 'hover:bg-[#EEEDF5]',
    cardBorder: 'border-[#E8E6F0]',
    filterStatus: 'DRAFT',
  },
  {
    key: 'approval_pending',
    label: 'APPROVAL PENDING',
    description: 'Plan ready for review',
    icon: <Eye className='w-5 h-5' />,
    iconBg: 'bg-[#735BF2]',
    iconColor: 'text-white',
    labelColor: 'text-[#735BF2]',
    cardBg: 'bg-[#F0EDFE]',
    cardHoverBg: 'hover:bg-[#E4DFFE]',
    cardBorder: 'border-[#D9D2FC]',
    filterStatus: 'IN_REVIEW',
    showGlow: true,
  },
  {
    key: 'need_info',
    label: 'NEED INFO',
    description: 'Lab requested information',
    icon: <AlertTriangle className='w-5 h-5' />,
    iconBg: 'bg-[#F45045]',
    iconColor: 'text-white',
    labelColor: 'text-[#F45045]',
    cardBg: 'bg-[#FEF2F1]',
    cardHoverBg: 'hover:bg-[#FDE5E3]',
    cardBorder: 'border-[#FCCCC9]',
    filterStatus: 'NEED_MORE_INFO',
    showGlow: true,
    glowBorder: true,
  },
]

const planningCards: Omit<CountCardConfig, 'filterStatus'>[] = [
  {
    key: 'in_planning',
    label: 'IN PROGRESS',
    description: 'Lab working on plan',
    icon: <Clock className='w-5 h-5' />,
    iconBg: 'bg-[#2563EB]',
    iconColor: 'text-white',
    labelColor: 'text-[#2563EB]',
    cardBg: 'bg-[#EFF6FF]',
    cardHoverBg: 'hover:bg-[#DBEAFE]',
    cardBorder: 'border-[#BFDBFE]',
  },
  {
    key: 'in_revision',
    label: 'IN REVISION',
    description: 'Lab working on changes',
    icon: <Zap className='w-5 h-5' />,
    iconBg: 'bg-[#EA580C]',
    iconColor: 'text-white',
    labelColor: 'text-[#EA580C]',
    cardBg: 'bg-[#FFF7ED]',
    cardHoverBg: 'hover:bg-[#FFEDD5]',
    cardBorder: 'border-[#FED7AA]',
  },
  {
    key: 'approved',
    label: 'APPROVED',
    description: 'Plan approved by you',
    icon: <CheckCircle2 className='w-5 h-5' />,
    iconBg: 'bg-[#059669]',
    iconColor: 'text-white',
    labelColor: 'text-[#059669]',
    cardBg: 'bg-[#ECFDF5]',
    cardHoverBg: 'hover:bg-[#D1FAE5]',
    cardBorder: 'border-[#A7F3D0]',
  },
]

/* ─── Map dashboard counts to card keys ─── */

const getCountForKey = (
  key: string,
  counts: Partial<PlanningPracticeCounts>,
  isZeroMode: boolean
): number => {
  if (isZeroMode) return 0
  const map: Record<string, number> = {
    draft: counts.draft ?? 0,
    approval_pending: counts.in_review ?? 0,
    need_info: counts.need_info ?? 0,
    in_planning: counts.in_progress ?? 0,
    in_revision: counts.in_revision ?? 0,
    approved: counts.approved ?? 0,
  }
  return map[key] ?? 0
}

/* ────────────────────── Count Card ────────────────────── */

type CountCardProps = {
  config: CountCardConfig
  count: number
  onClick: () => void
}
const CountCard: React.FC<CountCardProps> = ({config, count, onClick}) => (
  <button
    type='button'
    onClick={onClick}
    className={cn(
      'group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer w-full',
      config.cardBg,
      config.cardBorder,
      config.cardHoverBg,
      'hover:shadow-md',
      config.glowBorder &&
        count > 0 &&
        'shadow-[0_0_15px_-3px_rgba(244,80,69,0.3)] hover:shadow-[0_0_20px_-3px_rgba(244,80,69,0.4)]'
    )}
  >
    {config.showGlow && count > 0 && (
      <span className='absolute top-4 right-4'>
        <GlowingDot visible color='bg-red-400' />
      </span>
    )}
    <div className={cn('rounded-xl p-2.5 mb-3', config.iconBg, config.iconColor)}>
      {config.icon}
    </div>
    <div className={cn('text-xs font-bold tracking-wide uppercase', config.labelColor)}>
      {config.label}
    </div>
    <div className='text-[11px] text-gray-500 mt-0.5 capitalize'>{config.description}</div>
    <div className='flex items-center justify-between w-full mt-3'>
      <span className='text-xl font-bold text-gray-900'>{count} Cases</span>
      <ChevronRight className='w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
    </div>
  </button>
)

/* ────────────────── Case Statistics Sidebar ────────────────── */

type CaseStatisticsProps = {
  counts: Partial<PlanningPracticeCounts>
  isZeroMode: boolean
}
const CaseStatistics: React.FC<CaseStatisticsProps> = ({counts, isZeroMode}) => {
  const activeCases = isZeroMode ? 0 : (counts.active ?? 0)
  const completedCases = isZeroMode ? 0 : (counts.completed ?? 0)
  const totalThisMonth = isZeroMode ? 0 : (counts.cases_this_month ?? 0)
  const lastMonth = isZeroMode ? 0 : (counts.cases_last_month ?? 0)
  const lastActivityDate = counts.last_activity_date ?? null

  return (
    <div className='rounded-2xl bg-[#1e1b3a] text-white p-6 flex flex-col gap-5 h-full'>
      <div className='flex items-center gap-2 text-sm font-semibold'>
        <TrendingUp className='w-4 h-4' />
        CASE STATISTICS
      </div>

      {/* Active vs Completed */}
      <div className='flex items-end gap-6'>
        <div>
          <div className='text-4xl font-bold'>{activeCases}</div>
          <div className='text-xs text-gray-400 mt-1'>ACTIVE CASES</div>
        </div>
        <div className='flex flex-col items-center gap-1 pb-1'>
          {/* Simple bar-chart visualization */}
          <div className='flex items-end gap-1'>
            <div
              className='w-2 rounded-sm bg-purple-400'
              style={{height: `${Math.min(40, activeCases * 6 + 8)}px`}}
            />
            <div
              className='w-2 rounded-sm bg-green-400'
              style={{height: `${Math.min(40, completedCases * 6 + 8)}px`}}
            />
          </div>
        </div>
        <div className='text-right'>
          <div className='text-2xl font-bold text-green-400'>{completedCases}</div>
          <div className='text-xs text-gray-400 mt-1'>COMPLETED</div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className='flex gap-6 border-t border-gray-700 pt-4'>
        <div>
          <div className='text-2xl font-bold text-purple-400'>{totalThisMonth}</div>
          <div className='text-[10px] text-gray-400 uppercase'>Cases This Month</div>
        </div>
        <div>
          <div className='text-2xl font-bold'>{String(lastMonth).padStart(2, '0')}</div>
          <div className='text-[10px] text-gray-400 uppercase'>Cases Last Month</div>
        </div>
      </div>

      {/* Last Activity */}
      <div className='flex items-center gap-2 border-t border-gray-700 pt-4 text-xs text-gray-400'>
        <Calendar className='w-3.5 h-3.5' />
        <span>LAST CASE ACTIVITY</span>
      </div>
      <div className='text-sm'>
        {lastActivityDate ? (
          <>
            <span className='text-gray-300'>{moment(lastActivityDate).format('MMM DD, YYYY')}</span>
            <span className='text-purple-300 ml-2'>• {formatRelativeDate(lastActivityDate)}</span>
          </>
        ) : (
          <span className='text-gray-400'>No activity yet</span>
        )}
      </div>
    </div>
  )
}

/* ────────────────── Recent Cases Table ────────────────── */

type RecentCasesTableProps = {
  patients: PatientSummaryDTO[]
  loading: boolean
  onPatientClick: (patientId: number) => void
  onViewAll: () => void
  onNewCase: () => void
}
const RecentCasesTable: React.FC<RecentCasesTableProps> = ({
  patients,
  loading,
  onPatientClick,
  onViewAll,
  onNewCase,
}) => (
  <div className='mt-8'>
    <h2 className='text-lg font-bold text-gray-800 mb-4'>Recent Cases</h2>
    <div className='bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>
      {loading ? (
        <div className='flex items-center justify-center py-12 text-gray-400 text-sm'>
          Loading recent cases...
        </div>
      ) : patients.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 px-6'>
          <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5'>
            <FileText className='w-8 h-8 text-gray-300' />
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-2'>No active cases</h3>
          <p className='text-sm text-gray-400 mb-6'>
            Start by adding a patient and submitting a records set.
          </p>
          <button
            type='button'
            onClick={onNewCase}
            className='inline-flex items-center gap-2 rounded-xl bg-primaryColor px-8 py-3 text-sm font-bold text-white uppercase tracking-wide shadow-sm hover:bg-[#604ed0] transition'
          >
            <Plus className='w-4 h-4' />
            Start First Case
          </button>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <div className='min-w-[720px]'>
            {/* Header */}
            <div className='grid grid-cols-6 gap-4 px-4 md:px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100'>
              <div>Patient</div>
              <div>Clinic</div>
              <div>Case ID</div>
              <div>Last Updated</div>
              <div>Status</div>
              <div className='text-right'>Action</div>
            </div>
            {patients.map((p) => (
              <RecentCaseRow
                key={p.patient_id}
                patient={p}
                onClick={() => onPatientClick(p.patient_id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>

    {/* View All Cases button — only show when there are cases */}
    {!loading && patients.length > 0 && (
      <div className='flex justify-center mt-6'>
        <button
          type='button'
          onClick={onViewAll}
          className='inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 uppercase tracking-wide hover:bg-gray-50 transition'
        >
          View All Cases
        </button>
      </div>
    )}
  </div>
)

type RecentCaseRowProps = {
  patient: PatientSummaryDTO
  onClick: () => void
}
const RecentCaseRow: React.FC<RecentCaseRowProps> = ({patient, onClick}) => {
  const statusConfig = getStatusConfig(
    patient.order_status ?? patient.vsp_order_status ?? 'DRAFT'
  ) as ReturnType<typeof getStatusConfig>

  return (
    <button
      type='button'
      onClick={onClick}
      className='grid grid-cols-6 gap-4 px-4 md:px-6 py-4 w-full min-w-[720px] text-left items-center hover:bg-gray-50 transition border-b border-gray-50 last:border-b-0 cursor-pointer'
    >
      {/* Patient name + avatar */}
      <div className='flex items-center gap-3'>
        <div className='h-9 w-9 shrink-0 rounded-full bg-primarySupport flex items-center justify-center text-sm font-bold text-primaryColor border border-primaryColor'>
          {initials(patient.full_name)}
        </div>
        <span className='text-sm font-semibold text-gray-900 truncate'>
          {patient.full_name || 'Unknown'}
        </span>
      </div>

      {/* Clinic */}
      <div className='text-xs font-semibold text-gray-500 uppercase truncate'>
        {patient.practice_location_name || '-'}
      </div>

      {/* Case ID */}
      <div className='text-xs text-gray-500 font-medium'>{patient.customer_mapped_id || `-`}</div>

      {/* Last Updated */}
      <div className='text-xs text-gray-500 font-medium uppercase'>
        {formatRelativeDate(patient.last_updated)}
      </div>

      {/* Status badge */}
      <div>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase',
            statusConfig.badge
          )}
        >
          <span>{statusConfig.icon}</span>
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Action chevron */}
      <div className='flex justify-end'>
        <ChevronRight className='w-4 h-4 text-gray-400' />
      </div>
    </button>
  )
}

/* ────────────────────── Main Component ────────────────────── */
export const BASE_APP_PATIENT_URL = process.env.REACT_APP_BASE_APP_PATIENT_URL

const PlanningPracticeDashboard = () => {
  const {loadingDashboard, planning_practice, vsp_customer} = useDashboard(true)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {userId, organizationId} = useContext(AuthContext)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const isPlanningUser = serviceConfig?.PLANNING ?? false
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false

  const counts: Partial<PlanningPracticeCounts> =
    planning_practice?.counts ?? vsp_customer?.counts ?? {}

  // Recent patients – fetched from the V3 cases API
  const [recentPatients, setRecentPatients] = useState<PatientSummaryDTO[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)

  const fetchRecentPatients = useCallback(async () => {
    if (!userId || !organizationId) return
    setLoadingPatients(true)
    try {
      const payload = {
        organization_id: safeParseInt(organizationId),
        profile_id: null,
        search: null,
        clinic_id: null,
        customer_mapped_id: null,
        product_id: null,
        case_type: null,
        order_status: null,
        page_number: 0,
        page_size: 5,
        sort_by: 'lastUpdated',
        sort_direction: 'DESC',
        doctor_id: safeParseInt(userId),
      }
      const url = isVspPlanning
        ? `${BASE_APP_PATIENT_URL}/patient/list/v3/vsp-cases`
        : URL_PATIENTS_LIST_V3_CASES

      const response = await apiHelper(url, HttpMethod.POST, payload)

      setRecentPatients(response.data?.patients ?? [])
    } catch (err) {
      console.error('Error fetching recent patients for dashboard:', err)
    } finally {
      setLoadingPatients(false)
    }
  }, [userId, organizationId, isVspPlanning])

  useEffect(() => {
    fetchRecentPatients()
  }, [fetchRecentPatients])

  // Compute "Needs My Action" total for the ACTION REQUIRED glow
  const needsActionTotal = useMemo(() => {
    return needsActionCards.reduce((sum, card) => sum + getCountForKey(card.key, counts, false), 0)
  }, [counts])

  const planningCardConfigs = useMemo<CountCardConfig[]>(() => {
    return planningCards.map((card) => ({
      ...card,
      filterStatus:
        card.key === 'in_revision'
          ? isPlanningUser
            ? 'RE_PLAN'
            : 'REQUEST_REVISION'
          : card.key === 'in_planning'
            ? 'IN_PROGRESS'
            : 'APPROVED',
    }))
  }, [isPlanningUser])

  // Navigation helpers
  const handlePatientClick = useCallback(
    (patientId: number) => {
      navigate(`${profileBasePath}/${patientId}`)
    },
    [navigate, profileBasePath]
  )

  const handleCountCardClick = useCallback(
    (filterStatus: string | null) => {
      if (filterStatus) {
        navigate('/patients-list', {state: {dashboardFilter: filterStatus}})
      } else {
        navigate('/patients-list')
      }
    },
    [navigate]
  )

  const handleViewAllCases = useCallback(() => {
    navigate('/patients-list')
  }, [navigate])

  const handleNewCase = useCallback(() => {
    navigate('/add-patient')
  }, [navigate])

  return (
    <Page loading={loadingDashboard} loaderText='Loading dashboard...'>
      {/* Keyframe for pulsing glow on the outer box */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 12px -4px rgba(115,91,242,0.2); border-color: rgba(115,91,242,0.3); }
          50% { box-shadow: 0 0 24px -4px rgba(115,91,242,0.4); border-color: rgba(115,91,242,0.55); }
        }
      `}</style>
      <div className='md:px-6 py-4 md:pb-6 pb-[70px]'>
        {/* Header row — "Dashboard" title + New Case button */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
          <button
            type='button'
            onClick={handleNewCase}
            className='inline-flex shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap rounded-xl bg-primaryColor px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#604ed0]'
          >
            <Plus className='w-4 h-4' />
            New Case
          </button>
        </div>

        {/* Main grid: Left (counts) + Right (statistics) */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch'>
          {/* Left 2/3 — Count sections */}
          <div className='lg:col-span-2 flex flex-col gap-6'>
            {/* NEEDS MY ACTION */}
            <div
              className={cn(
                'rounded-2xl border-2 bg-white p-5 shadow-sm transition-shadow duration-500',
                needsActionTotal > 0
                  ? 'border-[#735BF2]/40 shadow-[0_0_20px_-4px_rgba(115,91,242,0.25)] animate-[pulseGlow_2.5s_ease-in-out_infinite]'
                  : 'border-gray-100'
              )}
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-sm font-bold text-[#735BF2] uppercase tracking-wide'>
                  Needs My Action
                </h3>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase',
                    needsActionTotal > 0
                      ? 'bg-primaryColor text-white'
                      : 'bg-purple-100 text-primaryColor'
                  )}
                >
                  Action Required
                </span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                {needsActionCards.map((card) => {
                  const count = getCountForKey(card.key, counts, false)
                  return (
                    <CountCard
                      key={card.key}
                      config={card}
                      count={count}
                      onClick={() => handleCountCardClick(card.filterStatus)}
                    />
                  )
                })}
              </div>
            </div>

            {/* PLANNING IN PROGRESS */}
            <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
              <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wide mb-4'>
                Planning In Progress
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                {planningCardConfigs.map((card) => {
                  const count = getCountForKey(card.key, counts, false)
                  return (
                    <CountCard
                      key={card.key}
                      config={card}
                      count={count}
                      onClick={() => handleCountCardClick(card.filterStatus)}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right 1/3 — Case Statistics (stretches full height) */}
          <div className='flex flex-col'>
            <CaseStatistics counts={counts} isZeroMode={false} />
          </div>
        </div>

        {/* Recent Cases Table */}
        <RecentCasesTable
          patients={recentPatients}
          loading={loadingPatients}
          onPatientClick={handlePatientClick}
          onViewAll={handleViewAllCases}
          onNewCase={handleNewCase}
        />
      </div>
    </Page>
  )
}

export default PlanningPracticeDashboard
