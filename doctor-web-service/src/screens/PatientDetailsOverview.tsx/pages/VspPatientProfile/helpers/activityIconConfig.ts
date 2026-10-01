import {ActivityType} from './caseHistory.types'

/**
 * Icon background color classes mapped by activity type.
 * Matches the design system colors from the Case History UI.
 */
const ACTIVITY_ICON_CONFIG: Record<ActivityType, {bgColor: string; iconColor: string}> = {
  CASE_CREATION: {
    bgColor: 'bg-[#F0EEFF]',
    iconColor: '#7C6FE4',
  },
  RECORD_UPLOAD: {
    bgColor: 'bg-[#E8F4FD]',
    iconColor: '#4A9BD9',
  },
  SUBMISSION: {
    bgColor: 'bg-[#FFE8EF]',
    iconColor: '#E05387',
  },
  INFORMATION_REQUEST: {
    bgColor: 'bg-[#FFF3E0]',
    iconColor: '#E8993E',
  },
  INITIAL_PLAN: {
    bgColor: 'bg-[#F0EEFF]',
    iconColor: '#7C6FE4',
  },
  REVISION_FEEDBACK: {
    bgColor: 'bg-[#FFF3E0]',
    iconColor: '#E8993E',
  },
  ITERATIVE_PLAN: {
    bgColor: 'bg-[#F0EEFF]',
    iconColor: '#7C6FE4',
  },
  APPROVAL: {
    bgColor: 'bg-[#E6F7ED]',
    iconColor: '#34A853',
  },
  PRIMARY_CLOSURE: {
    bgColor: 'bg-[#E6F7ED]',
    iconColor: '#34A853',
  },
  REFINEMENT_START: {
    bgColor: 'bg-[#E8F0FE]',
    iconColor: '#5B7FDB',
  },
  STL_REQUESTED: {
    bgColor: 'bg-[#FFF3E0]',
    iconColor: '#E8993E',
  },
  STL_UPLOADED: {
    bgColor: 'bg-[#E8F4FD]',
    iconColor: '#4A9BD9',
  },
  PLANNING_DONE: {
    bgColor: 'bg-[#E6F7ED]',
    iconColor: '#34A853',
  },
  SHIPPED: {
    bgColor: 'bg-[#E8F0FE]',
    iconColor: '#5B7FDB',
  },
  DELIVERED: {
    bgColor: 'bg-[#E6F7ED]',
    iconColor: '#34A853',
  },
}

export default ACTIVITY_ICON_CONFIG
