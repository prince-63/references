import React from 'react'
import {AlertTriangle, CheckCircle2, Clock, FileText, Zap} from 'lucide-react'
import newOrderStatusConstants from '@constants/newOrderStatus.constants'

export interface StatusConfig {
  bg: string
  text: string
  icon: React.ReactNode
  label: string
  badge: string
}

type StatusType = (typeof newOrderStatusConstants)[keyof typeof newOrderStatusConstants]

// Map order statuses to UI configuration — colors match the design exactly
const statusConfigMap: Record<StatusType, StatusConfig> = {
  [newOrderStatusConstants.DRAFT]: {
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#6B7280]',
    icon: <FileText className='w-3.5 h-3.5' />,
    label: 'Draft',
    badge: 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]',
  },
  [newOrderStatusConstants.ORDERED]: {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#2563EB]',
    icon: <Clock className='w-3.5 h-3.5' />,
    label: 'In Progress',
    badge: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
  },

  [newOrderStatusConstants.IN_PROGRESS]: {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#2563EB]',
    icon: <Clock className='w-3.5 h-3.5' />,
    label: 'In Progress',
    badge: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
  },
  [newOrderStatusConstants.NEED_MORE_INFO]: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    icon: <AlertTriangle className='w-3.5 h-3.5' />,
    label: 'Need More Info',
    badge: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
  },
  [newOrderStatusConstants.IN_REVIEW]: {
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#EA580C]',
    icon: <Zap className='w-3.5 h-3.5' />,
    label: 'In Review',
    badge: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]',
  },
  [newOrderStatusConstants.RE_PLAN]: {
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#EA580C]',
    icon: <Zap className='w-3.5 h-3.5' />,
    label: 'In Revision',
    badge: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]',
  },
  [newOrderStatusConstants.REQUEST_REVISION]: {
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#EA580C]',
    icon: <Zap className='w-3.5 h-3.5' />,
    label: 'In Revision',
    badge: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]',
  },
  [newOrderStatusConstants.APPROVED]: {
    bg: 'bg-[#ECFDF5]',
    text: 'text-[#059669]',
    icon: <CheckCircle2 className='w-3.5 h-3.5' />,
    label: 'Approved',
    badge: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
  },
  [newOrderStatusConstants.COMPLETED]: {
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#6B7280]',
    icon: <CheckCircle2 className='w-3.5 h-3.5' />,
    label: 'Completed',
    badge: 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]',
  },
}

/**
 * Get status configuration (colors, icon, label) based on order status
 * @param status - Order status from orderStatusConstants
 * @returns StatusConfig object with bg, text, icon, label, and badge classes
 */
export const getStatusConfig = (status: string | null | undefined): StatusConfig => {
  if (!status || !statusConfigMap[status as StatusType]) {
    return statusConfigMap[newOrderStatusConstants.DRAFT]
  }
  return statusConfigMap[status as StatusType]
}

/**
 * Format status label from status constant
 * @param status - Order status from orderStatusConstants
 * @returns Formatted label for display
 */
export const getStatusLabel = (status: string | null | undefined): string => {
  if (!status) return 'Unknown'
  const config = getStatusConfig(status)
  return config.label
}

/**
 * Get status badge JSX element with icon and label
 * @param status - Order status from orderStatusConstants
 * @param className - Additional CSS classes
 * @returns JSX badge element
 */
export const StatusBadge: React.FC<{
  status: string | null | undefined
  className?: string
}> = ({status, className = ''}) => {
  const config = getStatusConfig(status)

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${config.badge} ${className}`}
    >
      <span className={config.text}>{config.icon}</span>
      <span className={`${config.text} text-xs font-semibold uppercase`}>{config.label}</span>
    </div>
  )
}

/**
 * Get inline status badge (compact version)
 * @param status - Order status from orderStatusConstants
 * @returns Compact JSX badge element
 */
export const CompactStatusBadge: React.FC<{
  status: string | null | undefined
  className?: string
}> = ({status, className = ''}) => {
  const config = getStatusConfig(status)

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase ${config.badge} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  )
}
