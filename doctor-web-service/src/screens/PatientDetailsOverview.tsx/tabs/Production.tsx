import React, {useContext, useEffect, useMemo, useRef, useState} from 'react'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Tooltip} from 'antd'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {useManufacturingDetails} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import {ManufacturingDetailsCard} from 'screens/Patients/LeadsProfile/main/overview/components/ManufacturingDetailsCard'
import {safeParseInt} from 'utils/ConstFunctions'
import {BatchList} from '../components/BatchList'
import {getManufacturingListDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {useNavigate, useParams} from 'react-router-dom'
import useDispatchAction from '@hooks/useDispatchAction'
import hasValue from 'utils/hasValue'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import {getAllTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {AuthContext} from 'context/AuthContext'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import InfoCard from 'components/instruction/InfoCard'
import getColorPalette from 'utils/getColorPalette'
import moment from 'moment'
import When from 'components/when/When'
import StartManufacturingModal from 'screens/Patients/LeadsProfile/main/overview/components/StartManufacturingModal'
import CheckedCircleIcon from 'assets/icons/CheckedCircleIcon'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import PlanStatusTag from '../helpers/PlanStatusTag'
import {getPlanStatus} from '@utils/getPlanStatus'
import TabHeader from '../items/TabHeader'
import useAllUserPlan from '@hooks/useAllUserPlan'
import Spinner from 'components/spinner/Spinner'

export type TreatmentPlan = {
  id: string
  title: string
  version?: string
  cards: TreatmentPlanCardData[]
}

export type TreatmentPlanCardData = {
  label: string
  value: string
  lines?: string[]
  note?: string
}

type DeliveredTotals = {
  totalAligners: number
  upperJaw: {start: number | null; end: number | null}
  lowerJaw: {start: number | null; end: number | null}
}

const TreatmentPlanSection: React.FC<{
  plan: AllTreatmentPlanListItem
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>
}> = ({plan, setIsDisabled}) => {
  const {processed, latest_manufacturing_data, unprocessed, loading} = useManufacturingDetails({
    treatment_plan_id: plan.aligner_treatment_id,
    getFreshData: true,
  })

  const navigate = useNavigate()
  const {profileId} = useContext(AuthContext)
  const {isStarterPlanUser} = useAllUserPlan()

  const processed_reverse = useMemo(() => {
    return [...(processed ?? [])]
  }, [processed])

  const inProgress = ['MANUFACTURING_STARTED', 'COMPLETED', 'IN_PROGRESS', 'SHIPPED'].includes(
    latest_manufacturing_data?.status ?? ''
  )

  const unprocessedTotal = safeParseInt(unprocessed?.total_aligners) ?? 0
  const hasUnprocessed = (unprocessedTotal as number) > 0

  const status = plan?.treatment_status
  const isActiveOrApproved = useMemo(
    () =>
      [treatmentPlanStatusConstants.ACTIVE, treatmentPlanStatusConstants.APPROVED].includes(
        status as any
      ),
    [status]
  )
  const isDeactivated = status === treatmentPlanStatusConstants.DEACTIVATED

  useEffect(() => {
    setIsDisabled(!(hasUnprocessed && !inProgress) || isDeactivated)
  }, [hasUnprocessed, inProgress, status, setIsDisabled])
  const {getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)

  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams<{patientId: string}>()
  const {openModalManufacturing} = useSelector((state: RootState) => state.GettingStartedOverview)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {permissionChecks} = useFeatureAccess()
  const beginNextBatchAccess =
    permissionChecks?.patientProfileActions?.beginNextBatch?.isViewable &&
    serviceConfig?.ALIGNER_PLANNING_MANUFACTURING

  const refreshData = () => {
    if (!hasValue(plan?.aligner_treatment_id) && plan?.aligner_treatment_id === 0) return
    dispatchAction(
      getManufacturingListDetails({
        patient_id: safeParseInt(patientId),
        treatment_plan_id: safeParseInt(plan?.aligner_treatment_id),
      })
    ).unwrap()
  }

  useEffect(() => {
    if (openModalManufacturing) refreshData()
  }, [openModalManufacturing])

  const dueByDate = unprocessed?.due_by ? moment(unprocessed?.due_by).format('DD-MMM-YYYY') : null

  const deliveredBatches = processed_reverse.filter((b) => b.status === 'DELIVERED')

  const deliveredTotals = deliveredBatches.reduce<DeliveredTotals>(
    (acc, batch) => {
      acc.totalAligners += Number(batch.totalAligners || 0)

      const updateRange = (
        accObj: {start: number | null; end: number | null},
        curr: {start?: number | null; end?: number | null}
      ) => {
        const s = curr?.start ?? null
        const e = curr?.end ?? null
        if (s !== null && s !== undefined) {
          accObj.start = accObj.start === null ? s : Math.min(accObj.start, s)
        }
        if (e !== null && e !== undefined) {
          accObj.end = accObj.end === null ? e : Math.max(accObj.end, e)
        }
      }

      updateRange(acc.upperJaw, batch.upperJaw || {})
      updateRange(acc.lowerJaw, batch.lowerJaw || {})

      return acc
    },
    {
      totalAligners: 0,
      upperJaw: {start: null, end: null},
      lowerJaw: {start: null, end: null},
    }
  )
  // === END FIX ===

  // Next-batch prefill helpers
  const nextUpperStart = safeParseInt(unprocessed?.upperJaw?.start)
  const nextUpperEndMax = safeParseInt(unprocessed?.upperJaw?.end)
  const nextLowerStart = safeParseInt(unprocessed?.lowerJaw?.start)
  const nextLowerEndMax = safeParseInt(unprocessed?.lowerJaw?.end)
  const stepSize = 5
  const nextUpperEnd =
    Number.isFinite(nextUpperStart) && Number.isFinite(nextUpperEndMax)
      ? Math.min((nextUpperStart as number) + (stepSize - 1), nextUpperEndMax as number)
      : null
  const nextLowerEnd =
    Number.isFinite(nextLowerStart) && Number.isFinite(nextLowerEndMax)
      ? Math.min((nextLowerStart as number) + (stepSize - 1), nextLowerEndMax as number)
      : null
  const count = (s?: number | null, e?: number | null) =>
    Number.isFinite(s) && Number.isFinite(e) && (e as number) >= (s as number)
      ? (e as number) - (s as number) + 1
      : 0
  const nextTotal = count(nextUpperStart, nextUpperEnd) + count(nextLowerStart, nextLowerEnd)

  const isPrevOutsourced = useMemo(() => {
    const profId = (latest_manufacturing_data as any)?.service_products?.profile_id
    return Number(profileId) !== Number(profId)
  }, [latest_manufacturing_data, profileId])

  const treatmentStatus = getPlanStatus({
    treatmentPlan: plan as any,
  }) as keyof typeof treatmentPlanStatusConstants

  if (loading) {
    ;<Spinner loading />
  }

  return (
    <section className='mb-8'>
      <BorderedCardForDashBoardCards>
        <div className='flex items-center gap-2'>
          <h1 className='text-lg md:text-xl font-semibold text-gray-900'>
            {plan?.treatment_plan_tag_name ?? plan?.treatment_name}
          </h1>
          <h1 className='text-base md:text-base  text-textColor'>
            {unprocessed?.treatment_version}
          </h1>
          <CheckedCircleIcon color={getColorPalette().tertiaryColor} />
          <PlanStatusTag treatmentStatus={treatmentStatus} />
        </div>

        <When isTrue={isDeactivated}>
          <InfoCard
            {...{
              title: 'Treatment deactivated',
              subTitle:
                'You can review historical batches and details below. Creating new batches is disabled.',
              showButton: false,
              className: 'bg-amber-50 border border-amber-300 mt-3',
              titleClassName: 'text-sm font-semibold text-amber-900',
              infoIconColor: '#D97706',
            }}
          />
        </When>

        <When isTrue={!loading}>
          <div className='md:flex-row flex flex-col gap-2 justify-between'>
            <ManufacturingDetailsCard
              totalAligners={plan?.total_aligner}
              upperJaw={{
                start: plan?.upper_jaw_details?.starts_with,
                end: plan?.upper_jaw_details?.ends_with,
              }}
              lowerJaw={{
                start: plan?.lower_jaw_details?.starts_with,
                end: plan?.lower_jaw_details?.ends_with,
              }}
              title={'TOTAL ALIGNER'}
            />

            <ManufacturingDetailsCard
              totalAligners={safeParseInt(unprocessed?.total_aligners)}
              upperJaw={{
                start: safeParseInt(unprocessed?.upperJaw?.start),
                end: safeParseInt(unprocessed?.upperJaw?.end),
              }}
              lowerJaw={{
                start: safeParseInt(unprocessed?.lowerJaw?.start),
                end: safeParseInt(unprocessed?.lowerJaw?.end),
              }}
              title={'UNPROCESSED'}
            >
              <When
                isTrue={
                  (isActiveOrApproved &&
                    (unprocessedTotal as number) > 0 &&
                    !inProgress &&
                    beginNextBatchAccess) ||
                  (isStarterPlanUser && (unprocessedTotal as number) > 0)
                }
              >
                <AntdButton
                  className='mt-2 text-white bg-primaryColor border border-primaryColor font-semibold w-fit px-3 py-1.5 rounded-lg'
                  text={`${isStarterPlanUser ? 'Record new batch' : '+ Begin next batch'}`}
                  onClick={() => {
                    if (!!patientId && !!plan?.aligner_treatment_id) {
                      if (isStarterPlanUser) {
                        navigate(
                          `/starter-plan-production/${patientId}/${plan?.aligner_treatment_id}`
                        )
                        return
                      }

                      const prefill = {
                        from: 'next-batch',
                        prevBatchId:
                          (latest_manufacturing_data as any)?.manufacturing_batch_id ?? null,
                        productType: isPrevOutsourced ? 'OUTSOURCE' : 'IN_HOUSE',
                        productSelected: {
                          id: -1,
                          product_type: 'ALIGNER',
                          product_name:
                            (latest_manufacturing_data as any)?.service_products?.product_name ||
                            (latest_manufacturing_data as any)?.service_products?.product_type ||
                            'Aligner',
                          product_description: '',
                          product_image: null,
                          product_category_id: 0,
                          product_category_name:
                            (latest_manufacturing_data as any)?.service_products
                              ?.product_category_name || 'Aligners',
                          profile_id:
                            (latest_manufacturing_data as any)?.service_products?.profile_id ||
                            Number(profileId),
                          is_default: false,
                          created_at: '',
                          updated_at: '',
                          is_last_used: true,
                          added_by_user_name: '',
                        },
                        manufacturingData: {
                          batchType: 'IN_BATCHES',
                          upper_start: nextUpperStart ?? null,
                          upper_end: nextUpperEnd ?? null,
                          lower_start: nextLowerStart ?? null,
                          lower_end: nextLowerEnd ?? null,
                          total: nextTotal || safeParseInt(unprocessed?.total_aligners) || null,
                        },
                        readonlyPlan: true,
                      }
                      navigate(
                        `/production-setup-stepper/${patientId}/${plan?.aligner_treatment_id}?prefill=next-batch`,
                        {
                          state: {prefill},
                        }
                      )
                    }
                  }}
                />
              </When>
            </ManufacturingDetailsCard>

            <ManufacturingDetailsCard
              title='IN MANUFACTURING'
              status={latest_manufacturing_data?.status}
              // ✅ Show data when status is MANUFACTURING_STARTED, COMPLETED, IN_PROGRESS, or SHIPPED
              totalAligners={
                ['MANUFACTURING_STARTED', 'COMPLETED', 'IN_PROGRESS', 'SHIPPED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? latest_manufacturing_data?.total_aligners
                  : 0
              }
              upperJaw={{
                start: ['MANUFACTURING_STARTED', 'COMPLETED', 'IN_PROGRESS', 'SHIPPED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? safeParseInt(latest_manufacturing_data?.upper_aligner_start)
                  : '',
                end: ['MANUFACTURING_STARTED', 'COMPLETED', 'IN_PROGRESS', 'SHIPPED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? safeParseInt(latest_manufacturing_data?.upper_aligner_end)
                  : '',
              }}
              lowerJaw={{
                start: ['MANUFACTURING_STARTED', 'COMPLETED', 'IN_PROGRESS', 'SHIPPED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? safeParseInt(latest_manufacturing_data?.lower_aligner_start)
                  : '',
                end: ['MANUFACTURING_STARTED', 'COMPLETED', 'IN_PROGRESS', 'SHIPPED'].includes(
                  latest_manufacturing_data?.status ?? ''
                )
                  ? safeParseInt(latest_manufacturing_data?.lower_aligner_end)
                  : '',
              }}
            >
              <When
                isTrue={
                  isActiveOrApproved &&
                  ['MANUFACTURING_STARTED', 'COMPLETED', 'IN_PROGRESS', 'SHIPPED'].includes(
                    latest_manufacturing_data?.status ?? ''
                  ) &&
                  (latest_manufacturing_data?.total_aligners ?? 0) > 0
                }
              >
                <Tooltip title='Ongoing Production: Manage active batches currently under production.'>
                  <div className='inline-block'>
                    <AntdButton
                      className='mt-2 text-white bg-primaryColor border border-primaryColor font-semibold w-fit px-3 py-1.5 rounded-lg'
                      text='View Ongoing Production'
                      onClick={() => {
                        const batchId = (latest_manufacturing_data as any)?.manufacturing_batch_id

                        const params = new URLSearchParams()
                        params.set('tab', 'ongoing')
                        if (batchId) params.set('batchId', String(batchId))
                        if (getIndividualTaskList?.patient_name)
                          params.set('patientName', String(getIndividualTaskList?.patient_name))
                        navigate(`/aligner-production?${params.toString()}`)
                      }}
                    />
                  </div>
                </Tooltip>
              </When>
            </ManufacturingDetailsCard>

            <ManufacturingDetailsCard
              title='DELIVERED'
              status={deliveredTotals.totalAligners > 0 ? 'DELIVERED' : undefined}
              totalAligners={deliveredTotals.totalAligners}
              upperJaw={{
                // pass through as-is; avoid coercing null to 0
                start: deliveredTotals.upperJaw.start ?? '',
                end: deliveredTotals.upperJaw.end ?? '',
              }}
              lowerJaw={{
                start: deliveredTotals.lowerJaw.start ?? '',
                end: deliveredTotals.lowerJaw.end ?? '',
              }}
            />
          </div>
        </When>

        <When isTrue={!!dueByDate && !isStarterPlanUser}>
          <InfoCard
            {...{
              title: `Next Batch Due by ${dueByDate}`,
              showButton: false,
              titleClassName: 'text-base font-semibold text-black',
              className: 'bg-secondarySupport border border-secondaryColor',
              infoIconColor: getColorPalette().secondaryColor,
            }}
          />
        </When>
        <When isTrue={!isStarterPlanUser}>
          {processed_reverse.map((batch, idx) => (
            <BatchList
              key={batch.id ?? idx}
              processed={batch}
              index={idx}
              plan={plan}
              totalBatches={processed_reverse.length}
              latestManufacturingData={latest_manufacturing_data}
            />
          ))}
          <StartManufacturingModal
            openModal={useSelector(
              (state: RootState) => state.GettingStartedOverview.openModalManufacturing
            )}
            refreshData={refreshData}
            treatment_plan_id={plan?.aligner_treatment_id}
          />
        </When>
      </BorderedCardForDashBoardCards>
    </section>
  )
}

const StandardProduction: React.FC = () => {
  const {allTreatmentPlanList, getAllTreatmentPlanListLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const [, setIsDisabled] = useState<boolean>(true)
  const requestedTreatmentPlansForPatientRef = useRef<string | null>(null)
  const {userId, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams<{patientId: string}>()
  const hasTreatmentPlans = !!allTreatmentPlanList?.length

  useEffect(() => {
    if (!organizationId || !userId || !patientId) return
    if (
      getAllTreatmentPlanListLoading ||
      requestedTreatmentPlansForPatientRef.current === patientId
    ) {
      return
    }

    requestedTreatmentPlansForPatientRef.current = patientId
    dispatchAction(
      getAllTreatmentPlanList({
        doctor_id: userId,
        patient_id: patientId,
        organization_id: safeParseInt(organizationId),
      })
    )
  }, [
    dispatchAction,
    getAllTreatmentPlanListLoading,
    organizationId,
    patientId,
    userId,
  ])

  const filteredPlans =
    allTreatmentPlanList
      ?.filter(
        (plan: AllTreatmentPlanListItem) =>
          plan.treatment_status === treatmentPlanStatusConstants.ACTIVE ||
          plan.treatment_status === treatmentPlanStatusConstants.COMPLETE
      )
      .filter(
        (plan, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.aligner_treatment_id === plan.aligner_treatment_id && p.treatment_type !== 'BRACES'
          )
      ) ?? []
  return (
    <div className='w-full min-h-screen flex flex-col gap-4'>
      <TabHeader
        title='Production'
        description='View and manage all production batches for this case.'
      />

      {getAllTreatmentPlanListLoading && !hasTreatmentPlans ? (
        <div className='flex flex-1 items-center justify-center py-16'>
          <Spinner loading />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            {/* icon placeholder */}
            <div className='text-3xl text-gray-400'>🗂️</div>
          </div>
          <div className='text-sm text-gray-500 mb-4 text-center max-w-xl'>
            No production batches have been started yet
          </div>
        </div>
      ) : (
        filteredPlans.map((plan) => (
          <TreatmentPlanSection
            key={plan.aligner_treatment_id}
            plan={plan}
            setIsDisabled={setIsDisabled}
          />
        ))
      )}
    </div>
  )
}

const Production: React.FC = () => {
  return <StandardProduction />
}

export default Production
