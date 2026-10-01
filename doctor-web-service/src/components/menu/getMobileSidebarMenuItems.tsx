// hooks/useMobileSidebarMenuItems.ts
import brandNamesConstants from '@constants/brandNames.constants'
import sidebarRouteConstants from '@constants/sidebar.routeConstants'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

import DashboardIcon from 'assets/icons/DashboardIcon'
import CalenderHalfIcon from 'assets/icons/CalenderHalfIcon'
import FirstAidDashboardIcon from 'assets/icons/FirstAidDashboardIcon'
import PatientGroupIcon from 'assets/icons/PatientGroupIcon'
import OrdersIcon from 'assets/icons/ThreeDotIcons'
import ProductionIcon from 'assets/icons/ProductionIcon'
import CashIcon from 'assets/icons/CashIcon'
import ReportIcon from 'assets/icons/ReportIcon'
import ChatDashboardIcon from 'assets/icons/ChatDashboardIcon'
import HospitalIcon from 'assets/icons/HospitalIcon'
import SettingIcon from 'assets/icons/SettingIcon'
import BellSimpleIcon from 'assets/icons/BellSimpleIcon'
import AccessControlIcon from 'assets/icons/AccessControlIcon'
import SupportIcon from 'assets/icons/SupportIcon'
import SmileyIcon from 'assets/icons/SmileyIcon'
import {IMAGE_STAR} from 'utils/ImageConst'
import getBrandConfig from 'utils/getBrandConfig'
import getColorPalette from 'utils/getColorPalette'
import useAllUserPlan from '@hooks/useAllUserPlan'
import clsx from 'clsx'
import {useCallback, useContext, useEffect, useMemo} from 'react'
import {AuthContext} from 'context/AuthContext'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {getServiceConfiguration} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import useActiveProfile from '@hooks/useActiveProfile'
import hourGlassImage from 'assets/images/HourglassMedium.png'

/**
 * Mobile sidebar items with the SAME visibility rules and structure as web.
 * Provide totalUnreadMessagesCount / notificationsCount to render badges.
 */
