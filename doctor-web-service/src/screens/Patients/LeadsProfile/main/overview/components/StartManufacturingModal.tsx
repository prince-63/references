import {Divider, Modal} from 'antd'
import clsx from 'clsx'
import {Formik, Form} from 'formik'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {generateAlignerOptions, safeParseInt} from 'utils/ConstFunctions'
import * as Yup from 'yup'
import FormikSelect from 'components/atom/Inputs/FormikSelect'
import getColorPalette from 'utils/getColorPalette'
import InfoIcon from 'assets/icons/InfoIcon'
import RadioIcon from 'assets/icons/InfoIcon copy'
import {ReactNode, useCallback, useEffect, useMemo, useState, useRef} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getManufacturingListDetails,
  postManufacturingDetails,
  putManufacturingDetails,
  setOpenModalManufacturing,
  UpdateManufacturingBatchRequest,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useManufacturingDetails} from '../hooks/useManufacturingDetails'
import manufacturingConstants from '@constants/manufacturing.constants'
import {useParams} from 'react-router-dom'
import When from 'components/when/When'

// Types
interface AlignerStage {
  label: string
  value: number
}

export interface AlignerRangeDetails {
  upper_aligner_start: number
  upper_aligner_end: number
  lower_aligner_start: number
  lower_aligner_end: number
  total_aligners: number
}

export type DeliveryType = 'ALL_ALIGNERS' | 'IN_BATCHES'

type ManufacturingFormValues = {
  fromStage: string | number
  toStage: string | number
}

interface StartManufacturingModalProps {
  openModal: boolean
  treatment_plan_id: number | null | undefined
  refreshData: () => void
  status?: string
}

// Validation schema factory - memoized to prevent recreation
const createValidationSchema = (isAllAligners: boolean) => {
  return Yup.object({
    fromStage: isAllAligners
      ? Yup.mixed().notRequired()
      : Yup.string().required('From stage is required'),
    toStage: isAllAligners
      ? Yup.mixed().notRequired()
      : Yup.string().required('To stage is required'),
  })
}

// Utility functions moved outside component to prevent recreation
export const getAlignerRangeDetails = (
  fromStage?: AlignerStage,
  toStage?: AlignerStage,
  alignerList?: AlignerStage[]
): AlignerRangeDetails => {
  const from = fromStage?.value ?? 0
  const to = toStage?.value ?? 0

  if (!alignerList || !from || !to || from > to) {
    return {
      upper_aligner_start: 0,
      upper_aligner_end: 0,
      lower_aligner_start: 0,
      lower_aligner_end: 0,
      total_aligners: 0,
    }
  }

  const range = alignerList.filter((s) => s.value >= from && s.value <= to)

  let upper_start = 0
  let upper_end = 0
  let lower_start = 0
  let lower_end = 0

  for (const stage of range) {
    const label = stage.label.toLowerCase()
    const val = stage.value

    if (label.includes('upper')) {
      if (upper_start === 0) upper_start = val
      upper_end = val
    }

    if (label.includes('lower')) {
      if (lower_start === 0) lower_start = val
      lower_end = val
    }
  }

  const upper_total = upper_end !== 0 && upper_end >= upper_start ? upper_end + 1 - upper_start : 0
  const lower_total = lower_end !== 0 && lower_end >= lower_start ? lower_end + 1 - lower_start : 0

  return {
    upper_aligner_start: upper_start,
    upper_aligner_end: upper_end,
    lower_aligner_start: lower_start,
    lower_aligner_end: lower_end,
    total_aligners: upper_total + lower_total,
  }
}

const getStageFromAlignerValues = (
  lower: number,
  upper: number,
  alignerList: AlignerStage[]
): AlignerStage => {
  let label = ''

  if (upper && lower) {
    label = upper === lower ? `${upper} Upper & Lower` : `${upper} Upper & ${lower} Lower`
  } else if (upper) {
    label = `${upper} Upper`
  } else if (lower) {
    label = `${lower} Lower`
  }

  const match = alignerList.find((opt) => opt.label === label)
  return match ?? {label, value: upper || lower}
}

