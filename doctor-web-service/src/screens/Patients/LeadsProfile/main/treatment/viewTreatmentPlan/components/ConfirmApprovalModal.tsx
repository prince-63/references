import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {createTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {getPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'
import getColorPalette from 'utils/getColorPalette'

const ConfirmApprovalModal = ({
  refreshData,
  setShowConfirmApprovalModal,
  isCustomerPatientProfile = false,
  successRedirect,
}: {
  refreshData?: () => void
  setShowConfirmApprovalModal: React.Dispatch<React.SetStateAction<boolean>>
  isCustomerPatientProfile?: boolean
  successRedirect?: string
}) => {
  const colorPalette = getColorPalette()
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const profileBasePath = useProfileBasePath()
  const {isPractice} = useAllUserPlan()
  const {treatmentPlan, createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const customerApproveStyle = isCustomerPatientProfile
    ? ({
        '--approve-modal-btn-color': colorPalette.tertiaryColor,
      } as React.CSSProperties)
    : undefined

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
          status: treatmentPlanStatusConstants.DRAFT,
          file_ids_to_clone: treatmentPlan.file_ids_to_clone,
          video_display_to_patient: treatmentPlan.is_video_display_patient,
          link_display_patient: treatmentPlan.is_link_display_patient,
          approved_by_patient_at: null,
          order_id: treatmentPlan.order_id,
          initiator_status: treatmentPlanStatusConstants.APPROVED,
          approver_status: treatmentPlanStatusConstants.APPROVED,
          order_status_changed_at: new Date().toISOString(),
          treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
        },
        files: filesToSave,
        other_files: otherFilesToSave,
        video_files: video_files_to_save ?? {},
        pdf_file: treatmentPlan.pdf_file_to_save,
      })
    )
      .unwrap()
      .then(() => {
        setShowConfirmApprovalModal(false)
        SuccessToast('Treatment plan approved successfully')
        if (successRedirect) {
          navigate(successRedirect, {replace: true})
        } else if (serviceConfig?.PLANNING) {
          navigate(
            `${profileBasePath}/${treatmentPlan?.patient_id}/plans?order_id=${treatmentPlan.order_id}`,
            {
              replace: true,
            }
          )
        } else {
          navigate(`${profileBasePath}/${treatmentPlan?.patient_id}/plans-list`, {replace: true})
        }
        if (isPractice) {
          dispatchAction(
            getPatientPlanningStepper({
              order_id: treatmentPlan.order_id ?? null,
              patient_id: safeParseInt(patientId),
              doctor_id: safeParseInt(userId),
            })
          )
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
            <p className='font-bold text-2xl text-black'>Approve Treatment Plan</p>
            <p className='text-textColor text-base'>
              Once approved, this plan will be locked for further edits and marked as ready for
              finalization.
            </p>
          </div>
          <div className='flex  gap-2'>
            <button
              className={
                isCustomerPatientProfile
                  ? 'bg-white text-[var(--approve-modal-btn-color)] border border-[var(--approve-modal-btn-color)] h-14 font-semibold text-base w-full rounded'
                  : 'bg-white text-primaryColor border border-primaryColor h-14 font-semibold text-base w-full rounded'
              }
              style={customerApproveStyle}
              type='button'
              onClick={() => {
                setShowConfirmApprovalModal(false)
              }}
            >
              Cancel
            </button>
            <AntdButton
              className={
                isCustomerPatientProfile
                  ? 'h-14 font-semibold text-base w-full !bg-[var(--approve-modal-btn-color)] !border-[var(--approve-modal-btn-color)] !text-white hover:!bg-[var(--approve-modal-btn-color)] hover:!border-[var(--approve-modal-btn-color)] hover:!text-white'
                  : 'bg-primaryColor text-white h-14 font-semibold text-base w-full'
              }
              type={isCustomerPatientProfile ? 'default' : undefined}
              style={customerApproveStyle}
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

export default ConfirmApprovalModal
