import {useNavigate} from 'react-router-dom'
import ButtonOutlinedRed from '../../atom/Buttons/ButtonOutlinedRed'
import ButtonRed from '../../atom/Buttons/ButtonRed'

import {useDispatch} from 'react-redux'

import {SVG_NOTE_RED} from '../../../utils/SvgConstants'
import BackGroundSVG from '../../atom/SVG/BackGroundSVG'
import {postApiDataTreatmentDeactivate} from '../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentDeactivateSlice'

interface propsSuccessModel {
  setIsDeactivateModelOpen: any
  treatmentList: any[]
}

const ModalDeactivateTreatment: React.FC<propsSuccessModel> = (props) => {
  const dispatch = useDispatch()
  const navigation = useNavigate()
  const {setIsDeactivateModelOpen, treatmentList} = props
  // Data All treatment data

  const onPressDeactivate = () => {
    const alignerJourneyId = treatmentList[treatmentList.length - 1].value
    const postData: any = {
      data: {
        aligner_journey_id: alignerJourneyId != undefined && parseInt(alignerJourneyId),
        alignerUpdateStatus: 'DeactivateTreatment',
      },
    }
    dispatch(postApiDataTreatmentDeactivate(postData) as any).then(() => {
      setIsDeactivateModelOpen(false)
      navigation('/')
    })
  }

  const onPressBack = () => {
    setIsDeactivateModelOpen(false)
  }

  return (
    <div className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'>
      <div className='w-[30%] h-auto bg-white rounded-lg p-6 shadow-lg'>
        <BackGroundSVG
          svg={SVG_NOTE_RED}
          width='34'
          height='35'
          className='bg-redSupport rounded-full w-[60px] h-[60px]'
        />
        <div className='text-black text-2xl font-bold mt-4'>
          {'Do you want to deactivate the current treatment?'}
        </div>
        <div className='w-auto h-auto mt-3 text-textColor text-base font-normal leading-snug'>
          {
            'You will have to deactivate the current active treatment to create a new treatment for your patient. Data for the previous treatment will be saved. Do you wish to continue?'
          }
        </div>
        <div className='flex flex-row h-auto justify-between gap-6 mt-4'>
          <ButtonOutlinedRed text='Go back' onClick={() => onPressBack()} className={'h-11 mt-2'} />
          <ButtonRed
            text='Deactivate'
            onClick={() => onPressDeactivate()}
            className={'h-11 mt-2'}
          />
        </div>
      </div>
    </div>
  )
}

export default ModalDeactivateTreatment
