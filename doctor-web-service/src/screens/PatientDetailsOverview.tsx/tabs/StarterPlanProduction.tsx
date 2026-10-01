import React, {useContext, useMemo, useEffect, useState} from 'react'
import clsx from 'clsx'
import dayjs, {Dayjs} from 'dayjs'
import * as Yup from 'yup'
import {Formik, Form} from 'formik'
import {useSelector} from 'react-redux'

import FormikSelect from 'components/atom/Inputs/FormikSelect'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'

import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import manufacturingConstants from '@constants/manufacturing.constants'
import {
  postManufacturingDetails,
  postCompleteManufacturing,
  getManufacturingListDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {
  getTreatmentPlan,
  getAllTreatmentPlanList,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams, useNavigate} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'

type ProductionMode = 'BATCH' | 'ALL_AT_ONCE'

type FormValues = {
  production_mode: ProductionMode
  batch_from_stage: string | null
  batch_to_stage: string | null
  delivered_on: Dayjs | string | null
}

type BatchCompletionSectionProps = {
  minUnprocessedStage: number
  maxUnprocessedStage: number
  upperJawRange?: {start: number; end: number}
  lowerJawRange?: {start: number; end: number}
  initialDeliveredOn?: string | null
  onSubmit: (payload: {
    production_mode: ProductionMode
    from_stage: number
    to_stage: number
    delivered_on: string
    upper_aligners: number
    lower_aligners: number
    total_aligners: number
  }) => void | Promise<void>
  onCancel?: () => void
  setIsLoading?: (isLoading: boolean) => void
}

const makeSchema = (minStage: number, maxStage: number) =>
  Yup.object().shape({
    production_mode: Yup.mixed<ProductionMode>().oneOf(['BATCH', 'ALL_AT_ONCE']).required(),
    batch_from_stage: Yup.string()
      .nullable()
      .when('production_mode', {
        is: 'BATCH',
        then: (s) =>
          s.required('This field is required').test('range', 'Invalid stage', (val) => {
            if (!val) return false
            const n = Number(val)
            return !Number.isNaN(n) && n >= minStage && n <= maxStage
          }),
        otherwise: (s) => s.nullable(),
      }),
    batch_to_stage: Yup.string()
      .nullable()
      .when('production_mode', {
        is: 'BATCH',
        then: (s) =>
          s.required('This field is required').test('range', 'Invalid stage', (val) => {
            if (!val) return false
            const n = Number(val)
            return !Number.isNaN(n) && n >= minStage && n <= maxStage
          }),
        otherwise: (s) => s.nullable(),
      }),
    delivered_on: Yup.mixed()
      .required('Delivery date is required')
      .test('valid-date', 'Select a valid date', (val) => {
        if (!val) return false
        if (dayjs.isDayjs(val)) return val.isValid()
        return dayjs(val as any).isValid()
      }),
  })

const BatchCompletionSection: React.FC<BatchCompletionSectionProps> = ({
  minUnprocessedStage,
  maxUnprocessedStage,
  upperJawRange,
  lowerJawRange,
  initialDeliveredOn,
  setIsLoading,
  onSubmit,
  onCancel,
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {patientId, treatmentId} = useParams<{patientId: string; treatmentId: string}>()
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()

  const {allTreatmentPlanList, treatmentPlan} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  useEffect(() => {
    if (!!organizationId && !!userId && !!patientId) {
      dispatchAction(
        getAllTreatmentPlanList({
          doctor_id: userId,
          patient_id: patientId,
          organization_id: safeParseInt(organizationId),
        })
      )
    }
  }, [patientId, userId, organizationId, dispatchAction])

  const selectedPlan = useMemo(() => {
    return allTreatmentPlanList?.find(
      (plan) => plan.aligner_treatment_id === safeParseInt(treatmentId)
    )
  }, [allTreatmentPlanList, treatmentId])

  useEffect(() => {
    if (selectedPlan?.aligner_treatment_id) {
      dispatchAction(
        getTreatmentPlan({
          aligner_treatment_id: String(selectedPlan.aligner_treatment_id),
        })
      )
    }
  }, [dispatchAction, selectedPlan?.aligner_treatment_id])

  const manufacturing_details = treatmentPlan?.manufacturing_details || []

  const unprocessedRanges = useMemo(() => {
    const upperJaw = treatmentPlan?.aligner_details_meta_data?.upper_jaw
    const lowerJaw = treatmentPlan?.aligner_details_meta_data?.lower_jaw

    let upperStart = Number(upperJaw?.starts_with) || 0
    let upperEnd = Number(upperJaw?.ends_with) || 0
    let lowerStart = Number(lowerJaw?.starts_with) || 0
    let lowerEnd = Number(lowerJaw?.ends_with) || 0

    if ((!upperStart || !upperEnd) && upperJaw?.range && Array.isArray(upperJaw.range)) {
      if (upperJaw.range.length > 0) {
        upperStart = Math.min(...upperJaw.range)
        upperEnd = Math.max(...upperJaw.range)
      }
    }
    if ((!lowerStart || !lowerEnd) && lowerJaw?.range && Array.isArray(lowerJaw.range)) {
      if (lowerJaw.range.length > 0) {
        lowerStart = Math.min(...lowerJaw.range)
        lowerEnd = Math.max(...lowerJaw.range)
      }
    }

    let maxDeliveredUpper = 0
    let maxDeliveredLower = 0

    if (manufacturing_details && manufacturing_details.length > 0) {
      manufacturing_details.forEach((batch: any) => {
        if (batch.status === 'DELIVERED') {
          if (batch.upper_aligner_end && Number(batch.upper_aligner_end) > maxDeliveredUpper) {
            maxDeliveredUpper = Number(batch.upper_aligner_end)
          }
          if (batch.lower_aligner_end && Number(batch.lower_aligner_end) > maxDeliveredLower) {
            maxDeliveredLower = Number(batch.lower_aligner_end)
          }
        }
      })
    }

    const unprocessedUpperStart = maxDeliveredUpper > 0 ? maxDeliveredUpper + 1 : upperStart
    const unprocessedUpperEnd = upperEnd
    const unprocessedLowerStart = maxDeliveredLower > 0 ? maxDeliveredLower + 1 : lowerStart
    const unprocessedLowerEnd = lowerEnd

    const upperCount =
      unprocessedUpperStart > 0 &&
      unprocessedUpperEnd > 0 &&
      unprocessedUpperEnd >= unprocessedUpperStart
        ? unprocessedUpperEnd - unprocessedUpperStart + 1
        : 0
    const lowerCount =
      unprocessedLowerStart > 0 &&
      unprocessedLowerEnd > 0 &&
      unprocessedLowerEnd >= unprocessedLowerStart
        ? unprocessedLowerEnd - unprocessedLowerStart + 1
        : 0
    const totalCount = upperCount + lowerCount

    return {
      upperStart: unprocessedUpperStart,
      upperEnd: unprocessedUpperEnd,
      lowerStart: unprocessedLowerStart,
      lowerEnd: unprocessedLowerEnd,
      upperCount,
      lowerCount,
      totalCount,
    }
  }, [treatmentPlan, manufacturing_details])

  const formInitialValues = useMemo<FormValues>(
    () => ({
      production_mode: 'BATCH',
      batch_from_stage: String(minUnprocessedStage),
      batch_to_stage: String(minUnprocessedStage),
      delivered_on: initialDeliveredOn ? dayjs(initialDeliveredOn) : null,
    }),
    [minUnprocessedStage, initialDeliveredOn]
  )

  return (
    <Formik<FormValues>
      initialValues={formInitialValues}
      enableReinitialize
      validationSchema={makeSchema(minUnprocessedStage, maxUnprocessedStage)}
      onSubmit={async (values, {setSubmitting}) => {
        try {
          setSubmitting(true)
          if (setIsLoading) setIsLoading(true)

          const fromStage =
            values.production_mode === 'ALL_AT_ONCE'
              ? minUnprocessedStage
              : Number(values.batch_from_stage)
          const toStage =
            values.production_mode === 'ALL_AT_ONCE'
              ? maxUnprocessedStage
              : Number(values.batch_to_stage)

          const computeJawRange = (jawStart?: number, jawEnd?: number) => {
            if (!jawStart || !jawEnd || jawEnd < jawStart) return {start: null, end: null, count: 0}
            const start = Math.max(fromStage, jawStart)
            const end = Math.min(toStage, jawEnd)
            if (start > end) return {start: null, end: null, count: 0}
            return {start, end, count: end - start + 1}
          }

          const upperRange = computeJawRange(
            unprocessedRanges.upperStart,
            unprocessedRanges.upperEnd
          )
          const lowerRange = computeJawRange(
            unprocessedRanges.lowerStart,
            unprocessedRanges.lowerEnd
          )

          const upperCount = upperRange.count
          const lowerCount = lowerRange.count
          const totalCount = upperCount + lowerCount
          const upper_aligner_start = upperRange.start
          const lower_aligner_start = lowerRange.start
          const upper_aligner_end = upperRange.end
          const lower_aligner_end = lowerRange.end

          const delivery = dayjs.isDayjs(values.delivered_on)
            ? values.delivered_on
            : dayjs(values.delivered_on as any)
          const deliveredDateFormatted = delivery.format('YYYY-MM-DD')

          let serviceProduct = null
          if (manufacturing_details && manufacturing_details.length > 0) {
            const latestDelivered = manufacturing_details.find((b: any) => b.status === 'DELIVERED')
            if (latestDelivered?.service_products) {
              serviceProduct = latestDelivered.service_products
            }
          }

          if (!serviceProduct && treatmentPlan?.production_lab_details) {
            serviceProduct = {
              id: treatmentPlan.production_lab_details.production_lab_id,
              product_type: 'ALIGNER',
              product_name: treatmentPlan.production_lab_details.brand_name || 'Aligner',
              product_category_name: 'Aligners',
              profile_id: treatmentPlan.production_lab_id,
            }
          }

          const existingBatch = manufacturing_details.find((b: any) => {
            const bUpperStart = b.upper_aligner_start ?? null
            const bUpperEnd = b.upper_aligner_end ?? null
            const bLowerStart = b.lower_aligner_start ?? null
            const bLowerEnd = b.lower_aligner_end ?? null

            return (
              bUpperStart === upper_aligner_start &&
              bUpperEnd === upper_aligner_end &&
              bLowerStart === lower_aligner_start &&
              bLowerEnd === lower_aligner_end
            )
          })

          let manufacturing_id: number | null = null

          if (existingBatch) {
            manufacturing_id =
              existingBatch.id || existingBatch.manufacturing_id || existingBatch.manufacturingId
          } else {
            const manufacturingPayload = {
              status: manufacturingConstants.MANUFACTURING_STARTED,
              patient_id: safeParseInt(patientId),
              upper_aligner_start,
              upper_aligner_end,
              lower_aligner_start,
              lower_aligner_end,
              total_aligners: totalCount > 0 ? totalCount : 0,
              batch_type: 'IN_BATCHES',
              treatment_plan_id: selectedPlan?.aligner_treatment_id,
              instructions: '',
              service_products: serviceProduct,
              service_id: serviceProduct?.id || null,
              outsource_lab_profile_id:
                Number(profileId) !== serviceProduct?.profile_id && !!serviceProduct
                  ? serviceProduct.profile_id
                  : null,
              is_next_batch: null,
              service_product_id: serviceProduct?.id || null,
            }

            const res: any = await dispatchAction(
              postManufacturingDetails(manufacturingPayload as any)
            ).unwrap()

            manufacturing_id = res?.id ?? res?.manufacturing_id ?? null
          }

          if (manufacturing_id) {
            const completePayload = {
              patient_id: safeParseInt(patientId),
              delivery_date: deliveredDateFormatted,
              status: manufacturingConstants.DELIVERED,
              manufacturing_id,
              is_show_mark_as_received: true,
            }

            await dispatchAction(postCompleteManufacturing(completePayload as any))
              .unwrap()
              .then(() => {
                return dispatchAction(
                  getManufacturingListDetails({
                    patient_id: safeParseInt(patientId),
                    treatment_plan_id: safeParseInt(selectedPlan?.aligner_treatment_id),
                  })
                ).unwrap()
              })
              .then(() => {
                return onSubmit({
                  production_mode: values.production_mode,
                  from_stage: fromStage,
                  to_stage: toStage,
                  delivered_on: deliveredDateFormatted,
                  upper_aligners: upperCount,
                  lower_aligners: lowerCount,
                  total_aligners: totalCount,
                })
              })
              .then(() => {
                navigate(`${profileBasePath}/${patientId}/production`)
              })
          }
        } catch (error) {
          console.error('Error in batch completion submit:', error)
          setSubmitting(false)
          if (setIsLoading) setIsLoading(false)
        }
      }}
    >
      {(formik) => {
        const {values, setFieldValue, isSubmitting} = formik

        const stageOptions = useMemo(() => {
          const out: {label: string; value: string}[] = []
          if (
            typeof minUnprocessedStage !== 'number' ||
            typeof maxUnprocessedStage !== 'number' ||
            maxUnprocessedStage < minUnprocessedStage
          ) {
            return out
          }

          const upperStart = upperJawRange?.start || 0
          const upperEnd = upperJawRange?.end || 0
          const lowerStart = lowerJawRange?.start || 0
          const lowerEnd = lowerJawRange?.end || 0

          for (let i = minUnprocessedStage; i <= maxUnprocessedStage; i += 1) {
            const hasUpper = i >= upperStart && i <= upperEnd && upperStart > 0
            const hasLower = i >= lowerStart && i <= lowerEnd && lowerStart > 0

            let label = ''
            if (hasUpper && hasLower) {
              label = `Upper & Lower ${i}`
            } else if (hasUpper) {
              label = `Upper ${i}`
            } else if (hasLower) {
              label = `Lower ${i}`
            } else {
              label = String(i)
            }

            out.push({label, value: String(i)})
          }
          return out
        }, [minUnprocessedStage, maxUnprocessedStage, upperJawRange, lowerJawRange])

        const handleModeChange = (mode: ProductionMode) => {
          if (isSubmitting) return

          setFieldValue('production_mode', mode)
          if (mode === 'ALL_AT_ONCE') {
            setFieldValue('batch_from_stage', String(minUnprocessedStage))
            setFieldValue('batch_to_stage', String(maxUnprocessedStage))
          } else {
            setFieldValue('batch_from_stage', String(minUnprocessedStage))
            if (!values.batch_to_stage) {
              setFieldValue('batch_to_stage', String(minUnprocessedStage))
            }
          }
        }

        const isBatchMode = values.production_mode === 'BATCH'

        const from = Number(values.batch_from_stage)
        const to = Number(values.batch_to_stage)
        const validRange =
          !Number.isNaN(from) &&
          !Number.isNaN(to) &&
          to >= from &&
          from >= minUnprocessedStage &&
          to <= maxUnprocessedStage

        const upperStart = upperJawRange?.start || 0
        const upperEnd = upperJawRange?.end || 0
        const uStart = Math.max(from, upperStart)
        const uEnd = Math.min(to, upperEnd)
        const upperCount =
          validRange && uStart <= uEnd && upperStart > 0 && upperEnd > 0 ? uEnd - uStart + 1 : 0

        const lowerStart = lowerJawRange?.start || 0
        const lowerEnd = lowerJawRange?.end || 0
        const lStart = Math.max(from, lowerStart)
        const lEnd = Math.min(to, lowerEnd)
        const lowerCount =
          validRange && lStart <= lEnd && lowerStart > 0 && lowerEnd > 0 ? lEnd - lStart + 1 : 0

        const totalCount = upperCount + lowerCount

        return (
          <Form className='flex flex-col gap-6 max-w-3xl'>
            <h2 className='text-xl font-semibold'>Batch completion</h2>

            <div
              className={clsx(
                'rounded-xl border p-5 transition-colors',
                isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                isBatchMode
                  ? 'border-primaryColor bg-primarySupport/10'
                  : 'border-lighterGray bg-white'
              )}
              onClick={() => !isSubmitting && handleModeChange('BATCH')}
            >
              <div className='flex items-start gap-3'>
                <button
                  type='button'
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleModeChange('BATCH')
                  }}
                  className={clsx(
                    'mt-1 h-4 w-4 rounded-full border flex items-center justify-center',
                    isBatchMode ? 'border-primaryColor' : 'border-mediumGray',
                    isSubmitting && 'cursor-not-allowed'
                  )}
                >
                  {isBatchMode && <span className='h-2 w-2 rounded-full bg-primaryColor' />}
                </button>

                <div className='flex-1'>
                  <div className='text-sm font-semibold'>Produce in Batches</div>
                  <div className='text-sm text-textColor mt-1'>
                    Split aligners into multiple production jobs (e.g., Stage 1–10, Stage 11–20).
                  </div>

                  <div className='mt-4 grid grid-cols-2 gap-4'>
                    <div>
                      <FormikSelect
                        name='batch_from_stage'
                        label='From'
                        required={isBatchMode}
                        disabled={!isBatchMode || stageOptions.length === 0 || isSubmitting}
                        options={stageOptions}
                        placeholder={stageOptions.length ? 'Select stage' : 'No unprocessed stages'}
                      />
                    </div>
                    <div>
                      <FormikSelect
                        name='batch_to_stage'
                        label='To'
                        required={isBatchMode}
                        disabled={!isBatchMode || stageOptions.length === 0 || isSubmitting}
                        options={stageOptions}
                        placeholder={stageOptions.length ? 'Select stage' : 'No unprocessed stages'}
                      />
                    </div>
                  </div>

                  <div className='mt-6 border-t border-lighterGray pt-4 text-sm'>
                    {upperJawRange?.end && upperJawRange.end > 0 ? (
                      <div className='flex justify-between py-1'>
                        <span>Upper Aligners</span>
                        <span>{upperCount}</span>
                      </div>
                    ) : null}
                    {lowerJawRange?.end && lowerJawRange.end > 0 ? (
                      <div className='flex justify-between py-1'>
                        <span>Lower Aligners</span>
                        <span>{lowerCount}</span>
                      </div>
                    ) : null}
                    <div className='flex justify-between py-1 font-semibold'>
                      <span>Total</span>
                      <span>{totalCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={clsx(
                'rounded-xl border p-5 transition-colors',
                isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                !isBatchMode
                  ? 'border-primaryColor bg-primarySupport/10'
                  : 'border-lighterGray bg-white'
              )}
              onClick={() => !isSubmitting && handleModeChange('ALL_AT_ONCE')}
            >
              <div className='flex items-start gap-3'>
                <button
                  type='button'
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleModeChange('ALL_AT_ONCE')
                  }}
                  className={clsx(
                    'mt-1 h-4 w-4 rounded-full border flex items-center justify-center',
                    !isBatchMode ? 'border-primaryColor' : 'border-mediumGray',
                    isSubmitting && 'cursor-not-allowed'
                  )}
                >
                  {!isBatchMode && <span className='h-2 w-2 rounded-full bg-primaryColor' />}
                </button>

                <div className='flex-1'>
                  <div className='text-sm font-semibold'>Produce All at Once</div>
                  <div className='text-sm text-textColor mt-1'>
                    Generate the complete set of aligners and templates in one production job.
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-2'>
              <h3 className='text-base font-semibold mb-1'>Confirm Delivery</h3>
              <p className='text-sm text-textColor mb-4'>
                Confirm the delivery date for this batch.
              </p>

              <FormikDatePicker
                name='delivered_on'
                label='Delivered on'
                required
                disabled={isSubmitting}
                placeholder='dd-Mmm-yyyy'
                format='DD-MMM-YYYY'
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </div>

            <div className='flex justify-end gap-3 pt-4'>
              <button
                type='button'
                onClick={() => (onCancel ? onCancel() : navigate(-1))}
                disabled={isSubmitting}
                className={clsx(
                  'h-11 px-5 rounded-lg border border-lightGray text-sm font-semibold text-textColor bg-white hover:bg-[#F8F8F8]',
                  isSubmitting && 'opacity-60 cursor-not-allowed hover:bg-white'
                )}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className={clsx(
                  'h-11 px-6 rounded-lg text-sm font-semibold text-white bg-primaryColor',
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primaryColor/90'
                )}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

const StarterPlanProduction: React.FC = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId, organizationId} = useContext(AuthContext)
  const {patientId, treatmentId} = useParams<{patientId: string; treatmentId: string}>()
  const [, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {allTreatmentPlanList, treatmentPlan} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  useEffect(() => {
    if (!!organizationId && !!userId && !!patientId) {
      dispatchAction(
        getAllTreatmentPlanList({
          doctor_id: userId,
          patient_id: patientId,
          organization_id: safeParseInt(organizationId),
        })
      )
    }
  }, [patientId, userId, organizationId, dispatchAction])

  const selectedPlan = useMemo(() => {
    return allTreatmentPlanList?.find(
      (plan) => plan.aligner_treatment_id === safeParseInt(treatmentId)
    )
  }, [allTreatmentPlanList, treatmentId])

  useEffect(() => {
    if (selectedPlan?.aligner_treatment_id) {
      dispatchAction(
        getTreatmentPlan({
          aligner_treatment_id: String(selectedPlan.aligner_treatment_id),
        })
      )
    }
  }, [dispatchAction, selectedPlan?.aligner_treatment_id])

  const manufacturing_details = treatmentPlan?.manufacturing_details || []

  const {minUnprocessed, maxUnprocessed, upperJawRange, lowerJawRange} = useMemo(() => {
    const upperJaw = treatmentPlan?.aligner_details_meta_data?.upper_jaw
    const lowerJaw = treatmentPlan?.aligner_details_meta_data?.lower_jaw

    let upperStart = Number(upperJaw?.starts_with) || 0
    let upperEnd = Number(upperJaw?.ends_with) || 0
    let lowerStart = Number(lowerJaw?.starts_with) || 0
    let lowerEnd = Number(lowerJaw?.ends_with) || 0

    if ((!upperStart || !upperEnd) && upperJaw?.range && Array.isArray(upperJaw.range)) {
      if (upperJaw.range.length > 0) {
        upperStart = Math.min(...upperJaw.range)
        upperEnd = Math.max(...upperJaw.range)
      }
    }
    if ((!lowerStart || !lowerEnd) && lowerJaw?.range && Array.isArray(lowerJaw.range)) {
      if (lowerJaw.range.length > 0) {
        lowerStart = Math.min(...lowerJaw.range)
        lowerEnd = Math.max(...lowerJaw.range)
      }
    }

    let maxDeliveredUpper = 0
    let maxDeliveredLower = 0

    if (manufacturing_details && manufacturing_details.length > 0) {
      manufacturing_details.forEach((batch: any) => {
        if (batch.status === 'DELIVERED') {
          if (batch.upper_aligner_end && Number(batch.upper_aligner_end) > maxDeliveredUpper) {
            maxDeliveredUpper = Number(batch.upper_aligner_end)
          }
          if (batch.lower_aligner_end && Number(batch.lower_aligner_end) > maxDeliveredLower) {
            maxDeliveredLower = Number(batch.lower_aligner_end)
          }
        }
      })
    }

    const upperUnprocessedStart = maxDeliveredUpper > 0 ? maxDeliveredUpper + 1 : upperStart
    const lowerUnprocessedStart = maxDeliveredLower > 0 ? maxDeliveredLower + 1 : lowerStart

    const minUnprocessed = Math.min(
      upperUnprocessedStart > 0 && upperUnprocessedStart <= upperEnd
        ? upperUnprocessedStart
        : Infinity,
      lowerUnprocessedStart > 0 && lowerUnprocessedStart <= lowerEnd
        ? lowerUnprocessedStart
        : Infinity
    )
    const maxUnprocessed = Math.max(upperEnd, lowerEnd)

    return {
      minUnprocessed: minUnprocessed === Infinity ? 0 : minUnprocessed,
      maxUnprocessed,
      upperJawRange: {
        start: upperUnprocessedStart,
        end: upperEnd,
      },
      lowerJawRange: {
        start: lowerUnprocessedStart,
        end: lowerEnd,
      },
    }
  }, [treatmentPlan, manufacturing_details])

  if (!treatmentPlan || !selectedPlan) {
    return <div className='p-6'>Loading...</div>
  }

  if (minUnprocessed === 0 || maxUnprocessed === 0) {
    return (
      <div className='p-6'>
        <p>No unprocessed aligners found.</p>
      </div>
    )
  }

  return (
    <div className='p-6 pb-28 md:pb-6'>
      <BatchCompletionSection
        minUnprocessedStage={minUnprocessed}
        maxUnprocessedStage={maxUnprocessed}
        upperJawRange={upperJawRange}
        lowerJawRange={lowerJawRange}
        setIsLoading={setIsLoading}
        onSubmit={() => {}}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}

export default StarterPlanProduction
