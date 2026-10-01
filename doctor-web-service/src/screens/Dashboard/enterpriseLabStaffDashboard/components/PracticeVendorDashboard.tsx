import React, {useContext, useEffect, useState} from 'react'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {getSalutations, safeParseInt} from 'utils/ConstFunctions'
import When from 'components/when/When'
import {
  getSubscriptionDetails,
  requestForExtension,
} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import GettingStartedSideScreen from 'components/GettingStarted/GettingStartedSideScreen'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import isTrialPlanStarted from '@utils/isTrialPlanStarted'
import SubscriptionInfoModal from 'components/subscription/modals/SubscriptionInfoModal'
import CelebrationsIcon from 'assets/icons/CelebrationsIcon'
import {useNavigate} from 'react-router-dom'
import trialPlanForDesignLabFeatures from '@staticData/trialPlanForDesignLabFeatures'
import {
  ApiResponseDoctorProfile,
  getApiDataDoctorProfile,
} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import getActiveProfile from '@utils/getActiveProfile'
import CustomerActionPending from './CustomerActionPending'
import NeedsAttention from './NeedsAttention'
import MyTasks from './MyTasks'
import StatBoxes from './StatBoxes'
import {DashboardTypeListItem} from 'screens/Dashboard/dashboard/types/dashboard.types'
import useDashboard from '@hooks/useDashboard'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getStorageType} from 'utils/storage'

const PracticeVendorDashboard = ({
  filter,
}: {
  filter: Record<DashboardTypeListItem['value'], boolean>
}) => {
  const {dispatchAction} = useDispatchAction()
  const {enterprise_lab_staff} = useDashboard(true)
  const {userId, profileId} = useContext(AuthContext)
  const {gettingStartedData, gettingStartedLoading} = useSelector(
    (state: RootState) => state.apiDoctorProfileGet
  )
  const navigate = useNavigate()
  const {isPractice, isStarterPlanUser, isDesignLabUser} = useAllUserPlan()
  const {customer_added, user_added} = gettingStartedData
  const isAnyFalse = gettingStartedLoading
    ? false
    : [user_added, customer_added].some((value) => !value)
  const {permissionChecks} = useFeatureAccess()
  const dashboardChecks = permissionChecks?.dashboard
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(
    isAnyFalse && getStorageType().getItem('isGettingStartedOpen') === 'true'
  )
  const hasPermissions =
    permissionChecks?.profilesAccountsAndSettings?.addEditBrandingDetails?.isViewable

  useEffect(() => {
    dispatchAction(getSubscriptionDetails({doctor_id: safeParseInt(userId)}))
    const postData = {
      doctor_id: safeParseInt(userId),
    }
    dispatchAction(getApiDataDoctorProfile(postData))
      .unwrap()
      .then((res: ApiResponseDoctorProfile) => {
        const activeProfile = getActiveProfile(res!.profiles, safeParseInt(profileId))
        if (!activeProfile?.brand_name_added && hasPermissions) {
          navigate('/brand-details')
        } else {
          navigate('/')
        }
      })
  }, [])

  const {subscriptionData} = useSubscriptionDetails()
  const [isTrialPlanStartedModalOpen, setIsTrialPlanStartedModalOpen] = useState(
    isTrialPlanStarted(subscriptionData)
  )
  const {loadingEnterpriseLabStaffCounts} = useSelector((state: RootState) => state.DoctorDashboard)
  const {account} = useSelector((state: RootState) => state.settings)
  const doctorName = `${getSalutations(account?.salutation ?? '')} ${account.first_name ?? ''} ${
    account.last_name ?? ''
  }`

  const counts: any = (filter.PRACTICE_ORDER
    ? enterprise_lab_staff?.practice_order
    : enterprise_lab_staff?.customer_orders) ?? {
    total: 0,
    ordered: 0,
    in_progress: 0,
    in_review: 0,
    approved: 0,
    completed: 0,
    replan: 0,
    stl_files_requested: 0,
    stl_files_uploaded: 0,
  }

  return (
    <Page loading={loadingEnterpriseLabStaffCounts}>
      <When isTrue={isGettingStartedOpen && (isPractice || isDesignLabUser || isStarterPlanUser)}>
        <GettingStartedSideScreen setIsGettingStartedOpen={setIsGettingStartedOpen} />
      </When>
      <When isTrue={isTrialPlanStartedModalOpen && isDesignLabUser}>
        <SubscriptionInfoModal
          {...{
            title: `Congratulations! Your trial of Design Lab Plan has started`,
            subTitle: `Your 14-Day FREE trial of Design Lab starts now!`,
            footerInfo: 'Upgrade anytime to continue managing orders and collaborating seamlessly!',
            buttonText: 'Upgrade',
            HeaderIcon: CelebrationsIcon,
            onClick: () => {
              const payload = {
                ...subscriptionData,
                has_plan_started_consent: true,
              }
              dispatchAction(requestForExtension(payload))
              setIsTrialPlanStartedModalOpen(false)
              navigate('/upgrade-renew-subscription')
            },
            featuresHeader: 'During your trial, you can:',
            featuresList: trialPlanForDesignLabFeatures(),
            onClose: () => {
              const payload = {
                ...subscriptionData,
                has_plan_started_consent: true,
              }
              dispatchAction(requestForExtension(payload))
              setIsTrialPlanStartedModalOpen(false)
            },
            buttonClassName: 'pb-4',
          }}
        />
      </When>
      <div className='flex flex-col gap-4'>
        <div className=' text-black text-[18px] md:text-[32px] lg:text-[32px] font-semibold'>
          Welcome back, {doctorName ?? ''}!
        </div>
        {dashboardChecks?.orderStatusCards?.isViewable && (
          <StatBoxes counts={counts} filter={filter} />
        )}
        <div className='flex flex-col gap-4 '>
          <div className='flex gap-4 flex-wrap md:flex-nowrap  md:w-3/4'>
            {dashboardChecks?.myTasks?.isViewable && <MyTasks filter={filter} />}
            {dashboardChecks?.customerActionPending?.isViewable && (
              <CustomerActionPending filter={filter} />
            )}
          </div>
          {dashboardChecks?.needsAttention?.isViewable && (
            <div className='max-w-[500px]'>
              <NeedsAttention filter={filter} />
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}

export default PracticeVendorDashboard
