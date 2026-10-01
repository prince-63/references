import {useEvent} from './EventContext'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import Alerts from './Alerts'
import JustifiedBetweenDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/JustifiedBetweenDetails'
import WearDuration from 'screens/Patients/PatientProfile/components/WearDuration'
import moment from 'moment'

const AlignerChangeDetails = () => {
  const {event} = useEvent()
  const {
    previous_aligner_jaw_type,
    previous_aligner_number,
    current_aligner_jaw_type,
    current_aligner_number,
    recommended_date_of_change,
    days_delay_offset,
    manual,
  } = event.extendedProps.content.details
  const formattedDate = moment(recommended_date_of_change).format('DD MMM YYYY')
  return (
    <div className='flex flex-col gap-3'>
      <p className='text-black font-semibold text-base'>
        {`${capitalizeFirstLetter(
          previous_aligner_jaw_type ?? '',
          false
        )} ${previous_aligner_number} to ${capitalizeFirstLetter(
          current_aligner_jaw_type ?? '',
          false
        )} ${current_aligner_number}`}
      </p>
      <div className='flex flex-col gap-2'>
        {!manual && (
          <JustifiedBetweenDetails
            label='Recommended date of change'
            value={
              <div className='flex flex-row gap-2'>
                <p className='text-black font-semibold'>{formattedDate}</p>
                <WearDuration
                  changeOffset={days_delay_offset ?? null}
                  showDateRange={false}
                  showHyphen={false}
                  isManualTracking={false}
                />
              </div>
            }
            className='text-sm !flex !flex-col !gap-1'
          />
        )}
        {manual && <p>Manual tracking</p>}
        {!manual && <Alerts />}
      </div>
    </div>
  )
}

export default AlignerChangeDetails
