import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {ManufacturingItem, ManufacturingStatus} from '../types/GettingStarted.types'
import manufacturingConstants from '@constants/manufacturing.constants'
import {useEffect, useMemo} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {getManufacturingListDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'

export type ManufacturingStatusKey = keyof typeof manufacturingConstants | null

export interface JawRange {
  start: number | null
  end: number | null
}

const modeOptions = ['In-House', 'Outsourced', null] as const

export interface ProcessedManufacturingBatch {
  totalAligners: number
  upperJaw: JawRange
  lowerJaw: JawRange
  status: ManufacturingStatus | null
  started_on?: string | null
  completed_on?: string | null
  shipped_on?: string | null
  delivered_on?: string | null
  id?: number | string | null
  assignee?: string | null
  created_by?: string | null
  mode?: (typeof modeOptions)[number] | null
  case_type?: string | null
  service_products: ServiceProducts
  batch_number: number | null
  instructions?: string | null
  product_type: string | null
  product_name: string | null
  product_description: string | null
  product_image: string | null
  outsourced_to?: string | null
}

export interface ServiceProducts {
  product_category_name: string
  product_type: string
  profile_id: number
}

export interface UnprocessedManufacturing {
  upperJaw: JawRange
  lowerJaw: JawRange
  total_aligners: number
  due_by: string | null
  treatment_version: string
}

export interface ManufacturingDetails {
  processed: ProcessedManufacturingBatch[]
  unprocessed: UnprocessedManufacturing
  latest_manufacturing_data: ManufacturingItem | null
  loading: boolean
}

export const useManufacturingDetails = ({
  getFreshData = false,
  treatment_plan_id,
  patient_id_override,
}: {
  getFreshData?: boolean
  treatment_plan_id?: number
  patient_id_override?: number | string | null
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {order} = useSelector((state: RootState) => state.orders)
  const patient_id = useMemo(() => {
    if (patient_id_override !== undefined && patient_id_override !== null) {
      return patient_id_override
    }
    return patientId ?? order?.patient_details?.id
  }, [patientId, order, patient_id_override])
  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const active_treatment_plan = gettingStartedStepData?.in_manufacturing?.active_treatment_plan

  const {manufacturingListByPlan, loadingManufacturingListByPlan} = useSelector(
    (state: RootState) => state.GettingStartedOverview
  )

  const selectedPlanId = useMemo(
    () =>
      safeParseInt(treatment_plan_id) ||
      safeParseInt(active_treatment_plan?.treatment_plan_id as any),
    [treatment_plan_id, active_treatment_plan?.treatment_plan_id]
  )

  const manufacturingListData = useMemo(() => {
    if (!selectedPlanId) return undefined as any
    return manufacturingListByPlan[selectedPlanId]
  }, [manufacturingListByPlan, selectedPlanId])

  const processed: ProcessedManufacturingBatch[] = useMemo(() => {
    if (!manufacturingListData?.processed_manufacturing?.length) return []

    return [...manufacturingListData.processed_manufacturing].reverse().map(
      (batch): ProcessedManufacturingBatch => ({
        totalAligners: batch.total_aligners ?? 0,
        upperJaw: {
          start: batch.upper_aligner_start ?? null,
          end: batch.upper_aligner_end ?? null,
        },
        lowerJaw: {
          start: batch.lower_aligner_start ?? null,
          end: batch.lower_aligner_end ?? null,
        },
        status: batch.status ?? null,
        started_on: batch.started_on,
        completed_on: batch.completed_on,
        shipped_on: batch.shipped_on,
        delivered_on: batch.delivered_on,
        id: (batch as any).manufacturing_batch_id ?? (batch as any).id ?? null,
        created_by: batch.created_by,
        assignee: batch.assignee,
        case_type: (batch as any).case_type ?? null,
        service_products: {
          product_category_name: batch.service_products?.product_category_name ?? '-',
          product_type: batch.service_products?.product_name ?? '-',
          profile_id: batch.service_products?.profile_id,
        },
        batch_number: batch.batch_number,
        instructions: batch.instructions ?? null,
        product_type: batch.product_type,
        product_name: batch.product_name,
        product_description: batch.product_description,
        product_image: batch.product_description,
        outsourced_to: batch.outsourced_to,
      })
    )
  }, [manufacturingListData?.processed_manufacturing])

  const latest_manufacturing_data: ManufacturingItem | null = useMemo(() => {
    const list = manufacturingListData?.processed_manufacturing
    return list && list.length > 0 ? list[list.length - 1] : null
  }, [manufacturingListData?.processed_manufacturing])

  const unprocessed: UnprocessedManufacturing = useMemo(
    () => ({
      upperJaw: {
        start: manufacturingListData?.unprocessed_manufacturing?.upper_aligner_start ?? null,
        end: manufacturingListData?.unprocessed_manufacturing?.upper_aligner_end ?? null,
      },
      lowerJaw: {
        start: manufacturingListData?.unprocessed_manufacturing?.lower_aligner_start ?? null,
        end: manufacturingListData?.unprocessed_manufacturing?.lower_aligner_end ?? null,
      },
      total_aligners: manufacturingListData?.unprocessed_manufacturing?.total_aligners ?? 0,
      due_by: manufacturingListData?.unprocessed_manufacturing?.due_by ?? null,
      treatment_version: manufacturingListData?.unprocessed_manufacturing?.treatment_version ?? '',
    }),
    [manufacturingListData?.unprocessed_manufacturing]
  )

  const alignerListForUpdate: UnprocessedManufacturing = useMemo(
    () => ({
      upperJaw: {
        start: active_treatment_plan?.start_upper_jaw,
        end: active_treatment_plan?.end_upper_jaw,
      },
      lowerJaw: {
        start: active_treatment_plan?.start_lower_jaw,
        end: active_treatment_plan?.end_lower_jaw,
      },
      total_aligners: latest_manufacturing_data?.total_aligners ?? 0,
      due_by: manufacturingListData?.unprocessed_manufacturing?.due_by ?? null,
      treatment_version: manufacturingListData?.unprocessed_manufacturing?.treatment_version ?? '',
    }),
    [
      active_treatment_plan?.start_upper_jaw,
      active_treatment_plan?.end_upper_jaw,
      active_treatment_plan?.start_lower_jaw,
      active_treatment_plan?.end_lower_jaw,
      latest_manufacturing_data?.total_aligners,
    ]
  )

  useEffect(() => {
    if (!getFreshData) return
    if (!selectedPlanId) return
    dispatchAction(
      getManufacturingListDetails({
        patient_id: safeParseInt(patient_id),
        treatment_plan_id: safeParseInt(selectedPlanId),
      })
    )
  }, [selectedPlanId, patient_id, getFreshData])

  return {
    loading: !!(selectedPlanId && loadingManufacturingListByPlan[selectedPlanId]),
    processed,
    latest_manufacturing_data,
    unprocessed,
    alignerListForUpdate,
  }
}
