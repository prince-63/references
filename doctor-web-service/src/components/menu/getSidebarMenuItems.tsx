import brandNamesConstants from '@constants/brandNames.constants'
import sidebarRouteConstants from '@constants/sidebar.routeConstants'
import type {MenuProps} from 'antd'

type MenuItem = Required<MenuProps>['items'][number]
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import BellSimpleIcon from 'assets/icons/BellSimpleIcon'
import CalenderHalfIcon from 'assets/icons/CalenderHalfIcon'
import CashIcon from 'assets/icons/CashIcon'
import ChatDashboardIcon from 'assets/icons/ChatDashboardIcon'
import DashboardIcon from 'assets/icons/DashboardIcon'
import HospitalIcon from 'assets/icons/HospitalIcon'
import PatientGroupIcon from 'assets/icons/PatientGroupIcon'
import SettingIcon from 'assets/icons/SettingIcon'
import SupportIcon from 'assets/icons/SupportIcon'
import FolderIcon from 'assets/icons/FolderIcon'
import ArchiveIcon from 'assets/icons/ArchiveIcon'
import PulseIcon from 'assets/icons/PulseIcon'
import ChartBarIcon from 'assets/icons/ChartBarIcon'
import clsx from 'clsx'
import hourGlassImage from 'assets/images/HourglassMedium.png'
import nutImage from 'assets/images/Nut.png'
import {useMediaQuery} from 'react-responsive'
import getBrandConfig from 'utils/getBrandConfig'
import getColorPalette from 'utils/getColorPalette'
import SmileyIcon from 'assets/icons/SmileyIcon'
import {IMAGE_STAR} from 'utils/ImageConst'
import ReportIcon from 'assets/icons/ReportIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'
import AccessControlIcon from 'assets/icons/AccessControlIcon'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {useContext, useEffect, useMemo, useCallback} from 'react'
import {AuthContext} from 'context/AuthContext'
import {getServiceConfiguration} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import useActiveProfile from '@hooks/useActiveProfile'
import FirstAidDashboardIcon from 'assets/icons/FirstAidDashboardIcon'
import OrdersIcon from 'assets/icons/ThreeDotIcons'
import RewardsIcon from 'assets/icons/RewardsIcon'

