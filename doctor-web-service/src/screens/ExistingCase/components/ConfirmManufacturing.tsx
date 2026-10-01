import CardHeading from './CardHeading'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import {FormikProps} from 'formik'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {arrayOfAligners} from 'utils/ConstFunctions'
import {ManufacturingFormValues} from '../steps/ManufacturingStep'
import {useEffect} from 'react'
import When from 'components/when/When'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setManufacturingFromStage,
  setManufacturingToStage,
} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'

const ConfirmManufacturing = ({formik}: {formik: FormikProps<ManufacturingFormValues>}) => {
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {dispatchAction} = useDispatchAction()
  const alignerList = arrayOfAligners(treatmentPlan?.aligner_details_meta_data) || []
  const firstAligner = alignerList.length > 0 ? alignerList[0] : null

  const getAlignerCountsInRange = (from: number | null, to: number | null) => {
    if (!from || !to || from > to) return {upper: 0, lower: 0, total: 0}

    const inRange = alignerList.filter(
      (a) => a?.value && a?.label && a.value >= from && a.value <= to
    )

    let upper = 0
    let lower = 0

    inRange.forEach((aligner) => {
      const label = aligner.label.toLowerCase()
      if (label.includes('upper')) upper++
      if (label.includes('lower')) lower++
    })

    return {
      upper,
      lower,
      total: upper + lower,
    }
  }

  const rawFrom = formik.values.fromStage
  const rawTo = formik.values.toStage

  const fromStage = rawFrom === 0 ? null : rawFrom
  const toStage = rawTo === 0 ? null : rawTo

  useEffect(() => {
    if (!fromStage || !toStage || fromStage > toStage) return

    const inRange = alignerList.filter(
      (a) => a?.value && a?.label && a.value >= fromStage && a.value <= toStage
    )

    const upperValues = inRange
      .filter((a) => a.label.toLowerCase().includes('upper'))
      .map((a) => a.value)
    const lowerValues = inRange
      .filter((a) => a.label.toLowerCase().includes('lower'))
      .map((a) => a.value)

    const upperAlignerStart = upperValues.length > 0 ? Math.min(...upperValues) : null
    const upperAlignerEnd = upperValues.length > 0 ? Math.max(...upperValues) : null
    const lowerAlignerStart = lowerValues.length > 0 ? Math.min(...lowerValues) : null
    const lowerAlignerEnd = lowerValues.length > 0 ? Math.max(...lowerValues) : null

    // Set in Formik state
    formik.setFieldValue('upperAlignerStart', upperAlignerStart)
    formik.setFieldValue('upperAlignerEnd', upperAlignerEnd)
    formik.setFieldValue('lowerAlignerStart', lowerAlignerStart)
    formik.setFieldValue('lowerAlignerEnd', lowerAlignerEnd)
  }, [toStage])

  const {upper, lower, total} = getAlignerCountsInRange(fromStage, toStage)

  if (alignerList.length === 0) {
    return <div className='p-4'>No aligner data available</div>
  }

  useEffect(() => {
    dispatchAction(setManufacturingFromStage(fromStage))
    dispatchAction(setManufacturingToStage(toStage))
  }, [toStage, fromStage])

  return (
    <div>
      <div className='flex flex-col p-4 rounded-t-lg border-b-0 border border-mediumGray'>
        <div className='flex flex-col gap-3'>
          <CardHeading text='Confirm Manufactured aligners till date' />
          <div className='flex flex-col md:flex-row gap-3'>
            <FormikSelectList
              name='fromStage'
              label='From'
              items={firstAligner ? [firstAligner] : []}
              required
              aria-required
              showSearch={false}
            />
            <FormikSelectList
              name='toStage'
              label='To'
              items={alignerList}
              required
              showSearch={false}
            />
          </div>
        </div>
      </div>

      <div className='flex flex-col p-4 border rounded-b-lg border-mediumGray'>
        {total > 0 && (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <When isTrue={upper > 0}>
                <div className='flex justify-between'>
                  <span className='text-base text-textColor'>Upper Aligners</span>
                  <div className='flex gap-1'>
                    <span className='text-base'>{upper}</span>
                    <span className='text-base'>
                      {formik.values.upperAlignerStart && formik.values.upperAlignerEnd
                        ? `(Aligner ${formik.values.upperAlignerStart}-${formik.values.upperAlignerEnd})`
                        : null}
                    </span>
                  </div>
                </div>
              </When>

              <When isTrue={lower > 0}>
                <div className='flex justify-between'>
                  <span className='text-base text-textColor'>Lower Aligners</span>
                  <div className='flex gap-1'>
                    <span className='text-base'>{lower}</span>
                    <span className='text-base'>
                      {formik.values.lowerAlignerStart && formik.values.lowerAlignerEnd
                        ? `(Aligner ${formik.values.lowerAlignerStart}-${formik.values.lowerAlignerEnd})`
                        : null}
                    </span>
                  </div>
                </div>
              </When>
            </div>

            <div className='flex justify-between border-t pt-2 border-mediumGray'>
              <span className='text-base font-bold text-textColor'>Total</span>
              <div className='flex gap-1'>
                <span className='text-base'>{total}</span>
                <span className='text-base'>
                  {(formik.values.upperAlignerStart && formik.values.upperAlignerEnd) ||
                  (formik.values.lowerAlignerStart && formik.values.lowerAlignerEnd) ? (
                    <span className='text-base'>
                      (
                      {formik.values.upperAlignerStart && formik.values.upperAlignerEnd
                        ? `U ${formik.values.upperAlignerStart}-${formik.values.upperAlignerEnd}`
                        : ''}
                      {formik.values.upperAlignerStart &&
                      formik.values.upperAlignerEnd &&
                      formik.values.lowerAlignerStart &&
                      formik.values.lowerAlignerEnd
                        ? ', '
                        : ''}
                      {formik.values.lowerAlignerStart && formik.values.lowerAlignerEnd
                        ? `L ${formik.values.lowerAlignerStart}-${formik.values.lowerAlignerEnd}`
                        : ''}
                      )
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmManufacturing
