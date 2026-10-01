import useDispatchAction from '@hooks/useDispatchAction'
import reasonsForDeactivating from '@staticData/reasonsForDeactivating'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ButtonOutlinedRed from 'components/atom/Buttons/ButtonOutlinedRed'
import ModalLayout from 'components/modal/ModalLayout'
import {
  deactivateTreatmentPlan,
  setOpenConfirmDeactivateTreatmentPlanModal,
  setOpenConfirmFinalizeModal,
  setOpenDeactivateTreatmentPlanModal,
  setSelectedTreatmentPlanId,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'

const ConfirmDeactivateTreatmentPlan = ({
  setOpenDeactivateSuccessModal,
  setReasonForDeactivating,
  reasonForDeactivating,
  otherRemarks,
}: {
  setOpenDeactivateSuccessModal: (x: boolean) => void
  setReasonForDeactivating: (x: string) => void
  reasonForDeactivating: string
  otherRemarks: string
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const {selectedTreatmentPlanId} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {deactivatingTreatmentPlan, treatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const activeTreatmentPlanId = treatmentPlanList.find((item) => {
    return item.status === 'ACTIVE' || item.status === 'PAUSED'
  })?.treatment_plan_id

  return (
    <ModalLayout className='w-[30rem]'>
      <div className='mt-4 text-center md:text-start'>
        <p className='text-2xl font-bold '>Are you sure you want to deactivate this treatment?</p>
        <p className='text-base font-normal text-textColor mt-2'>
          This action is irreversible and you will have to create a new plan. The progress will
          still be visible
        </p>
      </div>

      <div className='md:mt-7 mt-3 flex md:gap-4 gap-2'>
        <ButtonOutlinedRed
          text='Go back'
          className='!h-12 text-md !font-semibold'
          onClick={() => {
            setReasonForDeactivating(reasonsForDeactivating[0].value)
            dispatchAction(setOpenConfirmDeactivateTreatmentPlanModal(false))
            dispatchAction(setOpenDeactivateTreatmentPlanModal(true))
          }}
        />
        <AntdButton
          text={'Deactivate'}
          className='h-12 !bg-red w-full hover:!bg-red'
          onClick={() => {
            dispatchAction(
              deactivateTreatmentPlan({
                reason_for_deactivation: reasonForDeactivating,
                treatment_plan_id: selectedTreatmentPlanId ?? activeTreatmentPlanId ?? 0,
                other_remarks: otherRemarks,
              })
            )
              .unwrap()
              .then(() => {
                dispatchAction(
                  getApiLeadsOverview({
                    data: {
                      patient_id: safeParseInt(patientId),
                      doctor_id: safeParseInt(userId),
                    },
                  })
                )
                dispatchAction(setOpenConfirmFinalizeModal(false))
                dispatchAction(setOpenConfirmDeactivateTreatmentPlanModal(false))
                dispatchAction(setSelectedTreatmentPlanId(null))
                setOpenDeactivateSuccessModal(true)
              })
          }}
          isLoading={deactivatingTreatmentPlan}
        />
      </div>
    </ModalLayout>
  )
}

export default ConfirmDeactivateTreatmentPlan
