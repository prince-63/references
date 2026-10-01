import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import React from 'react'
import {IMAGE_INVITE_PATIENT_SENT_SUCCESS} from 'utils/ImageConst'
import {SVG_CROSS} from 'utils/SvgConstants'
type NoteSuccessModalProps = {
  setSuccessNoteModal: (successNoteModal: boolean) => void
}

const NoteSuccessModal: React.FC<NoteSuccessModalProps> = ({setSuccessNoteModal}) => {
  return (
    <ModalLayout className='w-[31rem]'>
      <div
        className='cursor-pointer flex justify-end'
        onClick={() => {
          setSuccessNoteModal(false)
        }}
      >
        <CommonSVG svg={SVG_CROSS} width='36' height='36' />
      </div>

      <div className='flex flex-col gap-6'>
        <div className='flex justify-center'>
          <img className='w-[292px]' src={IMAGE_INVITE_PATIENT_SENT_SUCCESS} />
        </div>
        <div className='text-center  mt-5'>
          <p className='font-semibold text-2xl text-black'>Note added successfully!</p>
        </div>
      </div>
    </ModalLayout>
  )
}

export default NoteSuccessModal
