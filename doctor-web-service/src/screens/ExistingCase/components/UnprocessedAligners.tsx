import {useSelector} from 'react-redux'
import CardHeading from './CardHeading'
import {arrayOfAligners} from 'utils/ConstFunctions'
import {RootState} from 'redux/store'
import {FormikProps} from 'formik'
import {ManufacturingFormValues} from '../steps/ManufacturingStep'
import When from 'components/when/When'

const UnprocessedAligners = ({formik}: {formik: FormikProps<ManufacturingFormValues>}) => {
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const alignerList = arrayOfAligners(treatmentPlan?.aligner_details_meta_data)
  const rawFrom = formik.values.fromStage
  const rawTo = formik.values.toStage

  const fromStage = rawFrom === 0 ? null : rawFrom
  const toStage = rawTo === 0 ? null : rawTo

  const getRemainingAligners = (from: number | null, to: number | null) => {
    if (!from || !to || from > to) return alignerList
    return alignerList.filter((a) => a.value > to)
  }

  const remainingAligners = getRemainingAligners(fromStage, toStage)
  const upperAligners = remainingAligners.filter((a) => a.label.toLowerCase().includes('upper'))
  const lowerAligners = remainingAligners.filter((a) => a.label.toLowerCase().includes('lower'))
  const upper = upperAligners.length
  const lower = lowerAligners.length
  const total = upper + lower
  const upperAlignerStart =
    upperAligners.length > 0 ? Math.min(...upperAligners.map((a) => a.value)) : null
  const upperAlignerEnd =
    upperAligners.length > 0 ? Math.max(...upperAligners.map((a) => a.value)) : null
  const lowerAlignerStart =
    lowerAligners.length > 0 ? Math.min(...lowerAligners.map((a) => a.value)) : null
  const lowerAlignerEnd =
    lowerAligners.length > 0 ? Math.max(...lowerAligners.map((a) => a.value)) : null

  const totalLabel = [
    upperAlignerStart && upperAlignerEnd ? `U ${upperAlignerStart}-${upperAlignerEnd}` : null,
    lowerAlignerStart && lowerAlignerEnd ? `L ${lowerAlignerStart}-${lowerAlignerEnd}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div>
      <div className='flex flex-col p-4 gap-4 border rounded-lg border-mediumGray'>
        <CardHeading text='Unprocessed Aligners' />

        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <When isTrue={upper > 0}>
              <div className='flex justify-between'>
                <span className='text-base text-textColor'>Upper Aligners</span>
                <div className='flex gap-1'>
                  <span className='text-base'>{upper}</span>
                  <span className='text-base'>
                    {upperAlignerStart && upperAlignerEnd
                      ? `(Aligner ${upperAlignerStart}-${upperAlignerEnd})`
                      : ''}
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
                    {lowerAlignerStart && lowerAlignerEnd
                      ? `(Aligner ${lowerAlignerStart}-${lowerAlignerEnd})`
                      : ''}
                  </span>
                </div>
              </div>
            </When>
          </div>

          <div className='flex justify-between border-t pt-2 border-mediumGray'>
            <span className='text-base font-bold text-textColor'>Total</span>
            <div className='flex gap-1'>
              <span className='text-base'>{total}</span>
              {totalLabel && <span className='text-base'>({totalLabel})</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnprocessedAligners
