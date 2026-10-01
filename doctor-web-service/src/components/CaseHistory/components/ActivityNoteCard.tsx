import React, {useState} from 'react'
import cn from '../../../@utils/cn'

interface ActivityNoteCardProps {
  noteLabel: string
  noteContent: string
}

/**
 * Expandable note card shown for INFORMATION_REQUEST and REVISION_FEEDBACK activities.
 * Displays "Lab Note:" or "Your Note:" with the note content and a Read More/Less toggle.
 */
const ActivityNoteCard: React.FC<ActivityNoteCardProps> = ({noteLabel, noteContent}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const shouldTruncate = noteContent.length > 50
  const displayText = shouldTruncate && !isExpanded ? noteContent.slice(0, 50) + '...' : noteContent

  return (
    <div className='mt-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5'>
      <p className='text-[11px] leading-relaxed text-gray-700'>
        <span className='font-semibold text-gray-900'>{noteLabel}</span> {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'mt-1 text-[10px] font-semibold',
            'text-primaryColor hover:text-primary-600',
            'cursor-pointer transition-colors'
          )}
        >
          {isExpanded ? 'Read Less ∧' : 'Read More ∨'}
        </button>
      )}
    </div>
  )
}

export default ActivityNoteCard
