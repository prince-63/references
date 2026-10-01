import Fallback from 'components/errorHandler/Fallback'
import {IMAGE_APP_LOGO} from 'utils/ImageConst'

const ServerBusy = () => {
  return (
    <div className='h-dvh'>
      <div className='p-5'>
        <img className='w-52 self-center ' src={IMAGE_APP_LOGO} alt='app logo' />
      </div>
      <div className='h-[calc(100vh-5rem)]'>
        <Fallback className='' ifFromErrorPage={true} />
      </div>
    </div>
  )
}

export default ServerBusy
