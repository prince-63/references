import {useContext, useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import useDispatchAction from '@hooks/useDispatchAction'
import {ApiGetData, identifyUser, safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {getNewTreatmentList, resetPlansList} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import Page from 'components/page/Page'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {
  createTreatmentPlan,
  getTreatmentPlan,
  setOpenApprovePendingActionModal,
  setOpenDeactivateTreatmentPlanModal,
  setOpenDraftModal,
  setSelectedTreatmentPlanId,
  setTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import When from 'components/when/When'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import DraftConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/DraftConfirmationModal'
import ReplanTreatmentModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/ReplanTreatmentModal'
import ArchiveConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ArchiveConfirmationModal'
import SendForApprovalModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/SendForApprovalModal'
import DeactivateTreatmentPlan from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/DeactivateTreatmentPlan'
import hasValue from 'utils/hasValue'
import reasonsForDeactivating from '@staticData/reasonsForDeactivating'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ConfirmApprovalModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ConfirmApprovalModal'
import DeleteDraftConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/DeleteDraftConfirmationModal'
import {getPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import {NewPlanData} from 'screens/PatientDetailsOverview.tsx/types/PlanList.types'
import TabSectionCard from '../components/TabSectionCard'
import EmptyState from '../components/EmptyState'
import PlanCard from '../components/PlanCard'
import {PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'

/* ---------------- BRACES CARD + INLINE EDIT (query-param driven) ---------------- */

const CustomerPatientPlansList = () => {
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {plansList, loadingPlansList} = useSelector((state: RootState) => state.kanban)
  const {selectedOrderId, active_order_id} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )
  const [searchParams] = useSearchParams()
  const order_id = searchParams.get('order_id') ?? selectedOrderId ?? active_order_id
  const {isPractice} = useAllUserPlan()

  const {openDraftModal, openDeactivateTreatmentPlanModal, openDeleteDraftPlanModal} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const [otherRemarks, setOtherRemarks] = useState('')
  const [reasonForDeactivating, setReasonForDeactivating] = useState(
    reasonsForDeactivating[0].value
  )
  const [showSendForApprovalModal, setShowSendForApprovalModal] = useState(false)
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false)
  const [showReplanModal, setShowReplanModal] = useState(false)
  const [showConfirmApprovalModal, setShowConfirmApprovalModal] = useState(false)
  const {getAllTask, getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)

  const findNewCaseObjects = (
    cases: PatientTaskDetails[] | PatientTaskDetails | null | undefined
  ): boolean => {
    const list = Array.isArray(cases) ? cases : cases ? [cases as PatientTaskDetails] : []
    return list.some((caseItem) => caseItem?.workflow_name !== 'New Case')
  }

  const findIsTaskOutsourced = (
    cases: PatientTaskDetails[] | PatientTaskDetails | null | undefined
  ): boolean => {
    const list = Array.isArray(cases) ? cases : cases ? [cases as PatientTaskDetails] : []
    return list.some((caseItem) => caseItem?.workflow_name === 'Plan Outsourced')
  }

  const showTreatmentPlanButton =
    findNewCaseObjects(getIndividualTaskList) && !findIsTaskOutsourced(getAllTask)

  useEffect(() => {
    getPlanList()
  }, [patientId, order_id])

  const getPlanList = () => {
    dispatchAction(resetPlansList())
    const payload = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
      treatment_subtype: 'ALIGNERS',
      order_id: order_id ?? null,
    }
    dispatchAction(getNewTreatmentList(payload))
  }

  const filteredAlignerPlans = useMemo<NewPlanData[]>(() => {
    return (
      plansList?.plans_list.filter(
        (plan) => (plan.initiator_status !== 'IN_PROGRESS' && isPractice) || !isPractice
      ) ?? []
    )
  }, [plansList, isPractice])

  const handleOnClick = async (
    plan: NewPlanData,
    treatmentPlanStatus: keyof typeof treatmentPlanStatusConstants = treatmentPlanStatusConstants.ACTIVE
  ) => {
    identifyUser()
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: String(plan?.plan_id),
      })
    )
      .unwrap()
      .then((treatmentPlan: ITreatmentPlan) => {
        const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
          treatmentPlan
        if (treatmentPlanStatus === treatmentPlanStatusConstants.APPROVED) {
          setShowConfirmApprovalModal(true)
          return
        }
        if (treatmentPlanStatus === treatmentPlanStatusConstants.SENT_FOR_APPROVAL) {
          setShowSendForApprovalModal(true)
          return
        }
        if (treatmentPlanStatus === treatmentPlanStatusConstants.ARCHIVED) {
          setShowConfirmArchiveModal(true)
          return
        }
        if (treatmentPlanStatus === treatmentPlanStatusConstants.RE_PLAN) {
          setShowReplanModal(true)
          return
        }
        if (treatmentPlanStatus === treatmentPlanStatusConstants.DEACTIVATED) {
          dispatchAction(setSelectedTreatmentPlanId(treatmentPlan.treatment_plan_id))
          if (treatmentPlan?.aligner_journey_id && treatmentPlan?.pending_action_count > 0) {
            dispatchAction(setOpenApprovePendingActionModal(true))
            return
          }
          dispatchAction(setOpenDeactivateTreatmentPlanModal(true))
          return
        }

        if (treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT) {
          dispatchAction(setOpenDraftModal(true))
          return
        }
        dispatchAction(
          createTreatmentPlan({
            details: {
              aligner_treatment_details: aligner_details_meta_data,
              treatment_plan_id: treatmentPlan?.treatment_plan_id,
              treatment_sub_type: treatmentTypeMain.ALIGNERS,
              production_lab_details: treatmentPlan.production_lab_details,
              days_to_wear_each_aligner: treatmentPlan.days_to_wear_each_aligner,
              recommended_hours_to_wear_aligners: treatmentPlan.recommended_hours_to_wear_aligners,
              treatment_planning_software: treatmentPlan.treatment_planning_software,
              treatment_planning_link: treatmentPlan.treatment_planning_link,
              remarks: treatmentPlan.remarks,
              doctor_id: treatmentPlan.doctor_id,
              patient_id: treatmentPlan.patient_id,
              status: treatmentPlanStatus,
              video_display_to_patient: treatmentPlan.is_video_display_patient,
              link_display_patient: treatmentPlan.is_link_display_patient,
              approved_by_patient_at: null,
              treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
              approver_status: treatmentPlanStatus,
              initiator_status: treatmentPlanStatus,
              file_ids_to_clone: treatmentPlan.file_ids_to_clone,
              ...(hasValue(treatmentPlan.order_id) && {order_id: treatmentPlan.order_id}),
              order_status_changed_at: new Date().toISOString(),
              treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
            },
            files: filesToSave,
            other_files: otherFilesToSave,
            video_files: video_files_to_save,
            pdf_file: treatmentPlan.pdf_file_to_save,
          })
        )
          .unwrap()
          .then(() => {
            if (treatmentPlanStatus === treatmentPlanStatusConstants.ACTIVE) {
              const postData: ApiGetData = {
                data: {
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                },
              }
              dispatchAction(getApiLeadsOverview(postData))
              dispatchAction(
                getLeadsProfileDetails({
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                })
              )
              getPlanList()
              if (isPractice) {
                dispatchAction(
                  getPatientPlanningStepper({
                    order_id: treatmentPlan.order_id ?? null,
                    patient_id: safeParseInt(patientId),
                    doctor_id: safeParseInt(userId),
                  })
                )
              }
            }
          })
          .catch(() => {})
      })
  }

  return (
    <TabSectionCard
      title='Treatment Plans'
      buttonText={isPractice || !showTreatmentPlanButton ? null : 'New Plan'}
      onClick={() => {
        dispatchAction(setTreatmentPlan({}))
        const queryParams = new URLSearchParams()
        queryParams.append('order_id', String(order_id))
        const queryString = queryParams.toString()
        navigate(
          `/${patientId}/plans-list/new/setupTreatmentPlan${queryString ? `?${queryString}` : ''}`
        )
      }}
    >
      <Page loading={loadingPlansList}>
        <div className='space-y-6'>
          {(filteredAlignerPlans?.length ?? 0) === 0 ? (
            <EmptyState
              title='No Plans Available'
              subTitle='The lab has not shared a treatment plan yet. You will be notified once a plan is available.'
            />
          ) : (
            <div className='flex flex-col gap-6'>
              {(filteredAlignerPlans ?? []).map((plan: NewPlanData) => (
                <PlanCard
                  key={plan.plan_id}
                  {...{
                    plan,
                    handleOnClick,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <>
          <When isTrue={showReplanModal}>
            <ReplanTreatmentModal
              {...{
                setShowReplanModal,
                refreshData: getPlanList,
              }}
            />
          </When>
          <When isTrue={openDraftModal}>
            <DraftConfirmationModal />
          </When>
          <When isTrue={openDeleteDraftPlanModal}>
            <DeleteDraftConfirmationModal refreshData={getPlanList} />
          </When>
          <When isTrue={showSendForApprovalModal}>
            <SendForApprovalModal
              {...{
                setShowSendForApprovalModal,
                refreshData: getPlanList,
              }}
            />
          </When>
          <When isTrue={showConfirmApprovalModal}>
            <ConfirmApprovalModal
              {...{
                setShowConfirmApprovalModal,
                refreshData: getPlanList,
                isCustomerPatientProfile: true,
              }}
            />
          </When>
          <When isTrue={showConfirmArchiveModal}>
            <ArchiveConfirmationModal
              {...{
                setShowConfirmArchiveModal,
                refreshData: getPlanList,
              }}
            />
          </When>
          <When isTrue={openDeactivateTreatmentPlanModal}>
            <DeactivateTreatmentPlan
              setReasonForDeactivating={setReasonForDeactivating}
              setOtherRemarks={setOtherRemarks}
              otherRemarks={otherRemarks}
              reasonForDeactivating={reasonForDeactivating}
              refreshData={getPlanList}
            />
          </When>
        </>
      </Page>
    </TabSectionCard>
  )
}

export default CustomerPatientPlansList
