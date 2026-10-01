import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import ModalCard from 'components/modalCard/ModalCard'
import React from 'react'

interface ModalRevertSuccessProps {
  open: boolean
  onOkay: () => void
}

const ModalRevertSuccess = ({open, onOkay}: ModalRevertSuccessProps) => {
  return (
    <ModalCard
      title='Revert Successful!'
      subTitle={
        <>
          <div className='mt-4 text-base text-textColor'>
            The tracking data for the current aligner has been reset, and the aligner schedule has
            been updated.
          </div>
        </>
      }
      okText='Okay'
      classNameFooter='mt-5'
      open={open}
      onClick={onOkay}
      onClose={onOkay}
      HeaderIcon={
        <div className='w-16 h-16 rounded-full bg-[#EAFBF5] flex justify-center items-center mx-auto mb-2'>
          <CheckedCircleOutlineIcon />
        </div>
      }
      showCrossButton={false}
      showFooter={true}
      className='text-center'
    />
  )
}

export default ModalRevertSuccess
