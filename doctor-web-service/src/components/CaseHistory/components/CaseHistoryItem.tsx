import React from 'react'
import ActivityIconBadge from './ActivityIconBadge'
import ActivityNoteCard from './ActivityNoteCard'
import ACTIVITY_TITLE_MAP from '../helpers/activityTitleMap'
import {
  formatActivityTimestamp,
  hasNoteSupport,
  parseActivityText,
} from '../helpers/caseHistoryUtils'
import {CaseActivityItem} from '../helpers/caseHistory.types'

interface CaseHistoryItemProps {
  item: CaseActivityItem
  isLast: boolean
}

/**
 * Individual timeline item in the Case History.
 * Renders the icon badge, vertical connector line, title, timestamp, description,
 * and optionally an expandable note card.
 */
const CaseHistoryItem: React.FC<CaseHistoryItemProps> = ({item, isLast}) => {
  const title = ACTIVITY_TITLE_MAP[item.activity_type] ?? item.activity_type
  const {date, time} = formatActivityTimestamp(item.activity_at)
  const parsed = parseActivityText(item.activity)
  const showNote = hasNoteSupport(item.activity_type) && parsed.note !== null

  return (
    <div className='relative flex gap-3'>
      {/* Timeline connector line */}
      {!isLast && <div className='absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-200' />}

      {/* Icon badge */}
      <ActivityIconBadge activityType={item.activity_type} />

      {/* Content */}
      <div className='flex-1 pb-6'>
        {/* Header row: title + date/time */}
        <div className='flex items-start justify-between gap-2'>
          <h4 className='text-xs font-semibold text-gray-900'>{title}</h4>
          <span className='shrink-0 text-[10px] text-gray-400'>
            {date}, {time}
          </span>
        </div>

        {/* Description */}
        <p className='mt-0.5 text-[11px] leading-relaxed text-gray-500'>{parsed.description}</p>

        {/* Note card (only for INFORMATION_REQUEST & REVISION_FEEDBACK) */}
        {showNote && parsed.noteLabel && parsed.note && (
          <ActivityNoteCard noteLabel={parsed.noteLabel} noteContent={parsed.note} />
        )}
      </div>
    </div>
  )
}

export default CaseHistoryItem
