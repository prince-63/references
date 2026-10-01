import manufacturingConstants from '@constants/manufacturing.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useActiveProfile from '@hooks/useActiveProfile'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import {Button} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {changeWorkFlow, getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {postManufacturingDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {createTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {
  addShippingDetails,
  attachShippingDetails,
  setClearProductionSetupData,
  setManufacturingData,
  setShipping,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {
  AddBatchTaskData,
  clearProductionTaskList,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {getIndividualTask} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {RootState} from 'redux/store'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import {getCustomerId, safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

const ProductionStepperActions = ({
  items,
  steps,
  current,
  setCurrent,
  makeUnableManufacturing,
}: {
  items: any[]
  steps: any[]
  current: number
  setCurrent: React.Dispatch<React.SetStateAction<number>>
  makeUnableManufacturing: boolean
}) => {
  const {profileId, userId} = useContext(AuthContext)
  const {order: orderFromState} = userOrderDetails()
  const navigate = useNavigate()
  const {treatmentId, patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const [loading, setLoading] = useState(false)
  const {isPractice, isAdmin} = useAllUserPlan()
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {manufacturing_details} = treatmentPlan
  const order = useMemo(() => {
    if (!orderFromState || !Object.keys(orderFromState).length) return null

    const orderPatientId = safeParseInt(
      orderFromState?.patient_details?.id ?? (orderFromState as any)?.patient_id
    )
    const currentPatientId = safeParseInt(patientId)
    if (orderPatientId && currentPatientId && orderPatientId !== currentPatientId) return null

    if (
      treatmentPlan?.order_id &&
      orderFromState?.order_id &&
      String(treatmentPlan.order_id) !== String(orderFromState.order_id)
    ) {
      return null
    }

    return orderFromState
  }, [orderFromState, patientId, treatmentPlan?.order_id])
  const {activeProfile} = useActiveProfile()
  const {manufacturingData, productSelected, instructions, productType, shipping} = useSelector(
    (state: RootState) => state.productionSetup
  )
  const {getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)
  const normalizedTask = useMemo(() => {
    if (!getIndividualTaskList) return null
    if (Array.isArray(getIndividualTaskList)) {
      return getIndividualTaskList[0] ?? null
    }
    return getIndividualTaskList
  }, [getIndividualTaskList])
  const taskId = normalizedTask?.id ?? null
  const {cardDetails} = useSelector((state: RootState) => state.kanban)
  const isOutsourced = Number(profileId) !== productSelected?.profile_id
  const localChecklist = useSelector((state: RootState) => {
    const pid = safeParseInt(patientId)
    return state.profile?.productionChecklistLocalByPatient?.[pid] ?? []
  })
  const stepId = steps[current]?.id

  useEffect(() => {
    const parsedPatientId = safeParseInt(patientId)
    const parsedUserId = safeParseInt(userId)
    if (!parsedPatientId || !parsedUserId) return
    if (normalizedTask) return
    dispatchAction(
      getIndividualTask({
        patient_id: parsedPatientId,
        doctor_id: parsedUserId,
      })
    )
  }, [dispatchAction, normalizedTask, patientId, userId])
  const canNext = () => {
    const stepId = steps[current]?.id
    switch (stepId) {
      case 'setup':
        return !!productSelected && !!treatmentId
      case 'batch':
        return makeUnableManufacturing || !!manufacturingData?.total
      case 'stl':
        return true
      case 'shipping':
        return true
      case 'instructions':
      case 'review':
      default:
        return true
    }
  }

  const onNext = () => {
    if (steps[current]?.id === 'shipping') {
      if (!hasValue(shipping) && order) {
        const shipping = order?.shipping_details
        const payload = {
          treatement_plan_id: treatmentId,
          addressed_to: shipping?.addressed_to,
          name: shipping?.name,
          address_line: shipping?.address_line ?? '',
          country: shipping?.country,
          state: shipping?.state,
          city: shipping?.city,
          pincode: shipping?.pincode,
          default: false,
          profile_id: safeParseInt(profileId),
          customer_profile_id: getCustomerId({
            order: order,
            profileId: safeParseInt(profileId),
            isAdmin: isAdmin,
          }),
        }

        dispatchAction(addShippingDetails(payload))
          .unwrap()
          .then((res: any) => {
            dispatchAction(
              setShipping({
                addressed_to: res.addressed_to,
                name: res.name,
                address_line: res.address_line,
                country: res.country,
                state: res.state,
                city: res.city,
                pincode: res.pincode,
                default: res.default,
              })
            )
            dispatchAction(
              attachShippingDetails({
                treatment_plan_id: safeParseInt(treatmentId),
                shipping_id: res.shipping_id,
              })
            )
            setCurrent(4)
            return
          })
      }
    }
    if (stepId !== 'review') {
      setCurrent((c) => Math.min(c + 1, items.length - 1))
    } else {
      HandleSubmit()
    }
  }

  const onPrev = () => {
    setCurrent((c) => Math.max(0, c - 1))
  }

  const HandleSubmit = () => {
    setLoading(true)
    const {
      aligner_details_meta_data,
      filesToSave,
      otherFilesToSave,
      video_files_to_save,
      manufacturing_details,
    } = treatmentPlan

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
    if (
      (!!manufacturing_details && manufacturing_details.length > 0) ||
      treatmentPlan?.status === 'ACTIVE'
    ) {
      createManufacturingCreate()
      return
    } else {
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
          createManufacturingCreate()
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }

  const createManufacturingCreate = () => {
    const allBatchesDelivered =
      !!manufacturing_details &&
      manufacturing_details.length > 0 &&
      manufacturing_details.some((item) => item.status === manufacturingConstants.DELIVERED)
    const isNextBatch = allBatchesDelivered ? true : false
    const payload = {
      status: manufacturingConstants.MANUFACTURING_STARTED,
      patient_id: safeParseInt(patientId),
      upper_aligner_start: manufacturingData.upper_start || null,
      upper_aligner_end: manufacturingData.upper_end || null,
      lower_aligner_start: manufacturingData.lower_start || null,
      lower_aligner_end:
        manufacturingData.lower_start === 0 ? null : manufacturingData.lower_end || null,
      total_aligners: manufacturingData.total || 0,
      batch_type: manufacturingData.batchType as 'IN_BATCHES' | 'ALL_ALIGNERS',
      treatment_plan_id: treatmentPlan?.treatment_plan_id,
      instructions: instructions,
      service_products: productSelected,
      service_id: productSelected?.id,
      outsource_lab_profile_id:
        isOutsourced && !!productSelected ? productSelected.profile_id : null,
      is_next_batch: isNextBatch,
      service_product_id: productSelected?.id,
    }

    try {
      dispatchAction(postManufacturingDetails(payload))
        .unwrap()
        .then((res: {id: number}) => {
          const pid = safeParseInt(patientId)
          const profId = safeParseInt(profileId)

          const batchChecklistPayload = (localChecklist || []).map((item) => ({
            patient_id: pid,
            profile_id: profId,
            manufacturing_batch_id: res.id,
            title: item.title,
            checked: item.status === 'COMPLETED',
          }))

          if (!batchChecklistPayload.length) {
            callChangeWorkFlow(res)
            return
          }

          dispatchAction(AddBatchTaskData(batchChecklistPayload))
            .unwrap()
            .then(() => callChangeWorkFlow(res))
        })
    } catch (error) {
      console.error('Failed to create manufacturing batch:', error)
      setLoading(false)
    }
  }

  const callChangeWorkFlow = (res: {id: number}) => {
    const allBatchesDelivered =
      !!manufacturing_details &&
      manufacturing_details.length > 0 &&
      manufacturing_details.some((item) => item.status === manufacturingConstants.DELIVERED)
    const isNextBatch = allBatchesDelivered ? true : false

    const payloadForInHouse = {
      manufacturing_id: res.id,
      order_type: 'ALIGNER',
      workflow_name: 'Production In House',
      workflow_status_name: 'TO DO',
      order_id: null,
      patient_id: patientId,
      service_products: productSelected,
      lab_work_flow_name: null,
      lab_order_type: null,
      lab_workflow_status_name: null,
      case_type: 'IN_HOUSE_MANUFACTURING',
      lab_profile_id: null,
      doctor_id: userId,
      task_id: taskId ?? cardDetails?.id,
      service_product_id: productSelected?.id,
    }

    const payloadForOutSource = {
      manufacturing_id: res.id,
      order_type: 'ALIGNER',
      workflow_name: 'Production Outsource',
      workflow_status_name: 'In Progress',
      order_id: null,
      patient_id: patientId,
      service_products: productSelected,
      doctor_id: userId,
      task_id: taskId ?? cardDetails?.id,
      // Lab detail
      lab_workflow_name: 'Production In House',
      lab_order_type: 'ALIGNER',
      lab_workflow_status_name: 'TO DO',
      case_type: 'OUTSOURCED_MANUFACTURING',
      lab_profile_id: productSelected?.profile_id,
      service_product_id: productSelected?.id,
    }

    if (!isNextBatch) {
      dispatchAction(
        changeWorkFlow(
          isPractice
            ? payloadForOutSource
            : productType === 'IN_HOUSE' ||
                (safeParseInt(productSelected?.profile_id) ===
                  safeParseInt(activeProfile?.owner_profile_id) &&
                  isAdmin)
              ? (payloadForInHouse as any)
              : (payloadForOutSource as any)
        )
      )
        .unwrap()
        .then(() => {
          dispatchAction(getKanbanCountsByProfile({profile_id: Number(profileId)}))
            .unwrap()
            .then(() => {
              if (
                safeParseInt(productSelected?.profile_id) ===
                  safeParseInt(activeProfile?.owner_profile_id) &&
                isAdmin
              ) {
                dispatchAction(setClearProductionSetupData())
                SuccessToast('Ticket move to Production in house')
                navigate('/aligner-orders?workFlow=production-in-house')
                return
              }
              if (productType === 'OUTSOURCE' && !isPractice) {
                dispatchAction(setClearProductionSetupData())
                SuccessToast('Ticket move to Production out source')
                navigate('/aligner-orders?workFlow=production-outsource')
              } else if (isPractice) {
                dispatchAction(setClearProductionSetupData())
                navigate(`/profile/${patientId}`)
              } else {
                dispatchAction(setClearProductionSetupData())
                SuccessToast('Ticket move to Production in house')
                navigate('/aligner-orders?workFlow=production-in-house')
              }
              dispatchAction(setClearProductionSetupData())
              dispatchAction(clearProductionTaskList())
              dispatchAction(
                setManufacturingData({
                  batchType: 'ALL_ALIGNERS',
                  upper_start: null,
                  upper_end: null,
                  lower_start: null,
                  lower_end: null,
                  total: null,
                })
              )
              setLoading(false)
            })
        })
    } else {
      if (productType === 'IN_HOUSE') {
        dispatchAction(setClearProductionSetupData())
        SuccessToast('Ticket move to Production in house')
        navigate('/aligner-orders?workFlow=production-in-house')
      } else {
        dispatchAction(setClearProductionSetupData())
        SuccessToast('Ticket move to Production out source')
        navigate('/aligner-orders?workFlow=production-outsource')
      }
      dispatchAction(setClearProductionSetupData())
      dispatchAction(clearProductionTaskList())
      dispatchAction(
        setManufacturingData({
          batchType: 'ALL_ALIGNERS',
          upper_start: null,
          upper_end: null,
          lower_start: null,
          lower_end: null,
          total: null,
        })
      )
      setLoading(false)
    }
  }
  return (
    <div className='fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white md:pb-0 pb-16'>
      <div className='mx-auto flex items-center justify-end gap-3 px-4 py-3'>
        <div className='flex w-full sm:w-auto flex-col sm:flex-row justify-end gap-2'>
          <Button
            type='default'
            onClick={current === 0 ? () => navigate(-1) : onPrev}
            className='px-5 py-2.5 text-slate-700 bg-white ring-1 ring-slate-200 shadow-sm hover:!bg-slate-50'
          >
            Back
          </Button>
          <AntdButton
            type='primary'
            onClick={onNext}
            loading={loading}
            className='px-6 py-2.5 font-semibold shadow-sm'
            text={current === items.length - 1 ? 'Submit' : 'Next'}
            disabled={loading || !canNext()}
          />
        </div>
      </div>
    </div>
  )
}

export default ProductionStepperActions
