import filterPatientList from '@constants/filterPatientList'
import useDispatchAction from '@hooks/useDispatchAction'
import patientFilterNavBar from '@staticData/patientFilterNavBar'
import clsx from 'clsx'
import {useSelector} from 'react-redux'
import {setAllResetFilter} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import {RootState} from 'redux/store'
import {GlobalStatusType} from './CountBox'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {useEffect} from 'react'
import ordersPageFilterBarConstants from '@constants/ordersPageFilterBar.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import rolesConstants from '@constants/roles.constants'

type FilterNavBarProps = {
  filter: Record<string, boolean>
  handleFilterChange: (option: (typeof patientFilterNavBar)[number]['value']) => void
  getPatientList: ({
    page,
    search,
    globalFilters,
    filter,
    filter_by_role,
  }: {
    filter?: keyof typeof filterPatientList | 'ALL'
    globalFilters?: GlobalStatusType
    page?: number
    search?: string | null
    filter_by_role?: keyof typeof rolesConstants | null
  }) => void
}

const FilterNavBar = ({filter, handleFilterChange, getPatientList}: FilterNavBarProps) => {
  const {dataPatientsList, loadingPatients} = useSelector((state: RootState) => state.patientsList)
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const {isEnterprisePlanUser, isPractice, isAlignerCompanyOrg} = useAllUserPlan()
  const isCustomerList = searchParams.get('isCustomerList') === 'true'

  const customerCount =
    isAlignerCompanyOrg || isPractice
      ? dataPatientsList?.patient_count_response?.customer_patient_count
      : dataPatientsList?.customer_list_count?.all_count

  const practiceCount =
    isAlignerCompanyOrg || isPractice
      ? dataPatientsList?.patient_count_response?.practice_patient_count
      : dataPatientsList?.practice_list_count?.all_count

  const navigate = useNavigate()

  useEffect(() => {
    if (isEnterprisePlanUser) {
      if (isCustomerList) {
        handleFilterChange(ordersPageFilterBarConstants.CUSTOMER)
      } else {
        handleFilterChange(ordersPageFilterBarConstants.PRACTICE)
      }
    }
  }, [isEnterprisePlanUser])

  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full  text-textColor text-base font-semibold'>
      {patientFilterNavBar.map((item) => {
        return (
          <button
            key={item.value}
            disabled={loadingPatients}
            className={clsx(
              'py-2 cursor-pointer min-w-max',
              filter[item.value] && 'text-primaryColor border-b-2 border-primaryColor'
            )}
            onClick={() => {
              dispatchAction(setAllResetFilter(null))
              handleFilterChange(item.value)
              const queryParams = new URLSearchParams({
                isCustomerList: item.value === 'PRACTICE' ? 'false' : 'true',
              }).toString()
              navigate(`/patients-list?${queryParams}`)
              getPatientList({
                globalFilters: 'ALL',
                filter_by_role: item.value === 'PRACTICE' ? 'CONSULTING_ORTHODONTIST' : item.value,
              })
            }}
          >
            {item.label} ({item.value === 'CUSTOMER' ? customerCount : practiceCount})
          </button>
        )
      })}
    </div>
  )
}

export default FilterNavBar
