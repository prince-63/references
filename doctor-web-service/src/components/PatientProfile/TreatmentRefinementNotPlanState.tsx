import {IMAGE_TREATMENT_STATE} from '../../utils/ImageConst'
import {SVG_ARROW_RIGHT} from '../../utils/SvgConstants'
import CommonSVG from '../atom/SVG/CommonSVG'
import {useNavigate} from 'react-router-dom'

function TreatmentRefinementNotPlanState(props: {patientUserId: any}) {
  const {patientUserId} = props
  const navigation = useNavigate()

  const onClickButton = () => {
    navigation(`/setup-treatment-plan/${patientUserId}`, {
      state: {
        hideMidTreatmentOption: true,
      },
    })
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <img className='w-48 h-40' src={IMAGE_TREATMENT_STATE} alt='' />
      <div className='mt-4 text-center text-black text-2xl font-semibold'>
        {'You have not set up the refinement plan'}
      </div>
      <div className='mt-1 text-center text-textColor text-base font-normal'>
        {'All the data will be available after the treatment plan is set up'}
      </div>
      <div className='w-auto mt-4 h-10 px-3.5 py-2.5 bg-primarySupport rounded-lg justify-center items-center gap-2 inline-flex'>
        <div onClick={() => onClickButton()} className='text-primaryColor text-base font-semibold'>
          {'Set up refinement plan'}
        </div>
        <CommonSVG svg={SVG_ARROW_RIGHT} width='18' height='18' />
      </div>
    </div>
  )
}

export default TreatmentRefinementNotPlanState