const StartManufacturingModal = ({
  openModal,
  treatment_plan_id,
  refreshData,
  status,
}: StartManufacturingModalProps) => {
  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const {order} = useSelector((state: RootState) => state.orders)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {latest_manufacturing_data, unprocessed, alignerListForUpdate} = useManufacturingDetails({
    treatment_plan_id: treatment_plan_id ?? undefined,
    // Don't auto-fetch on mount for every rendered modal instance.
    // We'll fetch lazily when the modal opens and only if data is missing.
    getFreshData: false,
  })
  // Prevent repeated fallback fetches
  const attemptedFetchRef = useRef(false)

  // Memoize aligner list to prevent recalculation
  const alignerList = useMemo(() => {
    const isManufacturingStarted =
      latest_manufacturing_data?.status === 'MANUFACTURING_STARTED' &&
      latest_manufacturing_data?.manufacturing_batch_id

    const source = isManufacturingStarted ? alignerListForUpdate : unprocessed

    return generateAlignerOptions(
      source?.lowerJaw?.start,
      source?.lowerJaw?.end,
      source?.upperJaw?.start,
      source?.upperJaw?.end
    )
  }, [latest_manufacturing_data, alignerListForUpdate, unprocessed])

  const [delivery, setDelivery] = useState<DeliveryType>(
    () =>
      (gettingStartedStepData?.in_manufacturing?.delivery_preference ||
        order?.delivery_preference) ??
      'ALL_ALIGNERS'
  )

  const [definedSeries, setDefinedSeries] = useState<AlignerRangeDetails>({
    lower_aligner_end: 0,
    lower_aligner_start: 0,
    upper_aligner_end: 0,
    upper_aligner_start: 0,
    total_aligners: 0,
  })

  // Memoize validation schema
  const validationSchema = useMemo(
    () => createValidationSchema(delivery === 'ALL_ALIGNERS'),
    [delivery]
  )

  // Memoize initial values calculation
  const initialValues = useMemo(() => {
    if (latest_manufacturing_data?.status === 'MANUFACTURING_STARTED') {
      const lower_start = latest_manufacturing_data.lower_aligner_start ?? 0
      const lower_end = latest_manufacturing_data.lower_aligner_end ?? 0
      const upper_end = latest_manufacturing_data.upper_aligner_end ?? 0
      const upper_start = latest_manufacturing_data.upper_aligner_start ?? 0

      const fromStage = getStageFromAlignerValues(lower_start, upper_start, alignerList)
      const toStage = getStageFromAlignerValues(lower_end, upper_end, alignerList)

      return {
        fromStage: fromStage.value,
        toStage: toStage.value,
      }
    }

    return {
      fromStage: alignerList[0]?.value || 0,
      toStage: 0,
    }
  }, [latest_manufacturing_data, alignerList])

  // Memoize totals calculation
  const {lowerTotal, upperTotal} = useMemo(() => {
    const lower =
      definedSeries.lower_aligner_end !== 0 &&
      definedSeries.lower_aligner_end >= definedSeries.lower_aligner_start
        ? definedSeries.lower_aligner_end + 1 - definedSeries.lower_aligner_start
        : 0

    const upper =
      definedSeries.upper_aligner_end !== 0 &&
      definedSeries.upper_aligner_end >= definedSeries.upper_aligner_start
        ? definedSeries.upper_aligner_end + 1 - definedSeries.upper_aligner_start
        : 0

    return {lowerTotal: lower, upperTotal: upper}
  }, [definedSeries])

  // Memoize color palette
  const colorPalette = useMemo(() => getColorPalette(), [])

  // Reset state when modal closes
  useEffect(() => {
    if (!openModal) {
      setDefinedSeries({
        lower_aligner_end: 0,
        lower_aligner_start: 0,
        upper_aligner_end: 0,
        upper_aligner_start: 0,
        total_aligners: 0,
      })
      attemptedFetchRef.current = false
    }
  }, [openModal])

  // Memoized handlers
  const handleCancel = useCallback(() => {
    dispatchAction(setOpenModalManufacturing(false))
  }, [dispatchAction])

  const handleDeliveryChange = useCallback((val: DeliveryType) => {
    setDelivery(val)
  }, [])

  // Note: intentionally removed eager fetch on mount to avoid
  // duplicate requests from multiple hidden modal instances.

  // Fallback: if modal opens and aligner list is empty, fetch manufacturing list once
  useEffect(() => {
    if (
      openModal &&
      !attemptedFetchRef.current &&
      (alignerList === undefined || alignerList.length === 0) &&
      treatment_plan_id
    ) {
      attemptedFetchRef.current = true
      dispatchAction(
        getManufacturingListDetails({
          patient_id: safeParseInt(patientId),
          treatment_plan_id: safeParseInt(treatment_plan_id),
        })
      )
    }
  }, [openModal, alignerList, treatment_plan_id, patientId, dispatchAction])

  const updateManufacturing = useCallback(
    async (values: ManufacturingFormValues) => {
      try {
        if (!latest_manufacturing_data?.manufacturing_batch_id) return

        const fromStage = alignerList[0]
        const toStage =
          delivery === 'ALL_ALIGNERS'
            ? alignerList[alignerList.length - 1]
            : alignerList.find((stage) => stage.value === values.toStage)

        const rangeDetails = getAlignerRangeDetails(fromStage, toStage, alignerList)

        const payload: UpdateManufacturingBatchRequest = {
          manufacturing_id: latest_manufacturing_data.manufacturing_batch_id,
          status: manufacturingConstants.MANUFACTURING_STARTED,
          upper_aligner_start: rangeDetails.upper_aligner_start || null,
          upper_aligner_end: rangeDetails.upper_aligner_end || null,
          lower_aligner_start: rangeDetails.lower_aligner_start || null,
          lower_aligner_end: rangeDetails.lower_aligner_end || null,
          total_aligners: rangeDetails.total_aligners || 0,
          is_aligners_updated: true,
          batch_type:
            toStage?.value === alignerList[alignerList?.length - 1]?.value
              ? 'ALL_ALIGNERS'
              : delivery,
        }

        await dispatchAction(putManufacturingDetails(payload)).unwrap()
        dispatchAction(setOpenModalManufacturing(false))
        refreshData()
      } catch (error) {
        console.error('Failed to update manufacturing batch:', error)
      }
    },
    [latest_manufacturing_data, alignerList, delivery, dispatchAction, refreshData]
  )

  const createManufacturing = useCallback(
    async (values: ManufacturingFormValues, resetForm: () => void) => {
      if (!treatment_plan_id) return

      const fromStage = alignerList[0]
      const toStage =
        delivery === 'ALL_ALIGNERS'
          ? alignerList[alignerList.length - 1]
          : alignerList.find((stage) => stage.value === values.toStage)

      const rangeDetails = getAlignerRangeDetails(fromStage, toStage, alignerList)

      const payload = {
        status: 'MANUFACTURING_STARTED',
        patient_id: safeParseInt(patientId),
        upper_aligner_start: rangeDetails.upper_aligner_start || null,
        upper_aligner_end: rangeDetails.upper_aligner_end || null,
        lower_aligner_start: rangeDetails.lower_aligner_start || null,
        lower_aligner_end: rangeDetails.lower_aligner_end || null,
        total_aligners: rangeDetails.total_aligners,
        batch_type:
          toStage?.value === alignerList[alignerList?.length - 1]?.value
            ? 'ALL_ALIGNERS'
            : delivery,
        treatment_plan_id,
      }

      try {
        await dispatchAction(postManufacturingDetails(payload)).unwrap()
        resetForm()
        dispatchAction(setOpenModalManufacturing(false))
        refreshData()
      } catch (error) {
        console.error('Failed to create manufacturing batch:', error)
      }
    },
    [treatment_plan_id, alignerList, delivery, patientId, dispatchAction, refreshData]
  )

  return (
    <Formik<ManufacturingFormValues>
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, {resetForm}) => {
        if (status === manufacturingConstants.MANUFACTURING_STARTED) {
          await updateManufacturing(values)
        } else {
          await createManufacturing(values, resetForm)
        }
      }}
    >
      {(formik) => {
        // Effect to update defined series when values change
        useEffect(() => {
          if (!formik.values.toStage || !openModal) return

          const fromStage = alignerList[0]
          const toStage =
            delivery === 'ALL_ALIGNERS'
              ? alignerList[alignerList.length - 1]
              : alignerList.find((stage) => stage.value === formik.values.toStage)

          const alignerSet = getAlignerRangeDetails(fromStage, toStage, alignerList)
          setDefinedSeries(alignerSet)
        }, [delivery, formik.values.toStage, alignerList, openModal])

        return (
          <Modal
            closable={false}
            forceRender={true}
            destroyOnClose={true}
            open={openModal}
            className='md:w-[566px] w-full'
            maskClosable={false}
            getContainer={false}
            key={openModal ? 'visible' : 'hidden'}
            width={566}
            footer={
              <div className='flex gap-2 px-5 pb-5'>
                <button
                  className='w-full text-primaryColor border border-primaryColor py-3 px-6 rounded-lg'
                  type='button'
                  onClick={() => {
                    formik.resetForm()
                    handleCancel()
                  }}
                >
                  Cancel
                </button>
                <AntdButton
                  className='w-full text-white !bg-primaryColor h-12 rounded-lg'
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                  text='Confirm'
                  htmlType='submit'
                  onClick={() => formik.handleSubmit()}
                />
              </div>
            }
          >
            <Form>
              <div className='flex flex-col gap-4 p-5'>
                <div>
                  <div className='md:text-2xl text-xl font-semibold'>Start manufacturing</div>
                  <div className='text-base text-textColor'>
                    Define aligners to start manufacturing.
                  </div>
                </div>

                <div className='flex items-center border border-secondaryColor rounded-lg p-2 bg-secondarySupport !gap-2 text-black text-sm font-medium'>
                  <InfoIcon color={colorPalette.secondaryColor} />
                  <div>
                    Submitted selection: {delivery === 'IN_BATCHES' ? 'In Batches' : 'All aligners'}
                  </div>
                </div>

                <SelectBatch
                  title='Define series'
                  subtitle='Manually issued to patient for each batch.'
                  value='IN_BATCHES'
                  selected={delivery === 'IN_BATCHES'}
                  onSelect={handleDeliveryChange}
                >
                  <div className='flex flex-col gap-4'>
                    <Divider className='p-0 m-0' />
                    <div>
                      <div className='text-textColor font-medium text-base mb-2'>Stages</div>
                      <div className='flex gap-2'>
                        <FormikSelect
                          name='fromStage'
                          label='From'
                          placeholder='From'
                          options={alignerList}
                          disabled
                          isReturnObject={false}
                          value={formik.values.fromStage}
                        />
                        <FormikSelect
                          name='toStage'
                          label='To'
                          placeholder='To'
                          options={alignerList}
                          isReturnObject={false}
                          value={formik.values.toStage}
                        />
                      </div>
                    </div>
                    <Divider className='p-0 m-0' />
                    <AlignerSummary
                      upperTotal={upperTotal}
                      lowerTotal={lowerTotal}
                      definedSeries={definedSeries}
                    />
                  </div>
                </SelectBatch>

                <SelectBatch
                  title='Send All Aligners'
                  subtitle='All aligners delivered at once.'
                  value='ALL_ALIGNERS'
                  selected={delivery === 'ALL_ALIGNERS'}
                  onSelect={handleDeliveryChange}
                />
              </div>
            </Form>
          </Modal>
        )
      }}
    </Formik>
  )
}

