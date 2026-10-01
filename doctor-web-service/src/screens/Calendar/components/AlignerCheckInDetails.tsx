import {useEvent} from './EventContext'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import Alerts from './Alerts'

const AlignerCheckInDetails = () => {
  const {event} = useEvent()
  const {jaw_type, check_in_for_aligner_no} = event.extendedProps.content.details
  return (
    <div className='flex flex-col gap-3'>
      <p className='text-black font-semibold text-base'>
        {capitalizeFirstLetter(jaw_type ?? '', false)} {check_in_for_aligner_no}
      </p>
      <Alerts />
    </div>
  )
}

export default AlignerCheckInDetails
