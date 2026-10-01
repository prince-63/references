import jawType from '@constants/jawType'
import cn from '@utils/cn'
import UpperJawIcon from 'assets/icons/UpperJawIcon'
import When from 'components/when/When'
import {IAlignerUpdateDetails} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import JustifiedBetweenDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/JustifiedBetweenDetails'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

function transformText(text: string) {
  if (!text) return text
  let transformedText = text?.replace(/_/g, ' ').toLowerCase()

  transformedText = transformedText.replace(/\b\w/g, (l) => l.toUpperCase())

  return transformedText
}
const PatientsFeedback = ({
  alignerUpdateDetails,
}: {
  alignerUpdateDetails: IAlignerUpdateDetails
}) => {
  type jawTypesWithoutBoth = keyof Pick<typeof jawType, typeof jawType.LOWER | typeof jawType.UPPER>
  let alignerChangeFeedbacksKeys: jawTypesWithoutBoth[] = []
  const alignerChangeFeedbacks = alignerUpdateDetails.aligner_check_in_feedback?.feedbacks
  if (alignerChangeFeedbacks && hasValue(alignerChangeFeedbacks)) {
    alignerChangeFeedbacksKeys = Object.keys(alignerChangeFeedbacks) as jawTypesWithoutBoth[]
  }
  return (
    <div className='flex flex-col gap-4 '>
      {hasValue(alignerChangeFeedbacksKeys) && (
        <div className='flex flex-col  gap-3 md:flex-row md:gap-8'>
          {alignerChangeFeedbacksKeys?.reverse()?.map((key, index) => {
            const value = alignerChangeFeedbacks![key]?.fitting_feedback?.fittings[0]
            return (
              <div className='flex flex-col gap-2 md:w-1/2' key={index}>
                <p className='font-semibold text-textColor flex items-center gap-2 uppercase text-xs'>
                  <span className={key === 'LOWER' ? 'transform rotate-180' : ''}>
                    <UpperJawIcon />
                  </span>
                  {capitalizeFirstLetter(key)} Jaw
                </p>
                <JustifiedBetweenDetails
                  label='Fit of the aligner'
                  value={transformText(value)}
                  className='text-sm md:flex-col gap-1'
                  classNameLabel='text-sm font-medium'
                  valueClassName={cn(
                    'text-base text-textColor font-medium',
                    value === 'PERFECT_FIT' ? 'text-tertiaryColor' : 'text-red'
                  )}
                />
                {/* <JustifiedBetweenDetails
                    label='Issues while changing aligners'
                    value={transformText(
                      alignerChangeFeedbacks![key]?.changing_feedback?.aligner_changing_issues[0]
                    )}
                    className='text-sm'
                    valueClassName='md:text-right text-sm'
                  /> */}
              </div>
            )
          })}
        </div>
      )}
      <When isTrue={hasValue(alignerUpdateDetails.aligner_check_in_feedback?.other_issues)}>
        <div className='flex flex-col gap-1'>
          <p className='text-base font-medium text-textColor'>Other issues</p>
          <p className='text-black text-sm leading-6'>
            {alignerUpdateDetails.aligner_check_in_feedback?.other_issues}
          </p>
        </div>
      </When>
    </div>
  )
}

export default PatientsFeedback
