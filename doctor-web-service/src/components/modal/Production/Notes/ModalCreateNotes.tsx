import {Dispatch, SetStateAction, useContext} from 'react'
import CommonSVG from '../../../atom/SVG/CommonSVG'
import {SVG_CROSS, SVG_TIMER_REMINDER_PRIMARY} from '../../../../utils/SvgConstants'
import BackGroundSVG from '../../../atom/SVG/BackGroundSVG'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import InputTextArea from '../../../atom/Inputs/InputTextArea'
import InputText from '../../../atom/Inputs/InputText'
import AntdButton from '../../../atom/Buttons/AntdButton'
import ModalLayout from '../../ModalLayout'
import {ApiGetData, identifyUser, safeParseInt} from 'utils/ConstFunctions'
import {postApiDataNoteAdd} from 'redux/Slices/AppSlice/production/notes/CreateNote.slice'
import {useDispatch, useSelector} from 'react-redux'
import {postApiDataNoteUpdate} from 'redux/Slices/AppSlice/production/notes/UpdateNote.slice'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import {postApiDataProductionSlice} from 'redux/Slices/AppSlice/production/production.slice'
import {ThunkDispatch} from 'redux-thunk'
import {AnyAction} from '@reduxjs/toolkit'
interface ModalCreateNoteProps {
  setIsModalCreateNoteOpen: Dispatch<SetStateAction<boolean>>
  isNew: boolean
  noteId?: number
  prevTitle?: string
  prevText?: string
  alignerJourneyId: number
}

const schema = Yup.object().shape({
  noteTitle: Yup.string()
    .min(1, 'Note Title must be at least 1 character')
    .max(50, 'Note Title must be at most 50 characters')
    .matches(
      /^[a-zA-Z0-9@.!#$%&'*+/=?^_`{|}~\s]+$/,
      "Note Title can only contain alphanumeric characters, spaces, and the following special characters: @.!#$%&'*+/=?^_`{|}~"
    )
    .required('Submit button is not enabled until this is added'),
  noteText: Yup.string()
    .min(1, 'Note Text must be at least 1 character')
    .max(500, 'Note Text must be at most 500 characters')
    .required('This field is mandatory'),
})

const ModalCreateNote = ({
  setIsModalCreateNoteOpen,
  isNew,
  noteId,
  prevTitle,
  prevText,
  alignerJourneyId,
}: ModalCreateNoteProps) => {
  const {userId} = useContext(AuthContext)

  const {loading: addLoading} = useSelector((state: RootState) => state.apiNoteAdd)
  const {loading: updateLoading} = useSelector((state: RootState) => state.apiNoteUpdate)
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch()
  const formik = useFormik({
    initialValues: {
      noteTitle: isNew ? '' : prevTitle || '',
      noteText: isNew ? '' : prevText || '',
    },
    validationSchema: schema,
    onSubmit: () => {
      if (isNew) {
        identifyUser()

        const postData: ApiGetData = {
          data: {
            aligner_journey_id: safeParseInt(alignerJourneyId),
            user_id: userId,
            user_type: 'DOCTOR',
            title: formik.values.noteTitle,
            text: formik.values.noteText,
          },
        }
        dispatch(postApiDataNoteAdd(postData) as any)
          .unwrap()
          .then(() => {
            dispatch(
              postApiDataProductionSlice({
                status: '',
                doctorId: safeParseInt(userId),
              })
            )
            setIsModalCreateNoteOpen(false)
          })
          .catch(() => {})
      } else {
        identifyUser()

        const postData: ApiGetData = {
          data: {
            aligner_journey_id: safeParseInt(alignerJourneyId),
            note_id: noteId,
            updated_by: userId,
            updated_by_user: 'DOCTOR',
            title: formik.values.noteTitle,
            text: formik.values.noteText,
          },
        }
        dispatch(postApiDataNoteUpdate(postData) as any)
          .unwrap()
          .then(() => {
            dispatch(
              postApiDataProductionSlice({
                status: '',
                doctorId: safeParseInt(userId),
              })
            )
            setIsModalCreateNoteOpen(false)
          })
          .catch(() => {})
      }
    },
  })

  const isDisabled = !formik.isValid || !formik.dirty || formik.isSubmitting

  return (
    <ModalLayout>
      <form onSubmit={formik.handleSubmit}>
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
              setIsModalCreateNoteOpen(false)
            }}
          >
            <CommonSVG svg={SVG_CROSS} width='47' height='47' />
          </div>
        </div>
        <div className='mt-4'>
          <div className='text-black text-2xl font-semibold'>Your notes</div>
          <div className='mt-2 mb-7 text-textColor text-base font-normal'>
            Record any important information or actions required here
          </div>
        </div>

        <div className='flex flex-col gap-7'>
          <InputText
            label='Note Title'
            name='noteTitle'
            required={true}
            formik={formik}
            placeholder='Note'
            className='!p-4 font-md text-black text-lg'
            classNameLabel='text-lg'
          />
          <InputTextArea
            label='Note Text'
            required={true}
            name='noteText'
            formik={formik}
            placeholder='Example: Remind me to handover the aligners to the patient'
            className='py-4 text-textColor text-md '
            classNameLabel='text-lg'
          />
        </div>

        <div className='mt-7 w-full'>
          <AntdButton
            text={isNew ? 'Create Note' : 'Update Note'}
            className={
              isNew && isDisabled
                ? 'h-12 text-lg w-full bg-grayDisabled hover:bg-grayDisabled cursor-default'
                : 'h-12 text-lg w-full bg-primaryColor'
            }
            onClick={() => {
              formik.handleSubmit()
            }}
            isLoading={isNew ? addLoading : updateLoading}
          />
        </div>
      </form>
    </ModalLayout>
  )
}

export default ModalCreateNote
