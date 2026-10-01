import {useEffect, useRef} from 'react'
import CountBox, {GlobalStatusType} from 'screens/Patients/PatientList/components/CountBox'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {setGlobalFilter} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import orderListPatientForTracking from '@staticData/orderListPatientForTracking'
import patientCountStatTypesConstants from '@constants/patientCountStatTypes.constants'

const CountBoxForTracking = ({
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
    onGlobalFilter(patientCountStatTypesConstants.ALL_TREATMENT_TRACKING)
  }, [globalFilter, onGlobalFilter])

  const colorMapping: Record<string, {active: string; inactive: string}> = {
    [patientCountStatTypesConstants.ALL_TREATMENT_TRACKING]: {
      active: 'bg-[#F0EDFE] border-[#735BF2]',
      inactive: 'bg-[#F8F7FB] border-[#E8E6F0]',
    },
    [patientCountStatTypesConstants.STARTING_SOON]: {
      active: 'bg-[#EFF6FF] border-[#2563EB]',
      inactive: 'bg-[#F0F7FF] border-[#D1E5FF]',
    },
    [patientCountStatTypesConstants.ONGOING]: {
      active: 'bg-[#ECFDF5] border-[#059669]',
      inactive: 'bg-[#F0FDF4] border-[#DCFCE7]',
    },
    [patientCountStatTypesConstants.PAUSED]: {
      active: 'bg-[#FEF2F1] border-[#F45045]',
      inactive: 'bg-[#FFF5F5] border-[#FEE2E2]',
    },
    [patientCountStatTypesConstants.REFINEMENT]: {
      active: 'bg-[#FFF7ED] border-[#EA580C]',
      inactive: 'bg-[#FFFAF3] border-[#FFEDD5]',
    },
    [patientCountStatTypesConstants.COMPLETED]: {
      active: 'bg-[#F3F4F6] border-[#6B7280]',
      inactive: 'bg-[#F9FAFB] border-[#F3F4F6]',
    },
  }

  return (
    <div className='w-full flex flex-wrap gap-3'>
      {orderListPatientForTracking.map((stat) => (
        <div key={stat.value} className='flex-1 min-w-[180px]'>
          <CountBox
            title={stat.label}
            value={stat.value}
            count={counts?.[stat.mappedKey as CountKeys]}
            selected={globalFilter === stat.value}
            onClick={handleSelect}
            disabled={loadingPatients}
            activeClassName={colorMapping[stat.value]?.active}
            inactiveClassName={colorMapping[stat.value]?.inactive}
          />
        </div>
      ))}
    </div>
  )
}

export default CountBoxForTracking
