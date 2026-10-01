import hasValue from 'utils/hasValue'
import {useEvent} from './EventContext'

const Notes = () => {
  const {event} = useEvent()
  const {notes} = event.extendedProps.content.details
  return (
    <div className='flex flex-col'>
      <p>Notes for self</p>
      <p className='text-black text-wrap break-words'>{hasValue(notes) ? notes : 'Not added'}</p>
    </div>
  )
}

export default Notes
