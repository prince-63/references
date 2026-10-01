import {Dispatch, SetStateAction, useContext} from 'react'
import BackGroundSVG from '../../../atom/SVG/BackGroundSVG'
import {SVG_CROSS, SVG_TIMER_RED} from '../../../../utils/SvgConstants'
import CommonSVG from '../../../atom/SVG/CommonSVG'
import ButtonOutlined from '../../../atom/Buttons/ButtonOutlined'
import ModalLayout from '../../ModalLayout'
import {ApiGetData, identifyUser, safeParseInt} from 'utils/ConstFunctions'
import {useDispatch, useSelector} from 'react-redux'
import {postApiDataNoteDelete} from 'redux/Slices/AppSlice/production/notes/DeleteNote.slice'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RootState} from 'redux/store'
import {postApiDataProductionSlice} from 'redux/Slices/AppSlice/production/production.slice'
import {ThunkDispatch} from 'redux-thunk'
import {AnyAction} from '@reduxjs/toolkit'
import {AuthContext} from 'context/AuthContext'
interface ModalDeleteNoteProps {
  setIsModalDeleteNoteOpen: Dispatch<SetStateAction<boolean>>
  noteId: number
  alignerJourneyId: number
}

const ModalDeleteNote = ({
  setIsModalDeleteNoteOpen,
  noteId,
  alignerJourneyId,
}: ModalDeleteNoteProps) => {
  const {loading} = useSelector((state: RootState) => state.apiNoteDelete)
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch()
  const {userId} = useContext(AuthContext)

  const callNoteDelete = () => {
    identifyUser()

    const postData: ApiGetData = {
      data: {
        aligner_journey_id: safeParseInt(alignerJourneyId),
        note_id: noteId,
      },
    }
    dispatch(postApiDataNoteDelete(postData) as any)
      .unwrap()
      .then(() => {
        dispatch(
          postApiDataProductionSlice({
            status: '',
            doctorId: safeParseInt(userId),
          })
        )
        setIsModalDeleteNoteOpen(false)
      })
      .catch(() => {})
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
            setIsModalDeleteNoteOpen(false)
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
            setIsModalDeleteNoteOpen(false)
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