// Extracted components for better modularity
export const SelectBatch = ({
  title,
  subtitle,
  value,
  selected,
  onSelect,
  children,
}: {
  title: string
  subtitle: string
  value: DeliveryType
  selected: boolean
  onSelect: (val: DeliveryType) => void
  children?: ReactNode
}) => {
  const handleClick = useCallback(() => {
    onSelect(value)
  }, [onSelect, value])

  return (
    <button
      type='button'
      className={clsx(
        'w-full p-4 border rounded-lg text-left',
        selected ? 'border-primaryColor' : 'border-mediumGray'
      )}
      onClick={handleClick}
    >
      <div className='flex gap-2 items-start'>
        <div>
          {selected ? (
            <RadioIcon />
          ) : (
            <div className='w-6 h-6 rounded-full border border-mediumGray' />
          )}
        </div>
        <div>
          <div className='font-medium'>{title}</div>
          <div className='text-textColor font-normal'>{subtitle}</div>
        </div>
      </div>
      {selected && children && <div className='mt-4'>{children}</div>}
    </button>
  )
}

export const AlignerSummary = ({
  upperTotal,
  lowerTotal,
  definedSeries,
}: {
  upperTotal: number
  lowerTotal: number
  definedSeries: AlignerRangeDetails
}) => (
  <div className='flex flex-col gap-2'>
    <When isTrue={upperTotal != 0}>
      <div className='flex justify-between items-center'>
        <div className='text-textColor font-normal'>Upper Aligners</div>
        <div className='font-normal'>
          {upperTotal} (Aligner {definedSeries.upper_aligner_start}-
          {definedSeries.upper_aligner_end})
        </div>
      </div>
    </When>

    <When isTrue={lowerTotal != 0}>
      <div className='flex justify-between items-center'>
        <div className='text-textColor font-normal'>Lower Aligners</div>
        <div className='font-normal'>
          {lowerTotal} (Aligner {definedSeries.lower_aligner_start}-
          {definedSeries.lower_aligner_end})
        </div>
      </div>
    </When>

    <Divider className='m-0' />
    <div className='flex justify-between items-center'>
      <div className='font-semibold text-textColor'>Total Aligners</div>
      <div className='font-semibold'>
        {upperTotal + lowerTotal}{' '}
        {(() => {
          const hasUpper =
            definedSeries.upper_aligner_start !== 0 || definedSeries.upper_aligner_end !== 0
          const hasLower =
            definedSeries.lower_aligner_start !== 0 || definedSeries.lower_aligner_end !== 0

          if (!hasUpper && !hasLower) return null

          return (
            <>
              {' ('}
              {hasUpper && (
                <>
                  U {definedSeries.upper_aligner_start}-{definedSeries.upper_aligner_end}
                </>
              )}
              {hasUpper && hasLower && ', '}
              {hasLower && (
                <>
                  L {definedSeries.lower_aligner_start}-{definedSeries.lower_aligner_end}
                </>
              )}
              {')'}
            </>
          )
        })()}
      </div>
    </div>
  </div>
)

export default StartManufacturingModal
