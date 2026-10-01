import sidebarRouteConstants from '@constants/sidebar.routeConstants'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import ChatDashboardIcon from 'assets/icons/ChatDashboardIcon'
import DashboardIcon from 'assets/icons/DashboardIcon'
import FirstAidDashboardIcon from 'assets/icons/FirstAidDashboardIcon'
import clsx from 'clsx'
import getColorPalette from 'utils/getColorPalette'
import MoreBottomBarIcon from 'assets/icons/MoreBottomBarIcon'
import PatientIcon from 'assets/icons/PatientIcon'

export const getBottomBarMenuItems = ({
  expiredPlan,
  selectedMenu,
  totalUnreadMessagesCount,
}: {
  expiredPlan: boolean
  selectedMenu: string
  totalUnreadMessagesCount: number
}) => {
  const {permissionChecks} = useFeatureAccess()
  const customerPermissions = permissionChecks?.customerManagement?.customerManagement?.isEditable
  const chatPermissions = permissionChecks?.chat?.chatWithPatients?.isEditable

  return [
    {
      key: sidebarRouteConstants.DASHBOARD,
      label: '',
      icon: (
        <div className='flex flex-col items-center justify-center w-full'>
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
          <div
            className={clsx(
              'font-medium text-[13px] text-center w-full mt-1',
              selectedMenu === sidebarRouteConstants.DASHBOARD
                ? `text-[${expiredPlan ? '#666' : getColorPalette().primaryColor}]`
                : 'text-[#666]'
            )}
          >
            Dashboard
          </div>
        </div>
      ),
      disabled: expiredPlan,
    },

    {
      key: sidebarRouteConstants.PATIENTS,
      label: '',
      icon: (
        <div className='flex flex-col items-center justify-center w-full'>
          <PatientIcon
            className={clsx(expiredPlan && 'opacity-40')}
            color={
              selectedMenu === sidebarRouteConstants.PATIENTS
                ? expiredPlan
                  ? '#666'
                  : getColorPalette().primaryColor
                : '#666'
            }
          />
          <div
            className={clsx(
              'font-medium text-[13px] text-center w-full mt-1',
              selectedMenu === sidebarRouteConstants.PATIENTS
                ? `text-[${expiredPlan ? '#666' : getColorPalette().primaryColor}]`
                : 'text-[#666]'
            )}
          >
            Patients
          </div>
        </div>
      ),
      disabled: expiredPlan,
    },

    ...(customerPermissions
      ? [
          {
            key: sidebarRouteConstants.PRACTICES,
            label: '',
            icon: (
              <div className='flex flex-col items-center justify-center w-full'>
                <FirstAidDashboardIcon
                  className={clsx(expiredPlan && 'opacity-40')}
                  color={
                    selectedMenu === sidebarRouteConstants.PRACTICES
                      ? expiredPlan
                        ? '#666'
                        : getColorPalette().primaryColor
                      : '#666'
                  }
                />
                <div
                  className={clsx(
                    'font-medium text-[13px] text-center w-full mt-1',
                    selectedMenu === sidebarRouteConstants.PRACTICES
                      ? `text-[${expiredPlan ? '#666' : getColorPalette().primaryColor}]`
                      : 'text-[#666]'
                  )}
                >
                  Practice
                </div>
              </div>
            ),
            disabled: expiredPlan,
          },
        ]
      : []),

    ...(chatPermissions
      ? [
          {
            key: sidebarRouteConstants.CHAT,
            disabled: expiredPlan,
            label: '',
            icon: (
              <div className='flex flex-col items-center justify-center w-full'>
                {totalUnreadMessagesCount > 1 && <div className='w-2 h-2'>.</div>}

                <ChatDashboardIcon
                  className={clsx(expiredPlan && 'opacity-40')}
                  color={
                    selectedMenu === sidebarRouteConstants.CHAT
                      ? expiredPlan
                        ? '#666'
                        : getColorPalette().primaryColor
                      : '#666'
                  }
                />
                <div
                  className={clsx(
                    'font-medium text-[13px] text-center w-full mt-1',
                    selectedMenu === sidebarRouteConstants.CHAT
                      ? `text-[${expiredPlan ? '#666' : getColorPalette().primaryColor}]`
                      : 'text-[#666]'
                  )}
                >
                  Chat
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: sidebarRouteConstants.MORE,
      disabled: expiredPlan,
      label: '',
      icon: (
        <div className='flex flex-col items-center justify-center w-full'>
          <MoreBottomBarIcon
            className={clsx(expiredPlan && 'opacity-40')}
            color={
              selectedMenu === sidebarRouteConstants.MORE
                ? expiredPlan
                  ? '#666'
                  : getColorPalette().primaryColor
                : '#666'
            }
          />

          <div
            className={clsx(
              'font-medium text-[13px] text-center w-full mt-1',
              selectedMenu === sidebarRouteConstants.MORE
                ? `text-[${expiredPlan ? '#666' : getColorPalette().primaryColor}]`
                : 'text-[#666]'
            )}
          >
            More
          </div>
        </div>
      ),
    },
  ]
}
