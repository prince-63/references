import React from 'react'
import {useEvent} from './EventContext'
import AlertIcon from 'assets/icons/AlertIcon'

interface AlertItemProps {
  condition: boolean | undefined
  message: string
}

const AlertItem: React.FC<AlertItemProps> = ({condition, message}) => {
  if (!condition) return null
  return (
    <li className='flex items-center gap-2 text-red text-sm mb-2'>
      <AlertIcon color='red' />
      {message}
    </li>
  )
}

const Alerts: React.FC = () => {
  const {event} = useEvent()
  const {feedback_needs_review, photos_uploaded, check_in_performed} =
    event.extendedProps.content.details
  const {calendar_response_type} = event.extendedProps

  return (
    <ul>
      <AlertItem
        condition={calendar_response_type === 'ALIGNER_CHECK_IN' && !photos_uploaded}
        message='No photos uploaded'
      />
      <AlertItem
        condition={calendar_response_type === 'ALIGNER_CHECK_IN' && feedback_needs_review}
        message='Feedback needs review'
      />
      <AlertItem
        condition={calendar_response_type === 'ALIGNER_CHANGED' && !check_in_performed}
        message='No check-in done'
      />
    </ul>
  )
}

export default Alerts
