import clsx from 'clsx'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  optionTypePractices,
  practicesNavListFilter,
  practicesNavTabs,
} from '../types/practices.types'
import practicesFilterNavItems from '@staticData/practicesFilterNavItems'
import {AuthContext} from 'context/AuthContext'
import {
  getPracticesList,
  setPracticeListEmpty,
} from 'redux/Slices/AppSlice/Practices/practices.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import practiceSortingConstants from '@constants/practiceSorting.constants'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import {useNavigate} from 'react-router-dom'

interface INavBar {
  filter: practicesNavListFilter
  handleFilterChange: (option: practicesNavTabs) => void
  setPracticeListSort: (practiceListSort: optionTypePractices) => void
}

const FilterBar = ({filter, handleFilterChange, setPracticeListSort}: INavBar) => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {loadingAppointmentsList} = useSelector((state: RootState) => state.appointments)
  const navigate = useNavigate()
  const {dataPracticeList} = useSelector((state: RootState) => state.practices)
  const {active_invitation_count, pending_invitation_count} = dataPracticeList.pagination
  const callFilterNavBar = (item: (typeof practicesFilterNavItems)[number]) => {
    handleFilterChange(item.value)
    if (item.value === practiceFilterConstants.ACCEPTED) {
      navigate('/practices')
    } else {
      const queryParams = new URLSearchParams({
        invitation: 'true',
      }).toString()
      navigate(`/practices?${queryParams}`)
    }
    setPracticeListSort({label: '', value: practiceSortingConstants.ADDED_ON_NEWEST_TO_OLDEST})
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
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        })
      )
    }
  }

  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full  text-textColor text-base font-semibold'>
      {practicesFilterNavItems.map((item) => {
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
              item.value === practiceFilterConstants.ACCEPTED
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
