import {NotesEntity} from 'screens/Production/types/productionOrders.interface'
import Note from './Note'

interface NotesListProps {
  notes: NotesEntity[]
  onEditNoteClick: (prevNoteState: {noteId: number; noteTitle: string; noteText: string}) => void
  onDeleteNoteClick: (note_id: number) => void
}

const NotesList = ({notes, onEditNoteClick, onDeleteNoteClick}: NotesListProps) => {
  return (
    <div
      style={{
        scrollbarColor: '#735BF2 transparent',
        scrollbarWidth: 'thin',
      }}
      className='flex flex-col gap-2 w-full overflow-hidden overflow-y-scroll max-h-[24rem]'
    >
      {notes.map((note) => {
        return (
          <Note
            key={note.id}
            id={note.id}
            title={note.title}
            timestamp={note.created_at}
            description={note.text}
            onEditNoteClick={onEditNoteClick}
            onDeleteNoteClick={onDeleteNoteClick}
          />
        )
      })}
    </div>
  )
}

export default NotesList
