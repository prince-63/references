import {Dispatch, FC, SetStateAction} from 'react'
import BackGroundSVG from '../../../atom/SVG/BackGroundSVG'
import {SVG_CROSS, SVG_TIMER_REMINDER_PRIMARY} from '../../../../utils/SvgConstants'
import CommonSVG from '../../../atom/SVG/CommonSVG'
import Button from '../../../atom/Buttons/Button'
import When from '../../../when/When'
import NotesModalEmptyState from './NotesModalEmptyState'
import NotesList from './NotesList'
import ModalLayout from '../../ModalLayout'
import {NotesEntity} from 'screens/Production/types/productionOrders.interface'

interface modalViewNotesProps {
  setIsModalViewNotesOpen: Dispatch<SetStateAction<boolean>>
  notes?: NotesEntity[]
  setIsModalCreateNotesOpen: Dispatch<SetStateAction<boolean>>
  onEditNoteClick: (prevNoteState: {noteId: number; noteTitle: string; noteText: string}) => void
  onDeleteNoteClick: (note_id: number) => void
}

const ModalViewNotes: FC<any> = ({
  setIsModalViewNotesOpen,
  notes = [],
  setIsModalCreateNotesOpen,
  onEditNoteClick,
  onDeleteNoteClick,
}: modalViewNotesProps) => {
  const handleCreateModalClick = () => {
    setIsModalViewNotesOpen(false)
    setIsModalCreateNotesOpen(true)
  }

  return (
    <ModalLayout>
      <div className='flex justify-between items-center'>
        <BackGroundSVG
          svg={SVG_TIMER_REMINDER_PRIMARY}
          width='26'
          height='26'
          className='w-16 h-16 bg-primarySupport rounded-full'
        />
        <div
          className='cursor-pointer'
          onClick={() => {
            setIsModalViewNotesOpen(false)
          }}
        >
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <div className='mt-4'>
        <div className='text-black text-2xl font-semibold'>Your notes</div>
        <div className='mt-2 h-5 text-textColor text-base font-normal'>
          Record any important information or actions required here
        </div>
      </div>
      <div className='w-[100%] mt-8 flex flex-col items-center justify-center'>
        <When isTrue={notes.length == 0}>
          <NotesModalEmptyState />
        </When>
        <When isTrue={notes.length > 0}>
          <NotesList
            notes={notes}
            onEditNoteClick={onEditNoteClick}
            onDeleteNoteClick={onDeleteNoteClick}
          />
        </When>
      </div>

      <div className='mt-7'>
        <Button text={'Create New Note'} className='h-12' onClick={handleCreateModalClick} />
      </div>
    </ModalLayout>
  )
}

export default ModalViewNotes
