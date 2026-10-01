import BoxIcon from 'assets/icons/BoxIcon'
import CheckIcon from 'assets/icons/CheckIcon'
import LockIconSimple from 'assets/icons/LockIconSimple'
import AntdButton from 'components/atom/Buttons/AntdButton'
import SubscriptionInfoModal from 'components/subscription/modals/SubscriptionInfoModal'
import When from 'components/when/When'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

const LockedFeature = ({planName = 'professional'}: {planName?: string}) => {
  const [lockProduction, setLockProduction] = useState(false)
  const navigate = useNavigate()
  return (
    <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full min-h-screen'>
      <When isTrue={lockProduction}>
        <SubscriptionInfoModal
          {...{
            title: `Optimize your aligner manufacturing with the production module`,
            subTitle: ``,
            footerInfo:
              'Upgrade now to growth or professional plan to elevate your manufacturing efficiency!',
            buttonText: 'Upgrade',
            HeaderIcon: BoxIcon,
            iconClassName: 'bg-primarySupport',
            iconColor: '#735BF2',
            onClick: () => {
              setLockProduction(false)
              navigate('/settings/upgrade-renew-subscription')
            },
            featuresHeader: 'Take control of your production process with these powerful features:',
            featuresList: [
              {
                icon: CheckIcon,
                title: `Full production tracking - Monitor every stage: printing, production, inventory, and delivery to patients.`,
              },
              {
                icon: CheckIcon,
                title: `Batch management – Stay ahead with reminders for upcoming aligner batches.`,
              },
              {
                icon: CheckIcon,
                title:
                  'Seamless workflow – Organize production timelines and ensure on-time deliveries.',
              },
            ],
            onClose: () => {
              setLockProduction(false)
            },
          }}
        />
      </When>
      <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
        <LockIconSimple />
      </div>
      <div className='flex flex-col items-center'>
        <p className='text-black font-semibold text-base'>This feature is locked</p>
        <p className='text-sm'>Upgrade to {planName} plan to unlock this feature.</p>
      </div>
      <AntdButton
        onClick={() => {
          setLockProduction(true)
        }}
        text={
          <div className='flex gap-2 items-center'>
            <LockIconSimple color='white' width='20' height='20' />
            <p>Upgrade to {planName} plan</p>
          </div>
        }
        className='bg-primaryColor text-white h-12 font-semibold text-sm !rounded-lg'
      />
    </div>
  )
}

export default LockedFeature
