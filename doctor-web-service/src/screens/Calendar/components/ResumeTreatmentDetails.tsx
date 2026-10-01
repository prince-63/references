import When from 'components/when/When'
import {useEvent} from './EventContext'

import moment from 'moment'
import hasValue from 'utils/hasValue'

const ResumeTreatmentDetails = () => {
  const {event} = useEvent()
  const {paused_at, reason_for_pausing} = event.extendedProps.content.details

  const formattedDate = paused_at ? moment(paused_at).format('dddd, DD MMM YYYY') : 'N/A'

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex gap-1'>
        <p>Paused on:</p>
        <p className='text-black'>{formattedDate}</p>
      </div>
      <When isTrue={hasValue(reason_for_pausing)}>
        <div className='flex flex-col'>
          <p>Reason for pausing</p>
          <p className='text-black'>{reason_for_pausing}</p>
        </div>
      </When>
    </div>
  )
}

export default ResumeTreatmentDetails
