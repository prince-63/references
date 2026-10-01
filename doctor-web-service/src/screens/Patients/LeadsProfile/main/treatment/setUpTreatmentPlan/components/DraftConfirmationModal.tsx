import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {
  createTreatmentPlan,
  setOpenDraftModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import orderStatusConstants from '@constants/orderStatus.constants'
import {getTreatmentPlanStatus} from '../../viewTreatmentPlan/helpers/getTreatmentPlanStatus'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {ITreatmentPlan} from '../../types/treatmentPlan.types'
import {createFolder} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import userTypes from '@constants/userTypes'

const DraftConfirmationModal = ({
  toBeCloned,
  refreshData,
}: {
  toBeCloned?: boolean
  refreshData?: () => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const profileBasePath = useProfileBasePath()
  const {treatmentPlan, createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const treatmentStatus = getTreatmentPlanStatus({
    treatmentPlan,
  }) as keyof typeof treatmentPlanStatusConstants
  const {order} = userOrderDetails(toBeCloned)
  const linkedOrderId = order?.purchase_order_details?.order_id
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const handleOnClick = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
      treatmentPlan

    dispatchAction(
      createTreatmentPlan({
        details: {
          aligner_treatment_details: aligner_details_meta_data,
          treatment_plan_id: toBeCloned ? null : treatmentPlan?.treatment_plan_id,
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
          initiator_status: orderStatusConstants.IN_PROGRESS,
          order_id: toBeCloned
            ? linkedOrderId
            : (treatmentPlan?.order_id ?? dataLeadsOverview?.getting_started_order_id),
          ...(toBeCloned &&
            treatmentStatus !== 'DRAFT' && {
              linked_treatment_plan_id: treatmentPlan.treatment_plan_id,
            }),
          treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
        },
        other_files: otherFilesToSave,
        files: filesToSave,
        video_files: video_files_to_save ?? {},
        pdf_file: treatmentPlan.pdf_file_to_save,
      })
    )
      .unwrap()
      .then((res: ITreatmentPlan) => {
        dispatchAction(
          createFolder({
            parent_path: `/Orders`,
            folder_name: `STL ${res?.treatment_plan_name + res.treatment_plan_id}`,
            uploader: {
              user_id: safeParseInt(userId),
              user_type: userTypes.DOCTOR,
            },
            owners: [
              {
                user_id: safeParseInt(userId),
                user_type: userTypes.DOCTOR,
              },
              {
                user_id: safeParseInt(patientId),
                user_type: userTypes.PATIENT,
              },
            ],
          })
        )
        dispatchAction(setOpenDraftModal(false))
        if (serviceConfig?.PLANNING) {
          navigate(
            `${profileBasePath}/${treatmentPlan?.patient_id}/plans?order_id=${treatmentPlan.order_id}`,
            {replace: true}
          )
        } else {
          navigate(`${profileBasePath}/${treatmentPlan.patient_id}/plans-list`, {replace: true})
        }
        dispatchAction(
          getLeadsProfileDetails({
            patient_id: safeParseInt(treatmentPlan?.patient_id),
            doctor_id: safeParseInt(userId),
          })
        )

        refreshData && refreshData()
      })
      .catch(() => {})
  }
  return (
    <div>
      <ModalLayout>
        <div className='flex flex-col gap-6'>
          <div className='text-center md:text-start'>
            <p className='font-bold text-2xl text-black'>Do you want to save the plan as draft?</p>
            <p className='text-textColor text-base'>
              This plan will be saved as a draft. You can return to edit or submit it for approval
              later.
            </p>
          </div>
          <div className='flex  gap-2'>
            <button
              className='bg-white text-primaryColor border border-primaryColor h-14 font-semibold text-base w-full rounded'
              type='button'
              onClick={() => {
                dispatchAction(setOpenDraftModal(false))
              }}
            >
              Cancel
            </button>
            <AntdButton
              className='bg-primaryColor text-white h-14 font-semibold text-base w-full'
              isLoading={createTreatmentPlanLoading}
              text='Save Draft'
              onClick={handleOnClick}
              disabled={createTreatmentPlanLoading}
            />
          </div>
        </div>
      </ModalLayout>
    </div>
  )
}

export default DraftConfirmationModal
