import {useEffect, useRef} from 'react'
import CountBox, {GlobalStatusType} from './CountBox'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {setGlobalFilter} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import orderListPatientForOrg from '@staticData/orderListPatientForOrg'
import patientCountStatTypesConstants from '@constants/patientCountStatTypes.constants'

const CountBoxForOrg = ({
  onGlobalFilter,
}: {
  onGlobalFilter: (globalFilter: GlobalStatusType) => void
}) => {
  const {dataPatientsList, loadingPatients, globalFilter} = useSelector(
    (state: RootState) => state.patientsList
  )
  const counts = dataPatientsList?.patient_count_response
  type CountKeys = keyof typeof counts
  const {dispatchAction} = useDispatchAction()
  const defaultFilterApplied = useRef(false)

  const handleSelect = (value: GlobalStatusType) => {
    dispatchAction(setGlobalFilter(value))
    onGlobalFilter(value)
  }

  useEffect(() => {
    if (defaultFilterApplied.current || globalFilter !== patientCountStatTypesConstants.ALL) {
      return
    }

    defaultFilterApplied.current = true
    onGlobalFilter(patientCountStatTypesConstants.ALL)
  }, [globalFilter, onGlobalFilter])

  return (
    <div className='w-full flex gap-3 overflow-x-auto '>
      {orderListPatientForOrg.map((stat) => (
        <CountBox
          key={stat.value}
          title={stat.label}
          value={stat.value}
          count={counts?.[stat.mappedKey as CountKeys]}
          selected={globalFilter === stat.value}
          onClick={handleSelect}
          disabled={loadingPatients}
        />
      ))}
    </div>
  )
}

export default CountBoxForOrg
