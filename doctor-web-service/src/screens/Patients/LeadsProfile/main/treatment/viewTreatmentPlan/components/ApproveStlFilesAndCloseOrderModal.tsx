import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {createTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'

const ApproveStlFilesAndCloseOrderModal = ({
  setShowSendForApprovalModal,
}: {
  setShowSendForApprovalModal: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()

  const orderId = searchParams.get('order_id')
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {treatmentPlan, createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const handleOnClick = async () => {
    dispatchAction(
      createTreatmentPlan({
        details: {
          treatment_plan_id: treatmentPlan?.treatment_plan_id,
          doctor_id: treatmentPlan?.doctor_id,
          patient_id: safeParseInt(patientId),
          order_id: orderId,
          stl_file_metadata: {
            link: [...(treatmentPlan?.stl_file_metadata?.link || [])],
            file_id: [...(treatmentPlan?.stl_file_metadata?.file_id || [])],
            status: 'APPROVED',
            printing_type: treatmentPlan?.stl_file_metadata?.printing_type ?? 'THREE_D_PRINTED',
            requested_at:
              treatmentPlan?.stl_file_metadata?.requested_at ?? new Date().toISOString(),
            approved_on: new Date().toISOString(),
          },
        },
      })
    )
      .unwrap()
      .then(() => {
        setShowSendForApprovalModal(false)
        navigate('/orders')
      })
      .catch(() => {})
  }
  return (
    <div>
      <ModalLayout>
        <div className='flex flex-col gap-6'>
          <div className='text-center'>
            <p className='font-bold text-2xl text-black'>Approve STL files and close order?</p>
            <p className='text-textColor text-base'>
              Approving STL files will close order and you can't take any further actions. The
              vendor will be able to add STL files manually regardless. Are you sure you want to
              continue?
            </p>
          </div>
          <div className='flex  gap-2'>
            <button
              className='bg-white text-primaryColor border border-primaryColor h-14 font-semibold text-base w-full rounded'
              type='button'
              onClick={() => {
                setShowSendForApprovalModal(false)
              }}
            >
              Cancel
            </button>
            <AntdButton
              className='bg-primaryColor text-white h-14 font-semibold text-base w-full'
              isLoading={createTreatmentPlanLoading}
              text='Approve'
              onClick={handleOnClick}
              disabled={createTreatmentPlanLoading}
            />
          </div>
        </div>
      </ModalLayout>
    </div>
  )
}

export default ApproveStlFilesAndCloseOrderModal
