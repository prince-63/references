import useAllUserPlan from '@hooks/useAllUserPlan'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import CheckIcon from 'assets/icons/CheckIcon'
import CrossIcon from 'assets/icons/CrossIcon'
import InfoIcon from 'assets/icons/InfoIcon'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import When from 'components/when/When'
import {useNavigate} from 'react-router-dom'

const PlanExpiry = () => {
  const {subscriptionData} = useSubscriptionDetails()
  const isTrial = subscriptionData.plan_metadata.trial_plan
  const navigate = useNavigate()
  const {isPractice} = useAllUserPlan()
  return (
    <div className='md:w-[624px] w-full border border-mediumGray rounded-lg p-4'>
      <div className='mb-4'>
        <div
          className={clsx('w-12 h-12 rounded-full flex justify-center items-center bg-redSupport')}
        >
          <InfoIcon color={'red'} />
        </div>
      </div>
      <When isTrue={!isPractice}>
        <div className='max-h-[70vh] flex flex-col gap-4'>
          <div>
            <p className='font-semibold text-2xl '>
              {isTrial ? 'Your trial has expired!' : 'Your plan has expired!'}
            </p>
            <p className=' text-textColor text-base font-normal'>
              {isTrial
                ? 'Don’t let your competition get ahead! '
                : 'You’re missing out on powerful features that have helped practices thrive.'}
            </p>
          </div>
          <div className='flex flex-col gap-3'>
            <p className='font-medium text-base text-textColor'>
              {isTrial
                ? 'Here’s how practices using Dental Stack are already benefiting:'
                : 'Here’s what you’ll lose:'}
            </p>
            <div className='flex flex-col gap-3'>
              {isTrial &&
                featuresTrialList.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className='flex gap-3 text-sm'>
                      <Icon />
                      <p>{feature.title}</p>
                    </div>
                  )
                })}

              {!isTrial &&
                featuresPlanList.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className='flex gap-3 text-sm items-center'>
                      <Icon />
                      <p>{feature.title}</p>
                    </div>
                  )
                })}
              {!isTrial && (
                <p className='font-medium text-base text-textColor'>
                  Practices using Dental Stack have seen:{' '}
                </p>
              )}
              {!isTrial &&
                featuresPlanPracticesUseList.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className='flex gap-3 text-sm items-center'>
                      <Icon />
                      <p>{feature.title}</p>
                    </div>
                  )
                })}
            </div>

            <p className='font-normal text-base text-textColor'>
              {isTrial
                ? 'Catch up before it’s too late! Upgrade now to join the leaders in orthodontics and keep your practice growing.'
                : 'Don’t let your competition stay ahead! Upgrade now to continue benefiting from all Dental Stack has to offer!'}
            </p>
          </div>
          <div className='flex gap-6  items-center'>
            <AntdButton
              className={clsx(
                'w-full bg-red text-white font-semibold text-base hover:!text-white hover:!bg-red h-12'
              )}
              onClick={() => {
                navigate('/settings/upgrade-renew-subscription')
              }}
              text={isTrial ? 'Upgrade' : 'Renew plan'}
            />
          </div>
        </div>
      </When>

      <When isTrue={isPractice}>
        <div>
          <p className='font-semibold text-2xl '>Your no longer have access to this page. </p>
          <p className=' text-textColor text-base font-normal'>
            Please contact your lab for assistance.
          </p>
        </div>
      </When>
    </div>
  )
}

export default PlanExpiry

const featuresTrialList = [
  {
    icon: CheckIcon,
    title: `Staying connected with patients beyond appointments, ensuring ongoing engagement and better retention.`,
    checked: true,
  },
  {
    icon: CheckIcon,
    title:
      'Improving treatment outcomes with precise tracking and seamless communication - reducing dropouts.',
    checked: true,
  },
  {
    icon: CheckIcon,
    title: `Elevating the patient experience, resulting in more referrals and a stronger reputation in the industry.`,
    checked: true,
  },
]

const featuresPlanList = [
  {
    icon: CrossIcon,
    title: `You won’t be able to add new patients to your system.`,
    checked: false,
  },
  {
    icon: CrossIcon,
    title: 'No treatment tracking, patient management, and more.',
    checked: false,
  },
]

const featuresPlanPracticesUseList = [
  {
    icon: CheckIcon,
    title: `Improved patient compliance with real-time tracking and reminders`,
    checked: true,
  },
  {
    icon: CheckIcon,
    title: 'Increased efficiency by reducing time spent on administrative tasks',
    checked: true,
  },
  {
    icon: CheckIcon,
    title: `More focus on patient care with less paperwork`,
    checked: true,
  },
  {
    icon: CheckIcon,
    title: `Higher patient satisfaction leading to more referrals`,
    checked: true,
  },
]
