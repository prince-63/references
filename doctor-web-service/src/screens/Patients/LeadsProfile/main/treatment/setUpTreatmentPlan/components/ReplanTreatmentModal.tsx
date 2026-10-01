import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {createTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {ErrorMessage, Formik} from 'formik'
import * as Yup from 'yup'
import {useNavigate} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {Input} from 'antd'
import LabelTitle from 'components/atom/Labels/LabelTitle'
import When from 'components/when/When'
import {getPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
const {TextArea} = Input

const ReplanTreatmentModal = ({
  setShowReplanModal,
  isClone,
  initialComment,
  refreshData,
  successRedirect,
}: {
  setShowReplanModal: React.Dispatch<React.SetStateAction<boolean>>
  isClone?: boolean
  initialComment?: string | null
  refreshData?: () => void
  successRedirect?: string
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {treatmentPlan, createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const handleSubmit = async (values: {comment: string | null}) => {
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
          video_display_to_patient: treatmentPlan.is_video_display_patient,
          link_display_patient: treatmentPlan.is_link_display_patient,
          approved_by_patient_at: null,
          order_id: treatmentPlan?.order_id,
          initiator_status: treatmentPlanStatusConstants.RE_PLAN,
          approver_status: treatmentPlanStatusConstants.RE_PLAN,
          order_status_changed_at: new Date().toISOString(),
          treatment_plan_metadata: {
            replan_reason: values.comment,
            replan_requested_on: new Date().toISOString(),
          },
        },
        other_files: otherFilesToSave,
        files: filesToSave,
        video_files: video_files_to_save ?? {},
      })
    )
      .unwrap()
      .then(() => {
        setShowReplanModal(false)

        if (successRedirect) {
          navigate(successRedirect, {replace: true})
        } else if (serviceConfig?.PLANNING) {
          navigate(
            `${profileBasePath}/${treatmentPlan?.patient_id}/plans?order_id=${treatmentPlan.order_id}`,
            {replace: true}
          )
          if (!treatmentPlan?.order_id) return
          dispatchAction(
            getPatientPlanningStepper({
              order_id: treatmentPlan?.order_id,
              patient_id: safeParseInt(treatmentPlan?.patient_id),
              doctor_id: safeParseInt(userId),
            })
          )
        } else {
          navigate(`${profileBasePath}/${treatmentPlan?.patient_id}/plans-list`, {replace: true})
        }
        refreshData && refreshData()
      })
      .catch(() => {})
  }
  return (
    <Formik
      initialValues={{
        comment: initialComment ?? null,
      }}
      onSubmit={handleSubmit}
      enableReinitialize
      validationSchema={Yup.object().shape({
        comment: Yup.string().required('field is required'),
      })}
    >
      {(formik) => {
        return (
          <ModalLayout className='w-[600px]'>
            <form className='flex flex-col gap-5 p-2' onSubmit={formik.handleSubmit}>
              <div className='text-center md:text-start'>
                <p className='font-semibold text-2xl text-black'>Request Plan Revision</p>
                <p className='text-textColor text-base mt-1'>
                  Add instructions for changes. A new treatment plan will be created and shared with
                  updates as suggested.
                </p>
              </div>
              <div>
                <LabelTitle title='Comments' required={true} />
                <When isTrue={isClone}>
                  <p className='text-textColor text-sm mt-1'>
                    (The practice's comments appear by default. Review and edit if needed before
                    sending the request.)
                  </p>
                </When>
                <TextArea
                  {...formik.getFieldProps('comment')}
                  name={'comment'}
                  maxLength={1000}
                  className='min-!h-20'
                  autoSize={{minRows: 3}}
                />
                <ErrorMessage name={'comment'} component='div' className='text-xs text-red mt-1' />
              </div>
              <div className='flex  gap-2 mt-2'>
                <button
                  className='bg-redSupport text-red border border-red h-14 font-semibold text-base w-full rounded'
                  type='button'
                  onClick={() => {
                    setShowReplanModal(false)
                  }}
                >
                  Cancel
                </button>
                <AntdButton
                  className='bg-red text-white h-14 font-semibold text-base w-full hover:!bg-red hover:!text-white'
                  isLoading={createTreatmentPlanLoading}
                  text='Request Revision'
                  htmlType='submit'
                  disabled={createTreatmentPlanLoading}
                />
              </div>
            </form>
          </ModalLayout>
        )
      }}
    </Formik>
  )
}

export default ReplanTreatmentModal
