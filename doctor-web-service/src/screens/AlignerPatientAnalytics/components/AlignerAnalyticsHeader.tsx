import ArrowLeft from 'assets/icons/ArrowLeft'
import {useNavigate} from 'react-router-dom'

const AlignerAnalyticsHeader = () => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col gap-3'>
      <button
        onClick={() => navigate(-1)}
        className='flex gap-2 items-center justify-start font-semibold text-textColor'
      >
        <ArrowLeft />
        <p> Go back</p>
      </button>

      <div>
        <div className='text-2xl font-semibold'>Aligner patient analytics</div>
        <div className='text-base font-normal text-textColor'>
          View analytics to determine prompt action for your patients.
        </div>
      </div>
    </div>
  )
}

export default AlignerAnalyticsHeader
