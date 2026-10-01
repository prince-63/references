import React from 'react'
import CaseHistoryItem from './components/CaseHistoryItem'
import {CaseActivityItem} from './helpers/caseHistory.types'

interface CaseHistoryProps {
  activities: CaseActivityItem[]
}

/**
 * Case History timeline component.
 * Displays a collapsible list of case activities in reverse chronological order
 * with colored icon badges, timestamps, descriptions, and expandable notes.
 */
const CaseHistory: React.FC<CaseHistoryProps> = ({activities}) => {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime()
  )

  return (
    <div className='max-h-[300px] overflow-y-auto scrollbar-hide'>
      {sortedActivities.map((item, index) => (
        <CaseHistoryItem
          key={`${item.id}-${item.activity_type}-${index}`}
          item={item}
          isLast={index === sortedActivities.length - 1}
        />
      ))}

      {sortedActivities.length === 0 && (
        <p className='py-6 text-center text-sm text-gray-400'>No case history available.</p>
      )}
    </div>
  )
}

export default CaseHistory
