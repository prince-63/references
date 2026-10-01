import React from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ShowDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/ShowDetails'
import formatAligners from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/helpers/formatAligners'
import hasValue from 'utils/hasValue'

const AlignerDetails = ({isReceivedPlan}: {isReceivedPlan?: boolean}) => {
  const {treatmentPlan, sentToPracticeTreatmentPlan} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const treatmentPlanData = isReceivedPlan ? treatmentPlan : sentToPracticeTreatmentPlan
  return (
    <div className='flex gap-6'>
      <ShowDetails
        label='Total aligners'
        value={
          hasValue(treatmentPlanData?.total_aligners) ? (
            <div>{treatmentPlanData.total_aligners}</div>
          ) : (
            '-'
          )
        }
      />
      <ShowDetails
        label='Upper jaw range'
        value={
          hasValue(treatmentPlanData?.aligner_details_meta_data?.upper_jaw?.range) ? (
            <div>
              {formatAligners(
                treatmentPlanData?.aligner_details_meta_data?.upper_jaw?.range ?? []
              ).map((range, index) => (
                <p key={index}>{range}</p>
              ))}
            </div>
          ) : null
        }
      />
      <ShowDetails
        label='Lower jaw range'
        value={
          hasValue(treatmentPlanData?.aligner_details_meta_data?.lower_jaw?.range) ? (
            <div>
              {formatAligners(
                treatmentPlanData?.aligner_details_meta_data?.lower_jaw?.range ?? []
              ).map((range, index) => (
                <p key={index}>{range}</p>
              ))}
            </div>
          ) : null
        }
      />
    </div>
  )
}

export default AlignerDetails
