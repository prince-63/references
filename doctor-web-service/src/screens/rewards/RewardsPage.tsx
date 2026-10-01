import {useEffect, useState} from 'react'
import ContainerWrapper from 'screens/settings/components/ContainerWrapper'
import {Header} from 'components/PatientList/Header'
import StatBox from 'screens/Dashboard/components/StatBox'
import getColorPalette from 'utils/getColorPalette'
import PatientsRewardsTable from './components/PatientsRewardsTable'
import RewardsOrdersTable from './components/RewardsOrdersTable'
import PromotionOrdersTable from './components/PromotionOrdersTable'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getRewardsDashboard,
  getPatientWalletList,
  getRewardOrders,
  getPromotionClaims,
} from 'redux/Slices/AppSlice/rewards/rewards.slice'
import {getStorageType} from 'utils/storage'

const RewardsPage = () => {
  const {dispatchAction} = useDispatchAction()
  const {stats} = useSelector((state: RootState) => state.rewards)
  const doctorId = getStorageType().getItem('profileId')

  const [activeTab, setActiveTab] = useState<'patients' | 'orders' | 'promotions'>('patients')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [orderStatus, setOrderStatus] = useState('ALL')
  const [orderPage, setOrderPage] = useState(1)
  const [promotionStatus, setPromotionStatus] = useState('ALL')
  const [promotionPage, setPromotionPage] = useState(1)

  useEffect(() => {
    if (doctorId) {
      dispatchAction(getRewardsDashboard({doctor_id: Number(doctorId)}))
    }
  }, [doctorId])

  useEffect(() => {
    if (doctorId && activeTab === 'patients') {
      dispatchAction(
        getPatientWalletList({
          user_profile_id: Number(doctorId),
          search_text: '',
          page: page - 1,
          size: 10,
        })
      )
    }
  }, [doctorId, activeTab, search, page])

  useEffect(() => {
    if (doctorId && activeTab === 'orders') {
      dispatchAction(
        getRewardOrders({
          profile_id: Number(doctorId),
          status: orderStatus === 'ALL' ? null : orderStatus,
          search_text: null,
          page: orderPage - 1,
          size: 10,
        })
      )
    }
  }, [doctorId, activeTab, orderStatus, search, orderPage])

  useEffect(() => {
    if (doctorId && activeTab === 'promotions') {
      dispatchAction(
        getPromotionClaims({
          profile_id: Number(doctorId),
          status: promotionStatus === 'ALL' ? null : promotionStatus, // Default to CLAIMED as per curl, or handle ALL
          search: search || null,
          page: promotionPage - 1,
          size: 10,
        })
      )
    }
  }, [doctorId, activeTab, promotionStatus, search, promotionPage])

  const handleOnSearch = ({
    page: newPage,
    search: newSearch,
  }: {
    page: number
    search: string | null
  }) => {
    if (newSearch !== null) {
      setSearch(newSearch)
      if (activeTab === 'patients') setPage(1)
      else if (activeTab === 'orders') setOrderPage(1)
      else setPromotionPage(1)
    } else {
      if (activeTab === 'patients') setPage(newPage)
      else if (activeTab === 'orders') setOrderPage(newPage)
      else setPromotionPage(newPage)
    }
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      <Header
        title='Patient Rewards'
        subtitle='Track all your patients earn and redeem information'
        showAddPatientButton={false}
        activeList={true}
        showQuickAddButton={false}
      />

      {/* Stats Cards (use Dashboard StatBox for consistent look) */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {(() => {
          const palette = getColorPalette()
          return (
            <>
              <StatBox
                title='Active Patients'
                count={stats?.active_patient || 0}
                color={palette.primaryColor}
                className='min-w-full'
              />

              <StatBox
                title='Coins Distributed'
                count={stats?.coin_distributed || 0}
                color={palette.secondaryColor}
                className='min-w-full'
              />

              <StatBox
                title='Coins Redeemed'
                count={stats?.coin_redeemed || 0}
                color={palette.tertiaryColor}
                className='min-w-full'
              />
            </>
          )
        })()}
      </div>

      {/* Tabs: Pending Redemptions | Patients | Orders */}
      <div className='mt-6'>
        <div className='flex items-center gap-4 border-b border-lightGray pb-2'>
          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-2 text-sm font-semibold border-b-2 ${
              activeTab === 'patients'
                ? 'border-primaryColor text-primaryColor'
                : 'border-transparent text-textColor'
            }`}
          >
            Patient Coin History
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 text-sm font-semibold border-b-2 ${
              activeTab === 'orders'
                ? 'border-primaryColor text-primaryColor'
                : 'border-transparent text-textColor'
            }`}
          >
            Coin Orders
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`pb-2 text-sm font-semibold border-b-2 ${
              activeTab === 'promotions'
                ? 'border-primaryColor text-primaryColor'
                : 'border-transparent text-textColor'
            }`}
          >
            Promotion Orders
          </button>
        </div>

        <div className='mt-4'>
          {activeTab === 'patients' && (
            <ContainerWrapper
              title='Patients Rewards'
              subTitle='Summary of coins earned and used by patients'
            >
              <PatientsRewardsTable search={search} page={page} handleOnSearch={handleOnSearch} />
            </ContainerWrapper>
          )}

          {activeTab === 'orders' && (
            <ContainerWrapper title='Rewards Orders' subTitle='All reward order history'>
              <RewardsOrdersTable
                status={orderStatus}
                page={orderPage}
                search={search}
                setStatus={setOrderStatus}
                setPage={setOrderPage}
                handleSearch={handleOnSearch}
              />
            </ContainerWrapper>
          )}

          {activeTab === 'promotions' && (
            <ContainerWrapper title='Promotion Orders' subTitle='All promotion order history'>
              <PromotionOrdersTable
                status={promotionStatus}
                page={promotionPage}
                search={search}
                setStatus={setPromotionStatus}
                setPage={setPromotionPage}
                handleSearch={handleOnSearch}
              />
            </ContainerWrapper>
          )}
        </div>
      </div>
    </div>
  )
}

export default RewardsPage
