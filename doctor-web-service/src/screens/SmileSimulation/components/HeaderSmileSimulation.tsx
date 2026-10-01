import CrossIcon from 'assets/icons/CrossIcon'
import {useNavigate} from 'react-router-dom'
import {IMAGE_APP_LOGO} from 'utils/ImageConst'

const HeaderSmileSimulation = () => {
  const navigate = useNavigate()
  return (
    <div className='w-full h-[80px] flex justify-between items-center px-4'>
      <div
        className='flex items-center md:gap-6 gap-1'
        onClick={() => {
          navigate('/')
        }}
      >
        <img src={IMAGE_APP_LOGO} alt='logo' className='md:w-[159px] w-[99px]' />
      </div>
      <button
        className='md:mr-6'
        onClick={() => {
          navigate('/')
        }}
      >
        <CrossIcon width='16' height='16' />
      </button>
    </div>
  )
}

export default HeaderSmileSimulation
