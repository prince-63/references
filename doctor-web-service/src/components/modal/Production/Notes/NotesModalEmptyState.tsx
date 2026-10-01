import {IMAGE_NOTES_MODAL_EMPTY_STATE} from '../../../../utils/ImageConst'

const NotesModalEmptyState = () => {
  return (
    <>
      <img src={IMAGE_NOTES_MODAL_EMPTY_STATE} className='w-64 h-60 ' />
      <div className='text-center'>
        Use this feature to add notes, whether it's to remind yourself, your team, or the patient to
        take action, or simply for record-keeping purposes
      </div>
    </>
  )
}

export default NotesModalEmptyState
