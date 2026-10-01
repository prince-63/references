import KebabMenu from './KebabMenu'
import moment from 'moment'

interface NoteProps {
  id: number
  title: string
  timestamp: string
  description: string
  onEditNoteClick: (prevNoteState: {noteId: number; noteTitle: string; noteText: string}) => void
  onDeleteNoteClick: (note_id: number) => void
}

const formatTimestamp = (timestamp: string) => {
  // Parse the timestamp string
  const timestampString = moment(timestamp).format('DD-MM-YYYY-HH-mm')
  const timestampMoment = moment(timestampString, 'DD-MM-YYYY-HH-mm')
  // Get the current date
  const currentDate = moment()
  // Calculate the time difference
  const timeDifference = currentDate.diff(timestampMoment, 'days')
  let formattedOutput
  // If the timestamp is from today
  if (timeDifference === 0) {
    formattedOutput = 'Today at ' + timestampMoment.format('hh:mm A')
  }
  // If the timestamp is from yesterday
  else if (timeDifference === 1) {
    formattedOutput = 'Yesterday at ' + timestampMoment.format('hh:mm A')
  }
  // If the timestamp is from another day
  else {
    formattedOutput = 'on ' + timestampMoment.format('DD/MM/YY [at] hh:mm A')
  }
  return formattedOutput
}

// function formatTimestamp(dateTimeString: any) {
//   const now = moment()
//   const date = moment(dateTimeString)
//   const diffInMinutes = now.diff(date, 'minutes')
//   const diffInHours = now.diff(date, 'hours')
//   const diffInDays = now.diff(date, 'days')
//   if (diffInMinutes < 1) {
//     return 'Just now'
//   }
//   if (diffInMinutes < 60) {
//     return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
//   }
//   if (diffInHours < 24 && now.date() === date.date()) {
//     return 'Today'
//   }
//   if (diffInHours < 48 && now.date() - date.date() === 1) {
//     return 'Yesterday'
//   }
//   if (diffInDays < 4) {
//     return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
//   }
//   return date.format('DD-MMM')
// }

const Note = ({
  id,
  title,
  timestamp,
  description,
  onEditNoteClick,
  onDeleteNoteClick,
}: NoteProps) => {
  const timestampString = formatTimestamp(timestamp)

  const handleEditNoteClick = () => {
    onEditNoteClick({noteId: id, noteTitle: title, noteText: description})
  }

  const handleDeleteNote = () => {
    onDeleteNoteClick(id)
  }

  return (
    <div className='p-4 flex flex-col justify-center w-full border border-mediumGray rounded-lg'>
      <div className='flex items-center justify-between w-full'>
        <span className='text-xl font-semibold break-all'>{title}</span>
        <KebabMenu onEditNoteClick={handleEditNoteClick} onDeleteNoteClick={handleDeleteNote} />
      </div>
      <div className='bg-lightGray w-fit px-2 py-1 rounded-sm text-textColor text-xs'>
        Added {timestampString}{' '}
      </div>
      <div className='w-full mt-2 text-textColor text-sm break-all'>{description}</div>
    </div>
  )
}

export default Note
