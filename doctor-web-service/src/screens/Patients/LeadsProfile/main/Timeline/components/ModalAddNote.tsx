import {Button} from 'antd'
import NoteIcon from 'assets/icons/NoteIcon'
import clsx from 'clsx'
import InputText from 'components/atom/Inputs/InputText'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import ModalLayout from 'components/modal/ModalLayout'
import {FormikProps} from 'formik'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {CloseIcon} from 'yet-another-react-lightbox'
import {FormValuesTimeline} from '../Timeline'

interface props {
  setOpenModalAddNote: (openModalAddNote: boolean) => void
  formik: FormikProps<FormValuesTimeline>
}
const ModalAddNote = (props: props) => {
  const {setOpenModalAddNote, formik} = props
  const isDisabled = !formik.isValid || !formik.dirty || formik.isSubmitting
  const {loading: addLoading} = useSelector((state: RootState) => state.apiNoteAdd)

  return (
    <ModalLayout
      isResponsive={true}
      className={clsx(
        'md:w-[628px] bg-white rounded-lg md:px-[40px] pt-[39px] shadow-lg md:min-w-[37%] max-h-[95%] z-[1056] overflow-auto'
      )}
    >
      <div>
        <div className='flex justify-between items-center'>
          <div className='w-[64px] h-[64px] flex  justify-center items-center bg-primarySupport rounded-full'>
            <NoteIcon />
          </div>
          <div onClick={() => setOpenModalAddNote(false)}>
            <CloseIcon height={36} width={36} />
          </div>
        </div>
        <div className='text-[24px] font-semibold mt-[14px]'>Add note</div>
        <div className='text-[16px] text-textColor mt-2'>
          You can add notes or reminders about the patient for your own reference. These will not be
          visible to the patient.
        </div>
        <div className='flex flex-col gap-4 mt-4'>
          <InputText
            label='Title'
            name='noteTitle'
            required={false}
            formik={formik}
            placeholder='Note'
            className='!p-4 font-md text-black text-lg'
            classNameLabel='text-lg'
          />
          <div className='relative'>
            <InputTextArea
              label='Note'
              required={true}
              name='noteText'
              formik={formik}
              placeholder=''
              className=' text-md h-[268px] p-4'
              classNameLabel='text-lg'
              maxLength={500}
            />
            <div className='absolute bottom-10 right-4 text-textColor'>
              {formik.values.noteText.length}/500
            </div>
          </div>
          <div className='mt-[10px]'>
            <Button
              className={clsx(
                'h-[56px] text-lg w-full bg-primaryColor cursor-pointer !text-white',
                isDisabled && '!bg-grayDisabled hover:!bg-grayDisabled'
              )}
              onClick={() => {
                formik.handleSubmit()
              }}
              disabled={isDisabled}
              loading={addLoading || false}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </ModalLayout>
  )
}

export default ModalAddNote
