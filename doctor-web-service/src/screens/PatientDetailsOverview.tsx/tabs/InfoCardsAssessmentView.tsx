import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useAllUserPlan from '@hooks/useAllUserPlan'
import InfoCard from 'components/instruction/InfoCard'
import InfoCardWithContainer from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCardWithContainer'
import hasValue from 'utils/hasValue'
import getColorPalette from 'utils/getColorPalette'
import workflowNameConstants from '@constants/workflowName.constants'
import When from 'components/when/When'
import {useLocation, useNavigate, useParams} from 'react-router-dom'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {
  getManufacturingListDetails,
  setOpenShippingDetailsModal,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import manufacturingConstants from '@constants/manufacturing.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {
  getNewTreatmentList,
  resetPlansList,
  setIsOpenDeliverFromPackageModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {PlanDataList} from '../types/PlanList.types'
import {PatientOrderList} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {Modal} from 'antd'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import ShippingDetailsContainerTask from '../components/ShippingDetailsContainerTask'
import patientTypeConstants from '@constants/patientType.constants'
import SelectPlanningOrProductionModal from './SelectPlanningOrProductionModal'
import manufacturingBatchStatusConstants from '@constants/manufacturingBatchStatus.constants'
import useProfileBasePath from '@hooks/useProfileBasePath'

type InfoCardAssessmentViewProps = {
  onVisibilityChange?: (hasCards: boolean) => void
}

const InfoCardAssessmentView = ({onVisibilityChange}: InfoCardAssessmentViewProps) => {
  const {userId} = useContext(AuthContext)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {
    getIndividualTaskList,
    getAllTask,
    latestManufacturingBatchStatus,
    productionInHouseTask,
    productionOutSourceTask,
    manufacturingBatchId,
  } = useSelector((state: RootState) => state.workFlow)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {patientOrderList} = useSelector((state: RootState) => state.profile)
  const {
    isEnterprisePlanUser,
    isAlignerCompanyOrg,
    isGrowthPlanUser,
    isPractice,
    isCustomer,
    isInternalUser,
  } = useAllUserPlan()
  const allUserEnterPriseGrowth =
    isEnterprisePlanUser ||
    isGrowthPlanUser ||
    (isAlignerCompanyOrg && isInternalUser) ||
    isInternalUser
  const isPracticeOrCustomer = isPractice || isCustomer
  const palette = getColorPalette()
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {permissionChecks} = useFeatureAccess()
  const beginProductionPermission =
    permissionChecks?.patientProfileActions?.beginNextBatch?.isViewable ??
    permissionChecks?.patientProfileActions?.beginNextBatch?.isEditable
  const {dispatchAction} = useDispatchAction()
  const {plansList} = useSelector((state: RootState) => state.kanban)
  const [isShippingDetailsModalOpen, setIsShippingDetailsModalOpen] = useState(false)
  const {patientId: parsedPatientId} = useParams()
  const isNotExistingCase =
    data?.patient_details?.patient_type !== patientTypeConstants.EXISTING_PATIENT
  const {approved, pending_approval, plans_list, total_plans} = useMemo<PlanDataList>(() => {
    return plansList
  }, [plansList])
  const {search} = useLocation()
  const params = new URLSearchParams(search)
  const isFromPlanOutsourced = params.get('kanban_name') === 'Plan Outsourced'

  const customerTrackingEnabled = useMemo(() => {
    return data?.is_customer_tracking_enabled === true
  }, [data])
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const approvedPlan = useMemo(() => {
    if (!Array.isArray(plans_list)) return null

    return (
      plans_list
        .filter((plan) => !plan.is_treatment_plan_created_on_cloned_order)
        .find((plan) => {
          const primaryStatus = (plan.status ?? '').trim()
          const isPlanStatusApproved = primaryStatus === treatmentPlanStatusConstants.APPROVED
          const isBothRolesApproved =
            plan.initiator_status === treatmentPlanStatusConstants.APPROVED &&
            plan.approver_status === treatmentPlanStatusConstants.APPROVED

          return isPlanStatusApproved || isBothRolesApproved
        }) ?? null
    )
  }, [plans_list])

  const normalizedTaskList = useMemo<PatientTaskDetails[]>(() => {
    if (!getIndividualTaskList) return []
    return Array.isArray(getIndividualTaskList) ? getIndividualTaskList : [getIndividualTaskList]
  }, [getIndividualTaskList])
  const latestTaskComment = normalizedTaskList?.[0]?.comments?.[0]?.remark ?? ''
  const commentRemark = latestTaskComment ? (
    <>
      <span
        className=''
        style={{
          fontFamily: 'Figtree',
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '16px',
          lineHeight: '24px',
          letterSpacing: '0',
          color: '#666666',
        }}
      >
        Comments:
      </span>
      <span className='ml-1'>{latestTaskComment}</span>
    </>
  ) : (
    ''
  )

  const normalizedAllTaskList = useMemo<PatientTaskDetails[]>(() => {
    if (!getAllTask) return []
    return getAllTask
  }, [getAllTask])

  const currentTask = useMemo(() => {
    return normalizedTaskList[0] ?? null
  }, [normalizedTaskList])

  const latestManufacturingBatchResponse = useMemo(() => {
    const fromPrimaryTask = normalizedTaskList.find(
      (task) => !task.parent_task_id && task?.manufacturing_batch_response
    )
    if (fromPrimaryTask?.manufacturing_batch_response) {
      return fromPrimaryTask.manufacturing_batch_response
    }

    const fromAnyTask = normalizedAllTaskList.find((task) => task?.manufacturing_batch_response)
    return fromAnyTask?.manufacturing_batch_response ?? null
  }, [normalizedAllTaskList, normalizedTaskList])

  const hasNewCaseTask = useMemo(() => {
    return (
      Array.isArray(normalizedAllTaskList) &&
      normalizedAllTaskList.some((task) => {
        const name = task?.workflow_name ?? ''
        return name.toUpperCase().trim().includes('NEW CASE')
      })
    )
  }, [normalizedTaskList])

  const productionInHouseTasks = useMemo(() => {
    if (!Array.isArray(normalizedAllTaskList)) return []

    return normalizedAllTaskList.filter((task) => {
      const name = task?.workflow_name ?? ''
      return name.toUpperCase().trim().includes('PRODUCTION IN HOUSE')
    })
  }, [normalizedAllTaskList])

  const productionInHouseParentTask = useMemo<PatientTaskDetails[]>(() => {
    if (!normalizedAllTaskList.length) return []
    return normalizedAllTaskList.filter(
      (task) =>
        task.parent_task_id === null &&
        (task?.workflow_name ?? '').trim().toLowerCase() === 'production in house'
    )
  }, [normalizedAllTaskList])

  const hasProductionInHouseParentManufacturingResponse = useMemo(() => {
    return productionInHouseParentTask.some((task) => !!task.manufacturing_batch_response)
  }, [productionInHouseParentTask])

  // const hasPackagedStatus = useMemo(() => {
  // if (!normalizedAllTaskList) return []
  // return normalizedTaskList.filter(
  //  (task) => task.parent_task_id === null && task.current_status_name === 'Packaged'
  // )
  // }, [normalizedAllTaskList])

  const serviceProductDetails = useMemo(() => {
    if (!currentTask?.service_products) return null
    if (typeof currentTask.service_products === 'string') {
      try {
        return JSON.parse(currentTask.service_products)
      } catch {
        return null
      }
    }
    return currentTask.service_products
  }, [currentTask])

  const serviceProductAddedBy = serviceProductDetails?.added_by_user_name ?? null

  const taskWorkflowName = useMemo(() => {
    if (!currentTask?.workflow_name) return ''
    return currentTask.workflow_name
  }, [currentTask])

  const trackingEnabled = useMemo(() => {
    if (!dataLeadsOverview) return false
    return hasValue(dataLeadsOverview?.tracking?.tracking_id)
  }, [dataLeadsOverview])

  const trackingEnabledTreatmentStatus = useMemo(() => {
    return dataLeadsOverview?.tracking?.status ?? null
  }, [dataLeadsOverview])

  const patientId = useMemo(() => {
    return currentTask?.patient_id ?? ''
  }, [currentTask])
  const parsedUserId = useMemo(() => safeParseInt(userId), [userId])

  const taskWorkflowSlug = useMemo(() => {
    if (!taskWorkflowName) return null
    const normalizedName = taskWorkflowName.toString().trim().toUpperCase()
    if (normalizedName.includes('NEW CASE')) return workflowNameConstants.NEW_CASE
    if (
      normalizedName.includes('PLANS OUTSOURCED') ||
      normalizedName.includes('PLAN OUTSOURCED') ||
      normalizedName.includes('PLANNING OUTSOURCE') ||
      normalizedName.includes('PLANNING OUTSOURCED')
    )
      return workflowNameConstants.PLANNING_OUTSOURCE
    if (normalizedName.includes('PLANNING ORDER')) return workflowNameConstants.PLANNING_ORDER
    if (normalizedName.includes('PLANNING')) return workflowNameConstants.PLANNING_IN_HOUSE
    if (
      normalizedName.includes('PRODUCTION OUTSOURCED') ||
      normalizedName.includes('PRODUCTION OUTSOURCE')
    )
      return workflowNameConstants.PRODUCTION_OUTSOURCE
    if (normalizedName.includes('PRODUCTION')) return workflowNameConstants.PRODUCTION_IN_HOUSE
    return null
  }, [taskWorkflowName])

  const normalizedCurrentStatusName = useMemo(() => {
    if (!currentTask?.current_status_name) return ''
    return currentTask.current_status_name.toString().trim().toUpperCase()
  }, [currentTask?.current_status_name])

  const handleMoveToPlanning = () =>
    navigate(`/planning-setup-stepper/${patientId}`, {
      state: {
        useIndividualTask: true,
      },
    })

  const shouldShowPlanningCardGrowthPlanUser = Boolean(
    isGrowthPlanUser && !isPractice && taskWorkflowSlug === workflowNameConstants.NEW_CASE
  )
  const shouldShowPlanningCardEnterprisePlanUser = Boolean(
    isEnterprisePlanUser && !isPractice && taskWorkflowSlug === workflowNameConstants.NEW_CASE
  )
  const shouldShowPlanningCardCustomer =
    (isPractice || isCustomer) &&
    taskWorkflowSlug === workflowNameConstants.NEW_CASE &&
    !trackingEnabled

  const shouldShowCaseSubmittedToCustomer = Boolean(
    isPractice &&
      !!taskWorkflowSlug &&
      taskWorkflowSlug === workflowNameConstants.PLANNING_OUTSOURCE &&
      total_plans === 0
  )

  const orderId = useMemo(() => {
    if (!patientOrderList || patientOrderList.length === 0) return null
    return patientOrderList[0]?.order_id ?? null
  }, [patientOrderList])

  const caseMovedToNeedMoreInfo = Boolean(
    isPractice &&
      (!taskWorkflowSlug || taskWorkflowSlug === workflowNameConstants.PLANNING_OUTSOURCE) &&
      normalizedCurrentStatusName === 'NEED INFORMATION' &&
      pending_approval === 0 &&
      approved === 0
  )

  const treatmentPlanId = useMemo(() => {
    const planIdSource = dataLeadsOverview?.treatment_plan_id
    if (!planIdSource || hasProductionInHouseParentManufacturingResponse) return null
    const parsedId = safeParseInt(planIdSource)
    return parsedId || null
  }, [dataLeadsOverview?.treatment_plan_id, hasProductionInHouseParentManufacturingResponse])

  useEffect(() => {
    if (!parsedPatientId || !parsedUserId) return
    dispatchAction(
      PatientOrderList({
        doctor_id: parsedUserId,
        patient_id: safeParseInt(parsedPatientId),
        sort_criteria: {
          type: 'date',
          sort: 'desc',
        },
      })
    )
  }, [dispatchAction, parsedPatientId, parsedUserId])

  useEffect(() => {
    const numericPatientId = safeParseInt(parsedPatientId)
    const numericUserId = safeParseInt(userId)
    if (!numericPatientId || !numericUserId) return

    dispatchAction(
      getNewTreatmentList({
        patient_id: numericPatientId,
        doctor_id: numericUserId,
        treatment_subtype: 'ALIGNERS',
        order_id: null,
      })
    )

    return () => {
      dispatchAction(resetPlansList())
    }
  }, [dispatchAction, parsedPatientId, userId])

  //CaseMovedToProduction (Inhouse or Enterprise)
  const isMovedToProductionInHouseGrowth =
    allUserEnterPriseGrowth &&
    !!productionInHouseTask &&
    latestManufacturingBatchStatus === manufacturingBatchStatusConstants.MANUFACTURING_STARTED

  const isMovedToProductionInHouseGrowthTitle = 'Production in Progress'
  const isMovedToProductionInHouseGrowthSubtitle =
    'Aligner production in progress. Track individual aligners in “Ongoing Production,” or view batch progress under “Production.” Once manufacturing is complete, move the case to Packaged.'
  const isMovedToProductionInHouseSecondaryText = 'View Ongoing Production'
  const isMovedToProductionInHouseSecondaryTextNavigation = () => {
    const params = new URLSearchParams()
    params.set('tab', 'ongoing')
    const batchId = manufacturingBatchId || currentTask?.manufacturing_batch_id
    if (batchId) params.set('batchId', batchId.toString())
    const patientName = data?.patient_details?.full_name || currentTask?.patient_name || ''
    if (patientName) params.set('patientName', patientName.toString())
    navigate(`/aligner-production?${params.toString()}`)
  }
  const isMovedToProductionInHouseSecondaryTextClassName =
    'bg-transparent border border-orange text-orange'
  const isMovedToProductionInHousePrimaryText = 'View Batch Status'
  const isMovedToProductionInHousePrimaryTextNavigation = () => {
    const params = new URLSearchParams()
    params.set('workFlow', 'production-in-house')
    params.set('view', 'kanban')

    const statusLabel = (productionInHouseTasks[0]?.current_status_name || '').toString().trim()

    if (statusLabel) params.set('status', statusLabel)

    const patientName =
      data?.patient_details?.full_name || productionInHouseTasks[0]?.patient_name || ''
    if (patientName) params.set('search', patientName.toString())

    navigate(`/aligner-orders?${params.toString()}`)
  }

  const isMovedToProductionInHousePrimaryTextClassName = 'bg-orange'

  //CaseMovedToProduction (Customer)
  const isMovedToProductionCustomer =
    isPracticeOrCustomer &&
    currentTask?.workflow_name === 'Production Outsource' &&
    (latestManufacturingBatchStatus === manufacturingConstants.MANUFACTURING_STARTED ||
      latestManufacturingBatchStatus === manufacturingConstants.COMPLETED)
  const isMovedToProductionOutSourceCustomerTitle = 'Production in Progress'
  const isMovedToProductionOutSourceCustomerSubTitle =
    'Your patient’s aligners are currently being fabricated. You’ll be notified once they’re shipped. Contact the lab if you have any questions.'

  //AlignersAreShipped (Customer)
  const alignersAreShippedForCustomer =
    isPracticeOrCustomer &&
    latestManufacturingBatchStatus === manufacturingBatchStatusConstants.SHIPPED
  const alignersAreShippedTitleForCustomer = 'Shipment in Transit'
  const alignersAreShippedSubTitleForCustomer =
    'The aligners have been shipped. Once you’ve received the aligners, mark it as delivered to confirm delivery.'
  const alignersAreShippedButtonTitleForCustomer = 'Mark as Delivered.'
  const handleMarkAsDeliveredClick = useCallback(() => {
    if (!parsedPatientId) return

    const hasTreatmentPlanId = typeof treatmentPlanId === 'number' && treatmentPlanId > 0
    const fetchPromise = hasTreatmentPlanId
      ? dispatchAction(
          getManufacturingListDetails({
            patient_id: safeParseInt(parsedPatientId),
            treatment_plan_id: treatmentPlanId,
          })
        )
      : Promise.resolve()

    Promise.resolve(fetchPromise)
      .catch(() => null)
      .finally(() => {
        dispatchAction(setIsOpenDeliverFromPackageModal(true))
      })
  }, [dispatchAction, parsedPatientId, treatmentPlanId])

  const handleAddShippingDetailsClick = useCallback(() => {
    if (!parsedPatientId) return

    const hasTreatmentPlanId = typeof treatmentPlanId === 'number' && treatmentPlanId > 0
    const fetchPromise = hasTreatmentPlanId
      ? dispatchAction(
          getManufacturingListDetails({
            patient_id: safeParseInt(parsedPatientId),
            treatment_plan_id: treatmentPlanId,
          })
        )
      : Promise.resolve()

    Promise.resolve(fetchPromise)
      .catch(() => null)
      .finally(() => {
        dispatchAction(setOpenShippingDetailsModal(true))
      })
  }, [dispatchAction, parsedPatientId, treatmentPlanId])

  const handleViewShippingDetails = useCallback(() => {
    if (!parsedPatientId) return

    const hasTreatmentPlanId = typeof treatmentPlanId === 'number' && treatmentPlanId > 0
    const fetchPromise = hasTreatmentPlanId
      ? dispatchAction(
          getManufacturingListDetails({
            patient_id: safeParseInt(parsedPatientId),
            treatment_plan_id: treatmentPlanId,
          })
        )
      : Promise.resolve()

    Promise.resolve(fetchPromise)
      .catch(() => null)
      .finally(() => {
        setIsShippingDetailsModalOpen(true)
      })
  }, [dispatchAction, parsedPatientId, treatmentPlanId])

  const closeShippingDetailsModal = () => setIsShippingDetailsModalOpen(false)

  //Aligners Are Delivered (Customer)
  const alignersAreDeliveredCustomer =
    isPracticeOrCustomer &&
    latestManufacturingBatchStatus === manufacturingBatchStatusConstants.DELIVERED &&
    !trackingEnabled
  const alignersAreDeliveredCustomerTitle = 'Start Treatment'
  const alignersAreDeliveredCustomerSubTitle =
    'The aligners have been delivered. Add a treatment start date to begin tracking your patient’s progress and aligner wear.'
  const alignersAreDeliveredCustomerPrimaryButtonText = 'View Tracking'

  const canViewTracking = permissionChecks?.alignerTreatment?.patientProfileTrackingTab?.isViewable

  const redirectToTracking = () => {
    if (!canViewTracking) {
      ErrorToast('You don’t have permission to view tracking.')
      return
    }
    navigate(`${profileBasePath}/${parsedPatientId}/aligner-tracking`)
  }

  //Tracking Has Been Started (Customer)
  const trackingStartedCustomer =
    isPracticeOrCustomer &&
    trackingEnabled &&
    !!trackingEnabledTreatmentStatus &&
    trackingEnabledTreatmentStatus !== treatmentPlanStatusConstants.COMPLETE &&
    trackingEnabledTreatmentStatus !== treatmentPlanStatusConstants.DEACTIVATED
  const trackingStartedCustomerTitle = 'Treatment in Progress'
  const trackingStartedCustomerSubTitle =
    'The patient’s treatment is now in progress. You can view aligner stages, wear progress, and upcoming changes from the tracking tab.'
  const trackingStartedCustomerButtonNavigation = redirectToTracking

  //CaseMovedToPackaged (Growth or Enterprise)
  const isMovedToPackagedInHouseGrowth =
    allUserEnterPriseGrowth &&
    !!productionInHouseTask &&
    latestManufacturingBatchStatus === manufacturingConstants.COMPLETED
  const isMovedToPackagedInHouseGrowthTitle = 'Add Shipping Details'
  const isMovedToPackagedInHouseGrowthSubtitle =
    'The aligners have been packaged. Add shipment details to mark the case as dispatched.'
  const isMovedToPackagedInHousePrimaryText = 'Add Shipping Details'
  const isMovedToPackagedInHousePrimaryTextNavigation = handleAddShippingDetailsClick

  //CaseMovedToShipped (Growth or Enterprise (Internal User))
  const isShippedGrowthEnterprise =
    allUserEnterPriseGrowth &&
    !!productionInHouseTask &&
    latestManufacturingBatchStatus === manufacturingBatchStatusConstants.SHIPPED
  const isShippedGrowthEnterpriseTitle = 'Shipment In Transit'
  const isShippedGrowthEnterpriseSubtitle =
    'The shipment is in transit. Mark as delivered once it has been received by the clinic.'
  const isShippedGrowthEnterprisePrimaryButtonTitle = 'Mark as Delivered'
  const handleOpenDeliverFromPackagedModal = useCallback(() => {
    if (!currentTask) return
    const manufacturingBatchId =
      latestManufacturingBatchResponse?.manufacturing_batch_id || currentTask.manufacturing_batch_id
    if (!manufacturingBatchId) return

    dispatchAction(setIsOpenDeliverFromPackageModal(true))
  }, [currentTask, dispatchAction, latestManufacturingBatchResponse])

  const isShippedGrowthEnterprisePrimaryButtonNavigation = handleOpenDeliverFromPackagedModal

  const revisionCount = useMemo(() => {
    if (!Array.isArray(plans_list) || plans_list.length === 0) return 0
    return plans_list.filter((plan) => {
      const statuses = [
        plan?.status?.trim(),
        plan?.approver_status?.trim(),
        plan?.initiator_status?.trim(),
      ]
      return statuses.some((status) => status === treatmentPlanStatusConstants.RE_PLAN)
    }).length
  }, [plans_list])

  //Case Delivered(Growth or Enterprise)
  const isDeliveredGrowthEnterprise =
    allUserEnterPriseGrowth &&
    !!productionInHouseTask &&
    latestManufacturingBatchStatus === manufacturingBatchStatusConstants.DELIVERED &&
    !trackingEnabled

  const isDeliveredGrowthEnterpriseTitle = 'Case Delivered'
  const isDeliveredGrowthEnterpriseSubtitle =
    'The aligners have been delivered. Add a treatment start date to begin tracking the patient’s progress.'
  const isDeliveredGrowthEnterprisePrimaryButtonText = 'View Tracking'
  const isDeliveredGrowthEnterprisePrimaryButtonTextNavigation = redirectToTracking

  //Treatment Started(Growth or Enterprise)
  const treatmentStartedGrowthEnterprise =
    allUserEnterPriseGrowth && trackingEnabled && serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
  const treatmentStartedGrowthEnterpriseTitle = 'Treatment in Progress'
  const treatmentStartedGrowthEnterpriseSubTitle =
    'The patient’s treatment is ongoing. Monitor aligner stages, wear time, and progress from the tracking tab.'
  const treatmentStartedGrowthEnterpriseButtonText = 'View Tracking'
  const treatmentStartedGrowthEnterpriseButtonNavigation = redirectToTracking

  //CaseMovedToNeedMoreInfo (Growth or Enterprise)
  const caseMovedNeedMoreInfoGE =
    allUserEnterPriseGrowth &&
    normalizedCurrentStatusName === 'NEED INFORMATION' &&
    pending_approval === 0 &&
    approved === 0 &&
    !hasNewCaseTask &&
    revisionCount === 0

  //CaseMovedOutOfNeedMoreInfo (Growth or Enterprise)
  const caseMovedOutOfNeedMoreInfo =
    allUserEnterPriseGrowth &&
    approved === 0 &&
    taskWorkflowSlug === workflowNameConstants.PLANNING_IN_HOUSE &&
    (pending_approval > 0 || revisionCount > 0) &&
    !hasNewCaseTask

  //PlanMarkedAsApproved (Growth)

  const planApprovedGrowthEnterprise = Boolean(
    (allUserEnterPriseGrowth &&
      approvedPlan &&
      patientId &&
      !productionInHouseTask &&
      !hasNewCaseTask &&
      (serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || serviceConfig?.MANUFACTURING) &&
      !productionOutSourceTask &&
      !isFromPlanOutsourced &&
      !isPractice) ||
      normalizedCurrentStatusName === 'PLANNING DONE'
  )

  const handleStartProduction = () => {
    if (!patientId) return
    if (isInternalUser && !beginProductionPermission) {
      ErrorToast('You don’t have permission to move to production.')
      return
    }
    const targetPlanId = approvedPlan?.plan_id
    if (targetPlanId) {
      navigate(`/production-setup-stepper/${patientId}/${targetPlanId}`)
    } else {
      navigate(`/production-setup-stepper/${patientId}`)
    }
  }

  // On Plan Approved (Customer)
  const isPlanApprovedForCustomer =
    isPracticeOrCustomer &&
    approved > 0 &&
    currentTask?.workflow_name !== 'Production Outsource' &&
    currentTask?.workflow_name !== 'New Case' &&
    isNotExistingCase &&
    getIndividualTaskList?.task_order_type !== 'PLANNING_ORDER'

  const isPlanApprovedTitle = 'Ready to Move to Production'
  const isPlanApprovedSubtitle =
    'A treatment plan has been approved. Once you’ve discussed it with your patient and they’re ready to proceed, move the case to production to begin aligner manufacturing.'
  const isPlanApprovedButtonNavigation = handleStartProduction

  const planStatusTokens = [
    pending_approval > 0 ? `${pending_approval} pending approval` : null,
    approved > 0 ? `${approved} approved` : null,
    revisionCount > 0 ? `${revisionCount} under revision` : null,
  ].filter((token): token is string => Boolean(token))

  const planCountsRemark =
    planStatusTokens.length > 0 ? (
      <span>
        <span
          className=''
          style={{
            fontFamily: 'Figtree',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0',
            color: '#666666',
          }}
        >
          Status Summary:
        </span>
        <span className='ml-2'>{planStatusTokens.join(' • ')}</span>
      </span>
    ) : (
      ''
    )

  const showPracticePendingApprovalCard =
    isPracticeOrCustomer && pending_approval !== 0 && approved === 0
  const showCaseSubmittedCard =
    shouldShowCaseSubmittedToCustomer && currentTask?.current_status_name !== 'Need Information'

  const infoCardVisibilityFlags = [
    shouldShowPlanningCardGrowthPlanUser,
    shouldShowPlanningCardEnterprisePlanUser,
    shouldShowPlanningCardCustomer,
    showPracticePendingApprovalCard,
    showCaseSubmittedCard,
    caseMovedToNeedMoreInfo,
    isPlanApprovedForCustomer,
    isMovedToProductionCustomer,
    alignersAreShippedForCustomer,
    alignersAreDeliveredCustomer,
    trackingStartedCustomer,
    isMovedToProductionInHouseGrowth,
    isMovedToPackagedInHouseGrowth,
    isShippedGrowthEnterprise,
    isDeliveredGrowthEnterprise,
    treatmentStartedGrowthEnterprise,
    caseMovedNeedMoreInfoGE,
    caseMovedOutOfNeedMoreInfo,
    planApprovedGrowthEnterprise,
  ]

  const hasAnyInfoCard = infoCardVisibilityFlags.some(Boolean)

  useEffect(() => {
    onVisibilityChange?.(hasAnyInfoCard)
  }, [hasAnyInfoCard, onVisibilityChange])

  const renderPlanningJourneyCards = () => (
    <>
      <When isTrue={shouldShowPlanningCardGrowthPlanUser}>
        <InfoCard
          title='What’s Next? Move to planning'
          subTitle='Review the patient’s records and case details, then move the case to the planning stage to begin treatment design.'
          color={palette.secondaryColor}
          className='bg-secondarySupport border-secondaryColor'
          buttonText='Move to Planning'
          classNameButton='bg-secondaryColor'
          onClick={handleMoveToPlanning}
        />
      </When>
      <When isTrue={shouldShowPlanningCardEnterprisePlanUser}>
        <InfoCard
          title='What’s Next? Move to planning'
          subTitle='The doctor has added this patient but hasn’t created a case yet. You can wait for the doctor to send the case, or move to planning directly if you wish to begin planning.'
          color={palette.orange}
          className='bg-orangeSupport border-orange p-4'
          buttonText='Move to Planning'
          classNameButton='bg-orange'
          onClick={handleMoveToPlanning}
        />
      </When>
      <When isTrue={shouldShowPlanningCardCustomer}>
        <InfoCard
          title='Submit Case to Lab'
          subTitle='Add case records and treatment instructions to submit a case to the lab for planning.'
          color={palette.orange}
          className='bg-orangeSupport border-orange  border p-4'
          buttonText='Submit a Case'
          classNameButton='bg-orange'
          onClick={handleMoveToPlanning}
        />
      </When>
      <When isTrue={showCaseSubmittedCard}>
        <InfoCard
          title='Case Sent to Lab.'
          subTitle='Your case has been submitted. The lab will review the records and start preparing a treatment plan.'
          color={palette.secondaryColor}
          className='bg-secondarySupport border-secondaryColor p-4'
          onClick={() => {
            SelectPlanningOrProductionModal
          }}
        />
      </When>
      <When isTrue={showPracticePendingApprovalCard}>
        <InfoCard
          title='Planning in Progress'
          subTitle='Treatment plans have been shared for your review. Check the plans, approve the preferred one, or share feedback if updates are needed.'
          color={palette.orange}
          className='bg-orangeSupport border-orange  border p-4'
          buttonText='Review a plan'
          classNameButton='bg-orange'
          onClick={() => navigate(`${profileBasePath}/${parsedPatientId}/plans-list/`)}
        />
      </When>
      <When isTrue={caseMovedToNeedMoreInfo}>
        <InfoCardWithContainer
          title='More Information Required'
          subtitle={
            serviceProductAddedBy ? (
              <>
                <strong>{serviceProductAddedBy}</strong> has moved the case to “Need more
                Information.”
              </>
            ) : (
              'The lab has requested additional information for this case.'
            )
          }
          className='flex md:!justify-between !justify-start border !border-[#0095ff]'
          titleClassName='!text-black font-semibold'
          topSectionClassName='bg-[#E9f3fa]'
          infoIconColor='#0095ff'
          remarksClassName='!bg-transparent'
          hideDismissButton
          remarks={commentRemark}
          showRemarksTitle={false}
        />
      </When>
    </>
  )

  const renderCustomerManufacturingCards = () => {
    if (!isPracticeOrCustomer) return null

    return (
      <>
        <When isTrue={isPlanApprovedForCustomer}>
          <InfoCardWithContainer
            title={isPlanApprovedTitle}
            subtitle={isPlanApprovedSubtitle}
            className='flex md:!justify-between !justify-start border !border-orange'
            titleClassName='!text-black font-semibold'
            topSectionClassName='bg-orangeSupport'
            infoIconColor='orange'
            remarksClassName='!bg-transparent'
            hideDismissButton
            remarks={planCountsRemark}
            showRemarksTitle={false}
            primaryButtonText={'Move to Production'}
            onPrimaryClick={isPlanApprovedButtonNavigation}
            primaryButtonClassName='bg-orange text-white'
          />
        </When>

        <When isTrue={isMovedToProductionCustomer}>
          <InfoCard
            title={isMovedToProductionOutSourceCustomerTitle}
            subTitle={isMovedToProductionOutSourceCustomerSubTitle}
            color={palette.secondaryColor}
            className='bg-secondarySupport border-secondaryColor p-4'
          />
        </When>
        <When isTrue={alignersAreShippedForCustomer}>
          <InfoCard
            title={alignersAreShippedTitleForCustomer}
            subTitle={alignersAreShippedSubTitleForCustomer}
            color={palette.secondaryColor}
            className='bg-secondarySupport border-secondaryColor p-4'
            buttonText={alignersAreShippedButtonTitleForCustomer}
            onClick={handleMarkAsDeliveredClick}
            classNameButton='bg-secondaryColor'
            hideIcon
          />
        </When>

        <When isTrue={customerTrackingEnabled!}>
          <When isTrue={alignersAreDeliveredCustomer}>
            <InfoCard
              title={alignersAreDeliveredCustomerTitle}
              subTitle={alignersAreDeliveredCustomerSubTitle}
              color={palette.orange}
              className='bg-orangeSupport border-orange  border p-4'
              classNameButton='bg-orange'
              buttonText={alignersAreDeliveredCustomerPrimaryButtonText}
              onClick={redirectToTracking}
              hideIcon
            />
          </When>
          <When isTrue={trackingStartedCustomer}>
            <InfoCard
              title={trackingStartedCustomerTitle}
              subTitle={trackingStartedCustomerSubTitle}
              color={palette.secondaryColor}
              className='bg-secondarySupport border-secondaryColor p-4'
              buttonText='View Tracking'
              classNameButton='bg-secondaryColor'
              onClick={trackingStartedCustomerButtonNavigation}
            />
          </When>
        </When>
      </>
    )
  }

  const renderEnterpriseManufacturingCards = () => {
    if (!allUserEnterPriseGrowth) return null

    return (
      <>
        <When isTrue={isMovedToProductionInHouseGrowth}>
          <InfoCard
            title={isMovedToProductionInHouseGrowthTitle}
            subTitle={isMovedToProductionInHouseGrowthSubtitle}
            color={palette.orange}
            className='bg-orangeSupport border-orange  border p-4'
            buttonText={isMovedToProductionInHousePrimaryText}
            secondaryButtonText={isMovedToProductionInHouseSecondaryText}
            classNameButton={isMovedToProductionInHousePrimaryTextClassName}
            onClick={isMovedToProductionInHousePrimaryTextNavigation}
            onSecondaryClick={isMovedToProductionInHouseSecondaryTextNavigation}
            classNameSecondaryButton={isMovedToProductionInHouseSecondaryTextClassName}
          />
        </When>
        <When isTrue={isMovedToPackagedInHouseGrowth}>
          <InfoCard
            title={isMovedToPackagedInHouseGrowthTitle}
            subTitle={isMovedToPackagedInHouseGrowthSubtitle}
            color={palette.orange}
            className='bg-orangeSupport border-orange  border p-4'
            classNameButton='bg-orange'
            buttonText={isMovedToPackagedInHousePrimaryText}
            onClick={isMovedToPackagedInHousePrimaryTextNavigation}
            hideIcon
          />
        </When>
        <When isTrue={isShippedGrowthEnterprise}>
          <InfoCard
            title={isShippedGrowthEnterpriseTitle}
            subTitle={isShippedGrowthEnterpriseSubtitle}
            color={palette.orange}
            className='bg-orangeSupport border-orange border p-4'
            classNameButton='bg-orange'
            secondaryButtonText='View Details'
            onSecondaryClick={handleViewShippingDetails}
            classNameSecondaryButton='bg-transparent text-orange border-orange'
            buttonText={isShippedGrowthEnterprisePrimaryButtonTitle}
            onClick={isShippedGrowthEnterprisePrimaryButtonNavigation}
            hideIcon
          />
        </When>
        <When isTrue={isDeliveredGrowthEnterprise}>
          <InfoCard
            title={isDeliveredGrowthEnterpriseTitle}
            subTitle={isDeliveredGrowthEnterpriseSubtitle}
            color={palette.secondaryColor}
            className='bg-secondarySupport border-secondaryColor p-4'
            buttonText={isDeliveredGrowthEnterprisePrimaryButtonText}
            onClick={isDeliveredGrowthEnterprisePrimaryButtonTextNavigation}
            classNameButton='bg-secondaryColor'
          />
        </When>
        <When isTrue={treatmentStartedGrowthEnterprise}>
          <InfoCard
            title={treatmentStartedGrowthEnterpriseTitle}
            subTitle={treatmentStartedGrowthEnterpriseSubTitle}
            color={palette.secondaryColor}
            className='bg-secondarySupport border-secondaryColor p-4'
            buttonText={treatmentStartedGrowthEnterpriseButtonText}
            onClick={treatmentStartedGrowthEnterpriseButtonNavigation}
            classNameButton='bg-secondaryColor'
          />
        </When>
        <When isTrue={caseMovedNeedMoreInfoGE}>
          <InfoCardWithContainer
            title='More Information Required'
            subtitle={
              serviceProductAddedBy ? (
                <>
                  <strong>{serviceProductAddedBy}</strong> has moved the case to “Need more
                  Information.”
                </>
              ) : (
                'The lab has requested additional information for this case.'
              )
            }
            className='flex md:!justify-between !justify-start border !border-orange'
            titleClassName='!text-black font-semibold'
            topSectionClassName='bg-orangeSupport'
            infoIconColor='orange'
            remarksClassName='!bg-transparent'
            hideDismissButton
            remarks={commentRemark}
            showRemarksTitle={false}
          />
        </When>
        <When isTrue={caseMovedOutOfNeedMoreInfo}>
          <InfoCardWithContainer
            title='Planning in Progress'
            subtitle='Treatment plans are in progress for this case. Create or update plans, then share for review as needed.'
            className='flex md:!justify-between !justify-start border !border-secondaryColor'
            titleClassName='!text-black font-semibold'
            topSectionClassName='bg-secondarySupport'
            infoIconColor={palette.secondaryColor}
            remarksClassName='!bg-transparent'
            hideDismissButton
            remarks={planCountsRemark}
            showRemarksTitle={false}
            primaryButtonText='View Plans'
            primaryButtonClassName='bg-secondaryColor text-white'
            onPrimaryClick={() => navigate(`${profileBasePath}/${parsedPatientId}/plans-list`)}
            secondaryButtonText={!!orderId ? 'View Case details' : undefined}
            secondaryButtonClassName='text-secondaryColor border !border-secondaryColor'
            onSecondaryClick={() => {
              if (!!orderId) {
                if (profileBasePath === '/vsp-profile' && parsedPatientId) {
                  navigate(`/vsp-profile/${parsedPatientId}/case-details?order_id=${orderId}`)
                  return
                }
                navigate(`/view-order/${orderId}`)
              }
            }}
          />
        </When>
        <When isTrue={planApprovedGrowthEnterprise}>
          <InfoCard
            title='Start Production'
            subTitle='A treatment plan has been approved. You can now begin manufacturing aligners for this case. Review plan details before starting production.'
            color={palette.orange}
            className='bg-orangeSupport border-orange  border p-4'
            buttonText='Start Production'
            classNameButton='bg-orange'
            onClick={handleStartProduction}
          />
        </When>
      </>
    )
  }

  return (
    <>
      {/* <SelectPlanningOrProductionModal /> */}

      <Modal
        open={isShippingDetailsModalOpen}
        onCancel={closeShippingDetailsModal}
        footer={null}
        width={640}
        destroyOnClose
        centered
      >
        <div className='p-5'>
          <div className='text-2xl font-semibold mb-3'>Shipping details</div>
          <ShippingDetailsContainerTask onClose={closeShippingDetailsModal} />
        </div>
      </Modal>
      {renderPlanningJourneyCards()}
      {renderCustomerManufacturingCards()}
      {renderEnterpriseManufacturingCards()}
    </>
  )
}

export default InfoCardAssessmentView
