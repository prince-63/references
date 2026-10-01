import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'

const TreatmentStartedIntro = () => {
  const [countdown, setCountdown] = useState(10)
  const navigate = useNavigate()
  const {patientId} = useParams()
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          navigate(`/profile/${patientId}/aligner-tracking`)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [navigate])

  return (
    <BorderedCard>
      <div className='flex flex-col text-center gap-4 items-center justify-center md:p-4'>
        <div className='w-12 h-12 flex justify-center items-center bg-tertiarySupport rounded-full'>
          <CheckedCircleOutlineIcon />
        </div>
        <div>
          <div className='text-lg font-semibold'>Treatment started</div>
          <div className='text-textColor font-normal'>
            The case has been successfully set up and is now Ongoing.
          </div>
        </div>
        <div className='text-center'>
          <button
            onClick={() => navigate(`/profile/${patientId}/aligner-tracking`)}
            className='bg-primaryColor text-white font-semibold rounded-lg px-6 py-3 mb-2'
          >
            View treatment progress
          </button>
          <div className='text-textColor font-normal'>
            {`You will automatically view progress in ${countdown}s`}
          </div>
        </div>
      </div>
    </BorderedCard>
  )
}

export default TreatmentStartedIntro
