import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import filterPatientsList from '@staticData/filterPatientsList'
import useDispatchAction from '@hooks/useDispatchAction'
import OuterFilterSelection from '../OuterFilterSelection'
import {setStatusFilter} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import filterPatientList from '@constants/filterPatientList'

interface FilterSelectorProps {
  onStatusFilter: (filter: keyof typeof filterPatientList | 'ALL') => void
}

const FilterSelector: React.FC<FilterSelectorProps> = ({onStatusFilter}) => {
  const {dispatchAction} = useDispatchAction()
  const {statusFilter, loadingPatients} = useSelector((state: RootState) => state.patientsList)

  return (
    <div className='w-full flex gap-3 items-center overflow-x-auto shrink-0'>
      <div className='flex gap-3 items-center w-fit shrink-0'>
        {filterPatientsList.map((option) => (
          <OuterFilterSelection
            key={option.value}
            option={option}
            onChange={(selectedOption) => {
              dispatchAction(setStatusFilter(selectedOption))
              onStatusFilter(selectedOption)
            }}
            checked={option.value === statusFilter}
            disabled={loadingPatients}
          />
        ))}
      </div>
    </div>
  )
}

export default FilterSelector
