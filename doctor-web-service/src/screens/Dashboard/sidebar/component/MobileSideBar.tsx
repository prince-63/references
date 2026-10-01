import {ConfigProvider, Menu, MenuProps} from 'antd'
import clsx from 'clsx'
import InputSearchGray from 'components/atom/Inputs/InputSearchGray'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {identifyUser} from 'utils/ConstFunctions'
import {SVG_CROSS} from 'utils/SvgConstants'
import {setIsMobileSidebarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import sidebarMobilePaths from '@staticData/sidebarMobile.paths'
import {getMobileSidebarMenuItems} from 'components/menu/getMobileSidebarMenuItems'
import getColorPalette from 'utils/getColorPalette'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import isPlanExpired from '@utils/isPlanExpired'
import {getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import sidebarRouteConstants from '@constants/sidebar.routeConstants'
import {RootState} from 'redux/store'
import useAllUserPlan from '@hooks/useAllUserPlan'

type MenuItem = Required<MenuProps>['items'][number]

const MobileSideBar = () => {
  const {isPractice, isEnterprisePlanUser} = useAllUserPlan()
  const dispatch = useDispatch()
  const path = location.pathname

  const {profileId}: any = useContext(AuthContext)
  const navigate = useNavigate()
  const [selectedMenu, setSelectedMenu] = useState('')

  const handleClick = (option: any) => {
    const selectedOption = sidebarMobilePaths.find((item) => item.value === option.key)
    const alignerOrderKeys = new Set<string>([
      sidebarRouteConstants.ALIGNER_ORDERS,
      sidebarRouteConstants.CHILD_NEW_CASE,
      sidebarRouteConstants.CHILD_ALIGNER_PLANNING_IN_HOUSE,
      sidebarRouteConstants.CHILD_ALIGNER_PLANNING_OUTSOURCE,
      sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_IN_HOUSE,
      sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_OUTSOURCE,
    ])
    if (selectedOption) {
      const {path} = selectedOption
      if (selectedOption?.value === 'SUPPORT') {
        window.fcWidget.open()
      }
      if (path !== '') {
        dispatch(setIsMobileSidebarOpen(false))
        navigate(path)
      }
      identifyUser()
      if (profileId && alignerOrderKeys.has(selectedOption.value)) {
        dispatch(getKanbanCountsByProfile({profile_id: safeParseInt(profileId)}) as any)
      }
    }
  }

  useEffect(() => {
    const matchingItem = sidebarMobilePaths.find((item) => item.path === path)
    if (matchingItem) {
      setSelectedMenu(matchingItem.value)
    } else {
      setSelectedMenu('')
    }
  }, [path, sidebarMobilePaths])

  const {subscriptionData} = useSubscriptionDetails()
  const expiredPlan =
    isPlanExpired(subscriptionData) ||
    subscriptionData.is_lab_staff_deactivated ||
    subscriptionData.plan_metadata?.request_deletion
  const {newDashboard, countsData} = useSelector((state: RootState) => state.DoctorDashboard)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const labChatUnreadCount = useMemo(() => {
    const rawValue =
      newDashboard?.vsp_customer?.counts?.total_unread_chat_count ??
      newDashboard?.vsp_customer?.total_unread_chat_count ??
      newDashboard?.practice_connected_to_org?.counts?.total_unread_chat_count ??
      newDashboard?.practice_connected_to_org?.total_unread_chat_count ??
      newDashboard?.enterprise_planning_user?.total_unread_chat_count ??
      newDashboard?.internal_user_plan?.total_unread_chat_count ??
      newDashboard?.enterprise_manufacturing_user?.total_unread_chat_count ??
      newDashboard?.planning_practice?.counts?.total_unread_chat_count ??
      newDashboard?.enterprise_plan?.total_unread_chat_count ??
      newDashboard?.total_unread_chat_count ??
      newDashboard?.unread_chat_count ??
      newDashboard?.chat_unread_count ??
      0
    const parsedValue = Number(rawValue)
    return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.floor(parsedValue) : 0
  }, [
    newDashboard?.vsp_customer?.counts?.total_unread_chat_count,
    newDashboard?.vsp_customer?.total_unread_chat_count,
    newDashboard?.practice_connected_to_org?.counts?.total_unread_chat_count,
    newDashboard?.practice_connected_to_org?.total_unread_chat_count,
    newDashboard?.enterprise_manufacturing_user?.total_unread_chat_count,
    newDashboard?.enterprise_planning_user?.total_unread_chat_count,
    newDashboard?.internal_user_plan?.total_unread_chat_count,
    newDashboard?.planning_practice?.counts?.total_unread_chat_count,
    newDashboard?.enterprise_plan?.total_unread_chat_count,
    newDashboard?.total_unread_chat_count,
    newDashboard?.unread_chat_count,
    newDashboard?.chat_unread_count,
  ])
  const notificationsCount = useMemo(() => {
    const rawValue =
      newDashboard?.starter_plan?.unread_notification_count ??
      newDashboard?.growth_plan?.unread_notification_count ??
      newDashboard?.practice_connected_to_org?.unread_notification_count ??
      newDashboard?.enterprise_plan?.unread_notification_count ??
      newDashboard?.internal_user_plan?.unread_notification_count ??
      newDashboard?.enterprise_planning_user?.unread_notification_count ??
      newDashboard?.enterprise_manufacturing_user?.unread_notification_count ??
      newDashboard?.planning_practice?.unread_notification_count ??
      0
    const parsedValue = Number(rawValue)
    return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.floor(parsedValue) : 0
  }, [
    newDashboard?.starter_plan?.unread_notification_count,
    newDashboard?.growth_plan?.unread_notification_count,
    newDashboard?.practice_connected_to_org?.unread_notification_count,
    newDashboard?.enterprise_plan?.unread_notification_count,
    newDashboard?.internal_user_plan?.unread_notification_count,
    newDashboard?.enterprise_planning_user?.unread_notification_count,
    newDashboard?.enterprise_manufacturing_user?.unread_notification_count,
    newDashboard?.planning_practice?.unread_notification_count,
  ])

  const items: MenuItem[] = getMobileSidebarMenuItems({
    selectedMenu: selectedMenu,
    expiredPlan: expiredPlan,
    labChatUnreadCount,
    notificationsCount,
    totalUnreadMessagesCount: countsData?.unread_chat_count ?? 0,
  })

  // same filtering rules as desktop sidebar; keep mobile in sync with web
  const filteredItems: MenuItem[] = useMemo(() => {
    // copy of SidebarMenu.filterMenuItems logic
    const excludedKeys = new Set<string>([sidebarRouteConstants.REWARDS])
    if (
      !serviceConfig?.PLANNING &&
      !serviceConfig?.VSP_PLANNING &&
      !isPractice &&
      !isEnterprisePlanUser
    ) {
      excludedKeys.add(sidebarRouteConstants.LAB_CHAT)
    } else if (serviceConfig?.PLANNING && !serviceConfig?.VSP_PLANNING) {
      excludedKeys.add(sidebarRouteConstants.CHAT)
      excludedKeys.add(sidebarRouteConstants.ALIGNER_ANALYTICS_PARENT)
      excludedKeys.add(sidebarRouteConstants.ALIGNER_ANALYTICS_CHILD)
      excludedKeys.add(sidebarRouteConstants.ALIGNER_TRACKING)
    }

    const filterMenuItems = (menuItems: MenuItem[]): MenuItem[] =>
      menuItems
        .filter(Boolean)
        .map((item) => {
          if (!item || excludedKeys.has(String(item?.key))) return null
          if (!('children' in item) || !Array.isArray(item.children)) return item
          const filteredChildren = filterMenuItems(item.children as MenuItem[])
          if (filteredChildren.length === 0) {
            // no valid sub-items, remove parent as well
            return null
          }
          return {
            ...item,
            children: filteredChildren,
          }
        })
        .filter(Boolean) as MenuItem[]

    return filterMenuItems(items)
  }, [
    items,
    serviceConfig?.PLANNING,
    serviceConfig?.VSP_PLANNING,
    isPractice,
    isEnterprisePlanUser,
  ])

  return (
    <div className='md:hidden fixed left-0 top-0 z-[1055] h-full w-full flex items-center bg-black bg-opacity-40'>
      <div className='h-full w-[80%] max-w-[20rem] bg-white absolute right-[0] p-4'>
        <div className='flex items-center justify-end'>
          <div
            className='cursor-pointer'
            onClick={() => {
              dispatch(setIsMobileSidebarOpen(false))
            }}
          >
            <BackGroundSVG
              svg={SVG_CROSS}
              width='36'
              height='36'
              className='bg-mediumGray rounded-full '
            />
          </div>
        </div>

        <div className='py-2 px-2 w-full mt-4 flex flex-col gap-2'>
          <div
            className={clsx(
              ' w-full top-[72px] transition-all flex items-center justify-center mb-4'
            )}
            onClick={() => {
              dispatch(setIsMobileSidebarOpen(false))
              navigate('/global-search')
            }}
          >
            <InputSearchGray
              className={'w-full'}
              value={''}
              placeholder={'Search'}
              onClick={() => {
                dispatch(setIsMobileSidebarOpen(false))
                navigate('/global-search')
              }}
            />
          </div>
        </div>
        <hr />
        <div className={'h-[68%] overflow-y-auto'}>
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemSelectedBg: '#F5F4FE',
                  itemSelectedColor: getColorPalette().primaryColor,
                  groupTitleColor: '#666666',
                  itemColor: '#666666',
                  itemActiveBg: '#F5F4FE',
                  collapsedWidth: 92,
                  collapsedIconSize: 24,
                },
              },
            }}
          >
            <Menu
              defaultSelectedKeys={[selectedMenu]}
              selectedKeys={[selectedMenu]}
              mode='inline'
              inlineCollapsed={false}
              items={filteredItems}
              onClick={handleClick}
              style={{fontSize: '16px', fontWeight: '400', fontFamily: 'figtree'}}
            />
          </ConfigProvider>

          <div />
        </div>

        {/* User Data */}
        {/* <div className=' absolute bottom-8 flex flex-col gap-2 w-[100%] pr-8'>
          <div className='mx-2'>
            <SubscriptionDetailsTile {...{isDashBoard: false}} />
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default MobileSideBar
