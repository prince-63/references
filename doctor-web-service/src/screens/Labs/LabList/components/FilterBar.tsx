import clsx from 'clsx'
import {useContext, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {labsNavListFilter, labsNavTabs} from '../types/labs.types'
import labsFilterNavItems from '@staticData/practicesFilterNavItems'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate} from 'react-router-dom'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import {getLabsList, setLabListEmpty} from 'redux/Slices/AppSlice/Labs/labs.slice'
import useActiveProfile from '@hooks/useActiveProfile'
import {safeParseInt} from 'utils/ConstFunctions'
import useAllUserPlan from '@hooks/useAllUserPlan'
interface INavBar {
  filter: labsNavListFilter
  handleFilterChange: (option: labsNavTabs) => void
}
const FilterBar = ({filter, handleFilterChange}: INavBar) => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {loadingAppointmentsList} = useSelector((state: RootState) => state.appointments)
  const navigate = useNavigate()
  const {isPractice} = useAllUserPlan()
  const {dataLabList, invitationCounts} = useSelector((state: RootState) => state.labs)
  const data = dataLabList?.doctor_invitation_details_list ?? []
  const practiceDataLabList = Array.isArray(data)
    ? data.filter((d) => d.organization_id === safeParseInt(organizationId))
    : []
  const countsForDisplay = useMemo(
    () => ({
      active: isPractice ? (invitationCounts?.active ? 1 : 0) : invitationCounts?.active,
      pending: invitationCounts?.pending ?? 0,
    }),
    [invitationCounts, isPractice, practiceDataLabList.length]
  )
  const {activeProfile} = useActiveProfile()
  const callFilterNavBar = (item: (typeof labsFilterNavItems)[number]) => {
    handleFilterChange(item.value)
    if (item.value === practiceFilterConstants.ACCEPTED) {
      navigate('/settings/labs')
    } else {
      const queryParams = new URLSearchParams({
        invitation: 'true',
      }).toString()
      navigate(`/settings/labs?${queryParams}`)
    }
    dispatchAction(
      setLabListEmpty({
        doctor_invitation_details_list: [],
        pagination: {
          page_number: 1,
          page_size: 10,
          total_patients: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false,
          active_invitation_count: countsForDisplay.active,
          pending_invitation_count: countsForDisplay.pending,
        },
      })
    )
    if (userId && organizationId && profileId) {
      dispatchAction(
        getLabsList({
          payload: {
            doctor_id: userId,
            invitation_status: item.value,
            page_number: 0,
            page_size: 10,
            search: null,
            sort_order: 'ADDED_ON_NEWEST_TO_OLDEST',
          },
          roles: activeProfile.roles,
          isPractice: true,
        })
      )
    }
  }
  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full  text-textColor text-base font-semibold'>
      {labsFilterNavItems.map((item) => {
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
                ? countsForDisplay.active
                : countsForDisplay.pending
            })`}
          </button>
        )
      })}
    </div>
  )
}
export default FilterBar
