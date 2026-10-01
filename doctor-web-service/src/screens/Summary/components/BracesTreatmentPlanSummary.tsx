import {DataWrapper} from './DataWrapper'
import {ConditionalValueDiv} from './ConditionalValueDiv'
import hasValue from 'utils/hasValue'
import {formatPluralizedString, getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import moment from 'moment'

const BracesTreatmentPlanSummary = ({bracesTreatmentPlan}: {bracesTreatmentPlan: any}) => {
  const teethExtraction: string[] = Array.isArray(bracesTreatmentPlan?.teeth_extraction)
    ? bracesTreatmentPlan.teeth_extraction
    : []

  return (
    <div className='space-y-4 md:space-y-6'>
      {/* 1. Treatment details */}
      <DataWrapper
        title='Treatment details'
        isShow={
          bracesTreatmentPlan?.treatment_start_date ||
          bracesTreatmentPlan?.tentative_treatment_duration_in_months ||
          bracesTreatmentPlan?.recommended_hours_to_wear_aligners
        }
        showBorder={
          hasValue(bracesTreatmentPlan?.teeth_extraction) || hasValue(bracesTreatmentPlan?.remarks)
        }
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
          <ConditionalValueDiv
            label='Treatment type'
            value={
              bracesTreatmentPlan?.treatment_stage
                ? `${getFirstLetterCapitalOfWord(bracesTreatmentPlan.treatment_stage)} treatment`
                : null
            }
          />

          <ConditionalValueDiv
            label='Treatment start date'
            value={
              hasValue(bracesTreatmentPlan?.treatment_start_date)
                ? moment(bracesTreatmentPlan.treatment_start_date).format('DD MMM YYYY')
                : null
            }
          />

          <ConditionalValueDiv
            label='Treatment duration'
            value={
              hasValue(bracesTreatmentPlan?.tentative_treatment_duration_in_months)
                ? `${bracesTreatmentPlan.tentative_treatment_duration_in_months} months`
                : null
            }
          />

          <ConditionalValueDiv
            label='Recommended daily wear hours'
            value={
              hasValue(bracesTreatmentPlan?.recommended_hours_to_wear_aligners)
                ? formatPluralizedString(
                    bracesTreatmentPlan.recommended_hours_to_wear_aligners,
                    'hour'
                  )
                : null
            }
          />
        </div>
      </DataWrapper>

      {/* 2. Extraction */}
      <DataWrapper
        title='Extraction'
        isShow={teethExtraction.length > 0 || hasValue(bracesTreatmentPlan?.extraction_remarks)}
        showBorder={
          hasValue(bracesTreatmentPlan?.bracket_type) ||
          hasValue(bracesTreatmentPlan?.bracket_select_sub_type) ||
          hasValue(bracesTreatmentPlan?.bracket_select_type) ||
          hasValue(bracesTreatmentPlan?.bracket_brand)
        }
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
          <ConditionalValueDiv
            label='Selected tooth'
            value={teethExtraction.length > 0 ? teethExtraction.join(', ') : null}
          />
          <ConditionalValueDiv
            label='Remarks'
            value={bracesTreatmentPlan?.extraction_remarks || null}
          />
        </div>
      </DataWrapper>

      {/* 3. Bracket details */}
      <DataWrapper
        title='Bracket details'
        isShow={
          hasValue(bracesTreatmentPlan?.bracket_type) ||
          hasValue(bracesTreatmentPlan?.bracket_select_sub_type) ||
          hasValue(bracesTreatmentPlan?.bracket_select_type) ||
          hasValue(bracesTreatmentPlan?.bracket_brand)
        }
        showBorder={
          hasValue(bracesTreatmentPlan?.lower_jaw_anchor_type_value) ||
          hasValue(bracesTreatmentPlan?.upper_jaw_anchor_type_value)
        }
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
          <ConditionalValueDiv label='Bracket type' value={bracesTreatmentPlan?.bracket_type} />
          <ConditionalValueDiv
            label='Sub-type'
            value={bracesTreatmentPlan?.bracket_select_sub_type}
          />
          <ConditionalValueDiv label='Type' value={bracesTreatmentPlan?.bracket_select_type} />
          <ConditionalValueDiv label='Company name' value={bracesTreatmentPlan?.bracket_brand} />
        </div>
      </DataWrapper>

      {/* 4. Anchorage type */}
      <DataWrapper
        title='Anchorage type'
        isShow={
          hasValue(bracesTreatmentPlan?.lower_jaw_anchor_type_value) ||
          hasValue(bracesTreatmentPlan?.upper_jaw_anchor_type_value)
        }
        showBorder={hasValue(bracesTreatmentPlan?.remarks)}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
          <ConditionalValueDiv
            label='Upper jaw'
            value={bracesTreatmentPlan?.upper_jaw_anchor_type_value}
          />
          <ConditionalValueDiv
            label='Lower jaw'
            value={bracesTreatmentPlan?.lower_jaw_anchor_type_value}
          />
        </div>
      </DataWrapper>

      {/* 5. Overall remarks */}
      <DataWrapper
        showBorder={false}
        title='Remarks'
        isShow={hasValue(bracesTreatmentPlan?.remarks)}
      >
        <div className='text-sm md:text-[14px] text-textColor font-medium break-words'>
          {bracesTreatmentPlan?.remarks}
        </div>
      </DataWrapper>
    </div>
  )
}

export default BracesTreatmentPlanSummary
