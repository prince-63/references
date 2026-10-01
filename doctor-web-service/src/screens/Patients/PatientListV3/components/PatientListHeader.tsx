import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useAllUserPlan from '@hooks/useAllUserPlan'

const PatientListHeader = () => {
  const navigate = useNavigate()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {isPractice} = useAllUserPlan()
  const isCasesView = serviceConfig?.PLANNING && !isPractice && !serviceConfig?.VSP_PLANNING
  const pageLabel = isCasesView ? 'Cases' : 'Patients'
  const buttonLabel = isCasesView ? 'New Case' : 'New Patient'

  return (
    <div className='flex justify-between items-center mb-6'>
      <h1 className='text-2xl font-bold text-gray-900'>{pageLabel}</h1>
      <div className='flex gap-3'>
        <button
          onClick={() => navigate('/add-patient')}
          className='bg-primaryColor text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition'
        >
          <span className='text-lg'>+</span> {buttonLabel}
        </button>
      </div>
    </div>
  )
}

export default PatientListHeader
