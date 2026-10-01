import PracticeLocationIconCalendarEvent from 'assets/icons/PracticeLocationIconCalendarEvent'
import {useEvent} from './EventContext'
import hasValue from 'utils/hasValue'

const PracticeLocationDetails = () => {
  const {event} = useEvent()
  const {practice_location_city, practice_location_name} = event.extendedProps.content.details
  return (
    <div className='flex gap-2 '>
      <PracticeLocationIconCalendarEvent />
      <p className='text-black text-sm font-medium'>
        {practice_location_name ?? 'Practice Location Not added'}
        {hasValue(practice_location_city) && ','} {practice_location_city}
      </p>
    </div>
  )
}

export default PracticeLocationDetails
