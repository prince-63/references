import {FC, useState} from 'react'
import Button from '../../../../atom/Buttons/Button'
import {ApiGetData, checkButtonStates, safeParseInt} from '../../../../../utils/ConstFunctions'
import BackGroundSVG from '../../../../atom/SVG/BackGroundSVG'
import {SVG_WEAR_DAYS} from '../../../../../utils/SvgConstants'
import CommonSVG from '../../../../atom/SVG/CommonSVG'
import ModalSuccess from '../../../Alert/ModalSuccess'
import {SVG_ARROW_RIGHT_GRAY} from '../../../../../utils/SvgConstants'

import {TEXT_LOADING, TEXT_UPDATE_WEAR_DAYS} from '../../../../../utils/MessageConstant'
import ButtonOutlined from '../../../../atom/Buttons/ButtonOutlined'
import {postApiDataWearDaysUpdate} from '../../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/WearDaysUpdateSlice'
import {useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'
import {postApiDataTreatmentPlan} from '../../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import {alignerNumbersArrayToConcatenatedString} from '../../../../../@utils/convertAlignerNumbersArrayToString'
interface props {
  patientUserId: any
  setIsConfirmEditWearDaysModalOpen: (isConfirmEditWearDaysModalOpen: boolean) => void
  selectedWearDays: number
  changedAligners: number[]
}

const ModalConfirmEditWearDays: FC<props> = (props) => {
  const {setIsConfirmEditWearDaysModalOpen, selectedWearDays, changedAligners}: any = props
  const {id: patientUserId, alignerJourneyId} = useParams()

  const dispatch = useDispatch()

  const [buttonUpdateDetailsText, setButtonUpdateDetailsText] = useState(TEXT_UPDATE_WEAR_DAYS)
  const [success, setSuccess] = useState<boolean>(false)

  const changedAlignersString = alignerNumbersArrayToConcatenatedString(changedAligners)

  const callUpdateWearDays = () => {
    setButtonUpdateDetailsText(TEXT_LOADING)
    const postData: ApiGetData = {
      data: {
        aligner_journey_id: safeParseInt(alignerJourneyId),
        aligner_nos: changedAligners,
        days_to_wear_each_aligner: selectedWearDays,
      },
    }
    dispatch(postApiDataWearDaysUpdate(postData) as any)
      .unwrap()
      .then(() => {
        const postData: ApiGetData = {
          data: {
            patient_id: patientUserId,
            alignerJourneyId: alignerJourneyId,
          },
        }
        dispatch(postApiDataTreatmentPlan(postData) as any)
        setIsConfirmEditWearDaysModalOpen(false)
      })
      .catch(() => {
        setButtonUpdateDetailsText(TEXT_UPDATE_WEAR_DAYS)
      })
  }

  return (
    <div
      className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'
      tabIndex={-1}
    >
      {success && (
        <ModalSuccess
          setIsSuccessModelOpen={setSuccess}
          title={'Wear days details have been successfully updated!'}
        />
      )}
      {!success && (
        <div className=' bg-white w-[32%] rounded-lg p-6 shadow-lg'>
          <div className='flex justify-between items-center'>
            <BackGroundSVG
              svg={SVG_WEAR_DAYS}
              width='26'
              height='26'
              className='w-16 h-16 bg-primarySupport rounded-full'
            />
          </div>
          <div className='mt-4'>
            <div className='text-black text-2xl font-bold flex-wrap w-full'>
              You are modifying the wear days for Aligner {changedAlignersString}
            </div>
          </div>
          <div className='mt-7 flex h-16 px-8'>
            <div className='flex-1 flex items-center justify-center text-textColor text-s'>
              Days to wear each aligner changed to
            </div>
            <div className='flex-none flex items-center justify-center '>
              <CommonSVG svg={SVG_ARROW_RIGHT_GRAY} width='24' height='24' />
            </div>
            <div className='flex-1 flex items-center justify-center text-xl font-semibold'>
              {selectedWearDays} {selectedWearDays > 1 ? 'days' : 'day'}
            </div>
          </div>

          <div className='mt-7 flex gap-8'>
            <ButtonOutlined
              text={'Cancel'}
              className='h-12 bg-transparent border border-primaryColor text-primaryColor'
              onClick={() => setIsConfirmEditWearDaysModalOpen(false)}
            />
            <Button
              text={buttonUpdateDetailsText}
              isDisabled={checkButtonStates(buttonUpdateDetailsText)}
              className='h-12'
              onClick={() => callUpdateWearDays()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ModalConfirmEditWearDays
