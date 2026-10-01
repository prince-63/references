import JustifiedBetweenDetails from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/components/JustifiedBetweenDetails'
import WearDuration from 'screens/Patients/PatientProfile/components/WearDuration'
import dayjs from 'dayjs'

const AlignerChangeDetails = ({
  endDate,
  changeDate,
  changeOffset,
}: {
  endDate: string
  changeDate: string
  changeOffset: number
}) => {
  return (
    <div className='flex flex-col gap-3  '>
      <div className='flex flex-col gap-3 md:flex-row'>
        <JustifiedBetweenDetails
          label='Scheduled date'
          value={dayjs(endDate).format('DD-MMM-YYYY')}
          className='text-sm md:flex-col md:justify-normal'
          valueClassName='text-base font-normal'
        />
        <JustifiedBetweenDetails
          label='Change date'
          value={
            <div className='flex flex-row gap-2 '>
              <p className='text-black text-base'>
                {changeDate ? dayjs(changeDate).format('DD-MMM-YYYY') : '--'}
              </p>

              <WearDuration
                changeOffset={changeOffset}
                showDateRange={false}
                showHyphen={false}
                isManualTracking={false}
              />
            </div>
          }
          className='text-sm md:flex-col md:justify-normal'
        />
      </div>
    </div>
  )
}

export default AlignerChangeDetails
