import orderStatusConstants from '@constants/orderStatus.constants'
import patientTypeConstants from '@constants/patientType.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import userTypes from '@constants/userTypes'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import {Modal, Spin} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {PatientData} from 'components/modal/InvitePatient/AddPatient'
import {AuthContext} from 'context/AuthContext'
import {useContext, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {
  resetStep,
  setOpenStartTreatmentPlanModal,
} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import {postApiDataAddPatientSlice} from 'redux/Slices/AppSlice/InvitePatient/AddPatient'
import {postManufacturingDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {createFolder} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {createTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {postTrackingDetails} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import {createOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

const StartTreatmentPlanModal = () => {
  const navigate = useNavigate()
  const {openStartTreatmentPlanModal} = useSelector((state: RootState) => state.existingCase)
  const [loading, setLoading] = useState(false)
  const {isGrowthPlanUser} = useAllUserPlan()
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const {userId} = useContext(AuthContext)
  const {
    saveManufacturingData,
    saveOrderData,
    saveTreatmentData: treatmentPlan,
    savePatientData: patientData,
    saveTrackingData,
  } = useSelector((state: RootState) => state.existingCase)

  const handleSubmit = async () => {
    setLoading(true)
    const savePatientData = patientData?.data
    const postData = {
      data: {
        first_name: savePatientData.first_name,
        last_name: savePatientData.last_name,
        email: savePatientData.email !== '' ? savePatientData.email?.toLocaleLowerCase() : null,
        mobile: savePatientData.mobile !== '' ? savePatientData.mobile : null,
        country_code: savePatientData.country_code,
        practice_location:
          savePatientData.practice_location !== '' ? savePatientData.practice_location : null,
        inviter_id: userId,
        inviter_user_type: userTypes.DOCTOR,
        customer_mapped_id:
          savePatientData.customer_mapped_id?.trim?.() ?? savePatientData.customer_mapped_id,
        age: savePatientData.age,
        gender: savePatientData.gender,
        practice_location_id:
          savePatientData.practice_location_id !== '' ? savePatientData.practice_location_id : null,
        country: savePatientData.country,
        state: savePatientData.state,
        city: savePatientData.city,
        practice_profile_id: hasValue(savePatientData.practice_profile_id)
          ? savePatientData.practice_profile_id
          : null,
        receiver_profile_id: hasValue(savePatientData.receiver_profile_id)
          ? safeParseInt(savePatientData.receiver_profile_id)
          : null,
        receiver_org_id: hasValue(savePatientData.receiver_org_id)
          ? safeParseInt(savePatientData.receiver_org_id)
          : null,
        receiver_doctor_id: hasValue(savePatientData.receiver_doctor_id)
          ? safeParseInt(savePatientData.receiver_doctor_id)
          : null,
        practice_invite_code: hasValue(savePatientData?.practice_invite_code)
          ? savePatientData?.practice_invite_code
          : null,
        patient_type: patientTypeConstants.EXISTING_PATIENT,
      },
    }

    await dispatch(postApiDataAddPatientSlice(postData) as any)
      .unwrap()
      .then(async (res: PatientData) => {
        const patientId = res?.patient_id
        if (isGrowthPlanUser) {
          handleCreatePlan(patientId, null)
          return
        }
        await dispatchAction(createOrder({...saveOrderData, patient_id: patientId} as any))
          .unwrap()
          .then((res: {order_id: string}) => {
            handleCreatePlan(patientId, res.order_id)
          })
          .catch(() => {
            ErrorToast('Error while creating Order')
            setLoading(false)
          })
      })
      .catch((error: string) => {
        if (error === 'END000') {
          ErrorToast('You have exceeded your plan limit. Please upgrade to continue.')
        }
        ErrorToast('Error while creating Patient')
        setLoading(false)
      })
  }

  const handleCreatePlan = async (patientId: number, orderId: string | null) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
      treatmentPlan

    await dispatchAction(
      createTreatmentPlan({
        details: {
          aligner_treatment_details: aligner_details_meta_data,
          treatment_sub_type: treatmentTypeMain.ALIGNERS,
          treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
          production_lab_details: treatmentPlan.production_lab_details,
          days_to_wear_each_aligner: treatmentPlan.days_to_wear_each_aligner,
          recommended_hours_to_wear_aligners: treatmentPlan.recommended_hours_to_wear_aligners,
          treatment_planning_software: treatmentPlan.treatment_planning_software,
          treatment_planning_link: treatmentPlan.treatment_planning_link,
          remarks: treatmentPlan.remarks,
          doctor_id: treatmentPlan.doctor_id,
          status: treatmentPlanStatusConstants.ACTIVE,
          file_ids_to_clone: treatmentPlan.file_ids_to_clone,
          video_display_to_patient: treatmentPlan.is_video_display_patient,
          link_display_patient: treatmentPlan.is_link_display_patient,
          approved_by_patient_at: null,
          initiator_status: orderStatusConstants.APPROVED,
          approver_status: orderStatusConstants.APPROVED,
          treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
          patient_id: patientId,
          ...(orderId && {
            order_id: orderId,
          }),
        },
        other_files: otherFilesToSave,
        files: filesToSave,
        video_files: video_files_to_save ?? {},
        pdf_file: treatmentPlan.pdf_file_to_save,
      })
    )
      .unwrap()
      .then(async (res: ITreatmentPlan) => {
        const planId: number = res.treatment_plan_id
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
        await dispatchAction(
          postManufacturingDetails({
            ...saveManufacturingData,
            patient_id: safeParseInt(patientId),
            treatment_plan_id: safeParseInt(planId),
          })
        )
          .unwrap()
          .then(async () => {
            await dispatchAction(
              postTrackingDetails({
                ...saveTrackingData,
                aligner_treatment_plan_id: planId,
              })
            )
              .unwrap()
              .then(async () => {
                await dispatchAction(
                  postApiLeadsProfileDetailsUpdate({
                    data: {
                      patient_id: safeParseInt(patientId),
                      has_read_existing_patient_form: true,
                    },
                  }) as any
                )
                  .unwrap()
                  .then(() => {
                    dispatchAction(resetStep())
                    dispatchAction(setOpenStartTreatmentPlanModal(false))
                    navigate(`/patients-list`)
                    SuccessToast('Patient Added Successfully')
                    setLoading(false)
                  })
              })
              .catch(() => {
                ErrorToast('Error while creating Tracking details')
                setLoading(false)
              })
          })
          .catch(() => {
            ErrorToast('Error while creating manufacturing details')
            setLoading(false)
          })
      })
      .catch(() => {
        ErrorToast('Error while creating Treatment Plan')
        setLoading(false)
      })
  }
  return (
    <Modal
      destroyOnClose
      style={{fontFamily: 'figtree', padding: 20}}
      closable={false}
      open={openStartTreatmentPlanModal}
      title={
        <div className='flex flex-col gap-3 md:px-4 md:py-4'>
          <p className='font-semibold text-2xl text-center'>Confirm and add patient?</p>
          <p className='font-normal text-base leading-6 text-textColor text-center'>
            You’re about to add this patient with all the details entered so far. Once added, the
            treatment plan and manufacturing details will no longer be editable. Confirm and add
            patient?
          </p>
        </div>
      }
      width={570}
      centered
      footer={null}
    >
      <Spin
        spinning={loading}
        tip={
          <div className='text-sm font-medium bg-orange text-white px-2 py-1 rounded-lg'>
            Processing Your Request... Please do not close this window or refresh!
          </div>
        }
      >
        <div className='flex justify-between gap-2 md:px-4 md:pb-4'>
          <button
            className='w-full rounded-lg h-10 px-5 text-primaryColor border border-primaryColor  bg-primarySupport justify-start'
            type='button'
            onClick={() => dispatchAction(setOpenStartTreatmentPlanModal(false))}
          >
            Cancel
          </button>
          <AntdButton
            text='Confirm'
            htmlType='button'
            className='h-10 w-full bg-primaryColor text-center'
            onClick={(e) => {
              e.stopPropagation()
              handleSubmit()
            }}
            loading={loading}
          />
        </div>
      </Spin>
    </Modal>
  )
}

export default StartTreatmentPlanModal
