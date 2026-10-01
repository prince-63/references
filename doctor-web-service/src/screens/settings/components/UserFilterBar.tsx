import React from 'react'
import userFilterRouteConstants from '@constants/userFilter.route.constants'
import userFilterRouteNavConstants from '@staticData/userFilterRouteNavConstants'
import clsx from 'clsx'
import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {useNavigate} from 'context/CustomNavigationContext'

export type userNavTabs = (typeof userFilterRouteNavConstants)[number]
export type userNavListItem = userNavTabs['value']
export type userNavListFilter = Record<userNavTabs['value'], boolean>

interface INavBar {
  filter: userNavListFilter
  handleFilterChange: (option: userNavListItem) => void
}
const UserFilterBar = ({filter, handleFilterChange}: INavBar) => {
  const location = useLocation()
  const {navigate, shouldBlock} = useNavigate()

  useEffect(() => {
    const activeItem = userFilterRouteNavConstants.find((item) => {
      if (item.path && location.pathname.includes(item.path)) {
        return true
      }
      return false
    })

    if (activeItem) {
      handleFilterChange(activeItem.value)
    } else {
      handleFilterChange(userFilterRouteConstants.USERS)
    }
  }, [])

  const callFilterNavBar = (item: (typeof userFilterRouteNavConstants)[number]) => {
    if (!shouldBlock) handleFilterChange(item.value)
    navigate(`/settings/user-management/${item.path}`)
  }

  return (
    <div className='flex flex-col w-full text-textColor text-base font-semibold item-start'>
      {userFilterRouteNavConstants.map((item) => {
        return (
          <button
            key={item.value}
            className={clsx(
              'my-2 px-2 cursor-pointer min-w-max text-start',
              filter[item.value]
                ? 'text-primaryColor border-l-[3px] border-primaryColor'
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

export default UserFilterBar
