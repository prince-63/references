import React from 'react'
import {Modal} from 'antd'
import cn from '@utils/cn'

interface PatientNotJoinedModalProps {
  open: boolean
  onClose: () => void
  onSendMessage: () => void
  onResendInvite: () => void
}

const PatientNotJoinedModal: React.FC<PatientNotJoinedModalProps> = ({
  open,
  onClose,
  onSendMessage,
  onResendInvite,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={560}
      title={<div className='text-2xl font-semibold'>Patient hasn't joined the app yet</div>}
      className='patient-not-joined-modal'
    >
      <div className='flex flex-col items-center  text-textColor text-base gap-2'>
        <div className='w-full'>
          They won’t be able to see your message until they sign up. Would you like to resend the
          invite instead?
        </div>
        <div className='flex w-full gap-4 justify-center mt-2'>
          <button
            type='button'
            onClick={onSendMessage}
            className={cn(
              'flex-1 h-12 px-4 rounded-lg border border-primaryColor bg-primarySupport',
              'text-primaryColor font-semibold text-base hover:bg-primarySupport',
              'transition-colors duration-150'
            )}
          >
            Send message anyway
          </button>
          <button
            type='button'
            onClick={onResendInvite}
            className={cn(
              'flex-1 h-12 px-4 rounded-lg bg-primaryColor',
              'text-white font-semibold text-base hover:bg-primaryColor/90',
              'transition-colors duration-150'
            )}
          >
            Resend invite
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PatientNotJoinedModal
