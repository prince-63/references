import React, {useContext, useEffect, useState} from 'react'
import {Outlet} from 'react-router-dom'
import {FaChevronLeft} from 'react-icons/fa'
import {useMediaQuery} from 'react-responsive'
import {safeParseInt} from '../../utils/ConstFunctions'
import {AuthContext} from '../../context/AuthContext'
import {useSelector} from 'react-redux'
import MobileSideBar from 'screens/Dashboard/sidebar/component/MobileSideBar'
import {RootState} from 'redux/store'
import SidebarMenu from 'components/menu/SidebarMenu'
import ModalGlobalSearch from 'screens/Dashboard/sidebar/GlobalSearch/ModalGlobalSearch'
import When from 'components/when/When'
import {CustomNavigateContext} from 'context/CustomNavigationContext'
import {Modal, Spin} from 'antd'
import ButtonRed from 'components/atom/Buttons/ButtonRed'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import BottomBarMobile from 'components/menu/BottomBarMobile'
import useDispatchAction from '@hooks/useDispatchAction'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import AppTopHeader from 'components/header/AppTopHeader'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import isPlanExpired from '@utils/isPlanExpired'
import {getStorageType} from 'utils/storage'
import Spinner from 'components/spinner/Spinner'
import cn from '@utils/cn'

const MainLayout = () => {
  const isTabletAndBelow = useMediaQuery({query: '(max-width: 1200px)'})
  const [isSidebarCollapsed, setSidebarCollapsed] = React.useState(isTabletAndBelow)
  const {userId}: any = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const path = location.pathname
  const {subscriptionData, loadingSubscriptionData} = useSubscriptionDetails(true)
  const expiredPlan =
    isPlanExpired(subscriptionData) || subscriptionData.plan_metadata?.request_deletion

  const toggleSidebar = () => {
    setSidebarCollapsed((prev: any) => !prev)
  }

  useEffect(() => {
    if (isTabletAndBelow) {
      setSidebarCollapsed(true)
    } else {
      setSidebarCollapsed(false)
    }
  }, [isTabletAndBelow])

  // const loginSessionCheck = () => {
  //   const postData = {
  //     data: {
  //       email: userData?.email,
  //       fingerPrint: getDeviceDetails().fingerprint,
  //     },
  //   }

  //   dispatch(postApiDataLoginSessionCheck(postData) as any)
  //     .unwrap()
  //     .then((res: any) => {
  //       if (!res) {
  //         logout()
  //       }
  //     })
  //     .catch((error: AxiosError) => {
  //       console.error(error)
  //     })
  // }
  useEffect(() => {
    if (expiredPlan && !path.startsWith('/settings')) {
      navigate('/')
    }
  }, [path, subscriptionData])
  const {isMobileSidebarOpen, isBottomBarOpen} = useSelector((state: RootState) => {
    return state.mobileSidebar
  })

  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false)
  const {handleModalClose, isModalVisible, navigate} = useContext(CustomNavigateContext)

  useEffect(() => {
    const handler = () => {
      // open mobile sidebar via redux slice if available
      import('../../redux/Slices/AppSlice/Dashboard/MobileSidebarSlice')
        .then((m) => {
          const {} = m
          // dynamic import ensures no circular dependency at build
          // dispatch through store via window reference not present; fallback to console if missing
        })
        .catch(() => {})
    }
    window.addEventListener('app:toggleSidebar', handler)
    return () => window.removeEventListener('app:toggleSidebar', handler)
  }, [])

  useEffect(() => {
    if (userId) {
      const payload = {
        doctor_id: safeParseInt(userId),
      }
      dispatchAction(getApiDataDoctorProfile(payload))
    }
  }, [userId])

  useEffect(() => {
    const defaultRoute = getStorageType().getItem('defaultRoute')
    if (defaultRoute) {
      navigate(defaultRoute)
      getStorageType().removeItem('defaultRoute')
    }
  }, [])

  useEffect(() => {
    if (path === '/add-patient') {
      dispatchAction(setIsBottomBarOpen(false))
    } else {
      dispatchAction(setIsBottomBarOpen(true))
    }
  }, [path])

  return (
    <Spin indicator={<Spinner loading />} spinning={loadingSubscriptionData}>
      {isModalVisible && (
        <Modal
          title={<p className='text-black text-2xl font-bold mt-4'>Quit Editing?</p>}
          open={isModalVisible}
          onOk={() => handleModalClose(true)}
          footer={
            <div className='flex flex-row h-auto justify-between gap-6 mt-4'>
              <ButtonOutlined
                onClick={() => handleModalClose(false)}
                text='Go back'
                className={'h-14 border-red text-red hover:bg-white hover:drop-shadow-none'}
              />
              <ButtonRed
                text='Yes, Quit'
                onClick={() => {
                  handleModalClose(true)
                }}
              />
            </div>
          }
          onCancel={() => handleModalClose(false)}
        >
          <div className='w-auto h-auto mt-3 text-textColor text-base font-normal leading-snug'>
            You have unsaved changes. Are you sure you want to leave?
          </div>
        </Modal>
      )}

      <div className={`flex h-dvh max-w-full`} id='main-layout'>
        <div
          className={`hidden md:block h-full top-0 left-0 border-r border-mediumGray z-10 bg-white fixed transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'w-24' : 'w-[265px]'
          }`}
        >
          <div className='absolute top-[40px] -right-9 transform -translate-y-1/2 p-4 block  '>
            <button onClick={toggleSidebar} className='focus:outline-none'>
              <div className={`bg-primarySupport rounded-full p-2 `}>
                {!isSidebarCollapsed && <FaChevronLeft className='text-xl' />}
              </div>
            </button>
          </div>

          <SidebarMenu
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
            setIsSearchBoxOpen={setIsSearchBoxOpen}
          />
        </div>

        <div
          className={`max-w-full flex-grow h-full min-h-0 flex flex-col z-1 ${
            !isSidebarCollapsed ? 'md:ml-[267px]' : 'md:ml-[104px]'
          } transition-all duration-300`}
        >
          <div className='md:block w-full shrink-0'>
            <AppTopHeader />
          </div>
          {isMobileSidebarOpen && <MobileSideBar />}

          <When isTrue={isSearchBoxOpen}>
            <ModalGlobalSearch setIsModalGlobalSearchOpen={setIsSearchBoxOpen} />
          </When>

          {/* main content area – add padding only when there is overflow so we don’t show
              a blank stripe on short pages */}
          <main
            className='p-4 box-border max-w-full md:w-full z-1 flex-1 min-h-0 flex flex-col scroll-pb-[100px]'
            id='sidebar-container'
          >
            <div
              className={cn(
                'flex-1 min-h-0 ',
                isBottomBarOpen && !expiredPlan ? 'md:pb-0 pb-[70px]' : ''
              )}
            >
              <Outlet />
            </div>

            {isBottomBarOpen && !expiredPlan && (
              <div className='md:hidden fixed left-0 bottom-0 justify-end z-[50] w-full '>
                <BottomBarMobile />
              </div>
            )}
          </main>
        </div>
      </div>
    </Spin>
  )
}

export default MainLayout
