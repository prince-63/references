import {Card, SectionTitle} from '../ProductionSetupReview'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import When from 'components/when/When'

const PatientCard = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patient = data.patient_details

  return (
    <Card>
      <SectionTitle title='Patient details' />
      <div className='text-sm text-slate-700 space-y-1'>
        <div className='font-medium'>{patient?.full_name}</div>
        <When isTrue={patient?.gender != null}>
          <div className='text-slate-500'>{patient?.gender}</div>
        </When>
        <When isTrue={patient?.age != null}>
          <div className='text-slate-500'>{patient?.age} years</div>
        </When>
        <When isTrue={data?.patient_details?.customer_mapped_id != ''}>
          <div className='text-slate-500'>ID: {data?.patient_details?.customer_mapped_id}</div>
        </When>
      </div>
    </Card>
  )
}

export default PatientCard
