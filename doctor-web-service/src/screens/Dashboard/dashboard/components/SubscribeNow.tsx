import RightArrowIcon from 'assets/icons/RightArrowIcon'
import {useNavigate} from 'react-router-dom'
import getBrandConfig from 'utils/getBrandConfig'

const SubscribeNow = () => {
  const navigate = useNavigate()
  return (
    <div className='mt-6 sm:mt-4 lg:mt-6 md:mt-12 md:flex flex-col md:order-1 hidden '>
      <div className='text-[24px] font-bold'>Subscribe to {getBrandConfig().name} plans</div>
      <div className='text-[14px] font-normal mt-2 sm:mt-2 lg:mt-2 md:mt-4'>
        Tired of tracking your patient's aligner on excel? We have got a perfect solution for you.
        Subscribe to our Premium plan today!
      </div>
      <button
        className='flex gap-3 justify-start items-center text-[18px] font-semibold mt-10'
        onClick={() => navigate('/doctor-profile/subscription')}
      >
        Subscribe now <RightArrowIcon color={'white'} width='14' />
      </button>
    </div>
  )
}

export default SubscribeNow
