import useDispatchAction from '@hooks/useDispatchAction'
import ArrowRight from 'assets/icons/ArrowRight'
import TickIcon from 'assets/icons/TickIcon'
import Button from 'components/atom/Buttons/Button'
import {useNavigate, useParams} from 'react-router-dom'
import {handlePostTrackingDetails} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import getColorPalette from 'utils/getColorPalette'

const AddTrackingPrompt = () => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const navigate = useNavigate()
  const handleTakeMeThereClick = () => {
    dispatchAction(handlePostTrackingDetails({}))
    navigate(`/profile/${patientId}/aligner-tracking`)
  }
  return (
    <div className='w-full flex flex-col md:flex-row gap-4 rounded-lg border border-primaryColor p-6  bg-primarySupport'>
      <div className='flex-[6] flex flex-col gap-1'>
        <p className='text-[16px] font-bold text-primaryColor'>
          Choose a method of tracking your patient’s treatment
        </p>
        <div className='flex items-center gap-2 text-textColor font-medium text-[14px]'>
          <TickIcon color='#666666' /> Track each aligner change made by the patient and give
          feedback{' '}
        </div>
        <div className='flex gap-2 items-center text-textColor font-medium  text-[14px]'>
          <TickIcon color='#666666' /> Chat with your patient to address any concerns they have
        </div>
        <div className='flex gap-2 items-center text-textColor font-medium  text-[14px]'>
          <TickIcon color='#666666' />
          Monitor their aligner wear behavior throughout the treatment
        </div>
      </div>

      <div className='flex items-center md:justify-center justify-start ml-6'>
        <Button
          text='Take me there'
          onClick={handleTakeMeThereClick}
          className='bg-primarySupport !w-fit px-4 md:py-2 border border-primaryColor '
          textStyle='!text-primaryColor text-[14px] font-bold'
          SvgRight={<ArrowRight color={getColorPalette().primaryColor} height='9' width='13' />}
        />
      </div>
    </div>
  )
}

export default AddTrackingPrompt
