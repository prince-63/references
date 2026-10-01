import React from 'react'
import Button from '../../atom/Buttons/Button'
import CommonSVG from '../../atom/SVG/CommonSVG'
import {SVG_COMPUTER} from '../../../utils/SvgConstants'
import {setShowLockAccountModal} from 'redux/Slices/AuthSlice/loginSlice'
import {useDispatch} from 'react-redux'

const ModalLockAccount: React.FC = () => {
  const dispatch = useDispatch()

  const onClickLogOutLastSession = () => {
    dispatch(setShowLockAccountModal(false))
  }

  return (
    <div
      className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40 min-[876px]'
      tabIndex={-1}
    >
      <div className='bg-white w-96 rounded-lg px-5 shadow-lg min-w-[30%] py-4'>
        <div className='flex flex-shrink-0 items-center justify-between rounded-t-md'>
          <div className='w-[67px] h-[67px] bg-lightGray rounded-full flex justify-center items-center'>
            <CommonSVG svg={SVG_COMPUTER} width='41px' height='41px' />
          </div>
        </div>
        {/* Modal content */}
        <div className='mt-4'>
          <div className='text-black text-2xl font-semibold'>
            Your account has been blocked due to multiple attempts
          </div>
          <div className='text-textColor text-base font-normal'>
            Please log in after sometime. This is done to enhance security within our app.
          </div>
        </div>
        <div className='mt-8'>
          <Button text='Go back' onClick={() => onClickLogOutLastSession()} />
        </div>
      </div>
    </div>
  )
}
export default ModalLockAccount
