import React from 'react'
import Button from '../../atom/Buttons/Button'
import CommonSVG from '../../atom/SVG/CommonSVG'
import ButtonOutlined from '../../atom/Buttons/ButtonOutlined'
import {SVG_COMPUTER} from '../../../utils/SvgConstants'
import {useDispatch} from 'react-redux'
import {setShowLoginSessionModal} from 'redux/Slices/AuthSlice/loginSlice'
interface props {
  onLogoutClick: () => void
}
const ModalLoginSession: React.FC<props> = (props) => {
  const {onLogoutClick} = props
  const dispatch = useDispatch()
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
          <div className='text-textColor text-base font-normal'>
            Do you want to continue? This will log you out of previous session
          </div>
        </div>
        <div className='mt-8 flex gap-3'>
          <ButtonOutlined
            className='h-12'
            text='Go back'
            onClick={() => dispatch(setShowLoginSessionModal(false))}
          />
          <Button text='Continue' onClick={() => onLogoutClick()} />
        </div>
      </div>
    </div>
  )
}
export default ModalLoginSession
