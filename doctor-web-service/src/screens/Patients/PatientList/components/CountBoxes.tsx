import CountBox, {GlobalStatusType} from './CountBox'
import orderListPatient from '@staticData/orderListPatient'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {setGlobalFilter} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'

const CountBoxes = ({
  onGlobalFilter,
}: {
  onGlobalFilter: (globalFilter: GlobalStatusType) => void
}) => {
  const {dataPatientListCount, loadingPatients, globalFilter} = useSelector(
    (state: RootState) => state.patientsList
  )
  type CountKeys = keyof typeof dataPatientListCount
  const {dispatchAction} = useDispatchAction()

  const handleSelect = (value: GlobalStatusType) => {
    dispatchAction(setGlobalFilter(value))
    onGlobalFilter(value)
  }

  return (
    <div className='flex gap-3 overflow-x-auto md:flex-wrap'>
      {orderListPatient.map((stat) => (
        <CountBox
          key={stat.value}
          title={stat.label}
          value={stat.value}
          count={dataPatientListCount[stat.mappedKey as CountKeys]}
          selected={globalFilter === stat.value}
          onClick={handleSelect}
          disabled={loadingPatients}
        />
      ))}
    </div>
  )
}

export default CountBoxes
