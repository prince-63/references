import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {TrackingAddingPayload} from './types/tracking.types'
import {
  getTrackingDetails,
  handlePostTrackingDetails,
  postTrackingDetails,
  setIsModalAddedTrackingOpen,
} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AxiosError} from 'axios'
import {AuthContext} from 'context/AuthContext'
import {useContext, useState} from 'react'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import InfoIcon from 'assets/icons/InfoIcon'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'

const FinalizeTrackingConfirmModal = ({
  setIsFinalizeModalOpen,
  payload,
}: {
  setIsFinalizeModalOpen: (isFinalizeModalOpen: boolean) => void
  payload: TrackingAddingPayload
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId}: any = useContext(AuthContext)
  const {patientId} = useParams()
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const [loadingFinalize, setLoadingFinalize] = useState<boolean>(false)

  const handleOnClick = async () => {
    setLoadingFinalize(true)
    await dispatchAction(postTrackingDetails(payload))
      .unwrap()
      .then(async () => {
        dispatchAction(getApiDataDoctorProfile({doctor_id: safeParseInt(userId)}))
        dispatchAction(
          getTrackingDetails({
            patient_id: String(patientId),
            doctor_id: safeParseInt(userId),
            treatment_subtype: treatmentTypeMain.ALIGNERS,
          })
        )
          .unwrap()
          .then(async () => {
            setIsFinalizeModalOpen(false)
            setLoadingFinalize(false)

            dispatchAction(setIsModalAddedTrackingOpen(true))
            navigate(`${profileBasePath}/${patientId}/aligner-tracking`)

            dispatchAction(handlePostTrackingDetails(null))
            dispatchAction(
              getApiLeadsOverview({
                data: {
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                },
              })
            )
            dispatchAction(
              getLeadsProfileDetails({
                patient_id: safeParseInt(patientId),
                doctor_id: safeParseInt(userId),
              })
            )
          })
          .catch((error: AxiosError) => {
            setIsFinalizeModalOpen(false)
            console.error(error)
            setLoadingFinalize(false)
          })
      })
      .catch((error: AxiosError) => {
        console.error(error)
        setLoadingFinalize(false)
      })
  }
  return (
    <ModalLayout>
      <div className='flex flex-col gap-6 md:w-[566px]'>
        <div className='bg-primarySupport w-16 h-16 rounded-full flex justify-center items-center'>
          <InfoIcon color='#735bf2' width='32' height='32' />
        </div>
        <div className='text-center md:text-start'>
          <p className='font-bold text-2xl text-black'>Confirm treatment tracking finalization</p>
          <p className='text-textColor text-base mt-2'>
            Finalizing treatment tracking will use one credit. Please review before proceeding to
            finalize.{' '}
          </p>
        </div>
        <div className='w-full md:w-[88%] flex gap-2 mt-2'>
          <button
            className='bg-white text-primaryColor border border-primaryColor h-14 font-semibold text-base w-1/2 rounded'
            type='button'
            onClick={() => {
              setIsFinalizeModalOpen(false)
            }}
          >
            Cancel
          </button>
          <AntdButton
            className='bg-primaryColor text-white h-14 font-semibold text-base w-1/2 '
            isLoading={loadingFinalize}
            text='Finalize'
            onClick={handleOnClick}
            isDisabled={loadingFinalize}
          />
        </div>
      </div>
    </ModalLayout>
  )
}

export default FinalizeTrackingConfirmModal
