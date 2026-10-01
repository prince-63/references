import clsx from 'clsx'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  optionTypeCustomers,
  customersNavListFilter,
  customersNavTabs,
} from '../types/customerList.types'
import customersFilterNavItems from '@staticData/customersFilterNavItems'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import customerFilterConstants from '@constants/customerFilter.constants'
import {useNavigate} from 'react-router-dom'
import practiceSortingConstants from '@constants/practiceSorting.constants'
import {
  getPracticesList,
  setPracticeListEmpty,
} from 'redux/Slices/AppSlice/Practices/practices.slice'

interface INavBar {
  filter: customersNavListFilter
  handleFilterChange: (option: customersNavTabs) => void
  setCustomerListSort: (customerListSort: optionTypeCustomers) => void
}

const FilterBar = ({filter, handleFilterChange, setCustomerListSort}: INavBar) => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {loadingAppointmentsList} = useSelector((state: RootState) => state.appointments)
  const navigate = useNavigate()
  const {dataPracticeList} = useSelector((state: RootState) => state.practices)
  const {active_invitation_count, pending_invitation_count} = dataPracticeList.pagination

  const callFilterNavBar = (item: (typeof customersFilterNavItems)[number]) => {
    handleFilterChange(item.value)
    if (item.value === customerFilterConstants.ACCEPTED) {
      navigate('/customers')
    } else {
      const queryParams = new URLSearchParams({
        invitation: 'true',
      }).toString()
      navigate(`/customers?${queryParams}`)
    }
    setCustomerListSort({label: '', value: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST})
    if (userId && organizationId && profileId) {
      dispatchAction(
        setPracticeListEmpty({
          doctor_invitation_details_list: [],
          pagination: {
            page_number: 1,
            page_size: 10,
            total_patients: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false,
            active_invitation_count: 0,
            pending_invitation_count: 0,
          },
        })
      )
      if (userId && organizationId && profileId) {
        dispatchAction(
          getPracticesList({
            doctor_id: userId,
            profile_id: profileId,
            organization_id: organizationId,
            invitation_status: item.value,
            sort_order: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST,
            page_number: 0,
            page_size: 10,
            search: null,
            invitation_roles: [
              'CONSULTING_ORTHODONTIST',
              'ENTERPRISE_CUSTOMER',
              'GROWTH_CUSTOMER',
              'PRACTICE_CUSTOMER',
            ],
          })
        )
      }
    }
  }

  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full  text-textColor text-base font-semibold'>
      {customersFilterNavItems.map((item) => {
        return (
          <button
            key={item.value}
            className={clsx(
              'py-2 cursor-pointer min-w-max',
              filter[item.value] && 'text-primaryColor border-b-2 border-primaryColor'
            )}
            disabled={loadingAppointmentsList}
            onClick={() => {
              callFilterNavBar(item)
            }}
          >
            {`${item.label} (${
              item.value === customerFilterConstants.ACCEPTED
                ? active_invitation_count
                : pending_invitation_count
            })`}
          </button>
        )
      })}
    </div>
  )
}

export default FilterBar
