import React from 'react'
import clsx from 'clsx'
import {useNavigate} from 'context/CustomNavigationContext'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import settingsPaths from '@staticData/settings.paths'
import settingsRouteConstants from '@constants/settings.routeConstants'
import {settingsNavListFilter, settingsNavListItem} from '../settings.types'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface INavBar {
  filter: settingsNavListFilter
  handleFilterChange: (option: settingsNavListItem) => void
  paths?: typeof settingsPaths
}

const FilterBar = ({filter, handleFilterChange, paths = settingsPaths}: INavBar) => {
  const {navigate, shouldBlock} = useNavigate()
  const {loadingAppointmentsList} = useSelector((state: RootState) => state.appointments)
  const {permissionChecks} = useFeatureAccess()
  const settingPermissions = permissionChecks?.profilesAccountsAndSettings
  const {isInternalUser, isOwner, isPractice, isStarterPlanUser} = useAllUserPlan()

  const callFilterNavBar = (item: (typeof settingsPaths)[number]) => {
    if (!shouldBlock) handleFilterChange(item.value)
    if (item.value === settingsRouteConstants.WORKFLOW_MANAGEMENT) {
      const subPath = isStarterPlanUser ? 'add-ons' : 'overview'
      navigate(`/settings/${item.path}/${subPath}`)
    } else if (item.children && item.children.length > 0) {
      navigate(`/settings/${item.path}/${item.children[0].path}`)
    } else {
      navigate(`/settings/${item.path}`)
    }
  }

  const filteredSettingsPaths = paths.filter((item) => {
    if (item.value === settingsRouteConstants.WORKFLOW_MANAGEMENT) {
      return !isInternalUser && !isPractice
    }

    if (item.value === settingsRouteConstants.BILLING) {
      return settingPermissions?.addEditBillingDetails?.isViewable && !isInternalUser
    }

    if (item.value === settingsRouteConstants.PROFILE_MANAGEMENT) {
      return true
    }

    if (item.value === settingsRouteConstants.SUBSCRIPTION) {
      return isOwner
    }
    if (item.value === settingsRouteConstants.LABS) {
      const canViewLabs = permissionChecks?.labManagement?.labManagement?.isViewable
      return canViewLabs || isPractice
    }
    if (item.value === settingsRouteConstants.STORAGE) {
      return isOwner
    }
    // Show all other items by default
    return true
  })

  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full  text-textColor text-base font-semibold overflow-scroll'>
      {filteredSettingsPaths.map((item) => (
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
      ))}
    </div>
  )
}

export default FilterBar
