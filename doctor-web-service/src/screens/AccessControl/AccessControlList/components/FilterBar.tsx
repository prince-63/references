import clsx from 'clsx'
import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import accessControlFilterRouteNavConstants from '@staticData/accessControlFilterRouteNavConstants'
import {useNavigate} from 'context/CustomNavigationContext'
import accessControlRouteConstants from '@constants/accessControl.route.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {setSelectedAccessControlRole} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useAllUserPlan from '@hooks/useAllUserPlan'

export type userNavTabs = (typeof accessControlFilterRouteNavConstants)[number]
export type userNavListItem = userNavTabs['value']
export type userNavListFilter = Record<userNavTabs['value'], boolean>

interface INavBar {
  filter: userNavListFilter
  handleFilterChange: (option: userNavListItem) => void
}

const FilterBar = ({filter, handleFilterChange}: INavBar) => {
  const location = useLocation()
  const {navigate, shouldBlock} = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {isPractice} = useAllUserPlan()

  useEffect(() => {
    if (isPractice) {
      handleFilterChange(accessControlRouteConstants.LABS)
      if (!location.pathname.includes(accessControlRouteConstants.LABS.toLowerCase())) {
        navigate(`/access-control/${accessControlRouteConstants.LABS.toLowerCase()}`)
      }
      return
    }
    const isAccessControlRoot =
      location.pathname === '/access-control' || location.pathname === '/access-control/'
    if (isAccessControlRoot) {
      handleFilterChange(accessControlRouteConstants.OVERVIEW)
      return
    }
    const activeItem = accessControlFilterRouteNavConstants.find((item) => {
      if (item.path && location.pathname.includes(item.path)) {
        return true
      }
      return false
    })

    if (activeItem) {
      handleFilterChange(activeItem.value)
    } else {
      handleFilterChange(accessControlRouteConstants.OVERVIEW)
    }
  }, [handleFilterChange, isPractice, location.pathname, navigate])

  const callFilterNavBar = (item: (typeof accessControlFilterRouteNavConstants)[number]) => {
    if (!shouldBlock) handleFilterChange(item.value)
    if (item.value === accessControlRouteConstants.ROLES) {
      dispatchAction(setSelectedAccessControlRole(null))
    }

    navigate(`/access-control/${item.path}`)
  }

  return (
    <div className='flex gap-x-2 border-b border-lightGray w-full  text-textColor text-base font-semibold overflow-scroll mt-3 lin'>
      {accessControlFilterRouteNavConstants.map((item) => {
        if (isPractice && item.value !== accessControlRouteConstants.LABS) {
          return null
        }
        if (item.value === accessControlRouteConstants.LABS) {
          if (!isPractice && !serviceConfig?.ALIGNER_PLANNING_MANUFACTURING) return null
        }
        return (
          <button
            key={item.value}
            className={clsx(
              'px-2 cursor-pointer min-w-max text-start',
              filter[item.value]
                ? 'text-primaryColor border-b-[3px] border-primaryColor'
                : 'px-[11px]'
            )}
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
