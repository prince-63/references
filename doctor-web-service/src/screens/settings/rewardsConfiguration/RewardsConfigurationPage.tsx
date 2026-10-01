import {useContext, useEffect, useState} from 'react' // Added useState
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getRewardTasks,
  getRewardProducts,
  getPromotions,
} from 'redux/Slices/AppSlice/rewards/rewards.slice'
import DailyRewardsSection from './components/DailyRewardsSection'
import MilestonesSection from './components/MilestonesSection'
import PatientProductsSection from './components/PatientProductsSection'
import PromotionsSection from './components/PromotionsSection'
import ContainerWrapper from 'screens/settings/components/ContainerWrapper'
import Spinner from 'components/spinner/Spinner'
import {Tabs} from 'antd'
import type {TabsProps} from 'antd'

const RewardsConfigurationPage = () => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {loading, dailyRewards, milestones} = useSelector((state: RootState) => state.rewards)
  const [activeTab, setActiveTab] = useState('rewards')

  useEffect(() => {
    if (userId) {
      dispatchAction(getRewardTasks())
      dispatchAction(getRewardProducts())
      dispatchAction(getPromotions())
    }
  }, [userId, dispatchAction])

  const items: TabsProps['items'] = [
    {
      key: 'rewards',
      label: <span className='text-base font-semibold text-textColor'>Rewards</span>,
      children: (
        <div className='flex flex-col gap-6'>
          <DailyRewardsSection dailyRewards={dailyRewards} />
          <MilestonesSection milestones={milestones} />
        </div>
      ),
    },
    {
      key: 'products',
      label: <span className='text-base font-semibold text-textColor'>Rewards Product</span>,
      children: <PatientProductsSection />,
    },
    {
      key: 'campaign',
      label: <span className='text-base font-semibold text-textColor'>Promotion</span>,
      children: <PromotionsSection />,
    },
  ]

  return (
    <div className='relative flex flex-col gap-12 md:w-3/4'>
      {loading && (
        <div className='absolute inset-0 z-50 flex justify-center items-center bg-white/50 h-full w-full rounded-lg'>
          <Spinner loading={loading} />
        </div>
      )}
      <ContainerWrapper
        title={'Patient Rewards Configuration'}
        subTitle={'Manage all your patient rewards'}
      >
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} items={items} />
      </ContainerWrapper>
    </div>
  )
}

export default RewardsConfigurationPage
