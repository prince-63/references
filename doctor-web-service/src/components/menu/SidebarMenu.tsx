import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {MenuProps} from 'antd'
import {ConfigProvider, Menu, Spin} from 'antd'
import {SVG_SEARCH} from 'utils/SvgConstants'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {AuthContext} from 'context/AuthContext'
import InputSearchGray from 'components/atom/Inputs/InputSearchGray'
import {IMAGE_APP_LOGO} from 'utils/ImageConst'
import {useSelector} from 'react-redux'
import clsx from 'clsx'
import {RootState} from 'redux/store'
import sidebarPaths from '@staticData/sidebar.paths'
import sidebarRouteConstants from '@constants/sidebar.routeConstants'
import {useSidebarMenuItems} from './getSidebarMenuItems'
import {useNavigate} from 'context/CustomNavigationContext'
import {useLabChatWebSocket} from 'screens/LabChat/hooks/useLabChatWebSocket'
import {updateLabChatUnreadCount} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import {identifyUser} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'
import DoctorProfileBox from './DoctorProfileBox'
import isPlanExpired from '@utils/isPlanExpired'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import useAllUserPlan from '@hooks/useAllUserPlan'
import CaretDoubleRightIcon from 'assets/icons/CaretDoubleRightIcon'
import {useSearchParams} from 'react-router-dom'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import When from 'components/when/When'
import Spinner from 'components/spinner/Spinner'
import {getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'

type MenuItem = Required<MenuProps>['items'][number]

const SidebarMenu = ({
  isCollapsed,
  setIsCollapsed,
  setIsSearchBoxOpen,
}: {
  isCollapsed: boolean
  setIsCollapsed: Dispatch<SetStateAction<boolean>>
  setIsSearchBoxOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const [selectedMenu, setSelectedMenu] = useState('')
  const {dispatchAction} = useDispatchAction()
  const {countsData, newDashboard} = useSelector((state: RootState) => state.DoctorDashboard)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {subscriptionData} = useSubscriptionDetails()
  const {isPractice, isEnterprisePlanUser} = useAllUserPlan()
  const expiredPlan =
    isPlanExpired(subscriptionData) ||
    subscriptionData.is_lab_staff_deactivated ||
    subscriptionData.plan_metadata?.request_deletion
  const labChatUnreadCount = useMemo(() => {
    // Try multiple possible paths where the unread chat count might be located
    const possiblePaths = [
      newDashboard?.vsp_customer?.counts?.total_unread_chat_count,
      newDashboard?.vsp_customer?.total_unread_chat_count,
      newDashboard?.practice_connected_to_org?.counts?.total_unread_chat_count,
      newDashboard?.practice_connected_to_org?.total_unread_chat_count,
      newDashboard?.enterprise_planning_user?.total_unread_chat_count,
      newDashboard?.internal_user_plan?.total_unread_chat_count,
      newDashboard?.enterprise_manufacturing_user?.total_unread_chat_count,
      newDashboard?.planning_practice?.counts?.total_unread_chat_count,
      newDashboard?.enterprise_plan?.total_unread_chat_count,
      newDashboard?.total_unread_chat_count,
      newDashboard?.unread_chat_count,
      newDashboard?.chat_unread_count,
      countsData?.unread_chat_count,
    ]

    const rawValue = possiblePaths.find((value) => value !== undefined && value !== null) ?? 0
    const parsedValue = Number(rawValue)
    return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.floor(parsedValue) : 0
  }, [
    newDashboard?.vsp_customer?.counts?.total_unread_chat_count,
    newDashboard?.vsp_customer?.total_unread_chat_count,
    newDashboard?.practice_connected_to_org?.counts?.total_unread_chat_count,
    newDashboard?.practice_connected_to_org?.total_unread_chat_count,
    newDashboard?.planning_practice?.counts?.total_unread_chat_count,
    newDashboard?.enterprise_manufacturing_user?.total_unread_chat_count,
    newDashboard?.enterprise_planning_user?.total_unread_chat_count,
    newDashboard?.internal_user_plan?.total_unread_chat_count,
    newDashboard?.enterprise_plan?.total_unread_chat_count,
    newDashboard?.total_unread_chat_count,
    newDashboard?.unread_chat_count,
    newDashboard?.chat_unread_count,
    countsData?.unread_chat_count,
  ])

  const notificationsCount = useMemo(() => {
    // Try multiple possible paths where the notification count might be located
    const possiblePaths = [
      newDashboard?.vsp_customer?.counts?.unread_notification_count ??
        newDashboard?.vsp_customer?.unread_notification_count ??
        newDashboard?.starter_plan?.unread_notification_count ??
        newDashboard?.practice_connected_to_org?.counts?.total_unread_chat_count ??
        newDashboard?.growth_plan?.unread_notification_count ??
        newDashboard?.practice_connected_to_org?.unread_notification_count ??
        newDashboard?.enterprise_plan?.unread_notification_count ??
        newDashboard?.internal_user_plan?.unread_notification_count ??
        newDashboard?.enterprise_planning_user?.unread_notification_count ??
        newDashboard?.enterprise_manufacturing_user?.unread_notification_count ??
        newDashboard?.planning_practice?.counts?.unread_notification_count ??
        newDashboard?.unread_notification_count ??
        newDashboard?.notifications_unread_count ??
        newDashboard?.notification_count ??
        0,
    ]

    const rawValue = possiblePaths.find((value) => value !== undefined && value !== null) ?? 0
    const parsedValue = Number(rawValue)
    return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.floor(parsedValue) : 0
  }, [
    newDashboard?.vsp_customer?.counts?.unread_notification_count,
    newDashboard?.vsp_customer?.unread_notification_count,
    newDashboard?.practice_connected_to_org?.counts?.total_unread_chat_count,
    newDashboard?.starter_plan?.unread_notification_count,
    newDashboard?.growth_plan?.unread_notification_count,
    newDashboard?.practice_connected_to_org?.unread_notification_count,
    newDashboard?.enterprise_plan?.unread_notification_count,
    newDashboard?.internal_user_plan?.unread_notification_count,
    newDashboard?.enterprise_planning_user?.unread_notification_count,
    newDashboard?.enterprise_manufacturing_user?.unread_notification_count,
    newDashboard?.planning_practice?.counts?.unread_notification_count,
    newDashboard?.unread_notification_count,
    newDashboard?.notifications_unread_count,
    newDashboard?.notification_count,
  ])

  const sidebarHook = useSidebarMenuItems({
    expiredPlan: expiredPlan,
    isCollapsed: isCollapsed,
    selectedMenu: selectedMenu,
    totalUnreadMessagesCount: countsData.unread_chat_count,
    notificationsCount,
    labChatUnreadCount,
  })
  const items: MenuItem[] = useMemo(() => {
    const rawItems = Array.isArray(sidebarHook.items) ? sidebarHook.items : []

    // Hide feature-gated entries from sidebar.
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
            return null
          }
          return {
            ...item,
            children: filteredChildren,
          }
        })
        .filter((item): item is MenuItem => Boolean(item))

    return filterMenuItems(rawItems.filter(Boolean) as MenuItem[])
  }, [
    sidebarHook.items,
    serviceConfig?.PLANNING,
    serviceConfig?.VSP_PLANNING,
    isPractice,
    isEnterprisePlanUser,
  ])
  const path = location.pathname
  const [searchParams] = useSearchParams()
  const isCustomerOrder = searchParams.get('customerOrders') === 'true'
  const isLabOrders = searchParams.get('sent') === 'true'

  const workFlowToChildKey: Record<string, string> = {
    'new-case': sidebarRouteConstants.CHILD_NEW_CASE,
    'planning-in-house': sidebarRouteConstants.CHILD_ALIGNER_PLANNING_IN_HOUSE,
    'planning-outsource': sidebarRouteConstants.CHILD_ALIGNER_PLANNING_OUTSOURCE,
    'production-in-house': sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_IN_HOUSE,
    'production-outsource': sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_OUTSOURCE,
  }

  useEffect(() => {
    // 1) Special cases that you already handle
    if (isCustomerOrder || isLabOrders) {
      setSelectedMenu(sidebarRouteConstants.PLANNING_ORDERS)
      return
    }

    // 2) If we're on /aligner-orders, try to resolve the specific child from ?workFlow=
    const workFlow = searchParams.get('workFlow') || ''
    if (path === '/aligner-orders' && workFlow) {
      const childKey = workFlowToChildKey[workFlow]
      if (childKey) {
        setSelectedMenu(childKey) // highlight the child, not the parent
        return
      }
    }

    // 3) Generic match: compare pathname; if a sidebarPaths item has a query, also ensure it matches current search
    const matchingItem = sidebarPaths.find((item) => {
      const [itemPath, itemQuery] = item.path.split('?')
      if (itemPath !== path) return false
      if (!itemQuery) return true
      // require that all params in itemQuery exist in current search
      const params: any = new URLSearchParams(itemQuery)
      for (const [k, v] of params.entries()) {
        if (searchParams.get(k) !== v) return false
      }
      return true
    })

    if (matchingItem) {
      setSelectedMenu(matchingItem.value)
    } else {
      setSelectedMenu('')
    }
  }, [path, searchParams])

  const {navigate} = useNavigate()
  const {userId, userDetail, profileId} = useContext(AuthContext)
  const {sidebarAccess} = useFeatureAccess()
  const {loadingUsersPermissions} = useSelector((state: RootState) => state.accessControl)

  const handleGlobalWebSocketMessage = useCallback(
    (event: any) => {
      try {
        const eventType = String(event?.eventType ?? event?.event_type ?? '').toUpperCase()
        if (eventType !== 'NEW_MESSAGE') return

        const senderProfileIds = [
          event?.sender?.profile_id,
          event?.sender?.profileId,
          event?.profile_id,
          event?.profileId,
          event?.sender_profile_id,
          event?.senderProfileId,
          event?.created_by_profile_id,
          event?.createdByProfileId,
        ]
          .map((id) => safeParseInt(id))
          .filter((id) => Number.isFinite(id) && id > 0)

        const senderUserIds = [
          event?.sender?.user_id,
          event?.sender?.userId,
          event?.user_id,
          event?.userId,
          event?.sender_user_id,
          event?.senderUserId,
          event?.created_by,
          event?.createdBy,
          event?.doctor_id,
          event?.doctorId,
        ]
          .map((id) => safeParseInt(id))
          .filter((id) => Number.isFinite(id) && id > 0)

        const senderGenericIds = [event?.sender?.id, event?.senderId, event?.sender_id]
          .map((id) => safeParseInt(id))
          .filter((id) => Number.isFinite(id) && id > 0)

        const senderEmail = (
          event?.senderEmail ??
          event?.sender_email ??
          event?.email ??
          event?.sender?.email
        )
          ?.toString()
          .trim()
          .toLowerCase()

        const isOwnMessageByProfileId =
          !!profileId &&
          [...senderProfileIds, ...senderGenericIds].includes(safeParseInt(profileId))
        const userIdsToCompare = senderUserIds.length > 0 ? senderUserIds : senderGenericIds
        const isOwnMessageByUserId = !!userId && userIdsToCompare.includes(safeParseInt(userId))
        const currentUserEmail = userDetail?.email?.trim().toLowerCase()
        const isOwnMessageByEmail =
          !!currentUserEmail && !!senderEmail && senderEmail === currentUserEmail

        const isOwnMessage = isOwnMessageByProfileId || isOwnMessageByUserId || isOwnMessageByEmail

        // If someone else sent a new message, we increment the global unread count
        if (!isOwnMessage) {
          dispatchAction(updateLabChatUnreadCount(1))
        }
      } catch (e) {
        console.error('[ws] Error handling global chat message', e)
      }
    },
    [dispatchAction, profileId]
  )

  useLabChatWebSocket({
    url: `${process.env.REACT_APP_BASE_APP_PATIENT_URL}/ws-chat`,
    onMessage: handleGlobalWebSocketMessage,
  })

  const handleClick = useCallback(
    (option: any) => {
      const selectedOption = sidebarPaths.find((item) => item.value === option.key)
      const alignerOrderKeys = new Set<string>([
        sidebarRouteConstants.ORDERS,
        sidebarRouteConstants.CHILD_NEW_CASE,
        sidebarRouteConstants.CHILD_ALIGNER_PLANNING_IN_HOUSE,
        sidebarRouteConstants.CHILD_ALIGNER_PLANNING_OUTSOURCE,
        sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_IN_HOUSE,
        sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_OUTSOURCE,
      ])

      if (selectedOption?.value === 'SUPPORT') {
        // @ts-ignore
        window.fcWidget?.open?.()
      }
      if (selectedOption) {
        let {path} = selectedOption
        if (selectedOption.value === sidebarRouteConstants.CHAT) {
          path = `/chat-list`
        }
        if (selectedOption.value === sidebarRouteConstants.LAB_CHAT) {
          path = `/lab-chat`
        }

        if (path !== '') {
          navigate(path)
        }

        if (profileId && alignerOrderKeys.has(selectedOption.value)) {
          dispatchAction(getKanbanCountsByProfile({profile_id: safeParseInt(profileId)}))
        }
        identifyUser()
      }
    },
    [navigate, userDetail?.email, userId, profileId, dispatchAction]
  )

  /**
   * Keep "Aligner Orders" expanded by default when sidebar is expanded.
   * Also auto-open the parent when a child is selected.
   */
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const childToParent: Record<string, string> = {
    // Aligner Orders children -> parent
    [sidebarRouteConstants.CHILD_NEW_CASE]: sidebarRouteConstants.ORDERS,
    [sidebarRouteConstants.CHILD_ALIGNER_PLANNING_IN_HOUSE]: sidebarRouteConstants.ORDERS,
    [sidebarRouteConstants.CHILD_ALIGNER_PLANNING_OUTSOURCE]: sidebarRouteConstants.ORDERS,
    [sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_IN_HOUSE]: sidebarRouteConstants.ORDERS,
    [sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_OUTSOURCE]: sidebarRouteConstants.ORDERS,

    // Tracking children -> parent
    [sidebarRouteConstants.ALIGNER_TRACKING]: sidebarRouteConstants.ALIGNER_ANALYTICS_PARENT,
    [sidebarRouteConstants.ALIGNER_ANALYTICS_CHILD]: sidebarRouteConstants.ALIGNER_ANALYTICS_PARENT,
  }

  const defaultOpenKeysRef = useRef<string[]>([])

  const defaultOpenKeys = useMemo(() => {
    const topLevelItems = items.filter((item): item is Exclude<MenuItem, null | undefined> =>
      Boolean(item)
    )
    const keys = new Set<string>()
    topLevelItems.forEach((item) => {
      if (item.key === sidebarRouteConstants.ORDERS) {
        keys.add(sidebarRouteConstants.ORDERS)
      }
      if (item.key === sidebarRouteConstants.ALIGNER_ANALYTICS_PARENT) {
        keys.add(sidebarRouteConstants.ALIGNER_ANALYTICS_PARENT)
      }
    })
    const next = Array.from(keys).sort()
    const prev = defaultOpenKeysRef.current
    if (prev.length === next.length && prev.every((value, index) => value === next[index])) {
      return prev
    }
    defaultOpenKeysRef.current = next
    return next
  }, [items])

  const hasInitializedOpenKeys = useRef(false)

  useEffect(() => {
    if (!isCollapsed) {
      if (!hasInitializedOpenKeys.current) {
        setOpenKeys(defaultOpenKeys)
        hasInitializedOpenKeys.current = true
      }
    } else {
      setOpenKeys([])
      hasInitializedOpenKeys.current = false
    }
  }, [isCollapsed, defaultOpenKeys])

  useEffect(() => {
    if (isCollapsed) return
    const maybeParent = childToParent[selectedMenu]
    if (!maybeParent) return
    setOpenKeys((prev) => {
      if (prev.includes(maybeParent)) return prev
      return [...prev, maybeParent]
    })
  }, [selectedMenu, isCollapsed])

  useEffect(() => {
    if (isCollapsed) return
    setOpenKeys((prev) => {
      const next = new Set(prev)
      let changed = false
      defaultOpenKeys.forEach((key) => {
        if (!next.has(key)) {
          next.add(key)
          changed = true
        }
      })
      return changed ? Array.from(next) : prev
    })
  }, [defaultOpenKeys, isCollapsed])

  const onOpenChange: MenuProps['onOpenChange'] = useCallback(
    (keys: string[]) => {
      if (isCollapsed) return
      setOpenKeys(keys)
    },
    [isCollapsed]
  )

  return (
    <div className={clsx('sidebar max-h-full overflow-y-auto z-20 bg-white')}>
      <div className='px-2 w-full'>
        {!isCollapsed ? (
          <div
            className='w-full cursor-pointer flex justify-center items-center h-14 py-3 mt-4'
            onClick={() => {
              navigate('/')
            }}
          >
            <img src={IMAGE_APP_LOGO} alt='app logo' />
          </div>
        ) : (
          <button
            className='flex p-4 justify-center items-center bg-lightGray rounded-lg m-4'
            onClick={() => setIsCollapsed(false)}
          >
            <CaretDoubleRightIcon />
          </button>
        )}
        <DoctorProfileBox isCollapsed={isCollapsed} />
        <When isTrue={sidebarAccess?.globalSearch}>
          {!isCollapsed && (
            <div
              className={clsx(
                '  w-full top-[72px] transition-all flex items-center justify-center my-2 cursor-pointer',
                isCollapsed && 'w-full !justify-start'
              )}
              onClick={() => {
                !expiredPlan && setIsSearchBoxOpen(true)
              }}
            >
              <InputSearchGray
                className={!isCollapsed ? 'w/full cursor-pointer' : 'w/full cursor-pointer'}
                value={''}
                placeholder={'Search'}
                disabled={expiredPlan}
                onClick={() => {
                  !expiredPlan && setIsSearchBoxOpen(true)
                }}
              />
            </div>
          )}
          {isCollapsed && (
            <div
              onClick={() => {
                !expiredPlan && setIsSearchBoxOpen(true)
              }}
              className=' w-[3rem] !bg-lightGray flex items-center p-3 cursor-pointer justify-center rounded-lg  m-3'
            >
              <CommonSVG svg={SVG_SEARCH} height='20' width='20' />
            </div>
          )}
        </When>
      </div>
      <div className={!isCollapsed ? 'max-h-[68%] overflow-y-auto' : ''}>
        {loadingUsersPermissions ? (
          <div className='w-full h-full flex justify-center items-center'>
            <Spin indicator={<Spinner loading />} spinning={loadingUsersPermissions} />
          </div>
        ) : (
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
                  colorBorder: 'transparent',
                  colorBgContainer: 'transparent',
                },
              },
            }}
          >
            <Menu
              defaultSelectedKeys={[selectedMenu]}
              selectedKeys={[selectedMenu]}
              mode='inline'
              inlineCollapsed={isCollapsed}
              items={items}
              onClick={handleClick}
              onOpenChange={onOpenChange}
              openKeys={isCollapsed ? [] : openKeys}
              style={{
                fontSize: '16px',
                fontWeight: '400',
                fontFamily: 'figtree',
                border: 'none',
                backgroundColor: 'transparent',
              }}
            />
          </ConfigProvider>
        )}
      </div>
    </div>
  )
}

export default memo(SidebarMenu)
