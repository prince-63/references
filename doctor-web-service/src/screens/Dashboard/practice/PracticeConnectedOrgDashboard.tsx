import React, {useCallback, useContext, useEffect, useState} from 'react'
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
  HeartPulse,
  Activity,
  ShieldAlert,
  PlayCircle,
  FlaskConical,
} from 'lucide-react'
import Page from 'components/page/Page'

import useDashboard from '@hooks/useDashboard'
import {PracticeDashboardCounts} from 'redux/Slices/AppSlice/DoctorDashboard/dashboardCounts.types'
import {useNavigate} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import useProfileBasePath from '@hooks/useProfileBasePath'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {URL_PATIENTS_LIST_V3_CASES} from 'redux/Endpoints/apiEndpoints'
import {PatientSummaryDTO} from 'screens/Patients/PatientListV3/types'
import {getStatusConfig} from '@utils/getStatusConfig'
import cn from '@utils/cn'
import {safeParseInt} from 'utils/ConstFunctions'
import moment from 'moment'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import PlanningPracticeDashboard from '../Home/components/PlanningPracticeDashboard'
import useAllUserPlan from '@hooks/useAllUserPlan'

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

/* ─────────── Lab & Fulfillment Pipeline cards ─────────── */
const pipelineTopCards: CountCardConfig[] = [
  {
    key: 'draft',
    label: 'DRAFT',
    description: 'Submit required records',
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
    key: 'planning',
    label: 'PLANNING',
    description: 'Lab is preparing setup',
    icon: <Clock className='w-5 h-5' />,
    iconBg: 'bg-[#2563EB]',
    iconColor: 'text-white',
    labelColor: 'text-[#2563EB]',
    cardBg: 'bg-[#EFF6FF]',
    cardHoverBg: 'hover:bg-[#DBEAFE]',
    cardBorder: 'border-[#BFDBFE]',
    filterStatus: 'IN_PROGRESS',
  },
  {
    key: 'need_info',
    label: 'NEED INFO',
    description: 'Provide missing details',
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

const pipelineBottomCards: CountCardConfig[] = [
  {
    key: 'approval_pending',
    label: 'APPROVAL PENDING',
    description: 'Review & approve plan',
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
    key: 'in_revision',
    label: 'IN REVISION',
    description: 'Lab applying changes',
    icon: <Zap className='w-5 h-5' />,
    iconBg: 'bg-[#EA580C]',
    iconColor: 'text-white',
    labelColor: 'text-[#EA580C]',
    cardBg: 'bg-[#FFF7ED]',
    cardHoverBg: 'hover:bg-[#FFEDD5]',
    cardBorder: 'border-[#FED7AA]',
    filterStatus: 'RE_PLAN',
  },
  {
    key: 'approved',
    label: 'APPROVED',
    description: 'Awaiting production',
    icon: <CheckCircle2 className='w-5 h-5' />,
    iconBg: 'bg-[#059669]',
    iconColor: 'text-white',
    labelColor: 'text-[#059669]',
    cardBg: 'bg-[#ECFDF5]',
    cardHoverBg: 'hover:bg-[#D1FAE5]',
    cardBorder: 'border-[#A7F3D0]',
    filterStatus: 'APPROVED',
  },
  // {
  //   key: 'manufacturing',
  //   label: 'MANUFACTURING',
  //   description: 'Aligners in production',
  //   icon: <Box className='w-5 h-5' />,
  //   iconBg: 'bg-[#7C3AED]',
  //   iconColor: 'text-white',
  //   labelColor: 'text-[#7C3AED]',
  //   cardBg: 'bg-[#F5F3FF]',
  //   cardHoverBg: 'hover:bg-[#EDE9FE]',
  //   cardBorder: 'border-[#DDD6FE]',
  //   filterStatus: null,
  // },
  // {
  //   key: 'shipped',
  //   label: 'SHIPPED',
  //   description: 'Track delivery to clinic',
  //   icon: <Truck className='w-5 h-5' />,
  //   iconBg: 'bg-[#0891B2]',
  //   iconColor: 'text-white',
  //   labelColor: 'text-[#0891B2]',
  //   cardBg: 'bg-[#ECFEFF]',
  //   cardHoverBg: 'hover:bg-[#CFFAFE]',
  //   cardBorder: 'border-[#A5F3FC]',
  //   filterStatus: null,
  // },
]

/* ─────────── Patient Compliance cards ─────────── */
type ComplianceCardConfig = {
  key: string
  label: string
  description: string
  icon: ReactNode
  bg: string
  iconBg: string
  countBg: string
  countColor: string
  filterValue: string // Add filter value mapping
}

const complianceCards: ComplianceCardConfig[] = [
  {
    key: 'ready_to_start',
    label: 'Ready to Start',
    description: 'Awaiting patient initiation',
    icon: <PlayCircle className='w-5 h-5 text-blue-600' />,
    bg: 'bg-blue-50 border border-blue-100',
    iconBg: 'bg-blue-100',
    countBg: 'bg-blue-600',
    countColor: 'text-white',
    filterValue: 'READY_TO_START',
  },
  {
    key: 'on_track',
    label: 'On Track',
    description: 'Compliant and on schedule',
    icon: <Activity className='w-5 h-5 text-green-600' />,
    bg: 'bg-green-50 border border-green-100',
    iconBg: 'bg-green-100',
    countBg: 'bg-green-600',
    countColor: 'text-white',
    filterValue: 'ON_TRACK',
  },
  {
    key: 'needs_attention',
    label: 'Needs Attention',
    description: '7+ day change delay',
    icon: <HeartPulse className='w-5 h-5 text-amber-600' />,
    bg: 'bg-amber-50 border border-amber-100',
    iconBg: 'bg-amber-100',
    countBg: 'bg-amber-500',
    countColor: 'text-white',
    filterValue: 'NEEDS_ATTENTION',
  },
  {
    key: 'at_risk',
    label: 'At Risk',
    description: '< 7 day change delay',
    icon: <ShieldAlert className='w-5 h-5 text-red-600' />,
    bg: 'bg-red-50 border border-red-100',
    iconBg: 'bg-red-100',
    countBg: 'bg-red-500',
    countColor: 'text-white',
    filterValue: 'AT_RISK',
  },
]

/* ─── Map dashboard counts to card keys ─── */

const getPipelineCount = (key: string, counts: Partial<PracticeDashboardCounts>): number => {
  const map: Record<string, number> = {
    draft: counts.draft ?? 0,
    planning: counts.planning ?? 0,
    need_info: counts.need_info ?? 0,
    approval_pending: counts.approval_pending ?? 0,
    in_revision: counts.in_revision ?? 0,
    approved: counts.approved ?? 0,
    manufacturing: counts.manufacturing ?? 0,
    shipped: counts.shipped ?? 0,
  }
  return map[key] ?? 0
}

const getComplianceCount = (key: string, counts: Partial<PracticeDashboardCounts>): number => {
  const map: Record<string, number> = {
    ready_to_start: counts.ready_to_start ?? 0,
    on_track: counts.on_track ?? 0,
    needs_attention: counts.needs_attention ?? 0,
    at_risk: counts.at_risk ?? 0,
  }
  return map[key] ?? 0
}

/* ────────────────────── Pipeline Count Card ────────────────────── */

type PipelineCardProps = {
  config: CountCardConfig
  count: number
  onClick: () => void
}
const PipelineCard: React.FC<PipelineCardProps> = ({config, count, onClick}) => (
  <button
    type='button'
    onClick={onClick}
    className={cn(
      'group relative flex flex-col justify-between rounded-3xl border p-6 text-left transition-all duration-200 cursor-pointer w-full min-h-[160px] overflow-hidden',
      config.cardBg,
      config.cardBorder,
      config.cardHoverBg,
      'hover:shadow-xl'
    )}
  >
    {/* Top Row: Icon and Count */}
    <div className='flex items-start justify-between w-full'>
      <div className={cn('rounded-2xl p-2.5 shrink-0', config.iconBg, config.iconColor)}>
        {React.cloneElement(config.icon as React.ReactElement, {className: 'w-6 h-6'})}
      </div>
      <div className='text-3xl font-bold text-gray-900 tracking-tight leading-none'>{count}</div>
      {config.showGlow && count > 0 && (
        <span className='absolute top-4 right-4'>
          <GlowingDot visible color='bg-red-400' />
        </span>
      )}
    </div>

    {/* Bottom Section: Label and Description */}
    <div className='mt-5'>
      <div className={cn('text-xs font-black tracking-widest uppercase', config.labelColor)}>
        {config.label}
      </div>
      <div className='text-[10px] font-bold text-gray-400 mt-1 leading-tight'>
        {config.description}
      </div>
    </div>
  </button>
)

/* ────────────────────── Compliance Card ────────────────────── */

type ComplianceCardProps = {
  config: ComplianceCardConfig
  count: number
  onClick: () => void
}
const ComplianceCard: React.FC<ComplianceCardProps> = ({config, count, onClick}) => (
  <button
    type='button'
    onClick={onClick}
    className={cn(
      'flex items-center gap-4 rounded-2xl p-6 text-left transition-all duration-200 w-full',
      config.bg,
      'hover:shadow-md cursor-pointer'
    )}
  >
    <div className={cn('rounded-xl p-3 shrink-0', config.iconBg)}>
      {React.cloneElement(config.icon as React.ReactElement, {className: 'w-6 h-6'})}
    </div>
    <div className='flex-1 min-w-0 ml-2'>
      <div className='text-base font-bold text-gray-800 tracking-tight'>{config.label}</div>
      <div className='text-xs text-gray-500 mt-1 font-medium'>{config.description}</div>
    </div>
    <div
      className={cn(
        'rounded-full h-10 w-10 flex items-center justify-center text-base font-bold shadow-sm',
        config.countBg,
        config.countColor
      )}
    >
      {count}
    </div>
  </button>
)

/* ────────────────── Case Statistics Sidebar ────────────────── */

type CaseStatisticsProps = {
  counts: Partial<PracticeDashboardCounts>
}
const CaseStatistics: React.FC<CaseStatisticsProps> = ({counts}) => {
  const activeCases = counts.active_cases ?? 0
  const completedCases = counts.completed ?? 0
  const totalThisMonth = counts.cases_this_month ?? 0
  const lastMonth = counts.cases_last_month ?? 0
  const lastActivityDate = counts.last_activity_date ?? null

  return (
    <div className='rounded-[2.5rem] bg-[#1a1738] text-white p-10 flex flex-col h-full shadow-2xl'>
      {/* Header */}
      <div className='flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-12'>
        <TrendingUp className='w-4 h-4' />
        Case Statistics
      </div>

      {/* Main Stats Row - Screenshot Style */}
      <div className='flex items-center justify-between mb-10'>
        <div className='flex-1'>
          <div className='text-5xl font-black leading-none mb-2'>{activeCases}</div>
          <div className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Active Cases
          </div>
        </div>

        {/* Central Split Bar */}
        <div className='flex flex-col gap-1 mx-6'>
          <div className='w-2.5 rounded-full bg-[#a78bfa]' style={{height: '32px'}} />
          <div className='w-2.5 rounded-full bg-[#34d399]' style={{height: '16px'}} />
        </div>

        <div className='flex-1 text-right'>
          <div className='text-3xl font-black text-[#34d399] leading-none mb-2'>
            {completedCases}
          </div>
          <div className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Completed
          </div>
        </div>
      </div>

      <div className='h-px bg-white/5 w-full mb-10' />

      {/* Secondary Stats */}
      <div className='grid grid-cols-2 gap-12 mb-12'>
        <div className='flex flex-col'>
          <div className='text-4xl font-black text-[#a78bfa] mb-2'>{totalThisMonth}</div>
          <div className='text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed'>
            Cases
            <br />
            this month
          </div>
        </div>
        <div className='flex flex-col items-end text-right'>
          <div className='text-4xl font-black text-gray-200 mb-2'>{lastMonth}</div>
          <div className='text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed'>
            Cases
            <br />
            last month
          </div>
        </div>
      </div>

      <div className='h-px bg-white/5 w-full mb-10' />

      {/* Last Activity */}
      <div className='mt-auto flex flex-col gap-3'>
        <div className='flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
          <Calendar className='w-4 h-4' />
          Last Case Activity
        </div>
        <div className='flex items-center gap-3'>
          {lastActivityDate ? (
            <>
              <span className='text-sm font-bold text-gray-100 uppercase tracking-tight'>
                {moment(lastActivityDate).format('MMM DD, YYYY')}
              </span>
              <span className='text-sm font-bold text-purple-400/80 uppercase'>
                • {formatRelativeDate(lastActivityDate)}
              </span>
            </>
          ) : (
            <span className='text-sm font-bold text-gray-500'>NO ACTIVITY YET</span>
          )}
        </div>
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
  const statusConfig = getStatusConfig(patient.order_status)

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

const PracticeConnectedOrgDashboard: React.FC = () => {
  const {loadingDashboard, practice_connected_to_org} = useDashboard(true)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {userId, organizationId} = useContext(AuthContext)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {isPractice} = useAllUserPlan()
  const counts: Partial<PracticeDashboardCounts> = practice_connected_to_org?.counts ?? {}

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
      const response = await apiHelper(URL_PATIENTS_LIST_V3_CASES, HttpMethod.POST, payload)
      setRecentPatients(response.data?.patients ?? [])
    } catch (err) {
      console.error('Error fetching recent patients for dashboard:', err)
    } finally {
      setLoadingPatients(false)
    }
  }, [userId, organizationId])

  useEffect(() => {
    fetchRecentPatients()
  }, [fetchRecentPatients])

  // Navigation helpers
  const handlePatientClick = useCallback(
    (patientId: number) => {
      navigate(`${profileBasePath}/${patientId}`)
    },
    [navigate, profileBasePath]
  )

  const handlePipelineCardClick = useCallback(
    (filterStatus: string | null) => {
      if (filterStatus) {
        navigate('/patients-list', {state: {dashboardFilter: filterStatus}})
      } else {
        navigate('/patients-list')
      }
    },
    [navigate]
  )

  const handleComplianceCardClick = useCallback(
    (filterValue: string) => {
      if (filterValue === 'READY_TO_START') {
        // Navigate to aligner tracking page with Starting Soon filter
        navigate('/aligner-tracking?isFiltered=true&status=STARTING_SOON')
      } else {
        // Navigate to aligner patient analytics page with filter state
        navigate('/aligner-patient-analytics', {
          state: {complianceFilter: filterValue},
        })
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

  const getDashboard = () => {
    if (serviceConfig?.PLANNING || (serviceConfig?.VSP_PLANNING && isPractice)) {
      return <PlanningPracticeDashboard />
    } else {
      return (
        <div className='md:px-6 py-4 md:pb-6 pb-[70px]'>
          {/* Header row — "Dashboard" title + New Case button */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                Here's what's happening with your cases today.
              </p>
            </div>
            <button
              type='button'
              onClick={handleNewCase}
              className='inline-flex shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap rounded-xl bg-primaryColor px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#604ed0]'
            >
              <Plus className='w-4 h-4' />
              New Case
            </button>
          </div>

          {/* Main grid: Left (Pipeline + Compliance) + Right (Case Statistics) */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch'>
            {/* Left 2/3 — Pipeline + Compliance */}
            <div className='lg:col-span-2 flex flex-col gap-6'>
              {/* LAB & FULFILLMENT PIPELINE */}
              <div>
                <h3 className='text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <FlaskConical className='w-4 h-4 text-amber-500' />
                  Lab & Fulfillment Pipeline
                </h3>
                {/* Top row: 4 cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3'>
                  {pipelineTopCards.map((card) => (
                    <PipelineCard
                      key={card.key}
                      config={card}
                      count={getPipelineCount(card.key, counts)}
                      onClick={() => handlePipelineCardClick(card.filterStatus)}
                    />
                  ))}
                </div>
                {/* Bottom row: 4 cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {pipelineBottomCards.map((card) => (
                    <PipelineCard
                      key={card.key}
                      config={card}
                      count={getPipelineCount(card.key, counts)}
                      onClick={() => handlePipelineCardClick(card.filterStatus)}
                    />
                  ))}
                </div>
              </div>

              {/* PATIENT COMPLIANCE */}
              <div>
                <h3 className='text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <HeartPulse className='w-4 h-4 text-rose-500' />
                  Patient Compliance
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {complianceCards.map((card) => (
                    <ComplianceCard
                      key={card.key}
                      config={card}
                      count={getComplianceCount(card.key, counts)}
                      onClick={() => handleComplianceCardClick(card.filterValue)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1/3 — Case Statistics (stretches full height) */}
            <div className='flex flex-col'>
              <CaseStatistics counts={counts} />
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
      )
    }
  }

  return (
    <Page loading={loadingDashboard} loaderText='Loading dashboard...'>
      {getDashboard()}
    </Page>
  )
}

export default PracticeConnectedOrgDashboard