export const getMobileSidebarMenuItems = ({
  selectedMenu,
  expiredPlan,
  totalUnreadMessagesCount = 0,
  notificationsCount = 0,
  labChatUnreadCount = 0,
}: {
  selectedMenu: string
  expiredPlan: boolean
  totalUnreadMessagesCount?: number
  notificationsCount?: number
  labChatUnreadCount?: number
}) => {
  const {isOwner, isStarterPlanUser, isPractice, isInternalUser, isAdmin} = useAllUserPlan()
  const {sidebarAccess} = useFeatureAccess()

  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const {workflowCounts} = useSelector((state: RootState) => state.kanban)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const primaryColor = useMemo(() => getColorPalette().primaryColor, [])
  const {customerTrackingEnabled} = useActiveProfile()

  useEffect(() => {
    if (!profileId) return
    dispatchAction(getKanbanCountsByProfile({profile_id: safeParseInt(profileId)}))
    dispatchAction(getServiceConfiguration({profileId: safeParseInt(profileId)}))
  }, [profileId])

  const getCount = useCallback(
    (key: string): number => {
      if (!workflowCounts) return 0

      // Case 1: when workflowCounts is an object (like { "New Case": 24, ... })
      if (typeof workflowCounts === 'object' && !Array.isArray(workflowCounts)) {
        return workflowCounts[key] ?? 0
      }

      // Case 2: when workflowCounts is an array of items with workflow_name
      if (Array.isArray(workflowCounts)) {
        const item = workflowCounts.find(
          (t: any) => (t?.workflow_name || '').toLowerCase() === key.toLowerCase()
        )
        return item?.count || 0
      }

      return 0
    },
    [workflowCounts]
  )
  const counts = useMemo(
    () => ({
      newCaseCount: getCount('New Case'),
      planningInHouseCount: getCount('Planning In House'),
      planningOutsourceCount: getCount('Plan Outsourced'),
      productionInHouseCount: getCount('Production In House'),
      productionOutsourceCount: getCount('Production Outsource'),
    }),
    [getCount]
  )

  const isVspPlanning = serviceConfig?.VSP_PLANNING
  const isVspPractice = isVspPlanning && isPractice
  const isAlignerServiceEnabled = serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || isPractice
  const isPlanningServiceEnabled =
    serviceConfig?.PLANNING || serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || isPractice
  const isManufacturingServiceEnabled =
    serviceConfig?.MANUFACTURING || serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || isPractice
  const shouldShowCasesLabel =
    (isPractice && !serviceConfig?.PLANNING && !isVspPractice) ||
    (serviceConfig?.PLANNING && !isPractice && !isVspPlanning)

  const items = [
    {
      key: sidebarRouteConstants.DASHBOARD,
      label: 'Dashboard',
      icon: (
        <DashboardIcon
          className={clsx(expiredPlan && 'opacity-40')}
          color={
            selectedMenu === sidebarRouteConstants.DASHBOARD
              ? expiredPlan
                ? '#666'
                : getColorPalette().primaryColor
              : '#666'
          }
        />
      ),
      disabled: expiredPlan,
    },
    ...(isStarterPlanUser && !isVspPlanning
      ? [
          {
            key: sidebarRouteConstants.CALENDAR,
            label: 'Calendar',
            icon: (
              <CalenderHalfIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.CALENDAR
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),
    ...((sidebarAccess?.practiceLocations || isStarterPlanUser) && !isVspPlanning
      ? [
          {
            key: sidebarRouteConstants.PRACTICE_LOCATION,
            label: 'Practice Location',
            icon: (
              <HospitalIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.PRACTICE_LOCATION
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),
    ...((sidebarAccess?.customers && (!isInternalUser || isAdmin) && !isVspPractice) ||
    (isVspPlanning && !isPractice)
      ? [
          {
            key: sidebarRouteConstants.CUSTOMERS,
            label: (
              <div className='flex justify-between items-center gap-2'>
                <p>Customers</p>
              </div>
            ),
            icon: (
              <FirstAidDashboardIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.CUSTOMERS
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),

    ...(((sidebarAccess?.patients && isAlignerServiceEnabled) ||
      isStarterPlanUser ||
      (isVspPlanning && isPractice)) &&
    !(isVspPlanning && !isPractice)
      ? [
          {
            key: sidebarRouteConstants.PATIENTS,
            label: (
              <div className='flex justify-between items-center gap-2'>
                <p>{shouldShowCasesLabel ? 'Cases' : 'Patients'}</p>
              </div>
            ),
            icon: (
              <PatientGroupIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.PATIENTS
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),

    ...(serviceConfig.PLANNING && !isPractice && !isVspPlanning
      ? [
          {
            key: sidebarRouteConstants.CHILD_ALIGNER_PLANNING_IN_HOUSE,
            label: (
              <div className='flex justify-between items-center gap-2'>
                <p>Cases</p>
              </div>
            ),
            icon: (
              <PatientGroupIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.CHILD_ALIGNER_PLANNING_IN_HOUSE
                    ? expiredPlan
                      ? '#666'
                      : primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),
    sidebarAccess?.alignerOrders?.alignerOrders &&
    !serviceConfig.PLANNING &&
    !isVspPractice &&
    !isPractice
      ? {
          key: sidebarRouteConstants.ORDERS,
          label: (
            <div className='flex justify-between items-center gap-2'>
              <p>Orders</p>
            </div>
          ),
          disabled: expiredPlan,
          icon: (
            <OrdersIcon
              className={clsx(expiredPlan && 'opacity-40')}
              color={
                [
                  'CHILD_NEW_CASE',
                  'CHILD_ALIGNER_PLANNING_IN_HOUSE',
                  'CHILD_ALIGNER_PLANNING_OUTSOURCE',
                  'CHILD_ALIGNER_PRODUCTION_IN_HOUSE',
                  'CHILD_ALIGNER_PRODUCTION_OUTSOURCE',
                ].includes(selectedMenu)
                  ? expiredPlan
                    ? '#666'
                    : primaryColor
                  : '#666'
              }
            />
          ),
          children: [
            ...(sidebarAccess?.alignerOrders?.newCase && (isAlignerServiceEnabled || isVspPlanning)
              ? [
                  {
                    key: sidebarRouteConstants.CHILD_NEW_CASE,
                    label: `New Case (${counts.newCaseCount})`,
                    disabled: expiredPlan,
                  },
                ]
              : []),
            ...(sidebarAccess?.alignerOrders?.planning &&
            (isPlanningServiceEnabled || isVspPlanning)
              ? [
                  {
                    key: sidebarRouteConstants.CHILD_ALIGNER_PLANNING_IN_HOUSE,
                    label: `Planning (${counts.planningInHouseCount})`,
                    disabled: expiredPlan,
                  },
                ]
              : []),
            ...(sidebarAccess?.alignerOrders?.plansOutsourced && isAlignerServiceEnabled
              ? [
                  {
                    key: sidebarRouteConstants.CHILD_ALIGNER_PLANNING_OUTSOURCE,
                    label: `Plans Outsourced (${counts.planningOutsourceCount})`,
                    disabled: expiredPlan,
                  },
                ]
              : []),
            ...(sidebarAccess?.alignerOrders?.production &&
            (isManufacturingServiceEnabled || isVspPlanning)
              ? [
                  {
                    key: sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_IN_HOUSE,
                    label: `Production (${counts.productionInHouseCount})`,
                    disabled: expiredPlan,
                  },
                ]
              : []),
            ...(sidebarAccess?.alignerOrders?.productionOutsourced && isAlignerServiceEnabled
              ? [
                  {
                    key: sidebarRouteConstants.CHILD_ALIGNER_PRODUCTION_OUTSOURCE,
                    label: `Production Outsourced (${counts.productionOutsourceCount})`,
                    disabled: expiredPlan,
                  },
                ]
              : []),
          ].filter(Boolean),
        }
      : null,
    ...(sidebarAccess?.ongoingProduction && isManufacturingServiceEnabled && !isVspPlanning
      ? [
          {
            key: sidebarRouteConstants.PRODUCTION,
            label: (
              <div className='flex items-center gap-2 ml-2'>
                <span>Ongoing Production</span>
              </div>
            ),
            icon: (
              <ProductionIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.PRODUCTION
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),

    ...(sidebarAccess?.unprocessedList &&
    isManufacturingServiceEnabled &&
    !(isPractice && serviceConfig?.PLANNING) &&
    !isVspPlanning
      ? [
          {
            key: sidebarRouteConstants.UNPROCESSED_ORDERS,
            label: (
              <div className='flex justify-between items-center gap-2'>
                <p>Unprocessed Batches</p>
              </div>
            ),
            disabled: expiredPlan,
            icon: (
              <div className='mr-1'>
                <img
                  src={hourGlassImage}
                  alt='star'
                  className={clsx('h-5 w-5 object-contain', expiredPlan && 'opacity-40')}
                />
              </div>
            ),
          },
        ]
      : []),

    ...(isPractice && !serviceConfig?.PLANNING && !isVspPractice
      ? [
          ...(sidebarAccess?.tracking?.alignerTracking
            ? [
                {
                  key: sidebarRouteConstants.ALIGNER_TRACKING,
                  label: 'Aligner Tracking',
                  disabled: expiredPlan,
                  icon: (
                    <ReportIcon
                      className={clsx(expiredPlan && 'opacity-40')}
                      color={
                        selectedMenu === sidebarRouteConstants.ALIGNER_TRACKING
                          ? expiredPlan
                            ? '#666'
                            : primaryColor
                          : '#666'
                      }
                    />
                  ),
                },
              ]
            : []),
          ...(sidebarAccess?.tracking?.patientAnalytics
            ? [
                {
                  key: sidebarRouteConstants.ALIGNER_ANALYTICS_CHILD,
                  label: 'Patient Analytics',
                  disabled: expiredPlan,
                  icon: (
                    <ReportIcon
                      className={clsx(expiredPlan && 'opacity-40')}
                      color={
                        selectedMenu === sidebarRouteConstants.ALIGNER_ANALYTICS_CHILD
                          ? expiredPlan
                            ? '#666'
                            : primaryColor
                          : '#666'
                      }
                    />
                  ),
                },
              ]
            : []),
        ]
      : []),

    ...(((sidebarAccess?.tracking?.tracking &&
      customerTrackingEnabled &&
      isAlignerServiceEnabled) ||
      isStarterPlanUser) &&
    !isVspPlanning &&
    !(isPractice && !serviceConfig?.PLANNING && !isVspPractice)
      ? [
          {
            key: sidebarRouteConstants.ALIGNER_ANALYTICS_PARENT,
            label: 'Tracking',
            disabled: expiredPlan,
            icon: (
              <ReportIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  ['ALIGNER_TRACKING', 'ALIGNER_ANALYTICS_CHILD'].includes(selectedMenu)
                    ? primaryColor
                    : '#666'
                }
              />
            ),
            children: [
              sidebarAccess?.tracking?.alignerTracking
                ? {
                    key: sidebarRouteConstants.ALIGNER_TRACKING,
                    label: 'Aligner Tracking',
                    disabled: expiredPlan,
                  }
                : null,
              sidebarAccess?.tracking?.patientAnalytics || isStarterPlanUser
                ? {
                    key: sidebarRouteConstants.ALIGNER_ANALYTICS_CHILD,
                    label: 'Patient Analytics',
                    disabled: expiredPlan,
                  }
                : null,
            ].filter(Boolean),
          },
        ]
      : []),

    ...(((sidebarAccess?.patientChat && customerTrackingEnabled) || isStarterPlanUser) &&
    !isVspPlanning
      ? [
          {
            key: sidebarRouteConstants.CHAT,
            disabled: expiredPlan,
            label: (
              <div className='flex justify-between items-center'>
                <div>Patient Chat</div>
                {totalUnreadMessagesCount !== 0 && (
                  <div
                    className={clsx(
                      'p-1 w-5 h-5  text-[12px] rounded-full inline-flex items-center justify-center',
                      selectedMenu === sidebarRouteConstants.CHAT
                        ? 'bg-primaryColor text-white'
                        : 'bg-lightGray text-black'
                    )}
                  >
                    {totalUnreadMessagesCount}
                  </div>
                )}
              </div>
            ),
            icon: (
              <ChatDashboardIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.CHAT
                    ? expiredPlan
                      ? '#666'
                      : primaryColor
                    : '#666'
                }
              />
            ),
          },
        ]
      : []),
    {
      key: sidebarRouteConstants.LAB_CHAT,
      disabled: expiredPlan,
      label: <div>{labChatUnreadCount > 0 ? `Lab Chat (${labChatUnreadCount})` : 'Lab Chat'}</div>,
      icon: (
        <ChatDashboardIcon
          className={clsx(expiredPlan && 'opacity-40')}
          color={
            selectedMenu === sidebarRouteConstants.LAB_CHAT
              ? expiredPlan
                ? '#666'
                : primaryColor
              : '#666'
          }
        />
      ),
    },
    ...(serviceConfig.PAYMENT_AND_BILLING && !isVspPlanning
      ? [
          {
            key: sidebarRouteConstants.BILLINGS_AND_PAYMENTS,
            label: 'Billing & Payments',
            icon: (
              <CashIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.BILLINGS_AND_PAYMENTS
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),

    ...(sidebarAccess?.settings || isStarterPlanUser
      ? [
          {
            key: sidebarRouteConstants.SETTINGS,
            label: 'Settings',
            icon: (
              <SettingIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.SETTINGS
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
          },
        ]
      : []),

    ...(sidebarAccess?.notifications || isStarterPlanUser
      ? [
          {
            key: sidebarRouteConstants.NOTIFICATIONS,
            disabled: expiredPlan,
            label: (
              <div className='flex justify-between items-center'>
                <div>Notifications</div>
                {notificationsCount !== 0 && (
                  <div className='p-1 min-w-5 h-5 text-[12px] rounded-full inline-flex items-center justify-center bg-lightGray text-black'>
                    {notificationsCount}
                  </div>
                )}
              </div>
            ),
            icon: (
              <BellSimpleIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.NOTIFICATIONS
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
          },
        ]
      : []),

    ...(((isOwner && !isStarterPlanUser && !isPractice) || (isVspPlanning && !isPractice)) &&
    !isVspPractice
      ? [
          {
            key: sidebarRouteConstants.ACCESS_CONTROL,
            label: (
              <div className={clsx('flex gap-2 justify-between items-center')}>
                <div>Access Control</div>
              </div>
            ),
            icon: (
              <AccessControlIcon
                className={clsx(expiredPlan && '!opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.ACCESS_CONTROL
                    ? expiredPlan
                      ? '#666'
                      : primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),

    ...(((sidebarAccess?.support && getBrandConfig().brand === brandNamesConstants.DENTALSTACK) ||
      isStarterPlanUser) &&
    !isVspPractice
      ? [
          {
            key: sidebarRouteConstants.SUPPORT,
            label: (
              <div className='flex justify-between items-center '>
                <div>Support</div>
              </div>
            ),
            icon: (
              <SupportIcon
                className={clsx(expiredPlan && 'opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.SUPPORT
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),

    ...((sidebarAccess?.aiSmile || isStarterPlanUser) &&
    !(isPractice && serviceConfig?.PLANNING) &&
    !isVspPlanning
      ? [
          {
            key: sidebarRouteConstants.SMILE_SIMULATION,
            label: (
              <div className='flex gap-2 justify-between items-center'>
                <div>AI Smile</div>
                <div className='rounded-[4px] py-1 px-2 font-semibold text-xs flex justify-center items-center text-primaryColor bg-primarySupport'>
                  Beta
                  <sup>
                    <img src={IMAGE_STAR} alt='star' className='w-3 h-3' />
                  </sup>
                </div>
              </div>
            ),
            icon: (
              <SmileyIcon
                className={clsx(expiredPlan && '!opacity-40')}
                color={
                  selectedMenu === sidebarRouteConstants.SMILE_SIMULATION
                    ? expiredPlan
                      ? '#666'
                      : getColorPalette().primaryColor
                    : '#666'
                }
              />
            ),
            disabled: expiredPlan,
          },
        ]
      : []),
  ]
  return items
}
