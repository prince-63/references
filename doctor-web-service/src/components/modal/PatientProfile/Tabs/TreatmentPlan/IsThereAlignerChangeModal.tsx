import alertType from '@constants/alertType'
import {eventEmitter} from '@utils/eventEmitter'
import {AxiosError} from 'axios'
import AntdButton from 'components/atom/Buttons/AntdButton'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {getPatientTimeline} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {postApiDataEditSingleAlignerDetails} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/EditSingleAlignerDetailsSlice'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import {RootState} from 'redux/store'
import {ApiGetData, capitalizeFirstLetter} from 'utils/ConstFunctions'
import {SVG_SWITCH_ARROW, SVG_TEETH_PRIMARYT} from 'utils/SvgConstants'

const IsThereAlignerChangeModal = ({
  setSuccess,
  editAlignerData,
  setIsThereAlignerChangeModalOpen,
  isPatientTimeLine,
  selectedFilter,
}: {
  setSuccess: (x: boolean) => void
  editAlignerData: any
  setIsThereAlignerChangeModalOpen: (x: boolean) => void
  isPatientTimeLine?: boolean
  selectedFilter?: string
}) => {
  const {userId} = useContext(AuthContext)
  const {patientUserId, patientId, alignerJourneyId: alignerJourneyIdFromParams} = useParams()
  const alignerJourneyId =
    alignerJourneyIdFromParams ?? editAlignerData?.postData?.data?.aligner_journey_id
  const {loading} = useSelector((state: RootState) => state.apiEditSingleAlignerDetail)
  const dispatch = useDispatch()

  const onConfirm = () => {
    dispatch(postApiDataEditSingleAlignerDetails(editAlignerData.postData) as any)
      .unwrap()
      .then(() => {
        const postData: ApiGetData = {
          data: {
            patient_id: patientUserId ?? patientId,
            alignerJourneyId: alignerJourneyId,
          },
        }
        if (isPatientTimeLine) {
          dispatch(
            getPatientTimeline({
              doctor_id: parseInt(userId as string),
              patient_id: parseInt(patientId as string),
              filter: selectedFilter as any,
            }) as any
          )
        }
        dispatch(postApiDataTreatmentPlan(postData) as any)
        setSuccess(true)
      })
      .catch((error: AxiosError) => {
        eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
      })
  }
  return (
    <ModalLayout className='w-[534px]'>
      <div className='md:px-4 px-2'>
        <div className='flex justify-between items-center mt-3'>
          <BackGroundSVG
            svg={SVG_TEETH_PRIMARYT}
            width='26'
            height='26'
            className='w-16 h-16 bg-primarySupport rounded-full'
          />
        </div>
        <p className='mt-4 font-bold text-black text-2xl'>
          Changing data will change the current aligner
        </p>
        <div className='mt-4'>
          <div className='rounded-lg w-full border border-mediumGray'>
            <div className='relative flex h-[86px]'>
              <div className='flex flex-col items-center justify-center w-1/2 border-r'>
                <div className='text-[16px] font-medium'>
                  {capitalizeFirstLetter(
                    editAlignerData?.aligner_changing_details?.previous_current_aligner_jaw_type
                  )}{' '}
                  {editAlignerData?.aligner_changing_details?.previous_current_aligner}{' '}
                </div>
                <div className='text-[14px] text-textColor font-medium'>Changed from</div>
              </div>
              <div className='flex flex-col items-center justify-center w-1/2'>
                <div className='text-[16px] font-medium'>
                  {capitalizeFirstLetter(
                    editAlignerData?.aligner_changing_details?.next_current_aligner_jaw_type
                  )}{' '}
                  {editAlignerData?.aligner_changing_details?.next_current_aligner}{' '}
                </div>
                <div className='text-[14px] text-textColor font-medium'>Changed to</div>
              </div>
              <BackGroundSVG
                className='absolute w-[48px] h-[48px] bg-lightGray rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'
                svg={SVG_SWITCH_ARROW}
                width='34'
                height='34'
              />
            </div>
          </div>

          <div className='mt-7 flex gap-8 '>
            <AntdButton
              text={'Go back'}
              className='h-12 border !border-primaryColor w-full hover:!bg-primarySupport !bg-primarySupport hover:!text-primaryColor !text-primaryColor font-medium hover:!border-primaryColor '
              onClick={() => {
                setIsThereAlignerChangeModalOpen(false)
              }}
            />
            <AntdButton
              text={'Confirm'}
              loading={loading}
              className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor font-medium'
              onClick={() => {
                onConfirm()
              }}
            />
          </div>
        </div>
      </div>
    </ModalLayout>
  )
}

export default IsThereAlignerChangeModal
