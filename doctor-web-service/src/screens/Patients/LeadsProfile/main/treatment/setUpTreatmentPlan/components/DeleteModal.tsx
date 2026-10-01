import React, {useContext} from 'react'
import ModalLayout from 'components/modal/ModalLayout'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import ButtonRed from 'components/atom/Buttons/ButtonRed'
import {SVG_RED_TRAINGLE} from 'utils/SvgConstants'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import useDispatchAction from '@hooks/useDispatchAction'
import {setRequestDeletionFlag} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {useNavigate} from 'react-router-dom'

interface propsSuccessModel {
  setIsCancelModalOpen: any
  subTitle?: string
}

const DeleteModal: React.FC<propsSuccessModel> = (props) => {
  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const navigate = useNavigate()

  const {
    setIsCancelModalOpen,
    subTitle = 'We’ll review your request and get in touch to confirm next steps.',
  } = props

  const onPressBack = () => {
    setIsCancelModalOpen(false)
  }

  const deleteRequest = () => {
    safeParseInt(profileId)
    dispatchAction(setRequestDeletionFlag(true))
    setIsCancelModalOpen(false)
    navigate('/')
  }

  return (
    <ModalLayout>
      <div className='flex flex-col items-center  text-center'>
        <div className='h-12 w-12 rounded-full bg-redSupport flex items-center justify-center'>
          <CommonSVG svg={SVG_RED_TRAINGLE} width='24' height='24' />
        </div>

        <div className='text-black text-2xl font-bold mt-4'>Confirm Account Deletion Request?</div>

        <div className='text-textColor text-base font-normal leading-snug mt-2'>{subTitle}</div>

        <div className='flex flex-col md:flex-row justify-center gap-4 mt-6 w-full max-w-md'>
          <ButtonRed
            text='Request Deletion'
            onClick={() => {
              deleteRequest()
            }}
            className='w-full md:w-1/2 h-14'
          />
          <ButtonOutlined
            text='Cancel'
            onClick={onPressBack}
            className='w-full md:w-1/2 h-14 border-red text-red'
          />
        </div>
      </div>
    </ModalLayout>
  )
}

export default DeleteModal
