import {useSelector} from 'react-redux'
import CardHeading from './CardHeading'
import {RootState} from 'redux/store'
import When from 'components/when/When'

const AlignerSummary = () => {
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)

  const upper = treatmentPlan?.aligner_details_meta_data?.upper_jaw ?? null
  const lower = treatmentPlan?.aligner_details_meta_data?.lower_jaw ?? null

  const upperCount = upper?.range?.length || 0
  const lowerCount = lower?.range?.length || 0
  const totalCount = upperCount + lowerCount

  return (
    <div className='flex flex-col gap-3 p-4 rounded-lg border border-mediumGray'>
      <CardHeading text='Aligner Summary' />

      <div className='flex flex-col gap-4 md:flex-row md:gap-6'>
        <span className='font-medium'>Total aligners: {totalCount}</span>

        <When isTrue={upperCount > 0}>
          <div className='flex flex-col'>
            <span className='font-medium'>Upper jaw: {upperCount}</span>
            <span className='text-sm text-textColor'>
              (
              {upper?.starts_with && upper?.ends_with
                ? `Aligner ${upper.starts_with} - ${upper.ends_with}`
                : 'No data'}
              )
            </span>
          </div>
        </When>

        <When isTrue={lowerCount > 0}>
          <div className='flex flex-col'>
            <span className='font-medium'>Lower jaw: {lowerCount}</span>
            <span className='text-sm text-textColor'>
              (
              {lower?.starts_with && lower?.ends_with
                ? `Aligner ${lower.starts_with} - ${lower.ends_with}`
                : 'No data'}
              )
            </span>
          </div>
        </When>
      </div>
    </div>
  )
}

export default AlignerSummary
