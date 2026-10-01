import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {createTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import useProfileBasePath from '@hooks/useProfileBasePath'

const ArchiveConfirmationModal = ({
  refreshData,
  setShowConfirmArchiveModal,
}: {
  refreshData?: () => void
  setShowConfirmArchiveModal: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()

  const orderId = searchParams.get('order_id')
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const {treatmentPlan, createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()

  const handleOnClick = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
      treatmentPlan

    dispatchAction(
      createTreatmentPlan({
        details: {
          aligner_treatment_details: aligner_details_meta_data,
          treatment_plan_id: treatmentPlan?.treatment_plan_id,
          treatment_sub_type: treatmentTypeMain.ALIGNERS,
          treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
          production_lab_details: treatmentPlan.production_lab_details,
          days_to_wear_each_aligner: treatmentPlan.days_to_wear_each_aligner,
          recommended_hours_to_wear_aligners: treatmentPlan.recommended_hours_to_wear_aligners,
          treatment_planning_software: treatmentPlan.treatment_planning_software,
          treatment_planning_link: treatmentPlan.treatment_planning_link,
          remarks: treatmentPlan.remarks,
          doctor_id: treatmentPlan.doctor_id,
          patient_id: treatmentPlan.patient_id,
          status: treatmentPlanStatusConstants.ARCHIVED,
          video_display_to_patient: treatmentPlan.is_video_display_patient,
          link_display_patient: treatmentPlan.is_link_display_patient,
          approved_by_patient_at: null,
          order_id: orderId,
          initiator_status: treatmentPlanStatusConstants.ARCHIVED,
          approver_status: treatmentPlanStatusConstants.ARCHIVED,
          order_status_changed_at: new Date().toISOString(),
        },
        other_files: otherFilesToSave,
        files: filesToSave,
        video_files: video_files_to_save ?? {},
      })
    )
      .unwrap()
      .then(() => {
        setShowConfirmArchiveModal(false)
        if (serviceConfig?.PLANNING) {
          navigate(
            `${profileBasePath}/${treatmentPlan?.patient_id}/plans?order_id=${treatmentPlan.order_id}`,
            {replace: true}
          )
        } else {
          navigate(`${profileBasePath}/${treatmentPlan?.patient_id}/plans-list`, {replace: true})
        }
        refreshData && refreshData()
      })
      .catch(() => {})
  }
  return (
    <div>
      <ModalLayout>
        <div className='flex flex-col gap-6'>
          <div className='text-center'>
            <p className='font-bold text-2xl text-black'>Archive treatment plan?</p>
            <p className='text-textColor text-base'>
              Once archived, the plan can't be unarchived. Are you sure you want to continue?
            </p>
          </div>
          <div className='flex  gap-2'>
            <button
              className='bg-[#EFEFEF] text-textColor border border-textColor h-14 font-semibold text-base w-full rounded'
              type='button'
              onClick={() => {
                setShowConfirmArchiveModal(false)
              }}
            >
              Cancel
            </button>
            <AntdButton
              className='bg-textColor text-white hover:!bg-textCOlor hover:!text-white border border-[#EFEFEF]
              h-14 font-semibold text-base w-full'
              isLoading={createTreatmentPlanLoading}
              text='Archive'
              onClick={handleOnClick}
              disabled={createTreatmentPlanLoading}
            />
          </div>
        </div>
      </ModalLayout>
    </div>
  )
}

export default ArchiveConfirmationModal
