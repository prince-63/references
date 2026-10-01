import useFilter from '@hooks/useFilter'
import useAllUserPlan from '@hooks/useAllUserPlan'
import settingsPaths from '@staticData/settings.paths'
import HeaderTitle from 'components/header/HeaderTitle'
import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'
import {Outlet, useLocation} from 'react-router-dom'
import {RootState} from 'redux/store'
import FilterBar from './components/FilterBar'
import settingsRouteConstants from '@constants/settings.routeConstants'

const getActiveTabFromPath = (pathname: string, paths: typeof settingsPaths) => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const normalizedLower = normalizedPath.toLowerCase()
  const rootSettingsPath = '/settings'

  const activeItem = paths.find((item) => {
    if (!item.path) {
      return normalizedPath === rootSettingsPath
    }
    const targetPath = `${rootSettingsPath}/${item.path}`.toLowerCase()
    return normalizedLower.startsWith(targetPath)
  })

  return activeItem?.value ?? settingsRouteConstants.ACCOUNT
}

const SettingsPage = () => {
  const location = useLocation()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {isEnterprisePlanUser, isAdmin} = useAllUserPlan()

  const visibleSettingsPaths = useMemo(() => {
    if (serviceConfig?.PLANNING && isEnterprisePlanUser && !isAdmin) return settingsPaths
    return settingsPaths.filter((item) => item.value !== settingsRouteConstants.CASE_TEAM)
  }, [isEnterprisePlanUser, serviceConfig?.PLANNING])

  const activeTab = useMemo(
    () => getActiveTabFromPath(location.pathname, visibleSettingsPaths),
    [location.pathname, visibleSettingsPaths]
  )
  const defaultTab = useMemo(
    () => visibleSettingsPaths[0]?.value ?? settingsRouteConstants.ACCOUNT,
    [visibleSettingsPaths]
  )
  const resolvedActiveTab = visibleSettingsPaths.some((item) => item.value === activeTab)
    ? activeTab
    : defaultTab

  const {filter, handleFilterChange} = useFilter(visibleSettingsPaths, true, resolvedActiveTab)

  return (
    <div className='flex h-full min-h-0 flex-col gap-3 overflow-hidden'>
      <div className='shrink-0'>
        <HeaderTitle
          {...{
            title: 'Settings',
            subTitle: 'Tailor your account and platform settings effortlessly',
          }}
        />
      </div>
      <div className='shrink-0'>
        <FilterBar
          {...{
            filter,
            handleFilterChange,
            paths: visibleSettingsPaths,
          }}
        />
      </div>
      <div
        className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4'
        style={{WebkitOverflowScrolling: 'touch'}}
      >
        <Outlet />
      </div>
    </div>
  )
}

export default SettingsPage
