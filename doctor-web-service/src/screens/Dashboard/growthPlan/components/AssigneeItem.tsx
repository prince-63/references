import React from 'react'
import {AssigneeDistributionItem} from '../types'
import getColorPalette from 'utils/getColorPalette'

const AssigneeItem = ({m}: {m: AssigneeDistributionItem}) => {
  const isExternal = m.assignee_type === 'customer' || m.assignee_type === 'vendor'
  const pal = getColorPalette()
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center items-start gap-3 p-3 rounded border ${
        isExternal ? 'bg-gray-50' : 'bg-white'
      } border-lighterGray hover:shadow-sm`}
    >
      <div className='w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold shrink-0 bg-lightGray'>
        {getInitials(m.user_name)}
      </div>
      <div className='flex-1'>
        <div className='text-sm font-medium'>
          {m.user_name}
          {isExternal && <span className='text-gray-400 text-xs ml-1'>(Ext)</span>}
        </div>
        <div className='text-xs text-[#626C71] -mt-0.5'>{m.role}</div>
      </div>
      <div className='w-full md:min-w-[140px] md:w-auto'>
        <div
          className='h-2 rounded overflow-hidden'
          style={{backgroundColor: pal.secondarySupport}}
        >
          <div
            className='h-full rounded'
            style={{width: `${m.percentage}%`, backgroundColor: pal.secondaryColor}}
          />
        </div>
        <div className='text-right text-xs mt-1'>
          {m.percentage}% ({m.case_count} cases)
        </div>
      </div>
    </div>
  )
}

export default AssigneeItem

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
