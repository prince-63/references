import ArrowLeft from 'assets/icons/ArrowLeft'
import {useNavigate} from 'react-router-dom'

export const CaseRecordsHeader = () => {
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
    </div>
  )
}
