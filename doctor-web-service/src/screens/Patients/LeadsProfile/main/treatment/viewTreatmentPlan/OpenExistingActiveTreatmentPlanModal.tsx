import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ButtonOutlinedRed from 'components/atom/Buttons/ButtonOutlinedRed'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {
  setOpenExistingActiveTreatmentPlanModal,
  setOpenApprovePendingActionModal,
  setShowSendToPatientModal,
  setOpenDeactivateTreatmentPlanModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'

const OpenExistingActiveTreatmentPlanModal = () => {
  const {dispatchAction} = useDispatchAction()
  const {treatmentPlan, treatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const activeTreatmentPlanId = treatmentPlanList.find(
    (item) => item.status === 'ACTIVE' || item.status === 'PAUSED'
  )?.treatment_plan_id

  const completedTreatmentPlanId = treatmentPlanList.find(
    (item) => item.status === treatmentPlanStatusConstants.COMPLETE
  )?.treatment_plan_id

  const isCompleted = !!completedTreatmentPlanId && !activeTreatmentPlanId

  return (
    <ModalLayout className='w-[33rem]'>
      <div className='mt-4 text-center md:text-start'>
        {isCompleted ? (
          <>
            <p className='text-2xl font-bold'>Looks like this treatment is already completed</p>
            <p className='text-base font-normal text-textColor mt-2'>
              Since a treatment for this patient is already marked as completed, you'll need to
              deactivate the previous treatment before starting a new one.
            </p>
          </>
        ) : (
          <>
            <p className='text-2xl font-bold'>Looks like a treatment is already active</p>
            <p className='text-base font-normal text-textColor mt-2'>
              We only allow one treatment per patient to be active at a time. If you want to go
              ahead with this treatment, you can deactivate the active treatment and finalize this.
            </p>
          </>
        )}
      </div>

      <div className='md:mt-7 mt-4 flex gap-3'>
        <AntdButton
          text='Deactivate'
          className=' w-full !h-12 text-md !font-semibold md:hidden flex !bg-red hover:!bg-red'
          onClick={() => {
            dispatchAction(setOpenExistingActiveTreatmentPlanModal(false))
            if (treatmentPlan?.aligner_journey_id && treatmentPlan?.pending_action_count > 0) {
              dispatchAction(setOpenApprovePendingActionModal(true))
              return
            } else {
              dispatchAction(setOpenDeactivateTreatmentPlanModal(true))
            }
          }}
        />
        <AntdButton
          text={isCompleted ? 'Deactivate previous treatment' : 'Deactivate Treatment'}
          className=' w-full !h-14 text-md !font-semibold hidden md:flex !bg-red hover:!bg-red !text-base'
          onClick={() => {
            dispatchAction(setOpenExistingActiveTreatmentPlanModal(false))
            dispatchAction(setShowSendToPatientModal(false))
            if (treatmentPlan?.aligner_journey_id && treatmentPlan?.pending_action_count > 0) {
              dispatchAction(setOpenApprovePendingActionModal(true))
              return
            } else {
              dispatchAction(setOpenDeactivateTreatmentPlanModal(true))
            }
          }}
        />
        <ButtonOutlinedRed
          text={'Go back'}
          className='h-12'
          onClick={() => {
            dispatchAction(setOpenExistingActiveTreatmentPlanModal(false))
          }}
        />
      </div>
    </ModalLayout>
  )
}

export default OpenExistingActiveTreatmentPlanModal
