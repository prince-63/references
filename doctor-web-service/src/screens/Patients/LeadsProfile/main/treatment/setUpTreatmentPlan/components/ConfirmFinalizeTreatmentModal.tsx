import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {
  createTreatmentPlan,
  setOpenConfirmFinalizeModal,
  setOpenExistingActiveTreatmentPlanModal,
  setOpenTreatmentStartingModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import InfoCard from '../../../alignersTracking/components/InfoCard'
import InfoIcon from 'assets/icons/InfoIcon'
import When from 'components/when/When'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {useNavigate} from 'react-router-dom'
import useAllUserPlan from '@hooks/useAllUserPlan'

const ConfirmFinalizeTreatmentModal = () => {
  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {isPractice, isOrganization, isEnterprisePlanUser} = useAllUserPlan()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const navigate = useNavigate()
  const {treatmentPlan, createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {treatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const handleOnClick = async () => {
    const hasActivePlan =
      treatmentPlanList &&
      treatmentPlanList.some(
        (item) =>
          item.status === treatmentPlanStatusConstants.ACTIVE ||
          item.status === treatmentPlanStatusConstants.PAUSED ||
          item.status === treatmentPlanStatusConstants.COMPLETE
      )
    const hasDeactivatedPlan =
      treatmentPlanList &&
      treatmentPlanList.some((item) => item.status === treatmentPlanStatusConstants.DEACTIVATED)
    const isTrackingEnabled = dataLeadsOverview?.tracking?.enabled
    const isTrackingEnabledForLatestTreatmentPlan =
      dataLeadsOverview?.tracking_added_for_latest_treatment_plan

    if (
      !isEnterprisePlanUser &&
      !isPractice &&
      !hasActivePlan &&
      hasDeactivatedPlan &&
      isTrackingEnabled
    ) {
      dispatchAction(setOpenConfirmFinalizeModal(false))
      dispatchAction(setOpenTreatmentStartingModal(true))
      return
    }

    if (
      !hasActivePlan &&
      hasDeactivatedPlan &&
      isTrackingEnabled &&
      isTrackingEnabledForLatestTreatmentPlan
    ) {
      dispatchAction(setOpenConfirmFinalizeModal(false))
      dispatchAction(setOpenTreatmentStartingModal(true))
      return
    }

    if (hasActivePlan) {
      dispatchAction(setOpenConfirmFinalizeModal(false))
      dispatchAction(setOpenExistingActiveTreatmentPlanModal(true))
      return
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
        treatmentPlan
      const details = {
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
        status: treatmentPlanStatusConstants.ACTIVE,
        video_display_to_patient: treatmentPlan.is_video_display_patient,
        link_display_patient: treatmentPlan.is_link_display_patient,
        approved_by_patient_at: null,
        treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
        file_ids_to_clone: treatmentPlan.file_ids_to_clone,
      }
      const detailsForPractice = {
        ...details,
        order_id: treatmentPlan.order_id,
        initiator_status: 'APPROVED',
      }

      dispatchAction(
        createTreatmentPlan({
          details: isPractice ? detailsForPractice : details,
          files: filesToSave,
          other_files: otherFilesToSave,
          video_files: video_files_to_save ?? {},
          pdf_file: treatmentPlan.pdf_file_to_save,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(setOpenConfirmFinalizeModal(false))
          navigate(`/leads-profile/${treatmentPlan.patient_id}/treatment`, {replace: true})
        })
        .catch(() => {})
    }
  }
  return (
    <div>
      <ModalLayout className='w-[600px]'>
        <div className='flex flex-col gap-5 p-2'>
          <div className='flex justify-center items-center w-20 h-20 bg-primarySupport rounded-full'>
            <InfoIcon height='32' width='32' color='#735BF2' />
          </div>
          <div className='text-center md:text-start'>
            <p className='font-semibold text-2xl text-black'>Finalize Without Approval?</p>
            <p className='text-textColor text-base mt-1'>
              This plan hasn’t been approved yet. Are you sure you want to proceed with finalizing
              it?{' '}
            </p>
          </div>

          <InfoCard
            className='border border-primaryColor bg-primarySupport text-sm font-normal p-3'
            title='We recommend you to get it approved by your patient first.'
            Icon={InfoIcon}
            showButton={false}
          />

          <When
            isTrue={isPractice || (isOrganization && patientAssignedTo === 'ASSIGNED_TO_PRACTICE')}
          >
            <div className='flex flex-col gap-2 text-start md:text-start'>
              <p className='text-textColor text-base mt-1 font-normal'>
                Once the plan is finalized,
              </p>
              <InfoCard
                titleClassName='!text-black  font-normal'
                className='border-none p-0'
                title='Other plans will become archived and view-only.'
                Icon={InfoIcon}
                showButton={false}
              />
              <InfoCard
                className='border-none  p-0 '
                titleClassName='!text-black  font-normal'
                title='No Re-Plan can be requested for them.'
                Icon={InfoIcon}
                showButton={false}
              />
            </div>
          </When>
          <div className='flex  gap-2 mt-2'>
            <button
              className='bg-primarySupport text-primaryColor border border-primaryColor h-14 font-semibold text-base w-full rounded-lg'
              type='button'
              onClick={() => {
                dispatchAction(setOpenConfirmFinalizeModal(false))
              }}
            >
              Cancel
            </button>
            <AntdButton
              className='bg-primaryColor text-white h-14 font-semibold text-base w-full rounded-lg'
              isLoading={createTreatmentPlanLoading}
              text='Finalize'
              onClick={() => handleOnClick()}
              disabled={createTreatmentPlanLoading}
            />
          </div>
        </div>
      </ModalLayout>
    </div>
  )
}

export default ConfirmFinalizeTreatmentModal
