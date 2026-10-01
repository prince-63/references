import React, {useContext, useEffect, useMemo, useState} from 'react'
import {NewPlanData} from '../types/PlanList.types'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  ApiGetData,
  identifyUser,
  safeParseInt,
  formatPluralizedString,
  getFirstLetterCapitalOfWord,
} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {getNewTreatmentList} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import CountBoxPlanList from '../components/CountBoxPlanList'
import PlansListHeader from '../components/PlansListHeader'
import NoPlansState from '../components/NoPlansState'
import PlanCard from '../components/PlanCard'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import Page from 'components/page/Page'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {
  createTreatmentPlan,
  getTreatmentPlan,
  setOpenApprovePendingActionModal,
  setOpenConfirmFinalizeModal,
  setOpenDeactivateTreatmentPlanModal,
  setOpenDeleteDraftPlanModal,
  setOpenDraftModal,
  setOpenExistingActiveTreatmentPlanModal,
  setOpenTreatmentStartingModal,
  setSelectedTreatmentPlanId,
  setTreatmentId,
  setTreatmentPlan,
  getBracesTreatmentPlanList,
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
import CreateTreatmentPlanModal from 'screens/Orders/components/CreateTreatmentPlanModal'
import ConfirmApprovalModal from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ConfirmApprovalModal'
import DeleteDraftConfirmationModal from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/DeleteDraftConfirmationModal'
import {useMediaQuery} from 'react-responsive'
import moment from 'moment'
import bracesTreatmentPlanStatusConstants from '@constants/bracesTreatmentPlanStatus.constants'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import Tag from 'components/tags/Tag'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_ARROW_LEFT_BLACK, SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import ViewInformationSection from 'components/section/ViewInformationSection'
import JustifiedBetweenDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/JustifiedBetweenDetails'
import AntdButton from 'components/atom/Buttons/AntdButton'
import SetupTreatmentPlanBraces from 'screens/Patients/LeadsProfile/main/treatment/setupTreatmentPlanBraces/SetupTreatmentPlanBraces'
import {getPatientPlanningStepper} from 'redux/Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'

/* ---------------- BRACES CARD + INLINE EDIT (query-param driven) ---------------- */

const BracesTreatmentPlanSection: React.FC<{
  bracesPlan: any
  isEditing: boolean
  setEditingId: (id: string | null) => void
  onRefresh: () => void
}> = ({bracesPlan, isEditing, setEditingId, onRefresh}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)

  const getTagClassName = (status: string) => {
    switch (status) {
      case bracesTreatmentPlanStatusConstants.ACTIVE:
        return 'text-green-700 bg-green-100'
      case bracesTreatmentPlanStatusConstants.DRAFT:
        return 'bg-blue-100 text-blue-700'
      case bracesTreatmentPlanStatusConstants.INACTIVE:
        return 'bg-red-100 text-red-700'
      case bracesTreatmentPlanStatusConstants.PAUSED:
        return 'bg-orange-100 text-orange-700'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const setBracesQueryParams = (bracesJourneyId: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('bracesJourneyId', bracesJourneyId)
    next.set('new', 'false')
    next.set(
      'bracesTreatmentStage',
      bracesPlan?.braces_treatment_stage || bracesTreatmentPlanStatusConstants.ACTIVE
    )
    // keep isUpdate for compatibility with old flow
    next.set('isUpdate', 'true')
    setSearchParams(next)
  }

  const clearBracesQueryParams = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('bracesJourneyId')
    next.delete('new')
    next.delete('bracesTreatmentStage')
    // IMPORTANT: also remove isUpdate so global guards stop thinking we’re editing
    next.delete('isUpdate')
    setSearchParams(next)
  }

  const openInlineEdit = () => {
    const bracesJourneyId = String(bracesPlan?.braces_journey_id)
    setEditingId(bracesJourneyId)
    setBracesQueryParams(bracesJourneyId)
  }

  // INLINE EDIT MODE
  if (isEditing) {
    return (
      <section className='mb-8'>
        <BorderedCardForDashBoardCards>
          <SetupTreatmentPlanBraces
            isInline={true}
            propBracesJourneyId={String(bracesPlan?.braces_journey_id)}
            onCancel={() => {
              setEditingId(null)
              clearBracesQueryParams()
              setIsExpanded(true) // go back to view mode
            }}
            onSuccess={() => {
              setEditingId(null)
              clearBracesQueryParams()
              setIsExpanded(true)
              onRefresh()
            }}
          />
        </BorderedCardForDashBoardCards>
      </section>
    )
  }

  // EXPANDED VIEW MODE
  if (isExpanded) {
    return (
      <section className='mb-8'>
        <BorderedCardForDashBoardCards>
          <div className='flex flex-col gap-6'>
            {/* Header with Back Button */}
            <div className='flex items-center gap-4 border-b pb-4'>
              <button
                onClick={() => setIsExpanded(false)}
                className='p-1 hover:bg-gray-100 rounded-full transition-colors'
              >
                <CommonSVG svg={SVG_ARROW_LEFT_BLACK} height='24' width='24' />
              </button>
              <h2 className='text-xl font-bold text-gray-900'>View treatment plan details</h2>
            </div>

            {/* Details */}
            <div className='flex flex-col gap-5'>
              <ViewInformationSection title='Basic details'>
                <div className='flex flex-col md:flex-row md:gap-10 gap-4'>
                  <div className='flex flex-col gap-2 w-full'>
                    <JustifiedBetweenDetails
                      label='Treatment type'
                      value={getFirstLetterCapitalOfWord(bracesPlan?.treatment_stage || 'New')}
                    />
                    <JustifiedBetweenDetails
                      label='Treatment duration'
                      value={
                        hasValue(bracesPlan?.tentative_treatment_duration_in_months)
                          ? formatPluralizedString(
                              safeParseInt(bracesPlan?.tentative_treatment_duration_in_months),
                              ' month'
                            )
                          : '-'
                      }
                    />
                  </div>
                  <div className='flex flex-col gap-2 w-full'>
                    <JustifiedBetweenDetails
                      label='Treatment start date'
                      value={
                        hasValue(bracesPlan?.treatment_start_date)
                          ? moment(bracesPlan?.treatment_start_date).format('DD MMM YYYY')
                          : '-'
                      }
                    />
                  </div>
                </div>
              </ViewInformationSection>

              <ViewInformationSection title='Tooth to be extracted'>
                <div className='flex flex-col gap-5'>
                  <div className='flex flex-col gap-2 w-full'>
                    <div className='flex gap-4 flex-wrap'>
                      <When isTrue={hasValue(bracesPlan?.teeth_extraction)}>
                        {bracesPlan?.teeth_extraction?.map((tooth: string) => (
                          <Tag
                            value={tooth}
                            key={tooth}
                            className='text-base bg-blue-50 text-blue-500 w-12 font-medium'
                          />
                        ))}
                      </When>
                      <When isTrue={!hasValue(bracesPlan?.teeth_extraction)}>--</When>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 w-full'>
                    <div className='text-stone-500 text-base font-medium leading-normal'>
                      Remarks
                    </div>
                    <p
                      className={`${
                        hasValue(bracesPlan?.extraction_remarks) ? 'text-black' : 'text-textColor'
                      } text-base break-all font-medium`}
                    >
                      {bracesPlan?.extraction_remarks
                        ? bracesPlan?.extraction_remarks
                            .split('\n')
                            .map((line: string, index: number) => (
                              <div key={index}>
                                {line}
                                <br />
                              </div>
                            ))
                        : 'No remarks added'}
                    </p>
                  </div>
                </div>
              </ViewInformationSection>

              <ViewInformationSection title='Bracket details'>
                <div className='flex flex-col md:flex-row md:gap-10 gap-4'>
                  <div className='flex flex-col gap-2 w-full'>
                    <JustifiedBetweenDetails
                      label='Bracket type'
                      value={bracesPlan?.bracket_type || '-'}
                    />
                    <JustifiedBetweenDetails
                      label='Sub-type'
                      value={bracesPlan?.bracket_select_sub_type || '-'}
                    />
                  </div>
                  <div className='flex flex-col gap-2 w-full'>
                    <JustifiedBetweenDetails
                      label='Type'
                      value={bracesPlan?.bracket_select_type || '-'}
                    />
                    <JustifiedBetweenDetails
                      label='Company name'
                      value={bracesPlan?.bracket_brand || '-'}
                    />
                  </div>
                </div>
              </ViewInformationSection>

              <ViewInformationSection title='Anchorage type'>
                <div className='flex flex-col md:flex-row md:gap-10 gap-4'>
                  <JustifiedBetweenDetails
                    label='Upper'
                    value={bracesPlan?.upper_jaw_anchor_type_value || '-'}
                  />
                  <JustifiedBetweenDetails
                    label='Lower'
                    value={bracesPlan?.lower_jaw_anchor_type_value || '-'}
                  />
                </div>
              </ViewInformationSection>

              <ViewInformationSection title='Remarks'>
                <p
                  className={`${
                    hasValue(bracesPlan?.remarks) ? 'text-black' : 'text-textColor'
                  } text-base break-all font-medium`}
                >
                  {bracesPlan?.remarks
                    ? bracesPlan?.remarks.split('\n').map((line: string, index: number) => (
                        <div key={index}>
                          {line}
                          <br />
                        </div>
                      ))
                    : 'No remarks added'}
                </p>
              </ViewInformationSection>

              {/* Edit Treatment Plan Button */}
              <div className='flex justify-end mt-4'>
                <AntdButton
                  onClick={openInlineEdit}
                  className='rounded-lg h-12 cursor-pointer bg-primaryColor border border-primaryColor text-white font-semibold px-6'
                  text='Edit treatment plan'
                />
              </div>
            </div>
          </div>
        </BorderedCardForDashBoardCards>
      </section>
    )
  }

  // COLLAPSED CARD (click → expand to VIEW)
  return (
    <section className='mb-8'>
      <BorderedCardForDashBoardCards>
        <div className='cursor-pointer' onClick={() => setIsExpanded(true)}>
          <div className='flex justify-between items-start mb-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                BRACES TREATMENT PLAN
              </span>
              <span className='text-base font-medium text-gray-900'>
                {bracesPlan?.treatment_name || 'Treatment 1'}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <Tag
                value={getFirstLetterCapitalOfWord(bracesPlan?.braces_treatment_stage || 'Active')}
                className={`${getTagClassName(
                  bracesPlan?.braces_treatment_stage
                )} px-3 py-1 rounded-full text-sm font-medium`}
              />
              <CommonSVG svg={SVG_EXPAND_RIGHT} height='20' width='20' />
            </div>
          </div>

          <div className='h-px bg-gray-200 w-full mb-4' />

          <div className='flex flex-col gap-1'>
            <span className='text-sm text-gray-500'>Created on</span>
            <span className='text-base font-semibold text-gray-900'>
              {bracesPlan?.treatment_created_at
                ? moment(bracesPlan.treatment_created_at).format('DD-MMM-YYYY')
                : '-'}
            </span>
          </div>
        </div>
      </BorderedCardForDashBoardCards>
    </section>
  )
}

const PlansList: React.FC<{showOnlyApproved?: boolean}> = ({showOnlyApproved = false}) => {
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {plansList, loadingPlansList} = useSelector((state: RootState) => state.kanban)
  const {bracesTreatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const [searchParams] = useSearchParams()
  const order_id = searchParams.get('order_id')
  const patientActiveOrderId =
    data?.getting_started_details?.order_status === 'ORDERED'
      ? data?.getting_started_details?.order_id
      : null
  const {
    isAlignerCompanyOrg,
    isInternalUser,
    isPractice,
    isStarterPlanUser,
    isGrowthPlanUser,
    isCustomer,
    isDesignLabUser,
    isVendor,
  } = useAllUserPlan()
  const outSourceUser = isCustomer || isDesignLabUser || isVendor
  const assignedToVendor = useMemo(
    () =>
      ((data?.getting_started_details?.order_id !== null && outSourceUser) ||
        (data?.getting_started_details?.order_id === null && !outSourceUser) ||
        isAlignerCompanyOrg ||
        isInternalUser) &&
      !isPractice,
    [data, isAlignerCompanyOrg, isGrowthPlanUser, isInternalUser]
  )

  const gettingStartedDataLeadsOverview = data.getting_started_details
  const orderId = gettingStartedDataLeadsOverview?.order_id

  const hasActivePlan =
    plansList?.plans_list &&
    plansList.plans_list?.some(
      (item) =>
        item.status === treatmentPlanStatusConstants.ACTIVE ||
        item.status === treatmentPlanStatusConstants.PAUSED
    )
  const hasDeactivatedPlan =
    plansList &&
    plansList.plans_list?.some((item) => item.status === treatmentPlanStatusConstants.DEACTIVATED)
  const isTrackingEnabled = data?.getting_started_details?.tracking_status === 'ENABLED'

  const {openDraftModal, openDeactivateTreatmentPlanModal, openDeleteDraftPlanModal} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const [open, setOpen] = useState(false)
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})

  const [otherRemarks, setOtherRemarks] = useState('')
  const [reasonForDeactivating, setReasonForDeactivating] = useState(
    reasonsForDeactivating[0].value
  )
  const [showSendForApprovalModal, setShowSendForApprovalModal] = useState(false)
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false)
  const [showReplanModal, setShowReplanModal] = useState(false)
  const [showConfirmApprovalModal, setShowConfirmApprovalModal] = useState(false)

  // Inline braces edit driven by `bracesJourneyId` query param
  const [editingBracesPlanId, setEditingBracesPlanId] = useState<string | null>(
    searchParams.get('bracesJourneyId')
  )

  useEffect(() => {
    setEditingBracesPlanId(searchParams.get('bracesJourneyId'))
  }, [searchParams])

  useEffect(() => {
    getPlanList()
  }, [patientId])

  const getPlanList = () => {
    const payload = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
      treatment_subtype: 'ALIGNERS',
      order_id: order_id ?? null,
    }
    dispatchAction(getNewTreatmentList(payload))

    if (userId && patientId) {
      dispatchAction(
        getBracesTreatmentPlanList({
          doctor_id: userId,
          patient_id: patientId,
          braces_treatment_stage: 'ALL',
        })
      )
    }
  }

  const filteredBracesPlans =
    bracesTreatmentPlanList?.filter(
      (plan: any) =>
        plan.braces_treatment_stage === bracesTreatmentPlanStatusConstants.ACTIVE ||
        plan.braces_treatment_stage === bracesTreatmentPlanStatusConstants.DRAFT
    ) ?? []

  const filteredAlignerPlans: NewPlanData[] = showOnlyApproved
    ? plansList?.plans_list?.filter(
        (plan) => plan.approver_status === treatmentPlanStatusConstants.APPROVED
      )
    : plansList?.plans_list

  const handleOnClick = async (
    plan: NewPlanData,
    treatmentPlanStatus: keyof typeof treatmentPlanStatusConstants = treatmentPlanStatusConstants.ACTIVE
  ) => {
    identifyUser()
    const isActive = treatmentPlanStatus === treatmentPlanStatusConstants.ACTIVE
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
        if (isActive) {
          if (!hasActivePlan && hasDeactivatedPlan && isTrackingEnabled) {
            if (treatmentPlan.is_approved_by_patient) {
              dispatchAction(setOpenTreatmentStartingModal(true))
              return
            } else {
              dispatchAction(setOpenConfirmFinalizeModal(true))
              return
            }
          }
          if (hasActivePlan && treatmentPlan.is_approved_by_patient) {
            dispatchAction(setOpenExistingActiveTreatmentPlanModal(true))
            return
          } else {
            if (!treatmentPlan.is_approved_by_patient) {
              dispatchAction(setOpenConfirmFinalizeModal(true))
              return
            }
          }
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

  const handleCreateTreatmentPlan = () => {
    dispatchAction(setTreatmentPlan({}))

    if (isStarterPlanUser) {
      navigate(`/add-patient-starter?patient_id=${patientId}&step=1`)
    } else {
      const queryParams = new URLSearchParams()
      if (hasValue(patientActiveOrderId))
        queryParams.append('order_id', String(patientActiveOrderId))
      const queryString = queryParams.toString()

      navigate(
        `/${patientId}/plans-list/new/setupTreatmentPlan${queryString ? `?${queryString}` : ''}`
      )
    }
  }

  const handleDeleteDraft = ({planId}: {planId: number}) => {
    dispatchAction(setTreatmentId(planId))
    dispatchAction(setOpenDeleteDraftPlanModal(true))
  }

  return (
    <Page loading={loadingPlansList}>
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

      <div className='space-y-6'>
        <PlansListHeader
          handleCreateTreatmentPlan={handleCreateTreatmentPlan}
          hasActivePlan={Boolean(hasActivePlan)}
          assignedToVendor={assignedToVendor}
        />
        {filteredBracesPlans.length === 0 && !isPractice && <CountBoxPlanList data={plansList} />}

        {/* Braces Treatment Plans – card + inline edit via query params */}
        {filteredBracesPlans.map((bracesPlan: any) => (
          <BracesTreatmentPlanSection
            key={bracesPlan.braces_journey_id}
            bracesPlan={bracesPlan}
            isEditing={editingBracesPlanId === String(bracesPlan.braces_journey_id)}
            setEditingId={setEditingBracesPlanId}
            onRefresh={getPlanList}
          />
        ))}

        {/* ALIGNER PLANS */}
        {(filteredAlignerPlans?.length ?? 0) === 0 && filteredBracesPlans.length === 0 ? (
          <NoPlansState
            handleCreateTreatmentPlan={handleCreateTreatmentPlan}
            hasActivePlan={Boolean(hasActivePlan)}
            assignedToVendor={assignedToVendor}
          />
        ) : (
          <div className='flex flex-col gap-6'>
            {(filteredAlignerPlans ?? []).map((plan: NewPlanData) => (
              <PlanCard
                key={plan.plan_id}
                {...{
                  plan,
                  handleOnClick,
                  handleDeleteDraft,
                  isMobile,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <CreateTreatmentPlanModal {...{patientId, open, setOpen, orderId}} />
    </Page>
  )
}

export default PlansList
