import bottomBarFilterOptionConstants from '@constants/bottomBarFilterOption.constants'
import useFilter from '@hooks/useFilter'
import bottomBarMenu from '@staticData/bottomBarMenu'
import clsx from 'clsx'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {useNavigate} from 'context/CustomNavigationContext'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {setIsMobileSidebarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import {useEffect, useMemo} from 'react'
import getColorPalette from 'utils/getColorPalette'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'

const BottomBarMobile = () => {
  type DashboardFilterOption = (typeof bottomBarMenu)[number]
  const {filter, handleFilterChange} = useFilter<DashboardFilterOption>(bottomBarMenu)
  const {navigate, shouldBlock} = useNavigate()
  const {countsData} = useSelector((state: RootState) => state.DoctorDashboard)
  const {dispatchAction} = useDispatchAction()
  const {sidebarAccess} = useFeatureAccess()
  const {isPractice} = useAllUserPlan()

  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const isAlignerServiceEnabled = serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false
  const isVspPractice = isVspPlanning && isPractice
  const shouldUseLabChatForChats = isVspPractice
  const shouldShowCasesLabel =
    (isPractice && !serviceConfig?.PLANNING && !isVspPractice) ||
    (serviceConfig?.PLANNING && !isPractice && !isVspPlanning)

  // Allowed items for practice-style users (mobile bottom bar)
  const ALLOW_PRACTICE_SET = new Set<string>([
    bottomBarFilterOptionConstants.DASHBOARD,
    ...(sidebarAccess?.customers ? [bottomBarFilterOptionConstants.CUSTOMERS] : []),
    ...(isAlignerServiceEnabled ? [bottomBarFilterOptionConstants.PATIENTS] : []),
    ...(sidebarAccess?.patientChat ? [bottomBarFilterOptionConstants.CHATS] : []),
    bottomBarFilterOptionConstants.MORE,
  ])

  const allowed = useMemo<Set<string>>(() => {
    // if practice user with planning enabled, show only dashboard, patients, lab chat and more
    if (isPractice && serviceConfig?.PLANNING) {
      return new Set<string>([
        bottomBarFilterOptionConstants.DASHBOARD,
        bottomBarFilterOptionConstants.PATIENTS,
        bottomBarFilterOptionConstants.LAB_CHAT,
        bottomBarFilterOptionConstants.MORE,
      ])
    }
    return ALLOW_PRACTICE_SET
  }, [sidebarAccess, serviceConfig, isPractice])

  const CUSTOM_ORDER = [
    bottomBarFilterOptionConstants.DASHBOARD,
    bottomBarFilterOptionConstants.CUSTOMERS,
    bottomBarFilterOptionConstants.PATIENTS,
    bottomBarFilterOptionConstants.CHATS,
    bottomBarFilterOptionConstants.LAB_CHAT,
    bottomBarFilterOptionConstants.MORE,
  ]
  const orderIndex = (val: string) => {
    const i = CUSTOM_ORDER.indexOf(val as any)
    return i === -1 ? Number.MAX_SAFE_INTEGER : i
  }

  const callFilterNavBar = (item: DashboardFilterOption) => {
    const targetPath =
      shouldUseLabChatForChats && item.value === bottomBarFilterOptionConstants.CHATS
        ? '/lab-chat'
        : item.path

    if (!shouldBlock) handleFilterChange(item.value)
    if (targetPath === '') {
      dispatchAction(setIsMobileSidebarOpen(true))
    } else {
      navigate(`${targetPath}`)
    }
  }

  useEffect(() => {
    const matchingItem =
      shouldUseLabChatForChats && location.pathname === '/lab-chat'
        ? bottomBarMenu.find((i) => i.value === bottomBarFilterOptionConstants.CHATS)
        : bottomBarMenu.find((i) => i.path === location.pathname)

    if (matchingItem) handleFilterChange(matchingItem.value)
  }, [handleFilterChange, location.pathname, shouldUseLabChatForChats])

  return (
    <div className='h-[66px] bg-white w-full border-t border-lightGray'>
      <div className='space-2 p-1 z-30 flex justify-evenly md:hidden'>
        <div className='flex gap-x-5 border-b border-lightGray w-full text-textColor text-base font-semibold'>
          {bottomBarMenu
            .filter((item) => allowed.has(item.value as string))
            .sort((a, b) => orderIndex(a.value as string) - orderIndex(b.value as string)) // ← re-order
            .map((item) => {
              const Icon = item.icon
              return (
                <div
                  className='w-[100%] flex flex-col justify-center items-center'
                  key={item.value}
                >
                  {filter[item.value] && (
                    <div className='relative bottom-1 w-6 h-[5px] bg-primaryColor rounded-lg' />
                  )}

                  <When
                    isTrue={
                      item.value === bottomBarFilterOptionConstants.CHATS ||
                      item.value === bottomBarFilterOptionConstants.LAB_CHAT
                    }
                  >
                    {countsData.unread_chat_count !== 0 && (
                      <div className={clsx('absolute top-4 ml-5 w-3 h-3 bg-red rounded-full')}>
                        .
                      </div>
                    )}
                  </When>

                  <button
                    className='w-[25%] h-[66px] flex flex-col justify-center items-center'
                    onClick={() => callFilterNavBar(item)}
                  >
                    {filter[item.value] ? (
                      <Icon color={getColorPalette().primaryColor} secondaryColor='white' />
                    ) : (
                      <Icon />
                    )}
                    <div
                      className={clsx(
                        'text-[13px] font-medium whitespace-nowrap',
                        filter[item.value] ? 'text-primaryColor' : 'text-textColor'
                      )}
                    >
                      {item.value === bottomBarFilterOptionConstants.PATIENTS &&
                      shouldShowCasesLabel
                        ? 'Cases'
                        : item.label}
                    </div>
                  </button>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default BottomBarMobile
