import React, {useContext, useEffect, useMemo} from 'react'
import {Select, DatePicker} from 'antd'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import manufacturingConstants from '@constants/manufacturing.constants'
import {
  postCompleteManufacturing,
  postManufacturingDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {getPatientDetails} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import userTypes from '@constants/userTypes'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import Footer from '../components/Footer'
import hasValue from 'utils/hasValue'

interface ProductionDetailsStepProps {
  onFormikReady?: (formik: any) => void
  onNext?: () => void
  patientIdProp?: number
  treatmentPlanProp?: any
  onProductionReady?: () => void
}

const ProductionDetailsStep: React.FC<ProductionDetailsStepProps> = ({
  onFormikReady,
  onNext,
  patientIdProp,
  treatmentPlanProp,
  onProductionReady,
}) => {
  const {userId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {order} = userOrderDetails(true)
  const patientId = patientIdProp || order?.patient_details?.id
  const {treatmentPlan, getTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const planData = treatmentPlanProp || treatmentPlan

  const {manufacturing_details} = planData || {}
  const existingBatch = useMemo(
    () =>
      Array.isArray(manufacturing_details) && manufacturing_details.length > 0
        ? manufacturing_details[0]
        : null,
    [manufacturing_details]
  )
  const isReadOnly = hasValue(existingBatch)

  const {manufacturingData} = useSelector((state: RootState) => state.productionSetup)

  // Calculate aligner counts from treatment plan
  const alignerData = useMemo(() => {
    const upperJaw = planData?.aligner_details_meta_data?.upper_jaw
    const lowerJaw = planData?.aligner_details_meta_data?.lower_jaw

    // Convert to numbers explicitly to handle any type issues
    let upperStart = Number(upperJaw?.starts_with) || 0
    let upperEnd = Number(upperJaw?.ends_with) || 0
    let lowerStart = Number(lowerJaw?.starts_with) || 0
    let lowerEnd = Number(lowerJaw?.ends_with) || 0

    // Fallback: If starts_with/ends_with are not valid numbers, try to get from range array
    if (
      (!upperStart || !upperEnd) &&
      upperJaw?.range &&
      Array.isArray(upperJaw.range) &&
      upperJaw.range.length > 0
    ) {
      upperStart = Math.min(...upperJaw.range)
      upperEnd = Math.max(...upperJaw.range)
    }

    if (
      (!lowerStart || !lowerEnd) &&
      lowerJaw?.range &&
      Array.isArray(lowerJaw.range) &&
      lowerJaw.range.length > 0
    ) {
      lowerStart = Math.min(...lowerJaw.range)
      lowerEnd = Math.max(...lowerJaw.range)
    }

    // Only calculate if we have valid data (both start and end are non-zero)
    const upperCount = upperStart > 0 && upperEnd > 0 ? upperEnd - upperStart + 1 : 0
    const lowerCount = lowerStart > 0 && lowerEnd > 0 ? lowerEnd - lowerStart + 1 : 0
    const totalCount = upperCount + lowerCount

    return {
      upperStart,
      upperEnd,
      lowerStart,
      lowerEnd,
      upperCount,
      lowerCount,
      totalCount,
    }
  }, [planData])

  // Generate dropdown options for aligner selection with jaw labels
  const alignerOptions = useMemo(() => {
    const options = []
    const maxAligner = Math.max(alignerData.upperEnd, alignerData.lowerEnd)

    for (let i = 1; i <= maxAligner; i++) {
      const hasUpper = i >= alignerData.upperStart && i <= alignerData.upperEnd
      const hasLower = i >= alignerData.lowerStart && i <= alignerData.lowerEnd

      let label = ''
      if (hasUpper && hasLower) {
        label = `Upper & Lower ${i}`
      } else if (hasUpper) {
        label = `Upper ${i}`
      } else if (hasLower) {
        label = `Lower ${i}`
      }

      if (label) {
        options.push({value: i.toString(), label})
      }
    }
    return options
  }, [alignerData])

  const computeJawRange = (
    jawStart: number,
    jawEnd: number,
    selectedFrom: number,
    selectedTo: number
  ) => {
    if (!jawStart || !jawEnd || !selectedFrom || !selectedTo) return null
    const start = Math.max(selectedFrom, jawStart)
    const end = Math.min(selectedTo, jawEnd)
    return start <= end ? {start, end} : null
  }

  const formik = useFormik({
    initialValues: {
      fromAligner:
        existingBatch?.upper_aligner_start?.toString() ??
        existingBatch?.lower_aligner_start?.toString() ??
        '',
      toAligner:
        existingBatch?.upper_aligner_end?.toString() ??
        existingBatch?.lower_aligner_end?.toString() ??
        '',
      deliveryDate: existingBatch?.delivered_on ?? null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      fromAligner: Yup.string().required('Required'),
      toAligner: Yup.string().required('Required'),
      deliveryDate: Yup.mixed().required('Required'),
    }),
    onSubmit: async (values) => {
      // Handle submit logic here (e.g., API call)
      const fromAligner = parseInt(values.fromAligner) || 0
      const toAligner = parseInt(values.toAligner) || 0

      // Compute the overlap of the selected range with each jaw so both jaws are captured when the range spans them.
      const upperRange = computeJawRange(
        alignerData.upperStart,
        alignerData.upperEnd,
        fromAligner,
        toAligner
      )

      const lowerRange = computeJawRange(
        alignerData.lowerStart,
        alignerData.lowerEnd,
        fromAligner,
        toAligner
      )

      const upper_aligner_start = upperRange?.start ?? null
      const upper_aligner_end = upperRange?.end ?? null

      const lower_aligner_start = lowerRange?.start ?? null

      const lower_aligner_end = lowerRange?.end ?? null

      const totalAligners =
        (upperRange ? upperRange.end - upperRange.start + 1 : 0) +
        (lowerRange ? lowerRange.end - lowerRange.start + 1 : 0)

      const allBatchesDelivered =
        !!manufacturing_details &&
        manufacturing_details.length > 0 &&
        manufacturing_details.some((item: any) => item.status === manufacturingConstants.DELIVERED)
      const isNextBatch = allBatchesDelivered ? true : false

      const payload = {
        status: manufacturingConstants.DELIVERED,
        patient_id: safeParseInt(patientId),
        upper_aligner_start,
        upper_aligner_end,
        lower_aligner_start,
        lower_aligner_end,
        total_aligners: totalAligners,
        batch_type: manufacturingData.batchType as 'IN_BATCHES' | 'ALL_ALIGNERS',
        treatment_plan_id: planData?.treatment_plan_id,
        instructions: '',
        service_products: '',
        service_id: '',
        outsource_lab_profile_id: '',
        is_next_batch: isNextBatch,
        service_product_id: '',
      }

      dispatchAction(postManufacturingDetails(payload))
        .unwrap()
        .then((res: {id: number}) => {
          const pid = safeParseInt(patientId)
          const manufacturing_id = res.id

          if (!manufacturing_id) {
            // Nothing to do if we can’t identify the batch
            return
          }

          const delivery = dayjs.isDayjs(values.deliveryDate)
            ? values.deliveryDate
            : dayjs(values.deliveryDate)

          const payload = {
            patient_id: safeParseInt(pid),
            delivery_date: delivery.format('YYYY-MM-DD'),
            status: manufacturingConstants.DELIVERED,
            manufacturing_id,
            is_show_mark_as_received: true,
          }

          dispatchAction(postCompleteManufacturing(payload as any))
            .unwrap()
            .finally(() => {
              dispatchAction(getPatientDetails({patientId: safeParseInt(patientId)}))
                .unwrap()
                .then((res: any) => {
                  const postData = {
                    data: {
                      first_name: res.first_name,
                      last_name: res.last_name,
                      email: res.email !== '' ? res.email?.toLocaleLowerCase() : null,
                      mobile: res.mobile !== '' ? res.mobile : null,
                      country_code: res.country_code,
                      practice_location_name:
                        res.practice_location !== '' ? res.practice_location : null,
                      inviter_id: userId,
                      inviter_user_type: userTypes.DOCTOR,
                      customer_mapped_id: res.customer_mapped_id.trim(),
                      age: res.age,
                      gender: res.gender,
                      practice_location_id: null,
                      country: res.country,
                      state: res.state,
                      city: res.city,
                      practice_profile_id: profileId,
                      practice_invite_code: null,
                      current_step: 7,
                      patient_id: patientId,
                    },
                  }
                  dispatchAction(postApiLeadsProfileDetailsUpdate(postData as any))
                    .unwrap()
                    .then(() => {})
                })
              if (onProductionReady) {
                onProductionReady()
              }
              if (onNext) onNext()
            })
        })
    },
  })

  useEffect(() => {
    if (onFormikReady) {
      onFormikReady(formik)
    }
  }, [formik, onFormikReady])

  // Calculate unprocessed aligners based on selected range
  const unprocessedAligners = useMemo(() => {
    const from = parseInt(formik.values.fromAligner) || 0
    const to = parseInt(formik.values.toAligner) || 0

    if (from === 0 || to === 0) {
      return {
        upper: alignerData.upperCount,
        lower: alignerData.lowerCount,
        total: alignerData.totalCount,
      }
    }

    const upperRange = computeJawRange(alignerData.upperStart, alignerData.upperEnd, from, to)
    const lowerRange = computeJawRange(alignerData.lowerStart, alignerData.lowerEnd, from, to)

    const processedUpper = upperRange ? upperRange.end - upperRange.start + 1 : 0
    const processedLower = lowerRange ? lowerRange.end - lowerRange.start + 1 : 0

    const remainingUpper = Math.max(0, alignerData.upperCount - processedUpper)
    const remainingLower = Math.max(0, alignerData.lowerCount - processedLower)

    return {
      upper: remainingUpper,
      lower: remainingLower,
      total: Math.max(0, alignerData.totalCount - (processedUpper + processedLower)),
    }
  }, [formik.values.fromAligner, formik.values.toAligner, alignerData])

  useEffect(() => {
    if (isReadOnly && onProductionReady) {
      onProductionReady()
    }
  }, [isReadOnly, onProductionReady])

  const handleNextClick = () => {
    if (isReadOnly) {
      if (onProductionReady) {
        onProductionReady()
      }
      if (onNext) {
        onNext()
      }
      return
    }

    return formik.submitForm()
  }

  if (getTreatmentPlanLoading) {
    return <div className='flex justify-center items-center p-6'>Loading treatment plan...</div>
  }

  return (
    <div className='w-full md:w-1/2 flex flex-col gap-6 p-4 md:p-6 bg-white'>
      <h2 className='text-lg font-semibold'>Production details</h2>

      {/* Aligner summary */}
      <div className='p-4 rounded-lg border border-[#d9d9d9]'>
        <h3 className='font-semibold mb-2'>Aligner summary</h3>

        <div className='flex flex-col gap-4 md:flex-row md:gap-12'>
          {/* Total */}
          <div className='flex flex-col'>
            <span className='font-medium'>
              Total aligners: <span className='font-normal'>{alignerData.totalCount}</span>
            </span>
          </div>

          {/* Upper */}
          {alignerData.upperCount > 0 && (
            <div className='flex flex-col'>
              <span className='font-medium'>
                Upper jaw: <span className='font-normal'>{alignerData.upperCount}</span>
              </span>
              <span className='text-gray-500 text-sm mt-1'>
                (Aligner {alignerData.upperStart} - {alignerData.upperEnd})
              </span>
            </div>
          )}

          {/* Lower */}
          {alignerData.lowerCount > 0 && (
            <div className='flex flex-col'>
              <span className='font-medium'>
                Lower jaw: <span className='font-normal'>{alignerData.lowerCount}</span>
              </span>
              <span className='text-gray-500 text-sm mt-1'>
                (Aligner {alignerData.lowerStart} - {alignerData.lowerEnd})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Confirm manufactured aligners till date */}
      <div className='p-4 rounded-lg border border-[#d9d9d9]'>
        <h3 className='font-medium mb-4'>Confirm manufactured aligners till date</h3>
        <div className='flex flex-col gap-4 md:flex-row'>
          <div className='flex-1'>
            <label className='block text-base font-medium text-black mb-1'>
              From <span className='text-red'>*</span>
            </label>
            <Select
              className='w-full h-10'
              placeholder='Select'
              options={alignerOptions}
              value={formik.values.fromAligner}
              onChange={(val) => formik.setFieldValue('fromAligner', val)}
              disabled={isReadOnly}
              status={formik.touched.fromAligner && formik.errors.fromAligner ? 'error' : ''}
            />
            {formik.touched.fromAligner && formik.errors.fromAligner && (
              <div className='text-red text-xs mt-1'>{formik.errors.fromAligner}</div>
            )}
          </div>
          <div className='flex-1'>
            <label className='block text-base font-medium text-black mb-1'>
              To <span className='text-red'>*</span>
            </label>
            <Select
              className='w-full  h-10'
              placeholder='Select'
              options={alignerOptions}
              value={formik.values.toAligner}
              onChange={(val) => formik.setFieldValue('toAligner', val)}
              disabled={isReadOnly}
              status={formik.touched.toAligner && formik.errors.toAligner ? 'error' : ''}
            />
            {formik.touched.toAligner && formik.errors.toAligner && (
              <div className='text-red text-xs mt-1'>{formik.errors.toAligner}</div>
            )}
          </div>
        </div>
      </div>

      {/* Unprocessed aligners */}
      <div className='p-4 rounded-lg border border-[#d9d9d9]'>
        <h3 className='font-semibold text-lg mb-2'>Unprocessed aligners</h3>
        {unprocessedAligners.upper > 0 && (
          <div className='flex justify-between items-center py-1'>
            <span className='text-gray-500'>Upper Aligners</span>
            <span className='font-medium'>{unprocessedAligners.upper}</span>
          </div>
        )}
        {unprocessedAligners.lower > 0 && (
          <div className='flex justify-between items-center py-1'>
            <span className='text-gray-500'>Lower Aligners</span>
            <span className='font-medium'>{unprocessedAligners.lower}</span>
          </div>
        )}
        <div className='border-t border-gray-200 my-2'></div>
        <div className='flex justify-between items-center'>
          <span className='font-semibold'>Total</span>
          <span className='font-semibold'>{unprocessedAligners.total}</span>
        </div>
      </div>

      {/* Confirm Delivery */}
      <div className='p-4 rounded-lg border border-[#d9d9d9]'>
        <h3 className='font-semibold text-xl mb-2'>Confirm Delivery</h3>
        <p className='text-gray-500 text-base mb-4'>Confirm the delivery date for this batch.</p>
        <div>
          <label className='block text-base font-medium text-textColor mb-1'>
            Delivered on <span className='text-red'>*</span>
          </label>
          <DatePicker
            className='w-full  h-10'
            placeholder='dd-Mmm-yyyy'
            format='DD-MMM-YYYY'
            value={formik.values.deliveryDate ? dayjs(formik.values.deliveryDate) : null}
            onChange={(date) => formik.setFieldValue('deliveryDate', date)}
            disabled={isReadOnly}
            status={formik.touched.deliveryDate && formik.errors.deliveryDate ? 'error' : ''}
          />
          {formik.touched.deliveryDate && formik.errors.deliveryDate && (
            <div className='text-red text-xs mt-1'>{formik.errors.deliveryDate as string}</div>
          )}
        </div>
      </div>

      <Footer onNext={handleNextClick} showBack={false} disableNext={false} />
    </div>
  )
}

export default ProductionDetailsStep
