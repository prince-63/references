import {useEffect} from 'react'
import {useLocation, useParams} from 'react-router-dom'

import clsx from 'clsx'
import {useNavigate} from 'context/CustomNavigationContext'
import appointmentsFilterNavItems from '@staticData/appointmentsFilterNavItems'
import appointmentFilterRouteConstants from '@constants/patient.appointmentFilter.route.constants'
import {appointmentNavListFilter, appointmentNavListItem} from '../types/appointments.types'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
interface INavBar {
  filter: appointmentNavListFilter
  handleFilterChange: (option: appointmentNavListItem) => void
}
const FilterBar = ({filter, handleFilterChange}: INavBar) => {
  const location = useLocation()
  const {navigate, shouldBlock} = useNavigate()
  const {patientId, bracesJourneyId} = useParams()
  const {loadingAppointmentsList} = useSelector((state: RootState) => state.appointments)
  useEffect(() => {
    const activeItem = appointmentsFilterNavItems.find((item) => {
      if (item.path && location.pathname.includes(item.path)) {
        return true
      }
      return false
    })

    if (activeItem) {
      handleFilterChange(activeItem.value)
    } else {
      handleFilterChange(appointmentFilterRouteConstants.ALL)
    }
  }, [])
  const callFilterNavBar = (item: (typeof appointmentsFilterNavItems)[number]) => {
    if (!shouldBlock) handleFilterChange(item.value)
    navigate(`/profile/${patientId}/${bracesJourneyId}/bracesNotes/${item.path}`)
  }

  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full  text-textColor text-base font-semibold'>
      {appointmentsFilterNavItems.map((item) => {
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
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export default FilterBar
