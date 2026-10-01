import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import ModalLayout from 'components/modal/ModalLayout'
import When from 'components/when/When'
import React, {Dispatch, SetStateAction} from 'react'
import {SVG_PATIENT_PRIMARY, SVG_PATIENT_RED} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'

interface PatientSettingsActionProps {
  setIsModalPatientSettingsActionOpen: Dispatch<SetStateAction<boolean>>
  title: string
  text: string
  buttonOutlineText: string
  buttonSolidText: string
  type: 'primary' | 'warning'
  onClickOutlineButton: () => void
  onClickSolidButton: () => void
  loading?: boolean
}

const ModalPatientSettingsAction = ({
  title,
  text,
  buttonOutlineText,
  buttonSolidText,
  type,
  onClickOutlineButton,
  onClickSolidButton,
  loading = false,
}: PatientSettingsActionProps) => {
  return (
    <ModalLayout>
      <div className='flex justify-center items-center md:justify-start'>
        <BackGroundSVG
          svg={type === 'primary' ? SVG_PATIENT_PRIMARY : SVG_PATIENT_RED}
          width='30'
          height='30'
          className={clsx(
            'w-16 h-16 bg-primarySupport  rounded-full',
            type === 'warning' && '!bg-redSupport'
          )}
        />
      </div>
      <div className='mt-4 w-full flex flex-col items-center md:items-start justify-center'>
        <div className='text-black text-2xl font-bold text-center md:text-start'>{title}</div>
        <div className='mt-2 mb-7 text-textColor text-base font-normal text-center md:text-start'>
          {text}
        </div>
      </div>

      <div className='md:mt-7 mt:5 flex gap-4 md:gap-8'>
        <When isTrue={hasValue(buttonOutlineText)}>
          <ButtonOutlined
            text={buttonOutlineText}
            className={`!h-12 !font-semibold ${type === 'warning' && '!border-red !text-red '}`}
            onClick={onClickOutlineButton}
          />
        </When>

        <AntdButton
          text={buttonSolidText}
          className={`!h-12 w-full hover:bg-primaryColor bg-primaryColor !font-semibold ${
            type === 'warning' && '!border-red hover:!bg-red !bg-red'
          }`}
          onClick={onClickSolidButton}
          isLoading={loading}
        />
      </div>
    </ModalLayout>
  )
}

export default ModalPatientSettingsAction
