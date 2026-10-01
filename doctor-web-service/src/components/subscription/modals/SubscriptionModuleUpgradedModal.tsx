import CloseIcon from 'assets/icons/CloseIcon'
import PatientsUsedIcon from 'assets/icons/PatientsUsedIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import React from 'react'
import {IconProps} from 'types/IconProps'

const SubscriptionModuleUpgradedModal = ({
  onClose,
  onClick,
  HeaderIcon = PatientsUsedIcon,
  title,
  subTitle,
  content,
}: {
  onClose: () => void
  title: string
  subTitle: string
  onClick: () => void
  HeaderIcon?: React.FC<IconProps>
  content?: React.ReactNode
}) => {
  return (
    <ModalLayout>
      <div className='flex  items-center justify-between mb-4'>
        <div className='flex justify-center w-full ml-5'>
          <div className='w-12 h-12 bg-tertiarySupport rounded-full flex justify-center items-center'>
            <HeaderIcon color={'#00B383'} />
          </div>
        </div>
        <div className='cursor-pointer' onClick={onClose}>
          <CloseIcon color='black' />
        </div>
      </div>
      <div className='max-h-[70vh] flex flex-col gap-6 items-center'>
        <div>
          <p className='text-2xl font-semibold text-center '>{title}</p>
          <p className='text-base font-normal text-textColor mt-1 text-center'>{subTitle}</p>
          <div>{content}</div>
        </div>
        <AntdButton
          className='bg-primaryColor text-white h-12 font-semibold text-base w-fit px-10'
          text='Okay'
          disabled={false}
          onClick={onClick}
        />
      </div>
    </ModalLayout>
  )
}

export default SubscriptionModuleUpgradedModal