export const useSidebarMenuItems = ({
  expiredPlan,
  selectedMenu,
  isCollapsed,
  totalUnreadMessagesCount,
  notificationsCount,
  labChatUnreadCount = 0,
}: {
  expiredPlan: boolean
  selectedMenu: string
  isCollapsed: boolean
  totalUnreadMessagesCount: number
  notificationsCount: number
  labChatUnreadCount?: number
}) => {
  const isMobileView = useMediaQuery({query: '(max-width: 1200px)'})
  const {isStarterPlanUser, isOwner, isPractice, isInternalUser, isAdmin} = useAllUserPlan()
  const {sidebarAccess} = useFeatureAccess()

  // derive kanban counts for aligner workflows
  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const {workflowCounts} = useSelector((state: RootState) => state.kanban)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {customerTrackingEnabled} = useActiveProfile()

  useEffect(() => {
    if (!profileId) return

    dispatchAction(getKanbanCountsByProfile({profile_id: safeParseInt(profileId)}))
    dispatchAction(
      getServiceConfiguration({
        profileId: safeParseInt(profileId),
      })
    )
  }, [profileId, dispatchAction])

  // Memoized getCount function
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

  // Memoize all counts to prevent unnecessary recalculations
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

  const createLabel = useCallback(
    (text: React.ReactNode) => (
      <div
        className={clsx('flex items-center', isMobileView ? 'text-sm' : 'text-base', 'leading-5')}
      >
        {text}
      </div>
    ),
    [isMobileView]
  )

  const getIconFilter = useCallback(
    (menuKey: string) => (selectedMenu === menuKey && !expiredPlan ? 'none' : 'grayscale(1)'),
    [selectedMenu, expiredPlan]
  )

  // Memoize the primary color
  const primaryColor = useMemo(() => getColorPalette().primaryColor, [])
  const brandConfig = useMemo(() => getBrandConfig(), [])

  const isVspPlanning = serviceConfig?.VSP_PLANNING
  const isVspPractice = isVspPlanning && isPractice
  const isAlignerServiceEnabled = serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || isPractice
  const isPlanningServiceEnabled =
    serviceConfig?.PLANNING || serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || isPractice
  const isManufacturingServiceEnabled =
    serviceConfig?.MANUFACTURING || serviceConfig?.ALIGNER_PLANNING_MANUFACTURING || isPractice

  const items = useMemo(() => {
    // Exact sidebar for Practice Connected Org (no PLANNING flag)
    if (isPractice && !serviceConfig?.PLANNING && !isVspPractice) {
      return [
        {
          key: sidebarRouteConstants.DASHBOARD,
          label: createLabel('Dashboard'),
          icon: (
            <DashboardIcon
              className={clsx(expiredPlan && 'opacity-40')}
              color={
                selectedMenu === sidebarRouteConstants.DASHBOARD
                  ? expiredPlan
                    ? '#666'
                    : primaryColor
                  : '#666'
              }
            />
          ),
          disabled: expiredPlan,
        },
        sidebarAccess?.practiceLocations
          ? {
              key: sidebarRouteConstants.PRACTICE_LOCATION,
              label: createLabel('Practice Location'),
              icon: (
                <HospitalIcon
                  className={clsx(expiredPlan && 'opacity-40')}
                  color={
                    selectedMenu === sidebarRouteConstants.PRACTICE_LOCATION
                      ? expiredPlan
                        ? '#666'
                        : primaryColor
                      : '#666'
                  }
                />
              ),
              disabled: expiredPlan,
            }
          : null,
        sidebarAccess?.patients
          ? {
              key: sidebarRouteConstants.PATIENTS, // Maps to 'patients-list' in PrivateRoutes
              label: (
                <div className='flex justify-between items-center gap-2'>
                  <p>Cases</p>
                </div>
              ),
              icon: (
                <FolderIcon
                  color={
                    selectedMenu === sidebarRouteConstants.PATIENTS
                      ? expiredPlan
                        ? '#666'
                        : primaryColor
                      : '#666'
                  }
                />
              ),
              disabled: expiredPlan,
            }
          : null,
        {
          key: sidebarRouteConstants.LAB_CHAT,
          disabled: expiredPlan,
          label: (
            <div className='flex items-center justify-between gap-2 w-full'>
              <span>Lab Chat</span>
              {labChatUnreadCount > 0 ? (
                <span className='inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red text-white text-[10px] font-semibold px-1.5'>
                  {labChatUnreadCount}
                </span>
              ) : null}
            </div>
          ),
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
        sidebarAccess?.unprocessedList
          ? {
              key: sidebarRouteConstants.UNPROCESSED_ORDERS,
              label: createLabel('Unprocessed batches'),
              disabled: expiredPlan,
              icon: (
                <ArchiveIcon
                  color={
                    selectedMenu === sidebarRouteConstants.UNPROCESSED_ORDERS
                      ? expiredPlan
                        ? '#666'
                        : primaryColor
                      : '#666'
                  }
                />
              ),
            }
          : null,
        sidebarAccess?.tracking?.alignerTracking
          ? {
              key: sidebarRouteConstants.ALIGNER_TRACKING,
              label: createLabel('Aligner Tracking'),
              disabled: expiredPlan,
              icon: (
                <PulseIcon
                  color={
                    selectedMenu === sidebarRouteConstants.ALIGNER_TRACKING
                      ? expiredPlan
                        ? '#666'
                        : primaryColor
                      : '#666'
                  }
                />
              ),
            }
          : null,
        sidebarAccess?.tracking?.patientAnalytics
          ? {
              key: sidebarRouteConstants.ALIGNER_ANALYTICS_CHILD,
              label: createLabel('Patient Analytics'),
              disabled: expiredPlan,
              icon: (
                <ChartBarIcon
                  color={
                    selectedMenu === sidebarRouteConstants.ALIGNER_ANALYTICS_CHILD
                      ? expiredPlan
                        ? '#666'
                        : primaryColor
                      : '#666'
                  }
                />
              ),
            }
          : null,

        sidebarAccess?.patientChat && customerTrackingEnabled
          ? {
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
            }
          : null,

        sidebarAccess?.settings
          ? {
              key: sidebarRouteConstants.SETTINGS,
              label: 'Settings',
              icon: (
                <SettingIcon
                  color={selectedMenu === sidebarRouteConstants.SETTINGS ? primaryColor : '#666'}
                />
              ),
            }
          : null,

        sidebarAccess?.notifications
          ? {
              key: sidebarRouteConstants.NOTIFICATIONS,
              disabled: expiredPlan,
              label: (
                <div className='flex justify-between items-center'>
                  <div>Notifications</div>
                  {notificationsCount !== 0 && (
                    <div
                      className={clsx(
                        'p-1 min-w-5 h-5  text-[12px] rounded-full inline-flex items-center justify-center',
                        isCollapsed ? 'bg-primaryColor text-white' : 'bg-lightGray text-black'
                      )}
                    >
                      {notificationsCount}
                    </div>
                  )}
                </div>
              ),
              icon: (
                <BellSimpleIcon
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
            }
          : null,
      ].filter(Boolean) as MenuItem[]
    }
    return [
      {
        key: sidebarRouteConstants.DASHBOARD,
        label: createLabel('Dashboard'),
        icon: (
          <DashboardIcon
            className={clsx(expiredPlan && 'opacity-40')}
            color={
              selectedMenu === sidebarRouteConstants.DASHBOARD
                ? expiredPlan
                  ? '#666'
                  : primaryColor
                : '#666'
            }
          />
        ),
        disabled: expiredPlan,
      },
      ...((sidebarAccess.customers && (!isInternalUser || isAdmin) && !isVspPractice) ||
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
      ...(isStarterPlanUser && !isVspPlanning
        ? [
            {
              key: sidebarRouteConstants.CALENDAR,
              label: createLabel('Calendar'),
              icon: (
                <div className='mr-[1px]'>
                  <CalenderHalfIcon
                    className={clsx(expiredPlan && 'opacity-40')}
                    color={
                      selectedMenu === sidebarRouteConstants.CALENDAR
                        ? expiredPlan
                          ? '#666'
                          : primaryColor
                        : '#666'
                    }
                  />
                </div>
              ),
              disabled: expiredPlan,
            },
          ]
        : []),
      ...((sidebarAccess?.practiceLocations || isStarterPlanUser) && !isVspPlanning
        ? [
            {
              key: sidebarRouteConstants.PRACTICE_LOCATION,
              label: createLabel('Practice Location'),
              icon: (
                <HospitalIcon
                  className={clsx(expiredPlan && 'opacity-40')}
                  color={
                    selectedMenu === sidebarRouteConstants.PRACTICE_LOCATION
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

      ...((sidebarAccess?.patients && isAlignerServiceEnabled) ||
      isStarterPlanUser ||
      (isVspPlanning && isPractice)
        ? [
            {
              key: sidebarRouteConstants.PATIENTS,
              label: (
                <div className='flex justify-between items-center gap-2'>
                  <p>Patients</p>
                </div>
              ),
              icon: (
                <PatientGroupIcon
                  className={clsx(expiredPlan && 'opacity-40')}
                  color={
                    selectedMenu === sidebarRouteConstants.PATIENTS
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
              ...(sidebarAccess?.alignerOrders?.newCase &&
              (isAlignerServiceEnabled || isVspPlanning)
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

      sidebarAccess?.ongoingProduction && isManufacturingServiceEnabled && !isVspPlanning
        ? {
            key: sidebarRouteConstants.PRODUCTION,
            label: 'Ongoing Production',
            icon: (
              <div className='mr-1'>
                <img
                  src={nutImage}
                  alt='ongoing production'
                  className={clsx('h-5 w-5 object-contain', expiredPlan && 'opacity-40')}
                  style={{filter: getIconFilter(sidebarRouteConstants.PRODUCTION)}}
                />
              </div>
            ),
            disabled: expiredPlan,
          }
        : null,
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

      ...(((sidebarAccess?.tracking?.tracking &&
        customerTrackingEnabled &&
        isAlignerServiceEnabled) ||
        isStarterPlanUser) &&
      !isVspPlanning
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
        label: (
          <div className='flex items-center justify-between gap-2 w-full'>
            <span>Lab Chat</span>
            {labChatUnreadCount > 0 ? (
              <span className='inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red text-white text-[10px] font-semibold px-1.5'>
                {labChatUnreadCount}
              </span>
            ) : null}
          </div>
        ),
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
      ...(serviceConfig?.PAYMENT_AND_BILLING && !isVspPlanning
        ? [
            {
              key: sidebarRouteConstants.BILLINGS_AND_PAYMENTS,
              label: 'Billing & Payments',
              icon: (
                <div className='mr-1'>
                  <CashIcon
                    className={clsx(expiredPlan && 'opacity-40')}
                    color={
                      selectedMenu === sidebarRouteConstants.BILLINGS_AND_PAYMENTS
                        ? expiredPlan
                          ? '#666'
                          : primaryColor
                        : '#666'
                    }
                  />
                </div>
              ),
              disabled: expiredPlan,
            },
          ]
        : []),
      (sidebarAccess?.settings || isStarterPlanUser) && {
        key: sidebarRouteConstants.SETTINGS,
        label: 'Settings',
        icon: (
          <SettingIcon
            color={selectedMenu === sidebarRouteConstants.SETTINGS ? primaryColor : '#666'}
          />
        ),
      },

      ...(!isVspPractice
        ? [
            {
              key: sidebarRouteConstants.REWARDS,
              label: 'Rewards',
              icon: (
                <RewardsIcon
                  color={selectedMenu === sidebarRouteConstants.REWARDS ? primaryColor : '#666'}
                />
              ),
            },
          ]
        : []),
      ...(((isOwner && !isStarterPlanUser) ||
        (isPractice && !(isPractice && serviceConfig?.PLANNING)) ||
        (isVspPlanning && !isPractice)) &&
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

      (sidebarAccess?.notifications || isStarterPlanUser) && {
        key: sidebarRouteConstants.NOTIFICATIONS,
        disabled: expiredPlan,
        label: (
          <div className='flex justify-between items-center'>
            <div>Notifications</div>
            {notificationsCount !== 0 && (
              <div
                className={clsx(
                  'p-1 min-w-5 h-5  text-[12px] rounded-full inline-flex items-center justify-center',
                  isCollapsed ? 'bg-primaryColor text-white' : 'bg-lightGray text-black'
                )}
              >
                {notificationsCount}
              </div>
            )}
          </div>
        ),
        icon: (
          <BellSimpleIcon
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

      ...(((sidebarAccess?.support && brandConfig.brand === brandNamesConstants.DENTALSTACK) ||
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
                        : primaryColor
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
                <div className={clsx('flex gap-2 justify-between items-center')}>
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
                        : primaryColor
                      : '#666'
                  }
                />
              ),
              disabled: expiredPlan,
            },
          ]
        : []),
    ].filter(Boolean)
  }, [
    isCollapsed,
    createLabel,
    expiredPlan,
    selectedMenu,
    primaryColor,
    isStarterPlanUser,
    sidebarAccess,
    getIconFilter,
    counts,
    workflowCounts,
    totalUnreadMessagesCount,
    notificationsCount,
    isOwner,
    isInternalUser,
    isAdmin,
    brandConfig.brand,
    isAlignerServiceEnabled,
    isPlanningServiceEnabled,
    isManufacturingServiceEnabled,
    isVspPlanning,
  ])

  return {items}
}
