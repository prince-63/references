import {Dispatch, SetStateAction} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RootState} from 'redux/store'
import {ThunkDispatch} from 'redux-thunk'
import {AnyAction} from '@reduxjs/toolkit'
import {deleteNotes} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {SVG_TIMER_RED, SVG_CROSS} from 'utils/SvgConstants'
import {safeParseInt} from 'utils/ConstFunctions'

interface ModalDeleteNoteProps {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  noteId: number
  patientId: number
  onDeleteSuccess?: () => void
}

const ModalDeleteNote = ({
  noteId,
  patientId,
  setIsModalOpen,
  onDeleteSuccess,
}: ModalDeleteNoteProps) => {
  const {loading} = useSelector((state: RootState) => state.apiNoteDelete)
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch()

  const callNoteDelete = () => {
    const postData = {
      noteId: safeParseInt(noteId),
      patientId: safeParseInt(patientId),
    }

    dispatch(deleteNotes(postData) as any)
      .unwrap()
      .then(() => {
        setIsModalOpen(false)
        if (onDeleteSuccess) {
          onDeleteSuccess()
        }
      })
      .catch((error: any) => {
        console.error('Failed to delete note:', error)
      })
  }

  return (
    <ModalLayout>
      <div className='flex justify-between items-center'>
        <BackGroundSVG
          svg={SVG_TIMER_RED}
          width='30'
          height='30'
          className='w-16 h-16 bg-redSupport rounded-full'
        />
        <div
          className='cursor-pointer'
          onClick={() => {
            setIsModalOpen(false)
          }}
        >
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <div className='mt-4'>
        <div className='text-black text-2xl font-bold'>
          Are you sure you want to delete this note?
        </div>
        <div className='mt-2 mb-7 text-textColor text-base font-normal'>
          This note will be permanently deleted. You can create a new note later.
        </div>
      </div>

      <div className='mt-7 flex gap-8'>
        <ButtonOutlined
          text='Cancel'
          className='!h-12 text-md !font-semibold'
          onClick={() => {
            setIsModalOpen(false)
          }}
        />
        <AntdButton
          text={'Delete Note'}
          className='h-12 !bg-red w-full hover:!bg-red'
          onClick={callNoteDelete}
          isLoading={loading}
        />
      </div>
    </ModalLayout>
  )
}

export default ModalDeleteNote
