import useAllUserPlan from '@hooks/useAllUserPlan'
import PlusIcon from 'assets/icons/PlusIcon'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {RootState} from 'redux/store'
import {getSalutations} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'

const WelcomeHeader = ({showButton = false}: {showButton?: boolean}) => {
  const navigate = useNavigate()
  const {isOrganization} = useAllUserPlan()
  const {account} = useSelector((state: RootState) => state.settings)
  const {subscriptionData} = useSelector((state: RootState) => state.subscription)
  const isGrowthPlanUser = subscriptionData?.plan_metadata?.plan_name === 'GROWTH'
  const doctorName = `${getSalutations(account.salutation ?? '')} ${account.first_name ?? ''} ${
    account.last_name ?? ''
  }`
  return (
    <div className='w-full flex flex-wrap gap-3 justify-between'>
      <div className=' text-black text-[18px] md:text-[32px] lg:text-[32px] font-semibold'>
        Welcome back, {doctorName ?? ''}!
      </div>
      <When isTrue={(!isOrganization || !isGrowthPlanUser) && showButton}>
        <button
          className='md:w-fit min-w-[160px] w-full bg-primarySupport py-2 text-primaryColor border border-primaryColor rounded-lg flex gap-1 items-center justify-center font-semibold'
          onClick={() => {
            navigate('/patients-list')
          }}
        >
          <PlusIcon color={getColorPalette().primaryColor} />
          <div>Add a patient</div>
        </button>
      </When>
    </div>
  )
}

export default WelcomeHeader
