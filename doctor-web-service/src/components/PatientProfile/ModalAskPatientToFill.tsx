import {IMAGE_CALENDER_COMING_SOON} from '../../utils/ImageConst'

const ModalAskPatientToFill = () => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <img className='w-48 h-40' src={IMAGE_CALENDER_COMING_SOON} alt='' />
      <div className='mt-4 text-center text-black text-2xl font-semibold'>
        {'Waiting for patient to fill the treatment start details'}
      </div>
      <div className='mt-1 text-center text-textColor text-base font-normal'>
        {'All the data will be available after they fill in the details'}
      </div>
    </div>
  )
}

export default ModalAskPatientToFill
