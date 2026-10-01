import CheckMarkIcon from 'assets/icons/CheckMarkIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import getColorPalette from 'utils/getColorPalette'

const ApproveModal = ({
  setShowApprovedModal,
  sendToPatient,
}: {
  setShowApprovedModal: React.Dispatch<React.SetStateAction<boolean>>
  sendToPatient: () => void
}) => {
  const {createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const navigate = useNavigate()
  const {patientId} = useParams()
  return (
    <div>
      <ModalLayout>
        <div className='flex flex-col gap-6'>
          <div className='text-center flex flex-col items-center gap-6'>
            <div className='flex justify-center items-center  bg-tertiarySupport rounded-full p-4 w-11 h-11'>
              <div className='flex justify-center items-center border border-tertiaryColor rounded-full p-1 w-6 h-6'>
                <CheckMarkIcon color={getColorPalette().tertiaryColor} />
              </div>
            </div>
            <div>
              <p className='font-bold text-2xl text-black'>Treatment plan approved</p>
              <p className='text-textColor text-base'>
                You can send it for approval or skip to edit it for later.
              </p>
            </div>
          </div>
          <div className='flex  gap-2'>
            <button
              className='bg-white text-primaryColor border border-primaryColor h-14 font-semibold text-base w-full rounded'
              type='button'
              onClick={() => {
                setShowApprovedModal(false)
                navigate(`/leads-profile/${patientId}/treatment`)
              }}
            >
              Do it later
            </button>
            <AntdButton
              className='bg-primaryColor text-white h-14 font-semibold text-base w-full'
              isLoading={createTreatmentPlanLoading}
              text='Send to patient'
              onClick={sendToPatient}
              disabled={createTreatmentPlanLoading}
            />
          </div>
        </div>
      </ModalLayout>
    </div>
  )
}

export default ApproveModal
