import React from 'react'
import clsx from 'clsx'
import {getDueMessageText} from '../../../utils/getDueMessageText'
import moment from 'moment'
import hasValue from 'utils/hasValue'

interface DueMessageProps {
  offSetDays?: number | null
  date?: string | null
}

const DueMessage: React.FC<DueMessageProps> = ({offSetDays, date}) => {
  let days = offSetDays
  if (date && !offSetDays) {
    days = moment(date).diff(moment().format('YYYY-MM-DD'), 'days')
  }
  if (!days && days !== 0) return null

  const messageText = getDueMessageText({offSetDays, date})
  if (!hasValue(messageText)) return null

  return (
    <div className='font-semibold text-xs flex items-center gap-1'>
      <div
        className={clsx('w-2 h-2 rounded-full', {
          'bg-secondaryColor': days >= 0,
          'bg-red': days < 0,
        })}
      ></div>
      <span className={days >= 0 ? 'text-secondaryColor' : 'text-red'}>{messageText}</span>
    </div>
  )
}

export default DueMessage
